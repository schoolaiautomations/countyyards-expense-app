import React, { useState } from 'react';
import { ProjectPhoto, GalleryStage, GALLERY_STAGES } from '../../types';
import { formatDate } from '../../utils/formatters';
import { 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Maximize2, 
  Camera, 
  UploadCloud, 
  Download,
  Plus,
  X 
} from 'lucide-react';

interface ProjectGalleryCardProps {
  projectId: string;
  photos: ProjectPhoto[];
  onAddPhoto: (photo: Omit<ProjectPhoto, 'id' | 'created_at'>) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  onViewFullscreen: (photo: ProjectPhoto) => void;
}

const STAGE_SHORT_LABELS: Record<GalleryStage, string> = {
  'Before Work': 'Before',
  'Work in Progress': 'In Progress',
  'After Completion': 'Completed',
};

export const ProjectGalleryCard: React.FC<ProjectGalleryCardProps> = ({
  projectId,
  photos,
  onAddPhoto,
  onDeletePhoto,
  onViewFullscreen,
}) => {
  const [activeStage, setActiveStage] = useState<GalleryStage>('Before Work');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<GalleryStage>('Before Work');
  const [imageDate, setImageDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stagePhotos = photos.filter(p => p.stage === activeStage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    setIsSubmitting(true);
    try {
      await onAddPhoto({
        project_id: projectId,
        stage: selectedStage,
        image_url: previewUrl,
        date: imageDate || new Date().toISOString().split('T')[0],
        description: description.trim() || undefined,
      });

      setActiveStage(selectedStage);
      setPreviewUrl('');
      setDescription('');
      setImageDate(new Date().toISOString().split('T')[0]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-xs border border-stone-200/80 mb-3 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2.5">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-xs font-semibold text-stone-800">
            Gallery
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 font-medium">
            {photos.length}
          </span>
        </div>
      </div>

      {/* 3 Compact Stage Tabs (No Word Overlap) */}
      <div className="flex bg-stone-100 p-0.5 rounded-lg mb-2.5 text-xs">
        {GALLERY_STAGES.map(stage => {
          const count = photos.filter(p => p.stage === stage).length;
          const isActive = activeStage === stage;
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`flex-1 py-1.5 px-1 rounded-md text-center text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 ${
                isActive
                  ? 'bg-white text-yard-green shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{STAGE_SHORT_LABELS[stage]}</span>
              <span className={`text-[9px] px-1 rounded-full ${
                isActive ? 'bg-yard-mint text-yard-green' : 'text-stone-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Photo Button */}
      <button
        onClick={() => {
          setSelectedStage(activeStage);
          setIsModalOpen(true);
        }}
        className="w-full py-1.5 px-3 mb-3 rounded-lg border border-dashed border-yard-green/40 bg-yard-mint/20 hover:bg-yard-mint/40 text-yard-green font-medium text-xs flex items-center justify-center space-x-1 active:scale-[0.99] transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add {STAGE_SHORT_LABELS[activeStage]} Photo</span>
      </button>

      {/* Photos List */}
      {stagePhotos.length === 0 ? (
        <div className="text-center py-6 bg-stone-50 rounded-lg border border-stone-100">
          <ImageIcon className="w-6 h-6 text-stone-300 mx-auto mb-1" />
          <p className="text-[11px] font-medium text-stone-500">No {STAGE_SHORT_LABELS[activeStage]} photos</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {stagePhotos.map(photo => (
            <div
              key={photo.id}
              className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs flex flex-col"
            >
              {/* Image Container with Safe Loading */}
              <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden flex items-center justify-center">
                <img
                  src={photo.image_url}
                  alt=""
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => onViewFullscreen(photo)}
                  onError={(e) => {
                    // Hide broken image link text and show clean icon
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Fallback Icon if image fails or loading */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -z-0 text-stone-300">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-[10px] text-stone-400 mt-1">Photo</span>
                </div>

                <button
                  onClick={() => onViewFullscreen(photo)}
                  className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/60 text-white"
                  title="Expand"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>

                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white">
                    {STAGE_SHORT_LABELS[photo.stage]}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[10px] text-stone-400 mb-0.5">
                    <Calendar className="w-2.5 h-2.5 mr-1" />
                    <span>{formatDate(photo.date)}</span>
                  </div>
                  {photo.description && (
                    <p className="text-xs text-stone-700 font-normal line-clamp-2">
                      {photo.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <a
                    href={photo.image_url}
                    download={`cy-${photo.id}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yard-green font-medium flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="text-stone-400 hover:text-rose-600 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-4 shadow-xl border border-stone-100 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-yard-green" />
                Add Photo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Stage
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {GALLERY_STAGES.map(stage => (
                    <button
                      type="button"
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedStage === stage
                          ? 'bg-yard-green text-white border-yard-green'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {STAGE_SHORT_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Photo
                </label>
                {previewUrl ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100 mb-1.5">
                    <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreviewUrl('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-stone-300 hover:border-yard-green rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-stone-50">
                    <UploadCloud className="w-6 h-6 text-yard-green mb-1" />
                    <span className="text-xs font-medium text-stone-700">Choose or Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={imageDate}
                  onChange={(e) => setImageDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short description of photo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !previewUrl}
                  className="flex-1 py-2 rounded-lg bg-yard-green text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
