import Link from "next/link";
import { redirect } from "next/navigation";
import { crearRonda } from "@/app/actions";
import { Button, Card, Input } from "@/app/components/ui";

export const dynamic = "force-dynamic";

export default function NuevaRondaPage() {
  async function action(formData: FormData) {
    "use server";
    const nombre = String(formData.get("nombre") ?? "").trim();
    const precio_por_tabla = Number(formData.get("precio_por_tabla"));
    const porcentaje_premio = Number(formData.get("porcentaje_premio"));
    const porcentaje_aporte_acumulado = Number(formData.get("porcentaje_aporte_acumulado"));
    const es_final = formData.get("es_final") === "on";
    const id = await crearRonda({ nombre, precio_por_tabla, porcentaje_premio, porcentaje_aporte_acumulado, es_final, estado: 'comenzando' });
    redirect(`/admin?rondaId=${id}`);
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crear nueva ronda</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/" className="button-secondary px-3 py-2 rounded-md">Inicio</Link>
          <Link href="/admin" className="button-secondary px-3 py-2 rounded-md">Admin</Link>
        </nav>
      </header>

      <Card className="mt-8 max-w-xl">
        <form action={action} className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-400">Nombre de la ronda</span>
            <Input name="nombre" placeholder="Ej: Ronda 1" required />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-400">Precio por tabla (COP)</span>
            <Input name="precio_por_tabla" type="number" min={0} step={1} required />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-400">Porcentaje de premio (%)</span>
              <Input name="porcentaje_premio" type="number" min={0} max={100} step={1} required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-400">Aporte al acumulado (%)</span>
              <Input name="porcentaje_aporte_acumulado" type="number" min={0} max={100} step={1} required />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="es_final" 
              id="es_final"
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="es_final" className="text-sm text-gray-300">
              Esta es la ronda final (jugará el acumulado + porcentaje de premio)
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit">Crear ronda</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


