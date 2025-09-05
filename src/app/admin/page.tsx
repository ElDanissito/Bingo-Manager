import Link from "next/link";
import { agregarVenta, listarRondas, listarVentas, registrarPremioEntregado, totalesDeRonda, obtenerRondaEnCurso, setEstadoRonda, obtenerRondaPorId } from "../actions";
import { formatCOP } from "@/lib/money";
import { Badge, Button, Card, Input, Select, Table } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ rondaId?: string }> }) {
  const rondas = await listarRondas();
  const rondaEnCurso = await obtenerRondaEnCurso();
  const sp = (await searchParams) ?? {};
  const selectedId = sp.rondaId ? Number(sp.rondaId) : undefined;
  const rondaSeleccionada = selectedId ? await obtenerRondaPorId(selectedId) : rondaEnCurso;
  const ventas = rondaSeleccionada ? await listarVentas(rondaSeleccionada.id) : [];
  const totales = rondaSeleccionada ? await totalesDeRonda(rondaSeleccionada.id) : null;

  async function handleCrearVenta(formData: FormData) {
    "use server";
    const rondaId = Number(formData.get("ronda_id"));
    const cliente = String(formData.get("cliente") ?? "");
    const cantidad = Number(formData.get("cantidad"));
    const medio_pago = String(formData.get("medio_pago")) === 'NEQUI' ? 'NEQUI' : 'EFECTIVO';
    await agregarVenta({ ronda_id: rondaId, cliente, cantidad, medio_pago });
  }

  async function handleCambiarEstado(formData: FormData) {
    "use server";
    const rondaId = Number(formData.get("ronda_id"));
    const nuevoEstado = String(formData.get("estado"));
    await setEstadoRonda(rondaId, nuevoEstado as 'comenzando' | 'en_curso' | 'finalizada');
  }

  async function handlePremioEntregado(formData: FormData) {
    "use server";
    const rondaId = Number(formData.get("ronda_id"));
    const monto = Number(formData.get("premio"));
    await registrarPremioEntregado(rondaId, monto);
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administración</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/" className="button-secondary px-3 py-2 rounded-md">Inicio</Link>
          <Link href="/public" className="button-secondary px-3 py-2 rounded-md">Public</Link>
        </nav>
      </header>

      <section className="mt-8 grid gap-8">
        <div>
          <h2 className="font-semibold text-lg">Administrar ronda</h2>
          {!rondaSeleccionada ? (
            <p className="text-gray-400">No hay ronda seleccionada.</p>
          ) : (
            <Card className="p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="font-medium">{rondaSeleccionada.nombre}</p>
                  <p className="text-sm text-gray-600">Precio por tabla: {formatCOP(rondaSeleccionada.precio_por_tabla)}</p>
                  <p className="text-sm text-gray-600">Premio %: {rondaSeleccionada.porcentaje_premio}% | Aporte %: {rondaSeleccionada.porcentaje_aporte_acumulado}%</p>
                  <div className="mt-2">
                    <Badge>Estado actual: {rondaSeleccionada.estado}</Badge>
                  </div>
                </div>
                <form action={handleCambiarEstado} className="flex gap-2">
                  <input type="hidden" name="ronda_id" value={rondaSeleccionada.id} />
                  <Select name="estado" defaultValue={rondaSeleccionada.estado}>
                    <option value="comenzando">Comenzando</option>
                    <option value="en_curso">En curso</option>
                    <option value="finalizada">Finalizada</option>
                  </Select>
                  <Button type="submit">Cambiar estado</Button>
                </form>
              </div>

              {totales && (
                <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 card-muted rounded">
                    <p className="text-gray-400">Tablas vendidas</p>
                    <p className="text-lg font-semibold">{totales.total_tablas}</p>
                  </div>
                  <div className="p-3 card-muted rounded">
                    <p className="text-gray-400">Total recaudado</p>
                    <p className="text-lg font-semibold">{formatCOP(totales.total_recaudado)}</p>
                  </div>
                  <div className="p-3 card-muted rounded">
                    <p className="text-gray-400">Premio estimado</p>
                    <p className="text-lg font-semibold">{formatCOP(totales.premio_estimado)}</p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium">Registrar premio entregado</h3>
                <form action={handlePremioEntregado} className="flex gap-2 items-center mt-2">
                  <input type="hidden" name="ronda_id" value={rondaSeleccionada.id} />
                  <Input name="premio" type="number" min={0} step={1} placeholder="Monto en COP" required />
                  <Button variant="success">Guardar</Button>
                </form>
              </div>

              <div className="mt-6">
                <h3 className="font-medium">Registrar venta</h3>
                <form action={handleCrearVenta} className="flex flex-wrap gap-2 items-center mt-2">
                  <input type="hidden" name="ronda_id" value={rondaSeleccionada.id} />
                  <Input name="cliente" placeholder="Cliente" required />
                  <Input name="cantidad" type="number" min={1} step={1} placeholder="Cantidad" className="w-28" required />
                  <Select name="medio_pago">
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="NEQUI">Nequi</option>
                  </Select>
                  <Button>Agregar</Button>
                </form>
              </div>

              <div className="mt-6">
                <h3 className="font-medium">Ventas</h3>
                <div className="mt-2 overflow-x-auto">
                  <Table>
                    <thead>
                      <tr className="text-left">
                        <th className="py-2 pr-4">Cliente</th>
                        <th className="py-2 pr-4">Cantidad</th>
                        <th className="py-2 pr-4">Medio</th>
                        <th className="py-2 pr-4">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map(v => (
                        <tr key={v.id} className="border-b border-[var(--border)]">
                          <td className="py-2 pr-4">{v.cliente}</td>
                          <td className="py-2 pr-4">{v.cantidad}</td>
                          <td className="py-2 pr-4">{v.medio_pago}</td>
                          <td className="py-2 pr-4">{new Date(v.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-lg">Todas las rondas</h2>
          <div className="mt-2 overflow-x-auto">
            <Table>
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rondas.map(r => (
                  <tr key={r.id} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4">{r.nombre}</td>
                    <td className="py-2 pr-4"><Badge>{r.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}


