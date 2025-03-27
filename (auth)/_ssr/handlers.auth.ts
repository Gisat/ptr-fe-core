import { Issuer } from "openid-client";
import { Unsure } from "../../(shared)/coding/code.types";
import { ErrorBehavior } from "../../(shared)/errors/enums.errorBehavior";
import { HttpStatusCode } from "../../(shared)/errors/enums.httpStatusCode";
import { BaseHttpError } from "../../(shared)/errors/models.error";

/**
 * OpenID Connect functional context (as server side JS closure)
 * @returns Set of functions to handle OpenID (OAuth2) operations using official openid library with server side environments
 */
export function authContext(
  clientId: Unsure<string>,
  issuerUrl: Unsure<string>,
  redirectUrl: Unsure<string>
) {
  /**
   * Read server side environment values and validate them
   * @returns
   */
  const checkContextEnvironmens = () => {
    if (!issuerUrl)
      throw new BaseHttpError(
        "Missing OID issuer URL",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );

    if (!clientId)
      throw new BaseHttpError(
        "Missing OID client ID",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );

    if (!redirectUrl)
      throw new BaseHttpError(
        "Missing OID redirect url back to this app (OAuth2 callback path)",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );

    return {
      issuerUrl,
      clientId,
      redirectUrl,
    };
  };

  /**
   * Creates the active client for OpenID operations
   * @returns OpenID set up client ready to be used
   */
  async function oidSetupClient() {
    // check environments
    const oidEnvironments = checkContextEnvironmens();

    // prepare Open ID Issuer client
    const oidIssuer = await Issuer.discover(oidEnvironments.issuerUrl);
    const oidClient = new oidIssuer.Client({
      client_id: oidEnvironments.clientId,
      redirect_uris: [oidEnvironments.redirectUrl],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    });

    // return client
    return oidClient;
  }

  /**
   * Exported handler for authorisation process usinf OpenID Connect code flow
   */
  async function handleInternalKeycloak() {
    const oidClient = await oidSetupClient();
    const url = oidClient.authorizationUrl({
      scope: "openid email profile",
    });
    return url;
  }
  async function handleLogout(tokenExchangeUrl: Unsure<string>) {
    if (!tokenExchangeUrl)
      throw new BaseHttpError(
        "Missing URL for exchange",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );

    return { tokenExchangeUrl };
  }

  /**
   * Obtain tokens from redirect by sending OAuth2 code back to issuer
   * @param params Use NextRequest
   * @param urlOrigin Origin of the URL from callback route
   * @returns Tokens from the IAM
   */
  async function handleAuthCallback(
    params: any,
    tokenExchangeUrl: Unsure<string>
  ) {
    // initialize Open ID client
    const oidClient = await oidSetupClient();

    // prepare OID callback params for provider
    const callbackParams = oidClient.callbackParams(params);

    // OID Provider response with tokens
    const tokens = await oidClient.callback(
      checkContextEnvironmens().redirectUrl,
      callbackParams
    );

    // do we have tokens and all values?
    if (!tokens.access_token)
      throw new BaseHttpError(
        "Missing OID information",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!tokens.refresh_token)
      throw new BaseHttpError(
        "Missing OID information",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!tokens.id_token)
      throw new BaseHttpError(
        "Missing OID information",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!tokens.refresh_token)
      throw new BaseHttpError(
        "Missing OID information",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!clientId)
      throw new BaseHttpError(
        "Missing client ID",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!tokenExchangeUrl)
      throw new BaseHttpError(
        "Missing URL for excgange",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );
    if (!issuerUrl)
      throw new BaseHttpError(
        "Missing issuer URL",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        ErrorBehavior.SSR
      );

    // prepare output for route
    return {
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
      },
      clientId,
      issuerUrl,
      tokenExchangeUrl,
    };
  }

  return {
    handleInternalKeycloak,
    handleAuthCallback,
    handleLogout,
  };
}
