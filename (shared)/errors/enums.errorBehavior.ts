/**
 * Enum representing different sources of statuses and errors in the system.
 * This categorization ensures that statuses are clearly linked to their origin,
 * preventing confusion between similar issues from different layers (e.g., 404 from API vs. 404 from Frontend).
 */
export enum ErrorBehavior {
  // ===============================
  // Error Sources (Where the error comes from)
  // ===============================

  /** Errors and statuses from Server-Side Rendering (SSR) */
  SSR = "ssr",
  // client of panter BE (backend)
  // evetything in next routes

  /** Errors and statuses from client-side execution (UI, fetch failures, etc.) */
  FE = "frontend",
  // anything that happends in components, pages

  /** Errors and statuses occurring in middleware before reaching pages or APIs */
  BE = "backend",
  // inside panther BE (backend)

  /** Routing issues (e.g., 404 page not found, navigation errors) */
  // ROUTING = "routing",
  // there is no use-cases right now
}
