import React, { useState, useEffect } from 'react';
import { ProcurementItem } from '../types';
import { useProjects } from '../context/ProjectContext';
import { extractCoordinates, resolveGoogleShortLink } from '../utils/geoUtils';
import { X, Sprout, Save, Plus, IndianRupee, CheckSquare, Square, MapPin, Loader2, Check } from 'lucide-react';

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProcurementItem, 'id' | 'created_at'>) => Promise<void>;
  initialData?: ProcurementItem | null;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { vendors } = useProjects();
  const [plantName, setPlantName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paidAmount, setPaidAmount] = useState('');
  const [nurseryName, setNurseryName] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [resolvedInfo, setResolvedInfo] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPlantName(initialData.plant_name);
      setQuantity(initialData.quantity.toString());
      setPaidAmount(initialData.paid_amount ? initialData.paid_amount.toString() : '');
      setNurseryName(initialData.nursery_name || '');
      setLocationLink(initialData.location_link || '');
      setIsDone(initialData.is_done);
      setCoords(initialData.latitude && initialData.longitude ? { lat: initialData.latitude, lng: initialData.longitude } : null);
    } else {
      setPlantName('');
      setQuantity('1');
      setPaidAmount('');
      setNurseryName('');
      setLocationLink('');
      setIsDone(false);
      setCoords(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Quick select a saved vendor from Vendor Directory
  const handleSelectVendor = (vendorId: string) => {
    const selected = vendors.find(v => v.id === vendorId);
    if (selected) {
      setNurseryName(selected.vendor_name);
      if (selected.location_link) {
        handleLocationChange(selected.location_link);
      }
    }
  };

  const handleLocationChange = async (val: string) => {
    setLocationLink(val);
    setResolvedInfo(null);
    setCoords(null);

    // 1. Direct coordinates check (e.g. 16.8931, 81.8057 or DMS or @16.8931,81.8057)
    const directCoords = extractCoordinates(val);
    if (directCoords) {
      setCoords(directCoords);
      setResolvedInfo(`Coordinates: ${directCoords.lat.toFixed(4)}, ${directCoords.lng.toFixed(4)}`);
      return;
    }

    // 2. Google short link resolution (maps.app.goo.gl)
    if (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps')) {
      setIsResolvingLink(true);
      try {
        const resolved = await resolveGoogleShortLink(val);
        if (resolved) {
          if (resolved.coordinates) {
            setCoords(resolved.coordinates);
          }
          setResolvedInfo(`Detected: ${resolved.placeName}`);
          if (!nurseryName.trim()) {
            setNurseryName(resolved.placeName);
          }
        }
      } catch {
        // silent fallback
      } finally {
        setIsResolvingLink(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim() || !quantity) return;

    setIsSubmitting(true);
    try {
      const finalCoords = coords || extractCoordinates(locationLink) || extractCoordinates(nurseryName);
      await onSave({
        plant_name: plantName.trim(),
        quantity: Number(quantity) || 1,
        paid_amount: paidAmount ? Number(paidAmount) : 0,
        is_done: isDone,
        priority_order: initialData ? initialData.priority_order : 9999,
        nursery_name: nurseryName.trim(),
        location_link: locationLink.trim(),
        latitude: finalCoords ? finalCoords.lat : (initialData?.latitude ?? null),
        longitude: finalCoords ? finalCoords.lng : (initialData?.longitude ?? null),
      });
      onClose();
    } catch (err) {
      console.error('Error saving plant procurement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#78350f] flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {initialData ? 'Edit Plant' : 'Add Plant / Material'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Quick Kadiyam purchase checklist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Plant / Material Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Plant / Material Name *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Foxtail Palm 8ft, Red Soil, Ceramic Pots..."
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#78350f]/50 text-sm font-semibold text-stone-800"
              required
            />
          </div>

          {/* 2. Quantity */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#78350f]/50"
              required
            />
          </div>

          {/* 3. Nursery / Vendor & Google Maps Location (For Path Optimization) */}
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#78350f] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Nursery & Google Location Link</span>
              </label>
              {vendors.length > 0 && (
                <span className="text-[10px] text-stone-500 font-medium">Auto-fill from vendors</span>
              )}
            </div>

            {/* Quick Vendor Select */}
            {vendors.length > 0 && (
              <div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleSelectVendor(e.target.value);
                  }}
                  defaultValue=""
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 font-medium focus:ring-1 focus:ring-[#78350f]"
                >
                  <option value="">-- Or choose from saved Vendor Directory --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_name} ({v.plant_names.slice(0, 25)}...)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nursery Name */}
            <div>
              <input
                type="text"
                placeholder="Nursery Name (e.g. Sri Rama Nursery, Kadiyam)"
                value={nurseryName}
                onChange={(e) => setNurseryName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#78350f] text-stone-800 font-medium"
              />
            </div>

            {/* Google Location Link or Address */}
            <div>
              <input
                type="text"
                placeholder="Google Maps Link or Address (https://maps.app.goo.gl/...)"
                value={locationLink}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#78350f] text-stone-800 font-medium"
              />
              {isResolvingLink && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Detecting nursery name from Google link...</span>
                </p>
              )}
              {resolvedInfo && (
                <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{resolvedInfo}</span>
                </p>
              )}
              {!isResolvingLink && !resolvedInfo && (
                <p className="text-[10px] text-stone-500 mt-1">
                  Pasting a Google link automatically detects the nursery and coordinates.
                </p>
              )}
            </div>
          </div>

          {/* 4. Paid Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#78350f]" />
              Paid Amount (₹) <span className="text-[10px] font-normal text-stone-400 lowercase">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 4500"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#78350f]/50"
            />
          </div>

          {/* 4. Checkbox for "Done" */}
          <div 
            onClick={() => setIsDone(!isDone)}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors select-none"
          >
            {isDone ? (
              <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-400 flex-shrink-0" />
            )}
            <div>
              <span className={`text-xs font-bold block ${isDone ? 'text-emerald-800' : 'text-stone-700'}`}>
                {isDone ? 'Marked as Done (Procured)' : 'Mark as Done'}
              </span>
              <span className="text-[10px] text-stone-400">
                Done items automatically move to the bottom of the list.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !plantName.trim()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#78350f] hover:bg-[#632c0c] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 active:scale-98"
            >
              {initialData ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Plant'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
