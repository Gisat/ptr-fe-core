import { useErrorStore, HandledError } from './store';
import { useEffect } from 'react';
import './errorStyle.css';

/**
 * Global error notification renderer.
 *
 * This component:
 *  - listens to the shared `useErrorStore` (Zustand) and renders all current
 *    errors as dismissible "pop-up" notifications, and
 *  - subscribes to global `window` events (`error` and `unhandledrejection`)
 *    so that unexpected runtime errors and unhandled promise rejections are
 *    automatically captured and pushed into the store.
 *
 * Errors thrown via `throwError` are wrapped in `HandledError` and ignored
 * by these global listeners to avoid double-reporting the same issue.
 */

export const ErrorNotifications = () => {
    const { errors, removeError, addError } = useErrorStore();

    useEffect(() => {
        const handleGlobalError = (event: ErrorEvent) => {
            if (event.error instanceof HandledError) return;

            addError({
                title: 'Unexpected Error',
                message: event.message || 'An unexpected error occurred',
                type: 'error'
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            if (event.reason instanceof HandledError) return;

            addError({
                title: 'Unhandled Promise Rejection',
                message: event.reason?.message || String(event.reason),
                type: 'error'
            });
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [addError]);

    if (errors.length === 0) return null;

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

