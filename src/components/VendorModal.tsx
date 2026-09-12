import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { X, Store, Save, Plus, Phone, MapPin, Sprout, FileText } from 'lucide-react';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Vendor | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [plantNames, setPlantNames] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setVendorName(initialData.vendor_name);
      setPlantNames(initialData.plant_names);
      setContactNumber(initialData.contact_number || '');
      setLocationLink(initialData.location_link || '');
      setNotes(initialData.notes || '');
    } else {
      setVendorName('');
      setPlantNames('');
      setContactNumber('');
      setLocationLink('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !plantNames.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        vendor_name: vendorName.trim(),
        plant_names: plantNames.trim(),
        contact_number: contactNumber.trim(),
        location_link: locationLink.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving vendor details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-stone-100 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {initialData ? 'Edit Vendor Details' : 'Add New Vendor'}
              </h3>
              <p className="text-[11px] text-stone-500 font-normal">
                Kadiyam plant nursery & supplier info
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Vendor / Nursery Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-indigo-700" />
              <span>Vendor / Nursery Name</span>
              <span className="text-rose-500 font-normal">*</span>
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Sri Venkateswara Nursery, Kadiyam"
              className="w-full px-3 py-2 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:bg-white transition-all placeholder:text-stone-400"
            />
          </div>

          {/* 2. Plant Names / Materials Available */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plant Names / Materials Supplied</span>
              <span className="text-rose-500 font-normal">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={plantNames}
              onChange={(e) => setPlantNames(e.target.value)}
              placeholder="e.g. Royal Palms, Foxtail, Costus, Zebra, Carpet Grass, Bougainvillea"
              className="w-full px-3 py-2 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:bg-white transition-all placeholder:text-stone-400 resize-none"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              Separate multiple plants with commas. You can search vendors by any plant name!
            </p>
          </div>

          {/* 3. Contact Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-stone-600" />
              <span>Contact Number</span>
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. 9876543210 or 0883-2412345"
              className="w-full px-3 py-2 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:bg-white transition-all placeholder:text-stone-400"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              Enables direct 1-tap call & WhatsApp messaging
            </p>
          </div>

          {/* 4. Google Location Link or Location Text */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Google Location Link or Location Text</span>
            </label>
            <input
              type="text"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="e.g. https://maps.app.goo.gl/... or Burrilanka Road, Kadiyam"
              className="w-full px-3 py-2 text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:bg-white transition-all placeholder:text-stone-400"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              Paste a Google Maps share link or enter landmark / street name
            </p>
          </div>

          {/* 5. Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Notes (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Contact person: Ramesh. Good wholesale discounts on bulk orders."
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:bg-white transition-all placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !vendorName.trim() || !plantNames.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center space-x-1"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{initialData ? 'Update Vendor' : 'Save Vendor'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
