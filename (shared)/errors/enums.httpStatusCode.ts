/**
 * Enum representing all HTTP status codes categorized by their types.
 *
 * Categories:
 * - 1xx: Informational Responses
 * - 2xx: Success Responses
 * - 3xx: Redirection Messages
 * - 4xx: Client Errors
 * - 5xx: Server Errors
 */
export enum HttpStatusCode {
  // ===============================
  // 1xx: Informational Responses
  // ===============================

  // /** Continue processing request */
  // CONTINUE = 100,
  // /** Switching protocols as requested */
  // SWITCHING_PROTOCOLS = 101,
  // /** Server is processing request but no response yet */
  // PROCESSING = 102,
  // /** Early hints before final response */
  // EARLY_HINTS = 103,

  // ===============================
  // 2xx: Success Responses
  // ===============================

  /** Standard success response */
  OK = 200,
  // /** Resource created successfully */
  // CREATED = 201,
  // /** Request accepted but not yet completed */
  // ACCEPTED = 202,
  // /** Non-authoritative information received */
  // NON_AUTHORITATIVE_INFORMATION = 203,
  // /** Successful request with no content */
  // NO_CONTENT = 204,
  // /** Reset content requested */
  // RESET_CONTENT = 205,
  // /** Partial content sent due to range requests */
  // PARTIAL_CONTENT = 206,
  // /** Multiple statuses returned */
  // MULTI_STATUS = 207,
  // /** Resource already reported in response */
  // ALREADY_REPORTED = 208,
  // /** Instance manipulation used */
  // IM_USED = 226,

  // ===============================
  // 3xx: Redirection Messages
  // ===============================

  // /** Multiple choices available */
  // MULTIPLE_CHOICES = 300,
  // /** Resource has permanently moved */
  // MOVED_PERMANENTLY = 301,
  // /** Resource found but temporarily moved */
  // FOUND = 302,
  // /** See other resource */
  // SEE_OTHER = 303,
  // /** Resource not modified since last request */
  // NOT_MODIFIED = 304,
  // /** Use proxy (deprecated) */
  // USE_PROXY = 305,
  // /** Reserved for future use */
  // SWITCH_PROXY = 306,
  // /** Temporary redirect */
  // TEMPORARY_REDIRECT = 307,
  // /** Permanent redirect */
  // PERMANENT_REDIRECT = 308,

  // ===============================
  // 4xx: Client Errors
  // ===============================

  /** Bad request syntax or invalid parameters */
  BAD_REQUEST = 400,
  /** Authentication required */
  UNAUTHORIZED = 401,
  // /** Payment required (reserved for future use) */
  // PAYMENT_REQUIRED = 402,
  // /** Access to resource is forbidden */
  // FORBIDDEN = 403,
  // /** Resource not found */
  // NOT_FOUND = 404,
  // /** Method not allowed for resource */
  // METHOD_NOT_ALLOWED = 405,
  // /** Resource not acceptable per client request */
  // NOT_ACCEPTABLE = 406,
  // /** Proxy authentication required */
  // PROXY_AUTHENTICATION_REQUIRED = 407,
  // /** Request timeout exceeded */
  // REQUEST_TIMEOUT = 408,
  // /** Conflict with current resource state */
  // CONFLICT = 409,
  // /** Requested resource is no longer available */
  // GONE = 410,
  // /** Length required for request */
  // LENGTH_REQUIRED = 411,
  // /** Precondition failed */
  // PRECONDITION_FAILED = 412,
  // /** Request payload too large */
  // PAYLOAD_TOO_LARGE = 413,
  // /** Request URI too long */
  // URI_TOO_LONG = 414,
  // /** Unsupported media type */
  // UNSUPPORTED_MEDIA_TYPE = 415,
  // /** Requested range not satisfiable */
  // RANGE_NOT_SATISFIABLE = 416,
  // /** Expectation failed */
  // EXPECTATION_FAILED = 417,
  // /** I'm a teapot (Easter egg) */
  // IM_A_TEAPOT = 418,
  // /** Misdirected request */
  // MISDIRECTED_REQUEST = 421,
  // /** Unprocessable entity */
  // UNPROCESSABLE_ENTITY = 422,
  // /** Resource is locked */
  // LOCKED = 423,
  // /** Failed dependency */
  // FAILED_DEPENDENCY = 424,
  // /** Request sent too early */
  // TOO_EARLY = 425,
  // /** Upgrade required for request */
  // UPGRADE_REQUIRED = 426,
  // /** Precondition required */
  // PRECONDITION_REQUIRED = 428,
  // /** Too many requests from client */
  // TOO_MANY_REQUESTS = 429,
  // /** Request header fields too large */
  // REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  // /** Unavailable for legal reasons */
  // UNAVAILABLE_FOR_LEGAL_REASONS = 451,

  // ===============================
  // 5xx: Server Errors
  // ===============================

  /** Internal server error */
  INTERNAL_SERVER_ERROR = 500,
  // /** Server does not support requested function */
  // NOT_IMPLEMENTED = 501,
  // /** Bad gateway response */
  // BAD_GATEWAY = 502,
  // /** Server is unavailable */
  // SERVICE_UNAVAILABLE = 503,
  // /** Gateway timeout */
  // GATEWAY_TIMEOUT = 504,
  // /** HTTP version not supported */
  // HTTP_VERSION_NOT_SUPPORTED = 505,
  // /** Content negotiation error */
  // VARIANT_ALSO_NEGOTIATES = 506,
  // /** Insufficient storage */
  // INSUFFICIENT_STORAGE = 507,
  // /** Loop detected in request */
  // LOOP_DETECTED = 508,
  // /** Extension required for request */
  // NOT_EXTENDED = 510,
  // /** Network authentication required */
  // NETWORK_AUTHENTICATION_REQUIRED = 511,
}
