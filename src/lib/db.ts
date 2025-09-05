import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure a single DB connection in dev and prod
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export type SqliteDatabase = Database.Database;

function ensureDataDirectoryExists(dataDir: string): void {
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

function openDatabase(): SqliteDatabase {
	const dataDir = path.join(process.cwd(), 'data');
	ensureDataDirectoryExists(dataDir);
	const dbPath = path.join(dataDir, 'bingo.db');
	const db = new Database(dbPath);
	db.pragma('journal_mode = WAL');
	return db;
}

export function getDb(): SqliteDatabase {
	if (!globalAny.__BINGO_DB__) {
		globalAny.__BINGO_DB__ = openDatabase();
	}
	return globalAny.__BINGO_DB__ as SqliteDatabase;
}

export function closeDb(): void {
	if (globalAny.__BINGO_DB__) {
		try {
			(globalAny.__BINGO_DB__ as SqliteDatabase).close();
		} catch {}
		delete globalAny.__BINGO_DB__;
	}
}


