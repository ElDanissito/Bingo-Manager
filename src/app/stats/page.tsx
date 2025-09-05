import { formatCOP } from "@/lib/money";
import { RondaStats, statsPorRonda } from "../actions";
import { Card, Table, Select, Button } from "../components/ui";
import type { MedioPago } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estadísticas - Bingo Gestión",
  description: "Estadísticas financieras y análisis de rondas de bingo",
};

export default async function StatsPage({ searchParams }: { searchParams?: Promise<{ medio?: string }> }) {
  const sp = (await searchParams) ?? {};
  const medio = sp.medio === 'EFECTIVO' || sp.medio === 'NEQUI' ? sp.medio : 'ALL';
  const { rondas, totales } = await statsPorRonda(medio as MedioPago | 'ALL');
  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <p className="text-gray-400">Resumen global y por ronda</p>
        <form method="GET" className="mt-4 flex items-center gap-2">
          <Select name="medio" defaultValue={medio}>
            <option value="ALL">Todo</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="NEQUI">Nequi</option>
          </Select>
          <Button type="submit" className="px-3 py-2">Filtrar</Button>
        </form>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-gray-400">Total vendido</p>
          <p className="text-xl font-bold">{formatCOP(totales.vendido)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-400">Total pool acumulado</p>
          <p className="text-xl font-bold">{formatCOP(totales.pool)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-400">Total ingresos (organizadores)</p>
          <p className="text-xl font-bold">{formatCOP(totales.ingresos)}</p>
        </Card>
      </div>

      <div className="mt-8 overflow-x-auto">
        <Table>
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Ronda</th>
              <th className="py-2 pr-4">Precio tabla</th>
              <th className="py-2 pr-4">Tablas</th>
              <th className="py-2 pr-4">Recaudado</th>
              <th className="py-2 pr-4">Premio %</th>
              <th className="py-2 pr-4">Premio entregado</th>
              <th className="py-2 pr-4">Aporte %</th>
              <th className="py-2 pr-4">Pool (realtime)</th>
              <th className="py-2 pr-4">Ingresos (realtime)</th>
            </tr>
          </thead>
          <tbody>
            {rondas.map((r: RondaStats) => (
              <tr key={r.id} className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">{r.nombre}</td>
                <td className="py-2 pr-4">{formatCOP(r.precio_por_tabla)}</td>
                <td className="py-2 pr-4">{r.total_tablas}</td>
                <td className="py-2 pr-4">{formatCOP(r.total_recaudado)}</td>
                <td className="py-2 pr-4">{r.porcentaje_premio}%</td>
                <td className="py-2 pr-4">{r.premio_entregado !== null ? formatCOP(r.premio_entregado) : '-'}</td>
                <td className="py-2 pr-4">{r.porcentaje_aporte_acumulado}%</td>
                <td className="py-2 pr-4">{formatCOP(r.aporte_realtime)}</td>
                <td className="py-2 pr-4">{formatCOP(r.ingreso_realtime)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}


