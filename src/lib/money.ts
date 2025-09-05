// Formato COP sin decimales, con separador de miles
export function formatCOP(amount: number): string {
	const formatter = new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency: 'COP',
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
	});
	return formatter.format(amount);
}


