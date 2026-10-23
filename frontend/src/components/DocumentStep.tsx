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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>
      <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="mb-4" />
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {file && <p className="mb-2">Selected: {file.name}</p>}
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">
          Back
        </button>
        <button type="button" onClick={onNext} disabled={!isValid} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
};
