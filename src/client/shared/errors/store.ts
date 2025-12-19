/**
 * This file defines shared types and utility functions for the error handling system.
 * It is designed to be used with the React Context-based error provider.
 */


/**
 * Custom error type used to mark errors that have already been
 * handled (i.e., a notification has been triggered for them).
 *
 * Global listeners can detect this error type and avoid showing a
 * duplicate notification for the same issue.
 */
export class HandledError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HandledError';
    }
}

/**
 * Utility for throwing an error from non-component code while still triggering a UI notification.
 *
 * This function performs two actions:
 *  1. Dispatches a global `add-app-error` custom event with the error details.
 *     The `ErrorProvider` listens for this event and adds the error to its state.
 *  2. Throws a `HandledError` to interrupt execution flow, which can be caught
 *     by React/Next.js error boundaries.
 *
 * @param message The error message.
 * @param title An optional title for the error notification.
 */
export const throwError = (message: string, title?: string) => {
    const errorDetail = {
        title: title || 'Error',
        message,
        type: 'error' as const
    };
    // Dispatch a global event that the ErrorProvider will listen for.
    window.dispatchEvent(new CustomEvent('add-app-error', { detail: errorDetail }));
    // Throw a specific error type to be caught by boundaries and ignored by global listeners.
    throw new HandledError(message);
}
