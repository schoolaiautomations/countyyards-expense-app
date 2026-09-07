import React from 'react';
import { ProjectPhoto } from '../types';
import { formatDate } from '../utils/formatters';
import { X, Calendar, Download } from 'lucide-react';

interface ImageViewerModalProps {
  photo: ProjectPhoto | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between text-white pt-2 px-2">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yard-green text-white">
            {photo.stage}
          </span>
          <div className="flex items-center text-stone-300 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
            <span>{formatDate(photo.date)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={photo.image_url}
            download={`countryyards-${photo.stage.toLowerCase().replace(/\s+/g, '-')}-${photo.id}.jpg`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center space-x-1 text-xs font-semibold px-3"
            title="Download Photo"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="flex-1 flex items-center justify-center p-2 my-auto max-h-[75vh]">
        <img
          src={photo.image_url}
          alt={photo.description || photo.stage}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Footer Info */}
      <div className="bg-stone-900/90 rounded-xl p-4 border border-white/10 max-w-xl mx-auto w-full">
        <p className="text-sm text-stone-200 font-medium leading-relaxed">
          {photo.description || 'No description added.'}
        </p>
      </div>
    </div>
  );
};
