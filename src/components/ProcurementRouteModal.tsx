import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProcurementItem, ProcurementStop, ClientDestination } from '../types';
import { useProjects } from '../context/ProjectContext';
import { 
  groupItemsIntoStops, 
  optimizeRouteStops, 
  buildGoogleMapsNavUrl, 
  buildGoogleMapsMultiStopUrl,
  canBuildGoogleMapsMultiStop,
  resolveGoogleShortLink,
  extractCoordinates,
  calculateDistanceKm
} from '../utils/geoUtils';
import { 
  X, 
  Navigation, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Compass, 
  Store, 
  Check, 
  LocateFixed,
  Truck,
  Building2,
  Edit3,
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface ProcurementRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProcurementItem[];
  onToggleItem: (id: string) => Promise<void>;
}

export const ProcurementRouteModal: React.FC<ProcurementRouteModalProps> = ({
  isOpen,
  onClose,
  items,
  onToggleItem,
}) => {
  const { projects } = useProjects();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'prompting' | 'active' | 'denied' | 'unsupported'>('prompting');
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  // Client Delivery Destination state (persisted in localStorage)
  const [destination, setDestination] = useState<ClientDestination | null>(() => {
    try {
      const saved = localStorage.getItem('countryyards_procurement_destination');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isEditingDestination, setIsEditingDestination] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [destNameInput, setDestNameInput] = useState<string>('');
  const [destLinkInput, setDestLinkInput] = useState<string>('');
  const [isResolvingDest, setIsResolvingDest] = useState(false);

  // Sync destination changes to localStorage
  useEffect(() => {
    if (destination) {
      localStorage.setItem('countryyards_procurement_destination', JSON.stringify(destination));
    } else {
      localStorage.removeItem('countryyards_procurement_destination');
    }
  }, [destination]);

  // Request browser GPS location when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatus('active');
      },
      (err) => {
        console.warn('Geolocation error / permission denied:', err.message);
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [isOpen]);

  const [resolvedNames, setResolvedNames] = useState<{ [link: string]: string }>({});
  const [resolvedCoords, setResolvedCoords] = useState<{ [link: string]: { lat: number; lng: number } }>({});
  const attemptedLinksRef = useRef<Set<string>>(new Set());

  // Compute optimized stops
  const stops = useMemo(() => {
    const rawStops = groupItemsIntoStops(items);
    const withResolved = rawStops.map(s => {
      const updated = { ...s };
      if (resolvedNames[s.locationLink]) {
        updated.nurseryName = resolvedNames[s.locationLink];
      }
      if (resolvedCoords[s.locationLink]) {
        updated.latitude = resolvedCoords[s.locationLink].lat;
        updated.longitude = resolvedCoords[s.locationLink].lng;
      }
      return updated;
    });
    return optimizeRouteStops(withResolved, userCoords);
  }, [items, userCoords, resolvedNames, resolvedCoords]);

  // Background resolution for Google short links of nurseries
  useEffect(() => {
    if (!isOpen) return;
    const rawStops = groupItemsIntoStops(items);
    const linksToResolve = rawStops
      .map(s => s.locationLink)
      .filter(l => l && (l.includes('maps.app.goo.gl') || l.includes('goo.gl/maps')) && !attemptedLinksRef.current.has(l));

    if (linksToResolve.length === 0) return;

    linksToResolve.forEach(async (link) => {
      attemptedLinksRef.current.add(link);
      try {
        const res = await resolveGoogleShortLink(link);
        if (res) {
          if (res.placeName) {
            setResolvedNames(prev => ({ ...prev, [link]: res.placeName }));
          }
          if (res.coordinates) {
            setResolvedCoords(prev => ({ ...prev, [link]: res.coordinates! }));
          }
        }
      } catch {
        // silent
      }
    });
  }, [isOpen, items]);

  // Destination short link resolution in background
  useEffect(() => {
    if (!destination?.locationLink) return;
    if (destination.latitude && destination.longitude) return;

    const link = destination.locationLink;
    const directCoords = extractCoordinates(link);
    if (directCoords) {
      setDestination(prev => prev ? { ...prev, latitude: directCoords.lat, longitude: directCoords.lng } : null);
      return;
    }

    if (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps')) {
      resolveGoogleShortLink(link).then(res => {
        if (res?.coordinates) {
          setDestination(prev => prev ? { ...prev, latitude: res.coordinates!.lat, longitude: res.coordinates!.lng } : null);
        }
      }).catch(() => {});
    }
  }, [destination?.locationLink]);

  // Destination handlers
  const handleOpenEditDestination = () => {
    setSelectedProjectId(destination?.projectId || '');
    setDestNameInput(destination?.name || '');
    setDestLinkInput(destination?.locationLink || '');
    setIsEditingDestination(true);
  };

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      const name = proj.client_name ? `${proj.client_name} (${proj.name})` : proj.name;
      setDestNameInput(name);
      setDestLinkInput(proj.location || '');
    }
  };

  const handleSaveDestination = async () => {
    if (!destNameInput.trim() && !destLinkInput.trim()) return;

    setIsResolvingDest(true);
    let lat: number | null = null;
    let lng: number | null = null;
    const link = destLinkInput.trim();
    let name = destNameInput.trim();

    const directCoords = extractCoordinates(link) || extractCoordinates(name);
    if (directCoords) {
      lat = directCoords.lat;
      lng = directCoords.lng;
    } else if (link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps')) {
      try {
        const resolved = await resolveGoogleShortLink(link);
        if (resolved) {
          if (resolved.coordinates) {
            lat = resolved.coordinates.lat;
            lng = resolved.coordinates.lng;
          }
          if (!name && resolved.placeName) {
            name = resolved.placeName;
          }
        }
      } catch {
        // silent
      }
    }

    const newDest: ClientDestination = {
      name: name || 'Client Delivery Site',
      locationLink: link,
      latitude: lat,
      longitude: lng,
      projectId: selectedProjectId || undefined,
    };

    setDestination(newDest);
    setIsEditingDestination(false);
    setIsResolvingDest(false);
  };

  const handleClearDestination = () => {
    setDestination(null);
    setSelectedProjectId('');
    setDestNameInput('');
    setDestLinkInput('');
    setIsEditingDestination(false);
  };

  // Active uncompleted stops
  const pendingStops = useMemo(() => stops.filter(s => !s.isCompleted), [stops]);
  const hasDestination = Boolean(destination && (destination.name || destination.locationLink));
  const totalStopsCount = stops.length + (hasDestination ? 1 : 0);
  const canOpenFullRoute = useMemo(() => canBuildGoogleMapsMultiStop(stops, destination), [stops, destination]);

  // Adjust activeStopIndex if needed
  useEffect(() => {
    if (activeStopIndex >= totalStopsCount && totalStopsCount > 0) {
      setActiveStopIndex(totalStopsCount - 1);
    }
  }, [totalStopsCount, activeStopIndex]);

  if (!isOpen) return null;

  const isDestinationActive = hasDestination && activeStopIndex === stops.length;
  const currentStop: ProcurementStop | undefined = !isDestinationActive ? (stops[activeStopIndex] || stops[0]) : undefined;

  // Calculate distance from last nursery stop to destination
  const lastNurseryStop = stops[stops.length - 1];
  const destDistanceKm = (hasDestination && destination?.latitude && destination?.longitude && lastNurseryStop?.latitude && lastNurseryStop?.longitude)
    ? calculateDistanceKm(lastNurseryStop.latitude, lastNurseryStop.longitude, destination.latitude, destination.longitude)
    : undefined;

  const handleNextStop = () => {
    if (activeStopIndex < totalStopsCount - 1) {
      setActiveStopIndex(activeStopIndex + 1);
    }
  };

  const handlePrevStop = () => {
    if (activeStopIndex > 0) {
      setActiveStopIndex(activeStopIndex - 1);
    }
  };

  // Open multi-stop route
  const handleOpenFullRoute = () => {
    const url = buildGoogleMapsMultiStopUrl(stops, userCoords, destination);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-stone-100 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-shrink-0 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#78350f] flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight flex items-center gap-1.5">
                Truck Procurement Route
              </h3>
              <p className="text-[11px] text-stone-500 font-normal">
                {hasDestination 
                  ? 'Nurseries ➔ Client Site Delivery' 
                  : 'Commercial vehicle path covering all nursery stops'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
          {/* Status Bar / GPS & Truck Mode Indicator */}
          <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/70 text-xs">
            <div className="flex items-center space-x-1.5">
              <LocateFixed className={`w-3.5 h-3.5 ${gpsStatus === 'active' ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span className="font-semibold text-stone-700">
                {gpsStatus === 'active'
                  ? 'GPS Active: Live Optimized Path'
                  : 'Stops Grouped for Efficient Travel'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>Truck Mode</span>
              </span>
              <span className="text-[10px] font-bold text-[#78350f] bg-amber-100/80 px-2 py-0.5 rounded-md">
                {pendingStops.length} Stops Left
              </span>
            </div>
          </div>

          {/* Destination / Client Location Card */}
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <Building2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-950 truncate">
                  Final Delivery (Client Site)
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {destination && (
                  <button
                    type="button"
                    onClick={handleClearDestination}
                    className="p-1 text-stone-400 hover:text-red-500 rounded transition-colors"
                    title="Remove destination"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingDestination) {
                      setIsEditingDestination(false);
                    } else {
                      handleOpenEditDestination();
                    }
                  }}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{destination ? 'Change' : '+ Add Client Site'}</span>
                </button>
              </div>
            </div>

            {/* If Destination is Set and NOT editing */}
            {!isEditingDestination && destination && (
              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black text-stone-900 block truncate">
                    {destination.name}
                  </span>
                  {destination.locationLink && (
                    <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{destination.locationLink}</span>
                    </p>
                  )}
                </div>
                {destDistanceKm != null && destDistanceKm > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                    ~{destDistanceKm} km from nurseries
                  </span>
                )}
              </div>
            )}

            {/* Inline Destination Editor */}
            {isEditingDestination && (
              <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2.5 animate-in fade-in">
                {/* 1. Quick pick from active projects */}
                {projects.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                      Pick from Active Projects:
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleSelectProject(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose a project --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.client_name ? `${p.client_name} - ${p.name}` : p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. Custom Destination Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                    Client / Site Name:
                  </label>
                  <input
                    type="text"
                    value={destNameInput}
                    onChange={(e) => setDestNameInput(e.target.value)}
                    placeholder="e.g. Sharma Villa, Jubilee Hills Site"
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. Google Maps Link or Address */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">
                    Google Maps Link or Address:
                  </label>
                  <input
                    type="text"
                    value={destLinkInput}
                    onChange={(e) => setDestLinkInput(e.target.value)}
                    placeholder="e.g. https://maps.app.goo.gl/... or Jubilee Hills, Hyderabad"
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingDestination(false)}
                    className="flex-1 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDestination}
                    disabled={isResolvingDest || (!destNameInput.trim() && !destLinkInput.trim())}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40"
                  >
                    {isResolvingDest ? 'Resolving...' : 'Save Site'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Truck Mode Safety Notice */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] text-[#78350f]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#78350f] flex-shrink-0" />
            <span>
              <strong>Truck-safe roads enabled:</strong> Multi-stop routing follows major four-wheel vehicle roads, avoiding narrow bike shortcuts.
            </span>
          </div>

          {/* Combined Multi-stop Google Maps button */}
          {canOpenFullRoute ? (
            <button
              onClick={handleOpenFullRoute}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#78350f] to-amber-900 hover:from-[#632c0c] hover:to-amber-950 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm active:scale-98 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>
                Open Full Route ({totalStopsCount} Stops {hasDestination ? 'incl. Client Site' : ''})
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          ) : totalStopsCount > 1 ? (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-xs text-[#78350f] flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#78350f] flex-shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block">Shared Google Maps Links</span>
                <span className="text-stone-600 text-[11px]">
                  Tap <strong>"Navigate in Google Maps"</strong> on each stop below to open turn-by-turn truck driving directions.
                </span>
              </div>
            </div>
          ) : null}

          {/* Current Stop Hero Card: Destination or Nursery */}
          {isDestinationActive && destination ? (
            /* FINAL DESTINATION HERO CARD */
            <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-400 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Final Stop #{totalStopsCount} • Client Delivery</span>
                </span>
                {destDistanceKm != null && destDistanceKm > 0 && (
                  <span className="text-xs font-extrabold text-emerald-800">
                    ~{destDistanceKm} km away
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="truncate">{destination.name}</span>
                </h4>
                {destination.locationLink && (
                  <p className="text-[11px] text-stone-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span>{destination.locationLink}</span>
                  </p>
                )}
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200/70 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wide block">
                  Delivery Details:
                </span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed">
                  🚚 All procured plants & materials are loaded on the truck. Complete the procurement trip by driving directly to this client site to unload.
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const navUrl = buildGoogleMapsNavUrl({
                      latitude: destination.latitude,
                      longitude: destination.longitude,
                      nurseryName: destination.name,
                      locationLink: destination.locationLink,
                    });
                    window.open(navUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate to Client Site (Truck Driving Mode)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrevStop}
                  className="w-full py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-colors"
                >
                  Previous Stop (Last Nursery)
                </button>
              </div>
            </div>
          ) : currentStop ? (
            /* NURSERY STOP HERO CARD */
            <div className="bg-amber-50/60 rounded-2xl p-4 border-2 border-amber-300 shadow-xs space-y-3">
              {/* Stop Number & Distance */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Stop #{currentStop.stopNumber}</span>
                  <span>of {totalStopsCount}</span>
                </span>

                {currentStop.distanceKm != null && currentStop.distanceKm > 0 && (
                  <span className="text-xs font-extrabold text-[#78350f]">
                    ~{currentStop.distanceKm} km away
                  </span>
                )}
              </div>

              {/* Nursery / Stop Name */}
              <div>
                <h4 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#78350f] flex-shrink-0" />
                  <span className="truncate">{currentStop.nurseryName}</span>
                </h4>
                {currentStop.locationLink && (
                  <p className="text-[11px] text-stone-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span>{currentStop.locationLink}</span>
                  </p>
                )}
              </div>

              {/* Plants to Procure at this Stop */}
              <div className="space-y-1.5 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="text-[10px] font-black uppercase text-[#78350f] tracking-wide block mb-1">
                  Procure at this Nursery ({currentStop.items.length} items):
                </span>
                {currentStop.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-amber-50/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      {item.is_done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-bold truncate ${item.is_done ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {item.plant_name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#78350f] bg-amber-100 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons for Current Stop */}
              <div className="space-y-2 pt-1">
                {/* 1. Launch Turn-by-Turn Navigation (Truck Driving Mode) */}
                <button
                  type="button"
                  onClick={() => {
                    const navUrl = buildGoogleMapsNavUrl(currentStop);
                    window.open(navUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate in Google Maps (Truck Driving Mode)</span>
                </button>

                {/* 2. Prev / Next Stop Button */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevStop}
                    disabled={activeStopIndex === 0}
                    className="flex-1 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold disabled:opacity-30 hover:bg-stone-50 transition-colors"
                  >
                    Previous Stop
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStop}
                    disabled={activeStopIndex === totalStopsCount - 1}
                    className="flex-1 py-2 rounded-xl bg-[#78350f] hover:bg-[#632c0c] text-white text-xs font-bold disabled:opacity-30 flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>{hasDestination && activeStopIndex === stops.length - 1 ? 'Go to Client Site' : 'Next Stop'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* All Stops Roadmap List */}
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              Route Stop Itinerary ({totalStopsCount} stops)
            </span>
            <div className="space-y-2">
              {stops.map((stop, index) => {
                const isActive = index === activeStopIndex;
                const isDone = stop.isCompleted;

                return (
                  <div
                    key={stop.id}
                    onClick={() => setActiveStopIndex(index)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-amber-100/60 border-[#78350f] ring-1 ring-[#78350f]'
                        : isDone
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-700'
                          : isActive
                          ? 'bg-[#78350f] text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}>
                        {isDone ? <Check className="w-4 h-4" /> : `#${stop.stopNumber}`}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-stone-900 truncate">
                          {stop.nurseryName}
                        </h5>
                        <p className="text-[10px] text-stone-500 truncate">
                          {stop.items.map(i => i.plant_name).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#78350f] bg-amber-100 px-1.5 py-0.5 rounded block">
                        {stop.items.length} {stop.items.length === 1 ? 'plant' : 'plants'}
                      </span>
                      {stop.distanceKm != null && stop.distanceKm > 0 && (
                        <span className="text-[9px] text-stone-400 block mt-0.5">
                          {stop.distanceKm} km
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Final Delivery Stop in Roadmap List */}
              {hasDestination && destination && (
                <div
                  onClick={() => setActiveStopIndex(stops.length)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isDestinationActive
                      ? 'bg-emerald-100/70 border-emerald-600 ring-1 ring-emerald-600'
                      : 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isDestinationActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded">
                          Final Delivery
                        </span>
                        <h5 className="text-xs font-bold text-stone-900 truncate">
                          {destination.name}
                        </h5>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {destination.locationLink || 'Client Project Site'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded block">
                      Delivery
                    </span>
                    {destDistanceKm != null && destDistanceKm > 0 && (
                      <span className="text-[9px] text-stone-400 block mt-0.5">
                        ~{destDistanceKm} km
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex-shrink-0 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            Exit Route Mode
          </button>
        </div>
      </div>
    </div>
  );
};

