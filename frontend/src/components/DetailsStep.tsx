import React, { type ChangeEvent } from 'react';
import type { ApplicationFormData } from '../lib/types';

interface DetailsStepProps {
  data: ApplicationFormData;
  setData: (data: ApplicationFormData) => void;
  onNext: () => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({ data, setData, onNext }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, registrationExpiry: e.target.value });
  };

  const isValid =
    data.businessName &&
    data.registrationNumber &&
    data.registrationExpiry &&
    data.ownerName &&
    data.contactEmail;

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Business Details</h2>
        <p className="mt-1 text-sm text-gray-500">Provide legal entity information for KYB verification.</p>
      </div>
      <div className="grid gap-4">
        <input
          type="text"
          name="businessName"
          placeholder="Business Name"
          value={data.businessName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
          required
        />
        <input
          type="text"
          name="registrationNumber"
          placeholder="Registration Number"
          value={data.registrationNumber}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm font-mono"
          required
        />
        <input
          type="date"
          name="registrationExpiry"
          placeholder="Registration Expiry"
          value={data.registrationExpiry}
          onChange={handleDateChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
          required
        />
        <input
          type="text"
          name="ownerName"
          placeholder="Owner Name"
          value={data.ownerName}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
          required
        />
        <input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          value={data.contactEmail}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
          required
        />
      </div>
      <div className="flex justify-end pt-2">
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
