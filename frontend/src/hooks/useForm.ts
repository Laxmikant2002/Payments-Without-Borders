import { useState } from 'react';

interface ValidationRules {
    [key: string]: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: RegExp;
        match?: string;
        custom?: (value: any, formData: any) => boolean | string;
    };
}

interface ValidationErrors {
    [key: string]: string;
}

export const useForm = <T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        if (!validationRules) return true;
        
        const newErrors: ValidationErrors = {};
        let isValid = true;
        
        // Check each field with validation rules
        Object.keys(validationRules).forEach(key => {
            const value = values[key];
            const rules = validationRules[key];
            
            // Required check
            if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
                newErrors[key] = 'This field is required';
                isValid = false;
            }
            
            // Skip other validations if empty and not required
            if (!value && !rules.required) {
                return;
            }
            
            // Min length check
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                newErrors[key] = `Minimum length is ${rules.minLength} characters`;
                isValid = false;
            }
            
            // Max length check
            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                newErrors[key] = `Maximum length is ${rules.maxLength} characters`;
                isValid = false;
            }
            
            // Pattern check
            if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                newErrors[key] = 'Invalid format';
                isValid = false;
            }
            
            // Match check (e.g., password confirmation)
            if (rules.match && values[rules.match] !== value) {
                newErrors[key] = `Does not match ${rules.match.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
                isValid = false;
            }
            
            // Custom validator
            if (rules.custom) {
                const customResult = rules.custom(value, values);
                if (typeof customResult === 'string') {
                    newErrors[key] = customResult;
                    isValid = false;
                } else if (customResult === false) {
                    newErrors[key] = 'Invalid value';
                    isValid = false;
                }
            }
        });
        
        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' 
                ? (e.target as HTMLInputElement).checked 
                : value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (callback: (data: T) => void) => (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        if (validate()) {
            callback(values);
        }
        
        setIsSubmitting(false);
    };

    const getFieldError = (field: string): string => errors[field] || '';

    const setFieldValue = (field: string, value: any) => {
        setValues(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        getFieldError,
        setFieldValue,
        resetForm,
    };
};

export default useForm;
