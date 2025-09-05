export type MedioPago = 'EFECTIVO' | 'NEQUI';
export type EstadoRonda = 'comenzando' | 'en_curso' | 'finalizada';

export interface Ronda {
	id: number;
	nombre: string;
	precio_por_tabla: number; // COP enteros
	estado: EstadoRonda;
	porcentaje_premio: number; // 0-100
	premio_entregado: number | null; // COP enteros o null hasta que se ingrese
	porcentaje_aporte_acumulado: number; // 0-100
	created_at: string; // ISO-like from SQLite
}

export interface Venta {
	id: number;
	ronda_id: number;
	cliente: string;
	cantidad: number;
	medio_pago: MedioPago;
	created_at: string;
}

export interface AcumuladoMovimiento {
	id: number;
	ronda_id: number;
	monto_aporte: number;
	created_at: string;
}

export interface GananciaRegistro {
	id: number;
	ronda_id: number;
	monto_ganancia: number;
	created_at: string;
}


