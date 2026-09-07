import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ProjectPhoto } from '../types';
import { 
  ArrowLeft, 
  Images, 
  FolderKanban, 
  ChevronDown, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { ProjectGalleryCard } from '../components/subcards/ProjectGalleryCard';
import { ProjectDocumentsCard } from '../components/subcards/ProjectDocumentsCard';
import { ImageViewerModal } from '../components/ImageViewerModal';

interface ProjectGalleryHubScreenProps {
  onBack: () => void;
  onGoToProjects: () => void;
}

export const ProjectGalleryHubScreen: React.FC<ProjectGalleryHubScreenProps> = ({
  onBack,
  onGoToProjects,
}) => {
  const {
    projects,
    photos,
    documents,
    addPhoto,
    deletePhoto,
    addDocument,
    deleteDocument,
  } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects.length > 0 ? projects[0].id : '';
  });

  const [activeMediaTab, setActiveMediaTab] = useState<'gallery' | 'documents'>('gallery');
  const [fullscreenPhoto, setFullscreenPhoto] = useState<ProjectPhoto | null>(null);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const projectPhotos = currentProject 
    ? photos.filter(p => p.project_id === currentProject.id)
    : [];

  const projectDocs = currentProject 
    ? documents.filter(d => d.project_id === currentProject.id)
    : [];

  return (
    <div className="pb-20 pt-3 px-4 max-w-lg mx-auto sm:max-w-xl animate-in fade-in">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between py-2 mb-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-yard-green hover:text-yard-dark bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
          Project Media Hub
        </span>
      </div>

      {/* Screen Header */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Images className="w-6 h-6 text-yard-green" />
          Project Gallery & Media
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Select a project to upload and view site photos or project documents
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 p-6">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-stone-800">No Projects Created Yet</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            Create your first project in the Project Tracker to start uploading before/progress/after photos and documents.
          </p>
          <button
            onClick={onGoToProjects}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-yard-green text-white text-xs font-bold shadow-md"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Go to Projects Tracker</span>
          </button>
        </div>
      ) : (
        <>
          {/* Project Selector Dropdown Card */}
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-stone-200/80 mb-4">
            <label className="block text-[11px] font-extrabold text-yard-green uppercase tracking-wider mb-1.5">
              Selected Project
            </label>
            <div className="relative">
              <select
                value={selectedProjectId || currentProject?.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full appearance-none px-3.5 py-3 pr-10 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yard-green/50 cursor-pointer shadow-xs"
              >
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} {proj.client_name ? `(${proj.client_name})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-stone-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {currentProject && (
              <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Site: <strong className="text-stone-700">{currentProject.location || 'Not specified'}</strong></span>
                <span className="font-semibold text-yard-green">{currentProject.status}</span>
              </div>
            )}
          </div>

          {/* Media Switcher Tabs (Gallery vs Documents) */}
          <div className="grid grid-cols-2 gap-2 bg-stone-200/60 p-1 rounded-2xl mb-4 text-xs font-bold">
            <button
              onClick={() => setActiveMediaTab('gallery')}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                activeMediaTab === 'gallery'
                  ? 'bg-white text-yard-green shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Project Gallery ({projectPhotos.length})</span>
            </button>

            <button
              onClick={() => setActiveMediaTab('documents')}
              className={`py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                activeMediaTab === 'documents'
                  ? 'bg-white text-yard-green shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Documents ({projectDocs.length})</span>
            </button>
          </div>

          {/* Render Gallery or Documents for selected project */}
          {currentProject && activeMediaTab === 'gallery' && (
            <ProjectGalleryCard
              projectId={currentProject.id}
              photos={projectPhotos}
              onAddPhoto={async (pho) => { await addPhoto(pho); }}
              onDeletePhoto={deletePhoto}
              onViewFullscreen={(p) => setFullscreenPhoto(p)}
            />
          )}

          {currentProject && activeMediaTab === 'documents' && (
            <ProjectDocumentsCard
              projectId={currentProject.id}
              documents={projectDocs}
              onAddDocument={async (doc) => { await addDocument(doc); }}
              onDeleteDocument={deleteDocument}
            />
          )}

          {/* Lightbox Modal */}
          <ImageViewerModal
            photo={fullscreenPhoto}
            onClose={() => setFullscreenPhoto(null)}
          />
        </>
      )}
    </div>
  );
};
