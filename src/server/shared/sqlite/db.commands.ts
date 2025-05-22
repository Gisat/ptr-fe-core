import { AppDb } from "./db.connection";
import { UsedSqlTables } from "./db.defaults";

/**
 * Saves a state to the database with the specified key.
 * 
 * @param db - The application database instance.
 * @param key - The unique identifier for the state.
 * @param state - The state data to be saved as a string.
 * @returns A promise that resolves when the state has been saved.
 */
export const dbSaveState = async (db: AppDb, key: string, state: string, expirationSec: number) => {

    // Clean up expired state rows
    await db.run(
        `DELETE FROM ${UsedSqlTables.APP_STATES} 
         WHERE expires_at < ?`,
        [Math.floor(Date.now() / 1000)]
    );

    // Calculate expiration date by adding seconds to current time
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresAt = currentTimestamp + expirationSec;

    // Convert JSON to string
    const jsonString = JSON.stringify(state);

    // Convert string to binary (UTF-8)
    const encoder = new TextEncoder(); // Available in most modern environments
    const binaryData = encoder.encode(jsonString); // Uint8Array

    await db.run(
        `INSERT INTO ${UsedSqlTables.APP_STATES} (key, state, expires_at)
       VALUES (?, ?, ?)`,
        [key, binaryData, expiresAt]
    );
}