'use client';

import { useEffect } from 'react';
import { useError } from './ErrorContext';
import { HandledError } from './store';
import './errorStyle.css';

/**
 * Global error notification renderer.
 *
 * This component:
 *  - consumes the `ErrorContext` to display all current errors as dismissible notifications.
 *  - subscribes to global `window` events (`error` and `unhandledrejection`)
 *    to automatically capture and display unexpected runtime errors.
 *
 * It ignores `HandledError` instances to prevent duplicate notifications when
 * the `throwError` utility is used.
 */
export const ErrorNotifications = () => {
    const { errors, removeError, addError } = useError();

    useEffect(() => {
        const handleGlobalError = (event: ErrorEvent) => {
            // Ignore errors that have already been handled by our system.
            if (event.error instanceof HandledError) return;

            addError({
                title: 'Unexpected Error',
                message: event.message || 'An unexpected error occurred',
                type: 'error',
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            // Ignore promise rejections from errors that have already been handled.
            if (event.reason instanceof HandledError) return;

            addError({
                title: 'Unhandled Promise Rejection',
                message: event.reason?.message || String(event.reason),
                type: 'error',
            });
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup listeners on component unmount.
        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [addError]);

    if (errors.length === 0) {
        return null;
    }

    return (
        <div className='errorNotification-position-div'>
            {errors.map((error) => (
                <div
                    key={error.id}
                    className={
                        error.type === 'warning'
                            ? 'errorNotification-div errorNotification-div-warningType'
                            : 'errorNotification-div errorNotification-div-errorType'
                    }
                >
                    <div>
                        {error.title && <strong>{error.title}</strong>}
                        <div>{error.message}</div>
                    </div>
                    <button
                        onClick={() => removeError(error.id)}
                        className="errorNotification-closeBtn"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

