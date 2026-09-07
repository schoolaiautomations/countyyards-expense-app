import React, { useState } from 'react';
import { ProjectDocument } from '../../types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import { 
  Plus, 
  Trash2, 
  FileText, 
  FileCheck, 
  Download, 
  UploadCloud, 
  X 
} from 'lucide-react';

interface ProjectDocumentsCardProps {
  projectId: string;
  documents: ProjectDocument[];
  onAddDocument: (doc: Omit<ProjectDocument, 'id' | 'uploaded_at'>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const ProjectDocumentsCard: React.FC<ProjectDocumentsCardProps> = ({
  projectId,
  documents,
  onAddDocument,
  onDeleteDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type || 'document');
      setFileSize(Math.round(file.size / 1024)); // in KB
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileUrl) return;

    setIsSubmitting(true);
    try {
      await onAddDocument({
        project_id: projectId,
        file_name: fileName.trim(),
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
      });

      setFileName('');
      setFileUrl('');
      setFileSize(0);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-stone-200/80 mb-4 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
        <div>
          <h2 className="text-xs uppercase font-extrabold tracking-wider text-yard-green">
            Subcard 6
          </h2>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            Project Documents & Files
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
              {documents.length} Files
            </span>
          </h3>
        </div>
      </div>

      {/* Upload Doc Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 px-4 mb-4 rounded-xl border-2 border-dashed border-stone-300 hover:border-yard-green bg-stone-50 hover:bg-yard-mint/20 text-stone-700 hover:text-yard-green font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-[0.99] transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>+ Upload Project Document (PDF, Contract, CAD Blueprint)</span>
      </button>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-6 bg-stone-50 rounded-xl border border-stone-100">
          <FileText className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
          <p className="text-xs text-stone-500">No project documents uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {doc.file_name}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-stone-400 mt-0.5">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.file_name}
                  className="p-1.5 text-stone-600 hover:text-yard-green bg-white rounded-lg border border-stone-200 shadow-xs hover:bg-stone-50"
                  title="View / Download Document"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  title="Delete Document"
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-stone-100 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-yard-green" />
                Upload Project Document
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Select File (PDF, Images, Blueprint) *
                </label>
                <label className="border-2 border-dashed border-stone-300 hover:border-yard-green rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-stone-50 hover:bg-stone-100/60 transition-all">
                  <UploadCloud className="w-7 h-7 text-yard-green/80 mb-1.5" />
                  <span className="text-xs font-bold text-stone-800">
                    {fileName ? fileName : 'Tap to Browse File from Device'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    {fileSize > 0 ? `${formatFileSize(fileSize)} selected` : 'Supports PDF, JPG, PNG, DOC'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Document Title / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Garden Proposal v1.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yard-green/50 text-sm font-semibold text-stone-800"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !fileUrl || !fileName}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-yard-green hover:bg-yard-dark text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
