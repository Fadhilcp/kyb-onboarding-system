import React, { type ChangeEvent, useState } from 'react';
import type { ApplicationFormData } from '../lib/types';
import { FormField } from './common/FormField';
import {
  validateBusinessField,
  validateApplicationDetails,
  type ApplicationFormErrors,
} from '../utils/validation';

interface DetailsStepProps {
  data: ApplicationFormData;
  setData: (data: ApplicationFormData) => void;
  onNext: () => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({ data, setData, onNext }) => {
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ApplicationFormData, boolean>>>({});

  const handleFieldChange = (field: keyof ApplicationFormData, value: string) => {
    setData({ ...data, [field]: value });

    // Validate live only if the user has already touched or attempted submit
    if (touched[field]) {
      const errorMsg = validateBusinessField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: errorMsg || undefined,
      }));
    }
  };

  const handleFieldBlur = (field: keyof ApplicationFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateBusinessField(field, data[field] || '');
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg || undefined,
    }));
  };

  const handleNextClick = () => {
    const { isValid, errors: validationErrors } = validateApplicationDetails(data);
    if (!isValid) {
      setErrors(validationErrors);
      // Mark all fields as touched to show errors
      setTouched({
        businessName: true,
        registrationNumber: true,
        registrationExpiry: true,
        ownerName: true,
        contactEmail: true,
      });
      return;
    }

    onNext();
  };

  const { isValid } = validateApplicationDetails(data);

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Business Details</h2>
        <p className="mt-1 text-sm text-gray-500">Provide legal entity information for KYB compliance and verification.</p>
      </div>

      <div className="space-y-4">
        <FormField
          label="Legal Business Name"
          name="businessName"
          placeholder="e.g. Acme Global Logistics Inc."
          value={data.businessName}
          error={touched.businessName ? errors.businessName : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('businessName', e.target.value)}
          onBlur={() => handleFieldBlur('businessName')}
          required
        />

        <FormField
          label="Registration Number"
          name="registrationNumber"
          placeholder="e.g. REG-2024-98432"
          className="font-mono uppercase"
          value={data.registrationNumber}
          error={touched.registrationNumber ? errors.registrationNumber : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('registrationNumber', e.target.value)}
          onBlur={() => handleFieldBlur('registrationNumber')}
          required
        />

        <FormField
          label="Registration Expiry Date"
          name="registrationExpiry"
          type="date"
          value={data.registrationExpiry}
          error={touched.registrationExpiry ? errors.registrationExpiry : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('registrationExpiry', e.target.value)}
          onBlur={() => handleFieldBlur('registrationExpiry')}
          required
        />

        <FormField
          label="Primary Owner / Representative"
          name="ownerName"
          placeholder="e.g. Jane Doe"
          value={data.ownerName}
          error={touched.ownerName ? errors.ownerName : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('ownerName', e.target.value)}
          onBlur={() => handleFieldBlur('ownerName')}
          required
        />

        <FormField
          label="Contact Email"
          name="contactEmail"
          type="email"
          placeholder="e.g. contact@acme.com"
          value={data.contactEmail}
          error={touched.contactEmail ? errors.contactEmail : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange('contactEmail', e.target.value)}
          onBlur={() => handleFieldBlur('contactEmail')}
          required
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleNextClick}
          disabled={!isValid}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Upload Document →
        </button>
      </div>
    </div>
  );
};

export default DetailsStep;
