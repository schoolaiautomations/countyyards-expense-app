import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  FlaskConical, 
  Droplets, 
  Sun, 
  FileText,
  Layers,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { SiteAssessment } from '../types';
import { useProjects } from '../context/ProjectContext';

interface AssessmentDetailViewProps {
  assessment: SiteAssessment;
  onBack: () => void;
}

export const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({ assessment, onBack }) => {
  const { 
    assessmentMeasurements, 
    addMeasurement, 
    updateMeasurement,
    deleteMeasurement, 
    deleteAssessment,
    updateAssessment 
  } = useProjects();

  // Edit states for each section
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(assessment.client_name);
  const [editPhone, setEditPhone] = useState(assessment.client_phone || '');
  const [editLocation, setEditLocation] = useState(assessment.location || '');
  const [editVisitDate, setEditVisitDate] = useState(assessment.visit_date);

  const [isEditingInterest, setIsEditingInterest] = useState(false);
  const [editInterest, setEditInterest] = useState(assessment.interest_description || '');

  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const [editSoilDone, setEditSoilDone] = useState(assessment.soil_test_done);
  const [editSoilNotes, setEditSoilNotes] = useState(assessment.soil_test_notes || '');
  const [editWaterDone, setEditWaterDone] = useState(assessment.water_test_done);
  const [editWaterNotes, setEditWaterNotes] = useState(assessment.water_test_notes || '');
  const [editSunDone, setEditSunDone] = useState(assessment.sunlight_check_done);
  const [editSunNotes, setEditSunNotes] = useState(assessment.sunlight_check_notes || '');

  // Zone add state
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [zoneNotes, setZoneNotes] = useState('');

  // Zone edit state (by measurement id)
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneLength, setEditZoneLength] = useState('');
  const [editZoneWidth, setEditZoneWidth] = useState('');
  const [editZoneNotes, setEditZoneNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter measurements for this assessment
  const measurements = assessmentMeasurements.filter(m => m.assessment_id === assessment.id);
  const totalArea = measurements.reduce((sum, m) => sum + Number(m.area_sqft || 0), 0);

  // Save Info
  const handleSaveInfo = async () => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateAssessment(assessment.id, {
        client_name: editName.trim(),
        client_phone: editPhone.trim(),
        location: editLocation.trim(),
        visit_date: editVisitDate,
      });
      setIsEditingInfo(false);
    } catch (err) {
      console.error('Error saving info:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Interest
  const handleSaveInterest = async () => {
    setIsSubmitting(true);
    try {
      await updateAssessment(assessment.id, {
        interest_description: editInterest.trim(),
      });
      setIsEditingInterest(false);
    } catch (err) {
      console.error('Error saving interest:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Checklist
  const handleSaveChecklist = async () => {
    setIsSubmitting(true);
    try {
      await updateAssessment(assessment.id, {
        soil_test_done: editSoilDone,
        soil_test_notes: editSoilNotes.trim(),
        water_test_done: editWaterDone,
        water_test_notes: editWaterNotes.trim(),
        sunlight_check_done: editSunDone,
        sunlight_check_notes: editSunNotes.trim(),
      });
      setIsEditingChecklist(false);
    } catch (err) {
      console.error('Error saving checklist:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Zone
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || isSubmitting) return;

    const l = parseFloat(lengthFt) || 0;
    const w = parseFloat(widthFt) || 0;
    const area = l * w;

    setIsSubmitting(true);
    try {
      await addMeasurement({
        assessment_id: assessment.id,
        zone_name: zoneName.trim(),
        length_ft: l,
        width_ft: w,
        area_sqft: area,
        notes: zoneNotes.trim(),
      });

      setZoneName('');
      setLengthFt('');
      setWidthFt('');
      setZoneNotes('');
      setIsAddingZone(false);
    } catch (err) {
      console.error('Error adding zone:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Editing Zone
  const startEditZone = (m: typeof measurements[0]) => {
    setEditingZoneId(m.id);
    setEditZoneName(m.zone_name);
    setEditZoneLength(String(m.length_ft || ''));
    setEditZoneWidth(String(m.width_ft || ''));
    setEditZoneNotes(m.notes || '');
  };

  // Save Edited Zone
  const handleSaveZone = async (id: string) => {
    if (!editZoneName.trim() || isSubmitting) return;
    const l = parseFloat(editZoneLength) || 0;
    const w = parseFloat(editZoneWidth) || 0;
    const area = l * w;

    setIsSubmitting(true);
    try {
      await updateMeasurement(
        id,
        {
          zone_name: editZoneName.trim(),
          length_ft: l,
          width_ft: w,
          area_sqft: area,
          notes: editZoneNotes.trim(),
        },
        assessment.id
      );
      setEditingZoneId(null);
    } catch (err) {
      console.error('Error updating zone:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (window.confirm(`Delete assessment for ${assessment.client_name}? This cannot be undone.`)) {
      await deleteAssessment(assessment.id);
      onBack();
    }
  };

  const handleStatusChange = async (newStatus: 'Pending' | 'Approved' | 'Rejected') => {
    await updateAssessment(assessment.id, { status: newStatus });
  };

  const inputCls = "w-full text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelCls = "text-[11px] font-medium text-stone-600 mb-0.5 block";

  return (
    <div className="space-y-4 pb-24 animate-in fade-in">
      {/* Top Header / Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 text-xs font-semibold py-1 px-2 rounded-lg hover:bg-stone-200/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Assessments</span>
        </button>

        <div className="flex items-center gap-2">
          <select
            value={assessment.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="text-[11px] font-semibold px-2 py-1 rounded-full border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
          >
            <option value="Pending">⏳ Pending</option>
            <option value="Approved">✅ Approved</option>
            <option value="Rejected">❌ Rejected</option>
          </select>

          <button
            onClick={handleDeleteAssessment}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Assessment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Client Info Card */}
      <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
              Site Assessment
            </span>
            <h2 className="text-base font-bold text-stone-800 leading-tight">
              {assessment.client_name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] font-medium text-stone-400 block">Total Area</span>
              <span className="text-base font-extrabold text-amber-700">
                {totalArea.toLocaleString()} <span className="text-xs font-normal text-stone-600">sq.ft</span>
              </span>
            </div>
            <button
              onClick={() => {
                if (!isEditingInfo) {
                  setEditName(assessment.client_name);
                  setEditPhone(assessment.client_phone || '');
                  setEditLocation(assessment.location || '');
                  setEditVisitDate(assessment.visit_date);
                }
                setIsEditingInfo(!isEditingInfo);
              }}
              className="p-1 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
              title="Edit Client Info"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isEditingInfo ? (
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Client Name *</label>
                <input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={editPhone} onChange={e => setEditPhone(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Visit Date</label>
                <input type="date" className={inputCls} value={editVisitDate} onChange={e => setEditVisitDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="text-xs text-stone-600 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInfo}
                disabled={isSubmitting || !editName.trim()}
                className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Info'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 pt-1 border-t border-stone-100">
            {assessment.client_phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{assessment.client_phone}</span>
              </div>
            )}
            {assessment.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{assessment.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>Visit: {assessment.visit_date}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Client Interest & Notes Card */}
      <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              Client Interest & Notes
            </h3>
          </div>
          <button
            onClick={() => {
              if (!isEditingInterest) {
                setEditInterest(assessment.interest_description || '');
              }
              setIsEditingInterest(!isEditingInterest);
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            title="Edit Interest Notes"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditingInterest ? (
          <div className="space-y-2">
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={editInterest}
              onChange={e => setEditInterest(e.target.value)}
              placeholder="What is the client looking for? Grass, lawn, plants, vertical garden, gazebo..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingInterest(false)}
                className="text-xs text-stone-600 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInterest}
                disabled={isSubmitting}
                className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap bg-stone-50/80 rounded-lg p-2.5 border border-stone-200/60">
            {assessment.interest_description || (
              <span className="text-stone-400 italic">No client interest notes recorded yet.</span>
            )}
          </p>
        )}
      </div>

      {/* 3. Site Checklist Tests Card */}
      <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            Site Checklist Tests
          </h3>
          <button
            onClick={() => {
              if (!isEditingChecklist) {
                setEditSoilDone(assessment.soil_test_done);
                setEditSoilNotes(assessment.soil_test_notes || '');
                setEditWaterDone(assessment.water_test_done);
                setEditWaterNotes(assessment.water_test_notes || '');
                setEditSunDone(assessment.sunlight_check_done);
                setEditSunNotes(assessment.sunlight_check_notes || '');
              }
              setIsEditingChecklist(!isEditingChecklist);
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
            title="Edit Checklist"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditingChecklist ? (
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 space-y-3">
            {/* Soil Test Edit */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSoilDone}
                  onChange={e => setEditSoilDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-stone-800">Soil Test Done</span>
              </label>
              <input
                className={inputCls}
                value={editSoilNotes}
                onChange={e => setEditSoilNotes(e.target.value)}
                placeholder="Soil test notes (e.g. Red soil, good fertility, pH 6.5)"
              />
            </div>

            {/* Water Test Edit */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editWaterDone}
                  onChange={e => setEditWaterDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-stone-800">Water Test Done</span>
              </label>
              <input
                className={inputCls}
                value={editWaterNotes}
                onChange={e => setEditWaterNotes(e.target.value)}
                placeholder="Water test notes (e.g. Borewell water, TDS 450 ppm)"
              />
            </div>

            {/* Sunlight Edit */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editSunDone}
                  onChange={e => setEditSunDone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 text-yellow-600 focus:ring-yellow-500"
                />
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-semibold text-stone-800">Sunlight Checked</span>
              </label>
              <input
                className={inputCls}
                value={editSunNotes}
                onChange={e => setEditSunNotes(e.target.value)}
                placeholder="Sunlight notes (e.g. 5 hours direct morning sun)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEditingChecklist(false)}
                className="text-xs text-stone-600 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChecklist}
                disabled={isSubmitting}
                className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Checklist'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Soil Test View */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200/70">
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">Soil Test</span>
                  {assessment.soil_test_done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                {assessment.soil_test_notes && (
                  <p className="text-[11px] text-stone-600 mt-0.5">{assessment.soil_test_notes}</p>
                )}
              </div>
            </div>

            {/* Water Test View */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200/70">
              <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">Water Test</span>
                  {assessment.water_test_done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                {assessment.water_test_notes && (
                  <p className="text-[11px] text-stone-600 mt-0.5">{assessment.water_test_notes}</p>
                )}
              </div>
            </div>

            {/* Sunlight View */}
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200/70">
              <div className="w-7 h-7 rounded-md bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sun className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">Sunlight Analysis</span>
                  {assessment.sunlight_check_done ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Checked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                {assessment.sunlight_check_notes && (
                  <p className="text-[11px] text-stone-600 mt-0.5">{assessment.sunlight_check_notes}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Zone Measurements Section */}
      <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              Zone Measurements ({measurements.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddingZone(!isAddingZone)}
            className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Zone</span>
          </button>
        </div>

        {/* Add Zone Inline Form */}
        {isAddingZone && (
          <form onSubmit={handleAddZone} className="bg-stone-50 rounded-lg p-3 border border-stone-200 space-y-2">
            <p className="text-[11px] font-semibold text-stone-700">Add New Zone Measurement</p>
            <div>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Zone / Part Name (e.g. Front Lawn, Terrace)"
                className={inputCls}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  step="any"
                  value={lengthFt}
                  onChange={(e) => setLengthFt(e.target.value)}
                  placeholder="Length (ft)"
                  className={`${inputCls} text-center`}
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  value={widthFt}
                  onChange={(e) => setWidthFt(e.target.value)}
                  placeholder="Width (ft)"
                  className={`${inputCls} text-center`}
                  required
                />
              </div>
            </div>
            {lengthFt && widthFt && (
              <div className="text-[11px] font-semibold text-amber-700 text-right">
                Area: {((parseFloat(lengthFt) || 0) * (parseFloat(widthFt) || 0)).toFixed(1)} sq.ft
              </div>
            )}
            <div>
              <input
                type="text"
                value={zoneNotes}
                onChange={(e) => setZoneNotes(e.target.value)}
                placeholder="Notes (optional, e.g. Korean grass, slope)"
                className={inputCls}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingZone(false)}
                className="text-xs text-stone-600 px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !zoneName.trim()}
                className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Add Zone'}
              </button>
            </div>
          </form>
        )}

        {/* Measurements List Table */}
        {measurements.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-4 italic">
            No zone measurements added yet. Tap "Add Zone" above.
          </p>
        ) : (
          <div className="space-y-1.5">
            {measurements.map((m) => {
              const isEditingThisZone = editingZoneId === m.id;

              if (isEditingThisZone) {
                const currentCalcArea = (parseFloat(editZoneLength) || 0) * (parseFloat(editZoneWidth) || 0);
                return (
                  <div key={m.id} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800">Edit Zone</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSaveZone(m.id)}
                          disabled={isSubmitting || !editZoneName.trim()}
                          className="p-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingZoneId(null)}
                          className="p-1 rounded bg-stone-200 text-stone-600 hover:bg-stone-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={editZoneName}
                        onChange={e => setEditZoneName(e.target.value)}
                        placeholder="Zone name"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          step="any"
                          value={editZoneLength}
                          onChange={e => setEditZoneLength(e.target.value)}
                          placeholder="Length (ft)"
                          className={`${inputCls} text-center`}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          value={editZoneWidth}
                          onChange={e => setEditZoneWidth(e.target.value)}
                          placeholder="Width (ft)"
                          className={`${inputCls} text-center`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Calculated Area:</span>
                      <span className="font-bold text-amber-700">{currentCalcArea.toFixed(1)} sq.ft</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={editZoneNotes}
                        onChange={e => setEditZoneNotes(e.target.value)}
                        placeholder="Zone notes (optional)"
                        className={inputCls}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200/60"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-800 truncate">{m.zone_name}</span>
                      <span className="text-[10px] text-stone-500">
                        ({m.length_ft} ft × {m.width_ft} ft)
                      </span>
                    </div>
                    {m.notes && <p className="text-[10px] text-stone-500 truncate">{m.notes}</p>}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold text-amber-700 mr-1">
                      {Number(m.area_sqft).toLocaleString()} sq.ft
                    </span>
                    <button
                      onClick={() => startEditZone(m)}
                      className="p-1 rounded text-stone-400 hover:text-amber-700 hover:bg-stone-200/60 transition-colors"
                      title="Edit Zone"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteMeasurement(m.id, assessment.id)}
                      className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-stone-200/60 transition-colors"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total Summary Footer */}
            <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-700">Total Covered Area:</span>
              <span className="text-base font-extrabold text-amber-700">
                {totalArea.toLocaleString()} sq.ft
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
