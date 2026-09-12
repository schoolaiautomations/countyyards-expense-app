import { ProcurementItem, ProcurementStop, ClientDestination } from '../types';

/**
 * Parses a Google Maps link or text to extract latitude and longitude.
 * Supports various Google Maps link formats:
 * - https://www.google.com/maps/place/.../@16.9023,81.8234,17z/...
 * - https://maps.google.com/?q=16.9023,81.8234
 * - https://www.google.com/maps?ll=16.9023,81.8234
 * - data=!3m1!1e3!4m5!3m4!1s0x...!8m2!3d16.9023!4d81.8234
 * - Raw coordinates: "16.9023, 81.8234"
 */
export const extractCoordinates = (input: string): { lat: number; lng: number } | null => {
  if (!input || typeof input !== 'string') return null;
  const decoded = decodeURIComponent(input.trim())
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"');

  // 1. Check for @lat,lng
  const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. Check for ?q=lat,lng or &q=lat,lng
  const qMatch = decoded.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Check for !3dlat!4dlng (protobuf format in Google Maps URLs)
  const protoMatch = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (protoMatch) {
    const lat = parseFloat(protoMatch[1]);
    const lng = parseFloat(protoMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. Check for ll=lat,lng
  const llMatch = decoded.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) {
    const lat = parseFloat(llMatch[1]);
    const lng = parseFloat(llMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. Check for DMS coordinates (e.g. 16°54'04.1"N 81°48'46.3"E)
  const dmsMatch = decoded.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NS])\s*,?\s*(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([EW])/i);
  if (dmsMatch) {
    const latDeg = parseFloat(dmsMatch[1]);
    const latMin = parseFloat(dmsMatch[2]);
    const latSec = parseFloat(dmsMatch[3]);
    const latDir = dmsMatch[4].toUpperCase();

    const lngDeg = parseFloat(dmsMatch[5]);
    const lngMin = parseFloat(dmsMatch[6]);
    const lngSec = parseFloat(dmsMatch[7]);
    const lngDir = dmsMatch[8].toUpperCase();

    const lat = (latDeg + latMin / 60 + latSec / 3600) * (latDir === 'S' ? -1 : 1);
    const lng = (lngDeg + lngMin / 60 + lngSec / 3600) * (lngDir === 'W' ? -1 : 1);

    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 6. Check for decimal lat, lng anywhere in string (e.g. "16.9023, 81.8234")
  const decimalMatch = decoded.match(/(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/);
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1]);
    const lng = parseFloat(decimalMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
};

const isValidLatLng = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Resolves an opaque Google Maps short link (e.g. https://maps.app.goo.gl/...)
 * using Microlink CORS service to extract place name, address, and coordinates.
 */
export const resolveGoogleShortLink = async (
  url: string
): Promise<{ placeName: string; address: string; query: string; coordinates?: { lat: number; lng: number } } | null> => {
  if (!url || (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps'))) {
    return null;
  }
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url.trim())}`);
    const json = await res.json();
    if (json?.status === 'success' && json?.data?.title) {
      const fullTitle: string = json.data.title;
      const parts = fullTitle.split('·').map((s: string) => s.trim());
      let placeName = parts[0] || '';
      const address = parts[1] || '';

      // Check if placeName or fullTitle contains DMS or decimal coordinates
      const coords = extractCoordinates(placeName) || extractCoordinates(fullTitle);

      let query = '';
      if (coords) {
        query = `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
        if (placeName.includes('°')) {
          placeName = address ? address.split(',')[0].trim() : `Nursery (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
        }
      } else if (placeName) {
        const isCoordLike = /[\d.]+[°NSEW,\s]+[\d.]+/.test(placeName);
        if (isCoordLike) {
          query = placeName;
        } else {
          query = placeName.toLowerCase().includes('kadiyam') || placeName.toLowerCase().includes('kadiam')
            ? placeName
            : `${placeName}, Kadiam, Andhra Pradesh`;
        }
      } else {
        query = address;
      }

      return { placeName, address, query, coordinates: coords || undefined };
    }
  } catch (err) {
    console.warn('Could not resolve Google short link:', err);
  }
  return null;
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
};

/**
 * Groups procurement items into unified Stops by identical location or nursery name
 */
export const groupItemsIntoStops = (items: ProcurementItem[]): ProcurementStop[] => {
  const groups: { [key: string]: ProcurementStop } = {};

  items.forEach((item) => {
    // Generate a normalized key for grouping
    const nursery = (item.nursery_name || '').trim();
    const link = (item.location_link || '').trim();
    
    // Key preference: clean location link > coordinates > nursery name > item id
    let key = '';
    if (item.latitude && item.longitude) {
      key = `geo:${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`;
    } else if (link) {
      key = `link:${link.toLowerCase().replace(/\/$/, '')}`;
    } else if (nursery) {
      key = `nursery:${nursery.toLowerCase()}`;
    } else {
      key = `standalone:${item.id}`;
    }

    if (!groups[key]) {
      const coords = (item.latitude && item.longitude) 
        ? { lat: item.latitude, lng: item.longitude } 
        : (extractCoordinates(link) || extractCoordinates(nursery));

      // Clean name if nursery name is raw coordinates or DMS
      let displayName = nursery;
      if (displayName && (displayName.includes('°') || /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(displayName))) {
        displayName = coords ? `Nursery (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : '';
      }

      groups[key] = {
        id: key,
        stopNumber: 0,
        nurseryName: displayName || (link ? 'Nursery / Sourcing Point' : `Stop for ${item.plant_name}`),
        locationLink: link,
        latitude: coords ? coords.lat : (item.latitude || null),
        longitude: coords ? coords.lng : (item.longitude || null),
        items: [],
        isCompleted: false,
      };
    }

    groups[key].items.push(item);
  });

  // Calculate isCompleted for each stop (completed if all items in it are done)
  return Object.values(groups).map((stop) => ({
    ...stop,
    isCompleted: stop.items.every((i) => i.is_done),
  }));
};

/**
 * Optimizes stops sequence using Nearest-Neighbor TSP algorithm starting from user's current GPS location
 */
export const optimizeRouteStops = (
  stops: ProcurementStop[],
  userLocation?: { lat: number; lng: number } | null
): ProcurementStop[] => {
  if (stops.length <= 1) {
    return stops.map((s, idx) => ({ ...s, stopNumber: idx + 1 }));
  }

  // Separate stops with coordinates from stops without coordinates
  const geoStops = stops.filter((s) => s.latitude != null && s.longitude != null);
  const unlocatedStops = stops.filter((s) => s.latitude == null || s.longitude == null);

  const orderedGeoStops: ProcurementStop[] = [];
  const remaining = [...geoStops];

  // Current starting point: userLocation if provided, otherwise first stop with coordinates
  let currentLat = userLocation?.lat ?? remaining[0]?.latitude;
  let currentLng = userLocation?.lng ?? remaining[0]?.longitude;

  while (remaining.length > 0) {
    if (currentLat == null || currentLng == null) {
      orderedGeoStops.push(...remaining);
      break;
    }

    // Find the nearest unvisited stop to (currentLat, currentLng)
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const stop = remaining[i];
      const dist = calculateDistanceKm(currentLat, currentLng, stop.latitude!, stop.longitude!);
      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
      }
    }

    const nearestStop = remaining.splice(bestIndex, 1)[0];
    nearestStop.distanceKm = minDistance;
    orderedGeoStops.push(nearestStop);

    // Update current location for next iteration
    currentLat = nearestStop.latitude!;
    currentLng = nearestStop.longitude!;
  }

  // Combine geo-ordered stops with unlocated stops
  const allOrdered = [...orderedGeoStops, ...unlocatedStops];

  return allOrdered.map((stop, index) => ({
    ...stop,
    stopNumber: index + 1,
  }));
};

/**
 * Generates direct Google Maps turn-by-turn navigation URL for a single stop
 * Always enforces truck/driving road navigation (travelmode=driving&dirflg=d)
 */
export const buildGoogleMapsNavUrl = (stop: {
  latitude?: number | null;
  longitude?: number | null;
  nurseryName?: string;
  locationLink?: string;
}): string => {
  if (stop.latitude && stop.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}&travelmode=driving&dirflg=d`;
  }
  const coords = extractCoordinates(stop.nurseryName || '') || extractCoordinates(stop.locationLink || '');
  if (coords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving&dirflg=d`;
  }
  if (stop.locationLink) {
    if (stop.locationLink.startsWith('http://') || stop.locationLink.startsWith('https://')) {
      return stop.locationLink;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.locationLink)}&travelmode=driving&dirflg=d`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.nurseryName || '')}&travelmode=driving&dirflg=d`;
};

/**
 * Checks if all stops and optional destination have valid coordinates or place names for Google Maps multi-stop routing
 */
export const canBuildGoogleMapsMultiStop = (
  stops: ProcurementStop[],
  destinationStop?: ClientDestination | null
): boolean => {
  const activeStops = stops.filter((s) => !s.isCompleted);
  
  // If a destination stop is provided, we can route with at least 1 nursery stop (1 nursery + 1 client site = 2 points)
  if (destinationStop) {
    if (activeStops.length < 1) return false;
    const destValid = Boolean(
      (destinationStop.latitude && destinationStop.longitude) ||
      extractCoordinates(destinationStop.name) ||
      extractCoordinates(destinationStop.locationLink) ||
      (destinationStop.name && destinationStop.name.trim().length > 0) ||
      (destinationStop.locationLink && !destinationStop.locationLink.startsWith('http://') && !destinationStop.locationLink.startsWith('https://'))
    );
    if (!destValid) return false;
  } else {
    // If no destination stop, we need at least 2 nursery stops
    if (activeStops.length < 2) return false;
  }

  return activeStops.every((stop) => {
    if (stop.latitude && stop.longitude) return true;
    if (extractCoordinates(stop.nurseryName) || extractCoordinates(stop.locationLink)) return true;
    if (stop.nurseryName && !stop.nurseryName.startsWith('Stop for ') && stop.nurseryName !== 'Nursery / Sourcing Point') return true;
    if (stop.locationLink && !stop.locationLink.startsWith('http://') && !stop.locationLink.startsWith('https://')) return true;
    return false;
  });
};

/**
 * Generates a multi-stop route URL with all waypoints in Google Maps
 * Always enforces truck / commercial vehicle driving mode (travelmode=driving&dirflg=d)
 * If destinationStop is provided, route ends at the client delivery location.
 */
export const buildGoogleMapsMultiStopUrl = (
  stops: ProcurementStop[],
  userLocation?: { lat: number; lng: number } | null,
  destinationStop?: ClientDestination | null
): string => {
  const activeStops = stops.filter((s) => !s.isCompleted);
  if (activeStops.length === 0 && !destinationStop) return '';

  const formatPoint = (stop: {
    nurseryName?: string;
    locationLink?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): string | null => {
    // 1. Explicit decimal coordinates
    if (stop.latitude && stop.longitude) {
      return `${stop.latitude},${stop.longitude}`;
    }
    // 2. Extracted coordinates from nurseryName or locationLink (converts DMS to decimal!)
    const coords = extractCoordinates(stop.nurseryName || '') || extractCoordinates(stop.locationLink || '');
    if (coords) {
      return `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
    }
    // 3. Clean nursery / client / place name
    if (stop.nurseryName && !stop.nurseryName.startsWith('Stop for ') && stop.nurseryName !== 'Nursery / Sourcing Point') {
      const name = stop.nurseryName.trim();
      // If name is coordinate-like (DMS or numbers), DO NOT append Kadiyam
      const isCoordLike = /[\d.]+[°NSEW,\s]+[\d.]+/.test(name);
      if (isCoordLike) {
        return encodeURIComponent(name);
      }
      const query = name.toLowerCase().includes('kadiyam') || name.toLowerCase().includes('kadiam')
        ? name
        : `${name}, Kadiyam`;
      return encodeURIComponent(query);
    }
    // 4. Text address or non-URL location
    if (stop.locationLink && !stop.locationLink.startsWith('http://') && !stop.locationLink.startsWith('https://')) {
      return encodeURIComponent(stop.locationLink.trim());
    }
    // Web URLs (like https://maps.app.goo.gl/...) cannot be passed directly into waypoints
    return null;
  };

  const points = activeStops.map(s => formatPoint(s));
  if (points.some((p) => p === null)) {
    return '';
  }

  let formattedDest: string | null = null;
  if (destinationStop) {
    formattedDest = formatPoint({
      nurseryName: destinationStop.name,
      locationLink: destinationStop.locationLink,
      latitude: destinationStop.latitude,
      longitude: destinationStop.longitude,
    });
    if (!formattedDest) {
      return '';
    }
  }

  let origin = '';
  let destination = '';
  let waypoints: string[] = [];

  if (formattedDest) {
    // Route ends at the client delivery location!
    destination = formattedDest;
    if (userLocation) {
      origin = `${userLocation.lat},${userLocation.lng}`;
      waypoints = points as string[];
    } else {
      origin = points[0]!;
      waypoints = (points.slice(1) as string[]);
    }
  } else {
    // Route ends at the last nursery stop
    if (points.length === 0) return '';
    destination = points[points.length - 1]!;
    if (userLocation) {
      origin = `${userLocation.lat},${userLocation.lng}`;
      waypoints = (points.slice(0, points.length - 1) as string[]);
    } else {
      origin = points[0]!;
      waypoints = (points.slice(1, points.length - 1) as string[]);
    }
  }

  // Always enforce truck/driving mode (main vehicle roads)
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&dirflg=d`;
  if (waypoints.length > 0) {
    url += `&waypoints=${waypoints.join('|')}`;
  }

  return url;
};

