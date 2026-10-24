import React, { type ChangeEvent, useState } from 'react';

interface DocumentStepProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DocumentStep: React.FC<DocumentStepProps> = ({ file, setFile, onNext, onBack }) => {
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selected.type)) {
        setError('Invalid file type. Only PDF or JPEG/PNG/WebP images are allowed.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    } else {
      setFile(null);
    }
  };

  const isValid = !!file && !error;

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Document</h2>
        <p className="mt-1 text-sm text-gray-500">Attach official certificate of registration (PDF, PNG, or JPG).</p>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors duration-200">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200 cursor-pointer"
        />
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        {file && (
          <p className="mt-3 text-sm font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
            <span>✓ Selected:</span>
            <span className="font-mono text-gray-800">{file.name}</span>
          </p>
        )}
      </div>
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};
