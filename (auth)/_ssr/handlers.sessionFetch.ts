import { Nullable } from "../../(shared)/coding/code.types";
import { ErrorBehavior } from "../../(shared)/errors/enums.errorBehavior";
import { HttpStatusCode } from "../../(shared)/errors/enums.httpStatusCode";
import { BaseHttpError } from "../../(shared)/errors/models.error";

// Define the interface for the properties of the fetchWithSessions function
interface FetchWithBrowserSessionProps {
  method: "GET" | "POST",
  url: string,
  browserCookies: any,
  body?: any,
  headers?: any
  requireSessionId: boolean
}

// Define the interface for the response of the fetchWithSessions function
interface FetchWithSessionsResponse {
  status: number;
  backendContent: Nullable<any>;
  setCookieHeader: Nullable<string>;
}

/**
 * Fetch from API handler to backend service with session ID included in cookies
 * @param url URL of target endpoint
 * @param browserCookies Cookies from browser request (SPA part of Next)
 * @param headers Optional - any headers added to request
 * @returns Response from backend back to Next API route handler
 */
export const fetchWithSessions = async (
  props: FetchWithBrowserSessionProps
): Promise<FetchWithSessionsResponse> => {
  const { url, browserCookies, method, body, headers } = props;

  // Check if the URL is provided
  if (!url)
    throw new BaseHttpError(
      "Missing URL for session fetch",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      ErrorBehavior.SSR
    );

  // Get the session cookie from the browser cookies
  const sessionCookie = (browserCookies as any).get("sid");

  // Check if the session cookie is required but missing
  if (!sessionCookie && props.requireSessionId)
    throw new BaseHttpError(
      "Missing session from browser",
      HttpStatusCode.UNAUTHORIZED,
      ErrorBehavior.BE
    );

  // Add the session cookie to the headers if it exists
  const headersWithCookies = sessionCookie ? { ...headers, 'Cookie': `${sessionCookie.name}=${sessionCookie.value}` } : { ...headers }

  // Make the fetch request to the backend
  const response = await fetch(
    url,
    {
      method,
      body,
      headers: headersWithCookies
    }
  )

  // Parse the response from the backend
  const backendContent = await response.json();

  // Check if the response is successful
  if (response.ok) {
    const setCookieHeader = response.headers.get("set-cookie");

    // Check if the set-cookie header is missing when a session ID is required
    if (!setCookieHeader && props.requireSessionId) {
      console.error("Sessions Fetch: Missing cookies with SID");

      throw new BaseHttpError(
        "Fetch response with new session cookie missing",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.BE
      );
    }

    // Return the response status, content, and set-cookie header
    return { status: response.status, backendContent, setCookieHeader };
  } else {
    console.error("Error in fetchWithSessions", response.status, backendContent);
    throw new BaseHttpError(backendContent, response.status, ErrorBehavior.BE);
  }
};
