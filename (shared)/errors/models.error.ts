import { ErrorBehavior } from "./enums.errorBehavior";
import { HttpStatusCode } from "./enums.httpStatusCode";

/**
 * BaseHttpError: A structured error class that extends the native Error object.
 *
 * This class is designed to serve as a foundational error type for both
 * Next.js application errors (FE, SSR, BE, Routes) and
 * Backend errors.
 */

export class BaseHttpError extends Error {
  /** The status code associated with this error */
  public readonly status: number | HttpStatusCode;
  public readonly behavior: ErrorBehavior;

  constructor(message: string, status: number, behavior: ErrorBehavior) {
    super(message);
    this.status = status;
    this.behavior = behavior;
  }
}
