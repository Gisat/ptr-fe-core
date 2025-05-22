import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { UsedSqlTables } from './db.defaults';

/**
 * Represents a SQLite database connection for the application.
 * 
 * This type is a wrapper around the `Database` type from the SQLite library,
 * specifying the database and statement types as `sqlite3.Database` and
 * `sqlite3.Statement` respectively.
 * 
 * @type {Database<sqlite3.Database, sqlite3.Statement>}
 */
export type AppDb = Database<sqlite3.Database, sqlite3.Statement>

/**
 * Opens a connection to a SQLite database.
 * 
 * @param filename - The path to the SQLite database file. If the file does not exist, it will be created.
 * @returns A Promise that resolves to an AppDb instance representing the opened database connection.
 * 
 * @example
 * ```typescript
 * const db = await openDb('./myDatabase.sqlite');
 * ```
 */
export async function openDb(filename: string): Promise<AppDb> {
	const db = await open({
		filename, //database file will be created if it does not exist
		driver: sqlite3.Database,
	});

	// create the database structure
	await db.run(`
			CREATE TABLE IF NOT EXISTS ${UsedSqlTables.APP_STATES} (
												  key VARCHAR(50) PRIMARY KEY,
												  state BLOB,
												  expires_at DATETIME
			)`);

	// return the database connection
	// Note: The database connection is automatically closed when the process exits
	return db;
}
