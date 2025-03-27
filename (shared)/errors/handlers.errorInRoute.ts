import { BaseHttpError } from "./models.error";

/**
 * Processes and handles errors that occur during route execution
 * @param error - The unknown error to be processed
 * @returns {Object} An object containing:
 *  - message: The error message
 *  - status: HTTP status code (500 for unhandled errors, or specific status for BaseHttpError)
 * 
 * @example
 * ```typescript
 * try {
 *   // Some route logic
 * } catch (error) {
 *   const handled = handleRouteError(error);
 *   // handled = { message: "Error message", status: 500 }
 * }
 * ```
 */
export const handleRouteError = (error: unknown) => {
    
    // lets work with the error as an object
    const processedError = error as any;

    // need to know the type of error to handle it properly
    const errorType = processedError.constructor;
    
    // switch on the error type as we know how to handle our errors
    // TODO: we can add more complex error handling here as logging by type etc.
    switch (errorType) {
        case BaseHttpError:
            return { message: processedError.message, status: processedError.status };
        default:
            return { message: processedError.message, status: 500 }; // default status code for server errors
    }
}