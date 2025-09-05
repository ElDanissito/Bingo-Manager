import { getDb } from './db';

export function runMigrations(): void {
	const db = getDb();
	db.exec(`
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS rondas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			precio_por_tabla INTEGER NOT NULL CHECK (precio_por_tabla >= 0),
			estado TEXT NOT NULL CHECK (estado IN ('comenzando','en_curso','finalizada')),
			porcentaje_premio INTEGER NOT NULL DEFAULT 0 CHECK (porcentaje_premio >= 0 AND porcentaje_premio <= 100),
			premio_entregado INTEGER DEFAULT NULL CHECK (premio_entregado IS NULL OR premio_entregado >= 0),
			porcentaje_aporte_acumulado INTEGER NOT NULL DEFAULT 0 CHECK (porcentaje_aporte_acumulado >= 0 AND porcentaje_aporte_acumulado <= 100),
			es_final BOOLEAN NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		-- Asegurar que solo exista una ronda en estado en_curso a la vez
		CREATE UNIQUE INDEX IF NOT EXISTS idx_rondas_unica_en_curso
		ON rondas ((estado = 'en_curso'))
		WHERE estado = 'en_curso';

		CREATE TABLE IF NOT EXISTS ventas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ronda_id INTEGER NOT NULL,
			cliente TEXT NOT NULL,
			cantidad INTEGER NOT NULL CHECK (cantidad > 0),
			medio_pago TEXT NOT NULL CHECK (medio_pago IN ('EFECTIVO','NEQUI')),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS acumulado (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ronda_id INTEGER NOT NULL,
			monto_aporte INTEGER NOT NULL CHECK (monto_aporte >= 0),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS ganancias (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ronda_id INTEGER NOT NULL,
			monto_ganancia INTEGER NOT NULL CHECK (monto_ganancia >= 0),
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY (ronda_id) REFERENCES rondas(id) ON DELETE CASCADE
		);
	`);
}

// Ejecutar automáticamente al importar en el servidor
if (typeof window === 'undefined') {
	try {
		runMigrations();
	} catch (error) {
		console.error('Error applying migrations', error);
	}
}


