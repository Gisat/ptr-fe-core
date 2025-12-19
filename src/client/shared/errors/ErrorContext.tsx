'use client';

import { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';

/**
 * Shape of a single error item.
 */
export interface AppError {
    id: string;
    message: string;
    title?: string;
    type?: 'error' | 'warning' | 'info';
    autoClose?: boolean;
}

/**
 * The shape of the error context.
 */
interface ErrorContextType {
    errors: AppError[];
    addError: (error: Omit<AppError, 'id'>) => void;
    removeError: (id: string) => void;
}

/**
 * React Context for global error state management.
 */
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Custom hook to access the ErrorContext.
 * Throws an error if used outside of an ErrorProvider.
 */
export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

/**
 * Provider component that encapsulates the error state and logic.
 */
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [errors, setErrors] = useState<AppError[]>([]);

    const removeError = useCallback((id: string) => {
        setErrors((currentErrors) => currentErrors.filter((err) => err.id !== id));
    }, []);

    const addError = useCallback((error: Omit<AppError, 'id'>) => {
        const id = Math.random().toString(36).substring(7);
        const newError = { ...error, id };
        setErrors((currentErrors) => [...currentErrors, newError]);

        if (error.autoClose !== false) {
            setTimeout(() => {
                removeError(id);
            }, 5000);
        }
    }, [removeError]);

    // Effect to listen for custom events to add errors from outside React components
    useEffect(() => {
        const handleAddErrorEvent = (event: Event) => {
            const errorDetail = (event as CustomEvent).detail;
            if (errorDetail) {
                addError(errorDetail);
            }
        };

        window.addEventListener('add-app-error', handleAddErrorEvent);
        return () => {
            window.removeEventListener('add-app-error', handleAddErrorEvent);
        };
    }, [addError]);


    return (
        <ErrorContext.Provider value={{ errors, addError, removeError }}>
            {children}
        </ErrorContext.Provider>
    );
};

