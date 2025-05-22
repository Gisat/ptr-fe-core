import { AppDb } from "./db.connection";
import { UsedSqlTables } from "./db.defaults";

/**
 * Retrieves the application state associated with the specified key from the database.
 * 
 * @param db - The application database instance.
 * @param key - The key identifying the state to retrieve.
 * @returns A promise that resolves to the requested state data or undefined if not found.
 */
export const dbNeedAppState = async (db: AppDb, key: string): Promise<{
    key: any;
    state: any;
    expiresAt: number;
} | null> => {

    // read the state from the database
    const wantedState = await db.get(`SELECT * FROM ${UsedSqlTables.APP_STATES} WHERE key= ?`, key)

    // if the state is not found, return null
    if (!wantedState)
        return null

    // convert binary state back to JSON format
    const decoder = new TextDecoder("utf-8");
    const decodedString = decoder.decode(wantedState.state);
    const jsonState = JSON.parse(decodedString);

    // return the state and metadata
    return {
        key: wantedState.key,
        state: jsonState,
        expiresAt: wantedState.expires_at
    }

}