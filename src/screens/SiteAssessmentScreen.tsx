import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  ClipboardCheck, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Layers,
  FlaskConical,
  Droplets,
  Sun
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { SiteAssessment, AssessmentMeasurement } from '../types';
import { NewAssessmentModal } from '../components/NewAssessmentModal';
import { AssessmentDetailView } from '../components/AssessmentDetailView';
import { LoadingScreen, SyncingBadge } from '../components/LoadingScreen';

interface SiteAssessmentScreenProps {
  onBack: () => void;
}

export const SiteAssessmentScreen: React.FC<SiteAssessmentScreenProps> = ({ onBack }) => {
  const { 
    assessments, 
    assessmentMeasurements, 
    loading, 
    createAssessment, 
    addMeasurement 
  } = useProjects();
  
  const [selectedAssessment, setSelectedAssessment] = useState<SiteAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // If viewing details of a specific assessment
  if (selectedAssessment) {
    const liveAssessment = assessments.find(a => a.id === selectedAssessment.id) || selectedAssessment;
    return (
      <div className="px-4 py-3 max-w-lg mx-auto">
        <AssessmentDetailView
          assessment={liveAssessment}
          onBack={() => setSelectedAssessment(null)}
        />
      </div>
    );
  }

  // Filter assessments
  const filtered = assessments.filter(a => 
    a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveAssessment = async (
    assessmentData: Omit<SiteAssessment, 'id' | 'created_at' | 'updated_at'>,
    measurements: Omit<AssessmentMeasurement, 'id' | 'created_at' | 'assessment_id'>[]
  ) => {
    const created = await createAssessment(assessmentData);
    for (const m of measurements) {
      await addMeasurement({
        ...m,
        assessment_id: created.id,
      });
    }
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
            <h2 className="text-base font-bold text-stone-800 tracking-tight leading-tight">
              Client Site Assessment
            </h2>
            <p className="text-[11px] text-stone-500 font-normal">
              Measurements, checklist & interest notes
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Syncing indicator */}
      {loading && assessments.length > 0 && <SyncingBadge />}

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client or location..."
          className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Loading state when initial cache is empty */}
      {loading && assessments.length === 0 ? (
        <LoadingScreen 
          message="Loading Site Assessments..." 
          submessage="Retrieving checklist records, measurements and tests..." 
        />
      ) : filtered.length === 0 ? (
        /* Empty State only when NOT loading */
        <div className="bg-white rounded-xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">No Assessments Yet</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Record client site visit details, soil & water tests, sunlight conditions, and area measurements.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Assessment</span>
          </button>
        </div>
      ) : (
        /* Assessment Cards List */
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const itemMeasurements = assessmentMeasurements.filter(m => m.assessment_id === item.id);
            const totalArea = itemMeasurements.length > 0 
              ? itemMeasurements.reduce((sum, m) => sum + Number(m.area_sqft || 0), 0)
              : Number(item.total_sqft || 0);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedAssessment(item)}
                className="bg-white rounded-xl p-3 shadow-xs hover:shadow-soft border border-stone-200/80 hover:border-amber-400 active:scale-[0.99] cursor-pointer transition-all flex flex-col gap-2"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide block leading-tight">
                      {item.status || 'Pending'}
                    </span>
                    <h3 className="text-sm font-semibold text-stone-800 truncate">
                      {item.client_name}
                    </h3>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-medium text-stone-400 block">Total Area</span>
                    <span className="text-xs font-bold text-amber-700">
                      {totalArea.toLocaleString()} <span className="text-[10px] font-normal text-stone-500">sq.ft</span>
                    </span>
                  </div>
                </div>

                {/* Location & Date */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
                  {item.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span>{item.visit_date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    <span>{itemMeasurements.length} zones</span>
                  </span>
                </div>

                {/* Tests Badges */}
                <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${item.soil_test_done ? 'bg-amber-100 text-amber-800 font-medium' : 'bg-stone-100 text-stone-400'}`}>
                      <FlaskConical className="w-2.5 h-2.5" /> Soil: {item.soil_test_done ? 'Done' : 'No'}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${item.water_test_done ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-stone-100 text-stone-400'}`}>
                      <Droplets className="w-2.5 h-2.5" /> Water: {item.water_test_done ? 'Done' : 'No'}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${item.sunlight_check_done ? 'bg-yellow-100 text-yellow-800 font-medium' : 'bg-stone-100 text-stone-400'}`}>
                      <Sun className="w-2.5 h-2.5" /> Sun: {item.sunlight_check_done ? 'Checked' : 'No'}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Assessment Modal */}
      <NewAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAssessment}
      />
    </div>
  );
};
