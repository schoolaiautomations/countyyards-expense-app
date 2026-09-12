import React, { useState } from 'react';
import { X, Plus, Trash2, Droplets, Sun, FlaskConical } from 'lucide-react';
import { SiteAssessment, AssessmentMeasurement } from '../types';

interface MeasurementRow {
  zone_name: string;
  length_ft: string;
  width_ft: string;
}

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    assessment: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'>,
    measurements: Omit<AssessmentMeasurement, 'id' | 'created_at' | 'assessment_id'>[]
  ) => Promise<void>;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [location, setLocation] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestDesc, setInterestDesc] = useState('');
  const [soilDone, setSoilDone] = useState(false);
  const [soilNotes, setSoilNotes] = useState('');
  const [waterDone, setWaterDone] = useState(false);
  const [waterNotes, setWaterNotes] = useState('');
  const [sunDone, setSunDone] = useState(false);
  const [sunNotes, setSunNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([
    { zone_name: '', length_ft: '', width_ft: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addRow = () => {
    setMeasurements(prev => [...prev, { zone_name: '', length_ft: '', width_ft: '' }]);
  };

  const removeRow = (idx: number) => {
    setMeasurements(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof MeasurementRow, value: string) => {
    setMeasurements(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const calcArea = (r: MeasurementRow) => {
    const l = parseFloat(r.length_ft) || 0;
    const w = parseFloat(r.width_ft) || 0;
    return l * w;
  };

  const totalSqft = measurements.reduce((sum, r) => sum + calcArea(r), 0);

  const handleSubmit = async () => {
    if (!clientName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const assessmentData: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'> = {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        location: location.trim(),
        visit_date: visitDate,
        interest_description: interestDesc.trim(),
        soil_test_done: soilDone,
        soil_test_notes: soilNotes.trim(),
        water_test_done: waterDone,
        water_test_notes: waterNotes.trim(),
        sunlight_check_done: sunDone,
        sunlight_check_notes: sunNotes.trim(),
        total_sqft: totalSqft,
        notes: notes.trim(),
        status: 'Pending',
      };

      const validMeasurements = measurements
        .filter(r => r.zone_name.trim() && (parseFloat(r.length_ft) > 0 || parseFloat(r.width_ft) > 0))
        .map(r => ({
          zone_name: r.zone_name.trim(),
          length_ft: parseFloat(r.length_ft) || 0,
          width_ft: parseFloat(r.width_ft) || 0,
          area_sqft: calcArea(r),
          notes: '',
        }));

      await onSave(assessmentData, validMeasurements);
      onClose();
    } catch (e) {
      console.error('Error creating assessment:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full text-xs border border-stone-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white';
  const labelCls = 'text-[11px] font-medium text-stone-600 mb-0.5 block';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <h3 className="text-sm font-bold text-stone-800">New Site Assessment</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Client Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Client Name *</label>
              <input className={inputCls} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Name" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Phone" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={location} onChange={e => setLocation(e.target.value)} placeholder="Site location" />
            </div>
            <div>
              <label className={labelCls}>Visit Date</label>
              <input type="date" className={inputCls} value={visitDate} onChange={e => setVisitDate(e.target.value)} />
            </div>
          </div>

          {/* Interest Description */}
          <div>
            <label className={labelCls}>Client Interest / Description</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={interestDesc} onChange={e => setInterestDesc(e.target.value)}
              placeholder="What is the client looking for? Garden, lawn, terrace, etc." />
          </div>

          {/* Checklist */}
          <div className="bg-stone-50 rounded-lg p-2.5 space-y-2">
            <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wide">Site Checklist</p>

            {/* Soil Test */}
            <div className="flex items-start gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer min-w-[100px]">
                <input type="checkbox" checked={soilDone} onChange={e => setSoilDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                <FlaskConical className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] font-medium text-stone-700">Soil Test</span>
              </label>
              {soilDone && (
                <input className="flex-1 text-[11px] border border-stone-200 rounded px-2 py-1 bg-white" value={soilNotes}
                  onChange={e => setSoilNotes(e.target.value)} placeholder="Notes..." />
              )}
            </div>

            {/* Water Test */}
            <div className="flex items-start gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer min-w-[100px]">
                <input type="checkbox" checked={waterDone} onChange={e => setWaterDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-blue-600 focus:ring-blue-500" />
                <Droplets className="w-3 h-3 text-blue-600" />
                <span className="text-[11px] font-medium text-stone-700">Water Test</span>
              </label>
              {waterDone && (
                <input className="flex-1 text-[11px] border border-stone-200 rounded px-2 py-1 bg-white" value={waterNotes}
                  onChange={e => setWaterNotes(e.target.value)} placeholder="Notes..." />
              )}
            </div>

            {/* Sunlight */}
            <div className="flex items-start gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer min-w-[100px]">
                <input type="checkbox" checked={sunDone} onChange={e => setSunDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-yellow-600 focus:ring-yellow-500" />
                <Sun className="w-3 h-3 text-yellow-500" />
                <span className="text-[11px] font-medium text-stone-700">Sunlight</span>
              </label>
              {sunDone && (
                <input className="flex-1 text-[11px] border border-stone-200 rounded px-2 py-1 bg-white" value={sunNotes}
                  onChange={e => setSunNotes(e.target.value)} placeholder="Notes..." />
              )}
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wide">Area Measurements</p>
              <button onClick={addRow} className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5 hover:underline">
                <Plus className="w-3 h-3" /> Add Zone
              </button>
            </div>

            {measurements.map((row, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-stone-50 rounded-lg p-1.5">
                <input className="flex-1 text-[11px] border border-stone-200 rounded px-2 py-1.5 bg-white min-w-0"
                  value={row.zone_name} onChange={e => updateRow(idx, 'zone_name', e.target.value)} placeholder="Zone name" />
                <input type="number" className="w-16 text-[11px] border border-stone-200 rounded px-2 py-1.5 bg-white text-center"
                  value={row.length_ft} onChange={e => updateRow(idx, 'length_ft', e.target.value)} placeholder="L (ft)" />
                <span className="text-[10px] text-stone-400">×</span>
                <input type="number" className="w-16 text-[11px] border border-stone-200 rounded px-2 py-1.5 bg-white text-center"
                  value={row.width_ft} onChange={e => updateRow(idx, 'width_ft', e.target.value)} placeholder="W (ft)" />
                <span className="text-[10px] text-stone-500 font-medium w-14 text-right">{calcArea(row).toFixed(0)} ft²</span>
                {measurements.length > 1 && (
                  <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 p-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200">
              <span className="text-[11px] font-semibold text-stone-700">Total Coverage:</span>
              <span className="text-sm font-bold text-amber-700">{totalSqft.toFixed(0)} sq.ft</span>
            </div>
          </div>

          {/* Additional notes */}
          <div>
            <label className={labelCls}>Additional Notes</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any other observations..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-200 flex gap-2">
          <button onClick={onClose} className="flex-1 text-xs font-medium text-stone-600 py-2 rounded-lg border border-stone-300 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!clientName.trim() || isSubmitting}
            className="flex-1 text-xs font-semibold text-white py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};
