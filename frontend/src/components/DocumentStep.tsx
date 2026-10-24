import React, { type ChangeEvent, type DragEvent, useState } from 'react';
import {
  validateDocumentFile,
  formatFileSize,
  ALLOWED_EXTENSIONS,
} from '../utils/validation';

interface DocumentStepProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DocumentStep: React.FC<DocumentStepProps> = ({ file, setFile, onNext, onBack }) => {
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const previewUrl = React.useMemo(() => {
    if (file && file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processSelectedFile = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      setError('');
      return;
    }

    const result = validateDocumentFile(selected);
    if (!result.valid) {
      setError(result.error || 'Invalid file');
      setFile(null);
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    processSelectedFile(selected);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    processSelectedFile(droppedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
  };

  const isValid = !!file && !error;

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Document</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload official business registration certificate or articles of incorporation.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
          }`}
        >
          <input
            id="document-upload"
            type="file"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Accepted: PDF, JPEG, PNG, WebP (Max file size: 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                {file.type === 'application/pdf' ? (
                  <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.type || 'Document'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              Replace
            </button>
          </div>

          {previewUrl && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
              <img
                src={previewUrl}
                alt="Document preview"
                className="max-h-48 w-full object-contain rounded"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>File validated and ready to upload</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-start gap-2 shadow-sm">
          <svg className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Review Submission →
        </button>
      </div>
    </div>
  );
};

export default DocumentStep;
