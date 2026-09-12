import React, { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Vendor } from '../types';
import { 
  ArrowLeft, 
  Store, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  ExternalLink, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  Sprout, 
  Copy, 
  Check, 
  FileText,
  Building2
} from 'lucide-react';
import { VendorModal } from '../components/VendorModal';
import { LoadingScreen } from '../components/LoadingScreen';

interface VendorsScreenProps {
  onBack: () => void;
}

export const VendorsScreen: React.FC<VendorsScreenProps> = ({ onBack }) => {
  const { 
    vendors, 
    loading, 
    createVendor, 
    updateVendor, 
    deleteVendor 
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter vendors by vendor name OR plant names
  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase();
    return vendors.filter(
      v =>
        v.vendor_name.toLowerCase().includes(q) ||
        v.plant_names.toLowerCase().includes(q) ||
        (v.location_link && v.location_link.toLowerCase().includes(q)) ||
        (v.contact_number && v.contact_number.includes(q))
    );
  }, [vendors, searchQuery]);

  // Handle Save
  const handleSave = async (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingVendor) {
      await updateVendor(editingVendor.id, data);
      setEditingVendor(null);
    } else {
      await createVendor(data);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete vendor "${name}"?`)) {
      await deleteVendor(id);
    }
  };

  // Helper to open Google Maps
  const handleOpenMaps = (location: string) => {
    if (!location.trim()) return;
    if (location.startsWith('http://') || location.startsWith('https://')) {
      window.open(location, '_blank', 'noopener,noreferrer');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Helper to copy text to clipboard
  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to clean phone number for whatsapp
  const getWhatsAppNumber = (phone: string): string => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return cleaned;
  };

  return (
    <div className="px-4 py-3 max-w-lg mx-auto flex flex-col justify-start animate-in fade-in pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-stone-800 tracking-tight leading-tight flex items-center gap-1.5">
              <Store className="w-4 h-4 text-indigo-700" />
              Vendor Directory
            </h2>
            <p className="text-[11px] text-stone-500 font-normal">
              Kadiyam plant suppliers & nurseries
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingVendor(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-700/50 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
              Saved Suppliers & Nurseries
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-white">{vendors.length}</span>
              <span className="text-xs text-indigo-200">Total Vendors</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-200 backdrop-blur-xs">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-indigo-200/90 mt-2 pt-2 border-t border-white/10 flex items-center gap-1">
          <Sprout className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Search any plant name below to find which vendor supplies it.</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by vendor or plant name (e.g. Royal Palm)..."
          className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-indigo-700 shadow-xs placeholder:text-stone-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 hover:text-stone-600 bg-stone-100 hover:bg-stone-200 px-1.5 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content Area */}
      {loading && vendors.length === 0 ? (
        <LoadingScreen 
          message="Loading Vendors..." 
          submessage="Retrieving your plant suppliers & nurseries..." 
        />
      ) : filteredVendors.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">
              {searchQuery ? 'No Matching Vendors Found' : 'No Vendors Added Yet'}
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              {searchQuery
                ? `No vendor or plant matches "${searchQuery}". Try a different keyword.`
                : 'Save Kadiyam nurseries with their available plants, Google Maps location, and phone number.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingVendor(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Vendor</span>
          </button>
        </div>
      ) : (
        /* Vendors List */
        <div className="space-y-3">
          {filteredVendors.map((vendor) => {
            // Split plant names by comma or newline
            const plantsList = vendor.plant_names
              .split(/[\n,]+/)
              .map(p => p.trim())
              .filter(Boolean);

            const hasPhone = Boolean(vendor.contact_number && vendor.contact_number.trim());
            const hasLocation = Boolean(vendor.location_link && vendor.location_link.trim());

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-stone-200/80 hover:border-indigo-400/60 transition-all space-y-3"
              >
                {/* Top Row: Vendor Name & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-stone-900 leading-tight truncate">
                        {vendor.vendor_name}
                      </h3>
                      <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                        Added on {new Date(vendor.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVendor(vendor);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-indigo-700 hover:bg-stone-100 transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vendor.id, vendor.vendor_name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Plant Names Tags */}
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <Sprout className="w-3 h-3 text-emerald-600" />
                    Plants & Materials Available:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plantsList.map((plant, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {plant}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location Box */}
                {hasLocation && (
                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-start space-x-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-stone-500 uppercase block leading-none mb-0.5">
                          Location / Maps
                        </span>
                        <p className="text-xs font-medium text-stone-800 truncate" title={vendor.location_link}>
                          {vendor.location_link}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(vendor.location_link, `loc-${vendor.id}`)}
                        className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                        title="Copy Location"
                      >
                        {copiedId === `loc-${vendor.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenMaps(vendor.location_link)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200/60 shadow-2xs active:scale-95"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Maps</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact Number & Quick Actions */}
                {hasPhone && (
                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-stone-500 uppercase block leading-none mb-0.5">
                          Contact Number
                        </span>
                        <a 
                          href={`tel:${vendor.contact_number}`}
                          className="text-xs font-bold text-stone-800 hover:text-indigo-700 transition-colors truncate block"
                        >
                          {vendor.contact_number}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {/* Copy Phone */}
                      <button
                        type="button"
                        onClick={() => handleCopy(vendor.contact_number, `tel-${vendor.id}`)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
                        title="Copy Phone Number"
                      >
                        {copiedId === `tel-${vendor.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Call Button */}
                      <a
                        href={`tel:${vendor.contact_number}`}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                        title="Call Vendor Directly"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${getWhatsAppNumber(vendor.contact_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-2xs active:scale-95"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Optional Notes */}
                {vendor.notes && (
                  <div className="text-[11px] text-stone-500 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <p className="leading-snug text-stone-700">{vendor.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVendor(null);
        }}
        onSave={handleSave}
        initialData={editingVendor}
      />
    </div>
  );
};
