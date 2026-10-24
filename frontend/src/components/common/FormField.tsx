import React from 'react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  id,
  error,
  helperText,
  required,
  containerClassName = '',
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || `field-${name}`;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-xs text-gray-400">{helperText}</span>
        )}
      </div>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-lg px-4 py-2.5 text-sm transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
            error
              ? 'border border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
              : 'border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-400'
          } ${className}`}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-rose-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
