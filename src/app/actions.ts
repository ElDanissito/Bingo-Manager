"use server";

import { getDb } from '@/lib/db';
import type { EstadoRonda, MedioPago } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type RondaRow = {
	id: number;
	nombre: string;
	estado: EstadoRonda;
	precio_por_tabla: number;
	porcentaje_premio: number;
	premio_entregado: number | null;
	porcentaje_aporte_acumulado: number;
	es_final: number; // 0 = false, 1 = true
};

function assertInteger(value: number, name: string): void {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${name} debe ser un entero no negativo`);
	}
}

export async function crearRonda(params: {
	nombre: string;
	precio_por_tabla: number; // COP enteros
	porcentaje_premio?: number; // 0-100
	porcentaje_aporte_acumulado?: number; // 0-100
	es_final?: boolean; // default false
	estado?: EstadoRonda; // default 'comenzando'
}): Promise<number> {
	const db = getDb();
	const nombre = params.nombre.trim();
	if (nombre.length === 0) throw new Error('Nombre de ronda es requerido');
	assertInteger(params.precio_por_tabla, 'precio_por_tabla');
	const porcentajePremio = params.porcentaje_premio ?? 0;
	const porcentajeAporte = params.porcentaje_aporte_acumulado ?? 0;
	if (porcentajePremio < 0 || porcentajePremio > 100) throw new Error('porcentaje_premio 0-100');
	if (porcentajeAporte < 0 || porcentajeAporte > 100) throw new Error('porcentaje_aporte_acumulado 0-100');
	const estado: EstadoRonda = params.estado ?? 'comenzando';
	const esFinal = params.es_final ?? false;
	const stmt = db.prepare(`
		INSERT INTO rondas (nombre, precio_por_tabla, estado, porcentaje_premio, porcentaje_aporte_acumulado, es_final)
		VALUES (@nombre, @precio_por_tabla, @estado, @porcentaje_premio, @porcentaje_aporte_acumulado, @es_final)
	`);
	const info = stmt.run({
		nombre,
		precio_por_tabla: params.precio_por_tabla,
		estado,
		porcentaje_premio: porcentajePremio,
		porcentaje_aporte_acumulado: porcentajeAporte,
		es_final: esFinal ? 1 : 0,
	});
	const id = Number(info.lastInsertRowid);
	revalidatePath('/');
	revalidatePath('/admin');
revalidatePath('/stats');
	return id;
}

export async function listarRondas(): Promise<RondaRow[]> {
	const db = getDb();
	const rows = db.prepare(`
		SELECT id, nombre, estado, precio_por_tabla, porcentaje_premio, premio_entregado, porcentaje_aporte_acumulado
		FROM rondas
		ORDER BY id DESC
	`).all() as RondaRow[];
	return rows;
}

export async function setEstadoRonda(rondaId: number, estado: EstadoRonda): Promise<void> {
	assertInteger(rondaId, 'rondaId');
	const db = getDb();
	const stmt = db.prepare(`UPDATE rondas SET estado = @estado WHERE id = @id`);
	stmt.run({ id: rondaId, estado });
	revalidatePath('/');
	revalidatePath('/admin');
	revalidatePath('/public');
revalidatePath('/stats');
}

export async function marcarRondaEnCurso(rondaId: number): Promise<void> {
	assertInteger(rondaId, 'rondaId');
	const db = getDb();
	const transaction = db.transaction(() => {
		db.prepare(`UPDATE rondas SET estado = 'comenzando' WHERE estado = 'en_curso'`).run();
		db.prepare(`UPDATE rondas SET estado = 'en_curso' WHERE id = @id`).run({ id: rondaId });
	});
	transaction();
	revalidatePath('/');
	revalidatePath('/admin');
	revalidatePath('/public');
revalidatePath('/stats');
}

export async function agregarVenta(params: {
	ronda_id: number;
	cliente: string;
	cantidad: number;
	medio_pago: MedioPago;
}): Promise<number> {
	assertInteger(params.ronda_id, 'ronda_id');
	if (!params.cliente || params.cliente.trim().length === 0) throw new Error('cliente es requerido');
	if (!Number.isInteger(params.cantidad) || params.cantidad <= 0) throw new Error('cantidad > 0');
	if (params.medio_pago !== 'EFECTIVO' && params.medio_pago !== 'NEQUI') throw new Error('medio_pago inválido');
	const db = getDb();
	const info = db.prepare(`
		INSERT INTO ventas (ronda_id, cliente, cantidad, medio_pago)
		VALUES (@ronda_id, @cliente, @cantidad, @medio_pago)
	`).run({
		ronda_id: params.ronda_id,
		cliente: params.cliente.trim(),
		cantidad: params.cantidad,
		medio_pago: params.medio_pago,
	});
	const id = Number(info.lastInsertRowid);
	revalidatePath('/admin');
	revalidatePath('/public');
revalidatePath('/stats');
	return id;
}

export async function listarVentas(rondaId: number): Promise<Array<{ id: number; cliente: string; cantidad: number; medio_pago: MedioPago; created_at: string }>> {
	assertInteger(rondaId, 'rondaId');
	const db = getDb();
	const rows = db.prepare(`
		SELECT id, cliente, cantidad, medio_pago, created_at
		FROM ventas
		WHERE ronda_id = ?
		ORDER BY id DESC
	`).all(rondaId) as Array<{ id: number; cliente: string; cantidad: number; medio_pago: MedioPago; created_at: string }>;
	return rows;
}

export async function totalesDeRonda(rondaId: number): Promise<{
	total_tablas: number;
	total_recaudado: number; // COP
	premio_estimado: number; // COP
	premio_entregado: number | null; // COP
	aporte_acumulado: number; // COP
	ganancia_interna: number; // COP
}> {
	assertInteger(rondaId, 'rondaId');
	const db = getDb();
	const ronda = db.prepare(`SELECT precio_por_tabla, porcentaje_premio, porcentaje_aporte_acumulado, premio_entregado, es_final FROM rondas WHERE id = ?`).get(rondaId) as {
		precio_por_tabla: number;
		porcentaje_premio: number;
		porcentaje_aporte_acumulado: number;
		premio_entregado: number | null;
		es_final: number;
	} | undefined;
	if (!ronda) throw new Error('Ronda no encontrada');
	const ventaAgg = db.prepare(`SELECT COALESCE(SUM(cantidad),0) as total_tablas FROM ventas WHERE ronda_id = ?`).get(rondaId) as { total_tablas: number };
	const totalTablas = ventaAgg.total_tablas ?? 0;
	const totalRecaudado = totalTablas * ronda.precio_por_tabla;
	
	// Si es ronda final, el premio incluye el acumulado total + porcentaje de esta ronda
	let premioEstimado: number;
	if (ronda.es_final === 1) {
		const acumuladoTotal = await acumuladoTotalRealtime();
		const premioDeEstaRonda = Math.floor((totalRecaudado * ronda.porcentaje_premio) / 100);
		premioEstimado = acumuladoTotal + premioDeEstaRonda;
	} else {
		premioEstimado = Math.floor((totalRecaudado * ronda.porcentaje_premio) / 100);
	}
	
	const aporteAcumulado = Math.floor((totalRecaudado * ronda.porcentaje_aporte_acumulado) / 100);
	const premioEntregado = ronda.premio_entregado ?? null;
	const gananciaInterna = premioEntregado === null ? 0 : Math.max(totalRecaudado - premioEntregado - aporteAcumulado, 0);
	return {
		total_tablas: totalTablas,
		total_recaudado: totalRecaudado,
		premio_estimado: premioEstimado,
		premio_entregado: premioEntregado,
		aporte_acumulado: aporteAcumulado,
		ganancia_interna: gananciaInterna,
	};
}

export async function registrarPremioEntregado(rondaId: number, premioEntregado: number): Promise<void> {
	assertInteger(rondaId, 'rondaId');
	assertInteger(premioEntregado, 'premio_entregado');
	const db = getDb();
	db.prepare(`UPDATE rondas SET premio_entregado = @premio WHERE id = @id`).run({ id: rondaId, premio: premioEntregado });

	// Recalcular y persistir aportes y ganancias para trazabilidad
	const totales = await totalesDeRonda(rondaId);
	// Registrar aporte al acumulado
	db.prepare(`INSERT INTO acumulado (ronda_id, monto_aporte) VALUES (@ronda_id, @monto)`).run({
		ronda_id: rondaId,
		monto: totales.aporte_acumulado,
	});
	// Registrar ganancia interna
	db.prepare(`INSERT INTO ganancias (ronda_id, monto_ganancia) VALUES (@ronda_id, @monto)`).run({
		ronda_id: rondaId,
		monto: totales.ganancia_interna,
	});
	revalidatePath('/admin');
	revalidatePath('/public');
revalidatePath('/stats');
}

export async function obtenerRondaEnCurso(): Promise<
	| RondaRow
	| null
> {
	const db = getDb();
	const row = db.prepare(`
		SELECT id, nombre, estado, precio_por_tabla, porcentaje_premio, premio_entregado, porcentaje_aporte_acumulado, es_final
		FROM rondas
		WHERE estado = 'en_curso'
		LIMIT 1
	`).get() as RondaRow | undefined;
	return row ?? null;
}

export async function obtenerRondaComenzandoReciente(): Promise<RondaRow | null> {
	const db = getDb();
	const row = db.prepare(`
		SELECT id, nombre, estado, precio_por_tabla, porcentaje_premio, premio_entregado, porcentaje_aporte_acumulado, es_final
		FROM rondas
		WHERE estado = 'comenzando'
		ORDER BY id DESC
		LIMIT 1
	`).get() as RondaRow | undefined;
	return row ?? null;
}

export async function resumenAcumulado(): Promise<number> {
	const db = getDb();
	const row = db.prepare(`SELECT COALESCE(SUM(monto_aporte), 0) as total FROM acumulado`).get() as { total: number };
	return row.total ?? 0;
}

export async function obtenerRondaPorId(rondaId: number): Promise<RondaRow | null> {
	assertInteger(rondaId, 'rondaId');
	const db = getDb();
	const row = db.prepare(`
		SELECT id, nombre, estado, precio_por_tabla, porcentaje_premio, premio_entregado, porcentaje_aporte_acumulado
		FROM rondas
		WHERE id = ?
	`).get(rondaId) as RondaRow | undefined;
	return row ?? null;
}

// Acumulado total en tiempo real calculado desde ventas y configuración de rondas
export async function acumuladoTotalRealtime(): Promise<number> {
	const db = getDb();
	const rows = db.prepare(`
		SELECT r.id as id, r.precio_por_tabla as ppt, r.porcentaje_aporte_acumulado as paa, COALESCE(SUM(v.cantidad),0) as total_tablas
		FROM rondas r
		LEFT JOIN ventas v ON v.ronda_id = r.id
		GROUP BY r.id, r.precio_por_tabla, r.porcentaje_aporte_acumulado
	`).all() as Array<{ id: number; ppt: number; paa: number; total_tablas: number }>;
	let total = 0;
	for (const row of rows) {
		const totalRecaudado = row.total_tablas * row.ppt;
		const aporte = Math.floor((totalRecaudado * row.paa) / 100);
		total += aporte;
	}
	return total;
}

export type RondaStats = {
  id: number;
  nombre: string;
  precio_por_tabla: number;
  total_tablas: number;
  total_recaudado: number;
  porcentaje_premio: number;
  premio_entregado: number | null;
  porcentaje_aporte_acumulado: number;
  aporte_realtime: number;
  ingreso_realtime: number; // recaudado - premio_entregado - aporte
};

export async function statsPorRonda(medio?: MedioPago | 'ALL'): Promise<{ rondas: RondaStats[]; totales: { vendido: number; pool: number; ingresos: number } }> {
  const db = getDb();
  const filter: MedioPago | null = medio && medio !== 'ALL' ? medio : null;
  const rows = db.prepare(`
    SELECT r.id as id, r.nombre as nombre, r.precio_por_tabla as ppt, r.porcentaje_premio as pp, r.premio_entregado as pe,
           r.porcentaje_aporte_acumulado as paa,
           (
             SELECT COALESCE(SUM(v2.cantidad), 0)
             FROM ventas v2
             WHERE v2.ronda_id = r.id AND (? IS NULL OR v2.medio_pago = ?)
           ) as total_tablas
    FROM rondas r
    ORDER BY r.id DESC
  `).all(filter, filter) as Array<{ id: number; nombre: string; ppt: number; pp: number; pe: number | null; paa: number; total_tablas: number }>;
  const rondas: RondaStats[] = rows.map(r => {
    const totalRecaudado = r.total_tablas * r.ppt;
    const aporte = Math.floor((totalRecaudado * r.paa) / 100);
    const ingreso = r.pe === null ? 0 : Math.max(totalRecaudado - r.pe - aporte, 0);
    return {
      id: r.id,
      nombre: r.nombre,
      precio_por_tabla: r.ppt,
      total_tablas: r.total_tablas,
      total_recaudado: totalRecaudado,
      porcentaje_premio: r.pp,
      premio_entregado: r.pe,
      porcentaje_aporte_acumulado: r.paa,
      aporte_realtime: aporte,
      ingreso_realtime: ingreso,
    };
  });
  const totales = rondas.reduce((acc, r) => {
    acc.vendido += r.total_recaudado;
    acc.pool += r.aporte_realtime;
    acc.ingresos += r.ingreso_realtime;
    return acc;
  }, { vendido: 0, pool: 0, ingresos: 0 });
  return { rondas, totales };
}

