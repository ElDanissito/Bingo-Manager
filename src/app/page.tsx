import Link from "next/link";
import { listarRondas } from "./actions";
import { formatCOP } from "@/lib/money";
import { Badge, Table } from "./components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bingo - Gestión",
  description: "Sistema de gestión financiera para eventos de bingo locales",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bingo Manager</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/rondas/nueva" className="button-secondary px-3 py-2 rounded-md">Crear ronda</Link>
          <Link href="/admin" className="button-secondary px-3 py-2 rounded-md">Admin</Link>
          <Link href="/public" className="button-secondary px-3 py-2 rounded-md">Public</Link>
          <Link href="/stats" className="button-secondary px-3 py-2 rounded-md">Stats</Link>
        </nav>
      </header>
      <section className="mt-8">
        <ListaRondas />
      </section>
    </div>
  );
}

async function ListaRondas() {
  const rondas = await listarRondas();
  return (
    <div className="grid gap-4">
      <div>
        <Link href="/rondas/nueva" className="button-primary focus-ring px-3 py-2 rounded-md inline-block">Crear ronda</Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Precio tabla</th>
              <th className="py-2 pr-4">Premio %</th>
              <th className="py-2 pr-4">Aporte %</th>
              <th className="py-2 pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rondas.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)]">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.nombre}</td>
                <td className="py-2 pr-4">
                  <Badge>{r.estado}</Badge>
                </td>
                <td className="py-2 pr-4">{formatCOP(r.precio_por_tabla)}</td>
                <td className="py-2 pr-4">{r.porcentaje_premio}%</td>
                <td className="py-2 pr-4">{r.porcentaje_aporte_acumulado}%</td>
                <td className="py-2 pr-4">
                  <Link href={`/admin?rondaId=${r.id}`} className="button-secondary px-2 py-1 rounded">Administrar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
