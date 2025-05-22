export const DEFAULT_DB_NAME = "db.sqlite";
export const DEFAULT_DB_STATE_EXPIRATION_SEC = 60 * 60 * 24; // default to 1 day

/**
 * Enumeration of the SQL table names used throughout the application.
 * 
 * This enum provides a centralized registry of table names to ensure consistent
 * references across the application's database operations.
 * 
 * @enum {string}
 */
export enum UsedSqlTables {
    APP_STATES = "states"
}