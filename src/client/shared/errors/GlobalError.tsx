import './errorStyle.css';

/**
 * Props for the global error component used by consuming applications.
 *
 * - `error`  – The error object caught by a Next.js error boundary. In addition
 *              to the standard `Error` fields, it may contain a `digest` field
 *              that Next.js uses internally to identify/log the error.
 * - `reset`  – Callback provided by Next.js that allows the UI to request
 *              a retry. When called, Next.js will try to re-render the
 *              affected route segment and recover from the error.
 */
interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Reusable global error UI for applications using the ptr-fe-core package.
 *
 * This component is intended to be used from the app's root `error.tsx`
 * boundary. It displays a generic error message, shows the error's message
 * text, and provides a “Try again” button which invokes the `reset` callback
 * so Next.js can attempt to re-render and recover from the failure.
 */
export const GlobalError = ({ error, reset }: GlobalErrorProps) => {
    return (
        <div className="globalError-div">
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button
                onClick={() => reset()}
                className="globalError-btn">
                Try again
            </button>
        </div>
    );
};

