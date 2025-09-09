import { useState, useCallback, useRef } from 'react';

export type ValidationRule<T = any> = {
  field: string;
  validate: (value: any, formData?: T) => string | null;
  debounceMs?: number;
};

export type ValidationRules<T = any> = ValidationRule<T>[];

export interface UseRealTimeValidationOptions {
  validateOnChange?: boolean;
  debounceMs?: number;
}

export interface UseRealTimeValidationReturn<T = any> {
  errors: Record<string, string>;
  validateField: (field: string, value: any, formData?: T) => void;
  validateAllFields: (formData: T) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

/**
 * Custom hook for real-time form validation
 * Provides debounced validation on field changes with immediate error clearing
 */
export function useRealTimeValidation<T = any>(
  rules: ValidationRules<T>,
  options: UseRealTimeValidationOptions = {}
): UseRealTimeValidationReturn<T> {
  const { validateOnChange = true, debounceMs = 300 } = options;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Clear any pending timeout for this field
    if (timeoutRefs.current[field]) {
      clearTimeout(timeoutRefs.current[field]);
      delete timeoutRefs.current[field];
    }
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    // Clear all pending timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  }, []);

  const validateField = useCallback(
    (field: string, value: any, formData?: T) => {
      const rule = rules.find(r => r.field === field);
      if (!rule || !validateOnChange) return;

      // Clear existing error immediately when user starts typing
      if (errors[field]) {
        clearError(field);
      }

      // Clear any existing timeout for this field
      if (timeoutRefs.current[field]) {
        clearTimeout(timeoutRefs.current[field]);
      }

      // Set up debounced validation
      const delay = rule.debounceMs ?? debounceMs;
      timeoutRefs.current[field] = setTimeout(() => {
        const errorMessage = rule.validate(value, formData);

        if (errorMessage) {
          setErrors(prev => ({
            ...prev,
            [field]: errorMessage,
          }));
        }

        delete timeoutRefs.current[field];
      }, delay);
    },
    [rules, validateOnChange, debounceMs, errors, clearError]
  );

  const validateAllFields = useCallback(
    (formData: T): boolean => {
      const newErrors: Record<string, string> = {};

      // Clear all pending timeouts
      Object.values(timeoutRefs.current).forEach(clearTimeout);
      timeoutRefs.current = {};

      rules.forEach(rule => {
        const value = (formData as any)[rule.field];
        const errorMessage = rule.validate(value, formData);

        if (errorMessage) {
          newErrors[rule.field] = errorMessage;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  return {
    errors,
    validateField,
    validateAllFields,
    clearError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
  };
}

// Common validation functions
export const ValidationHelpers = {
  required:
    (message = 'This field is required') =>
    (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return message;
      }
      return null;
    },

  minLength: (min: number, message?: string) => (value: string) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (value && value.length > max) {
      return message || `Must not exceed ${max} characters`;
    }
    return null;
  },

  range: (min: number, max: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined) {
      if (value < min || value > max) {
        return message || `Must be between ${min} and ${max}`;
      }
    }
    return null;
  },

  min: (minimum: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value < minimum) {
      return message || `Must be at least ${minimum}`;
    }
    return null;
  },

  max: (maximum: number, message?: string) => (value: number) => {
    if (value !== null && value !== undefined && value > maximum) {
      return message || `Must not exceed ${maximum}`;
    }
    return null;
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  custom:
    (validate: (value: any, formData?: any) => boolean, message: string) =>
    (value: any, formData?: any) => {
      return validate(value, formData) ? null : message;
    },
};
