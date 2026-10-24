import type { ApplicationFormData } from '../lib/types';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = '.pdf, .jpg, .jpeg, .png, .webp';

// Standard RFC 5322-compliant simplified email pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const validateBusinessField = (
  field: keyof ApplicationFormData,
  value: string
): string | null => {
  const trimmed = value ? value.trim() : '';

  switch (field) {
    case 'businessName':
      if (!trimmed) return 'Legal business name is required';
      if (trimmed.length < 2) return 'Business name must be at least 2 characters';
      return null;

    case 'registrationNumber':
      if (!trimmed) return 'Registration number is required';
      if (trimmed.length < 3) return 'Registration number must be at least 3 characters';
      return null;

    case 'registrationExpiry': {
      if (!trimmed) return 'Registration expiry date is required';
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime())) return 'Please enter a valid expiry date';
      return null;
    }

    case 'ownerName':
      if (!trimmed) return 'Primary owner / authorized representative name is required';
      if (trimmed.length < 2) return 'Owner name must be at least 2 characters';
      return null;

    case 'contactEmail':
      if (!trimmed) return 'Contact email is required';
      if (!isValidEmail(trimmed)) return 'Please enter a valid email address (e.g. name@company.com)';
      return null;

    default:
      return null;
  }
};

export type ApplicationFormErrors = Partial<Record<keyof ApplicationFormData, string>>;

export const validateApplicationDetails = (
  data: ApplicationFormData
): { isValid: boolean; errors: ApplicationFormErrors } => {
  const errors: ApplicationFormErrors = {};
  const fields: (keyof ApplicationFormData)[] = [
    'businessName',
    'registrationNumber',
    'registrationExpiry',
    'ownerName',
    'contactEmail',
  ];

  for (const field of fields) {
    const error = validateBusinessField(field, data[field] || '');
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateDocumentFile = (file: File | null): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'Please select a registration document file to upload' };
  }

  const isTypeAllowed = (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type);
  if (!isTypeAllowed) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF, JPEG, PNG, or WebP files are accepted.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (selected file: ${formatFileSize(file.size)}).`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty. Please choose a valid document.',
    };
  }

  return { valid: true };
};
