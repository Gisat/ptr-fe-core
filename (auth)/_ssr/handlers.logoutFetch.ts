import { Nullable } from "../../(shared)/coding/code.types";
import { ErrorBehavior } from "../../(shared)/errors/enums.errorBehavior";
import { HttpStatusCode } from "../../(shared)/errors/enums.httpStatusCode";
import { BaseHttpError } from "../../(shared)/errors/models.error";

interface LogoutFetchProps {
    identityServiceUrl: string,
    browserCookies: any,
}

/**
 * Fetch from API handler to backend service with session ID included in cookies
 * @param url URL of target endpoint
 * @param browserCookies Cookies from browser request (SPA part of Next)
 * @param headers Optional - any headers added to request
 * @returns Response from backend back to Next API route handler
 */
export const fetchLogoutNotification = async (
    props: LogoutFetchProps
): Promise<void> => {

    const { browserCookies, identityServiceUrl } = props;

    // get session cookie from browser
    const sessionCookie = (browserCookies as any).get("sid");

    if (!sessionCookie)
        console.warn("Logout: Missing SID from browser");

    //prepare logout URL
    const logoutUrl = `${identityServiceUrl}/oid/logout`;

    // prepare body for session exchange
    const body = {
        sid: sessionCookie
    }

    // make notify POST request to backend for session exchange
    try {
        const response = await fetch(
            logoutUrl,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        )

        if (!response.ok)
            console.warn("Logout: Backend logout failed");
    } catch (error: any) {
        console.warn(`Logout: Backend logout failed: ${error["message"]}`);
    }

};
