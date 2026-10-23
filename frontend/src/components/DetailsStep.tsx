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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Business Details</h2>
      <div className="grid gap-4">
        <input
          type="text"
          name="businessName"
          placeholder="Business Name"
          value={data.businessName}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          name="registrationNumber"
          placeholder="Registration Number"
          value={data.registrationNumber}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="date"
          name="registrationExpiry"
          placeholder="Registration Expiry"
          value={data.registrationExpiry}
          onChange={handleDateChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="text"
          name="ownerName"
          placeholder="Owner Name"
          value={data.ownerName}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="email"
          name="contactEmail"
          placeholder="Contact Email"
          value={data.contactEmail}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
