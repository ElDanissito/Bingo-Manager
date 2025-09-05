// Sin navegación, solo información pública
import { formatCOP } from "@/lib/money";
import { obtenerRondaEnCurso, obtenerRondaComenzandoReciente, acumuladoTotalRealtime, totalesDeRonda } from "../actions";
import Image from "next/image";
import { Card } from "../components/ui";
import PublicPageClient from "../components/PublicPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bingo - Información Pública",
  description: "Información en tiempo real del bingo - Premios y acumulados",
};

export default async function PublicPage() {
  const ronda = await obtenerRondaEnCurso();
  const rondaComenzando = await obtenerRondaComenzandoReciente();
  const acumulado = await acumuladoTotalRealtime();
  const totales = ronda ? await totalesDeRonda(ronda.id) : null;
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center text-center gap-10 bg-gradient-to-br from-violet-400/25 via-cyan-300/15 to-transparent">
      <PublicPageClient />
      <header>
        <div className="fixed top-6 left-6">
          <Image src="/logo2.png" alt="Bingo" width={420} height={420} priority />
        </div>
      </header>

      {!ronda ? (
        <>
          {rondaComenzando ? (
            <Card className="px-12 py-14 text-center">
              <p className="text-8xl sm:text-9xl font-extrabold">{rondaComenzando.nombre}</p>
              <p className="text-gray-200 mt-8 text-6xl">Esta ronda comenzará en breve,</p>
              <p className="text-gray-200 text-6xl">compra tu tabla y participa</p>
              <p className="mt-10 text-7xl sm:text-8xl bounce-soft">Valor tabla: <span className="font-extrabold">{formatCOP(rondaComenzando.precio_por_tabla)}</span></p>
            </Card>
          ) : (
            <Card className="px-8 py-10 text-center">
              <p className="text-gray-300 text-3xl">No hay ronda en curso por ahora.</p>
            </Card>
          )}
        </>
      ) : (
        <section className="grid gap-8">
          <Card className="px-12 py-14">
            <p className="text-8xl sm:text-9xl font-extrabold">{ronda.nombre}</p>
            <p className="text-gray-200 mt-6 text-6xl">Precio por tabla: <span className="font-extrabold">{formatCOP(ronda.precio_por_tabla)}</span></p>
          </Card>
          {totales && (
            <div className={ronda.es_final === 1 ? "grid gap-8" : "grid gap-8 sm:grid-cols-2"}>
              <div className="px-10 py-12 card-muted rounded">
                <p className="text-gray-300 text-3xl">Premio</p>
                <p className="text-6xl sm:text-7xl font-extrabold mt-3 bounce-soft">{ronda.premio_entregado !== null ? formatCOP(ronda.premio_entregado) : formatCOP(totales.premio_estimado)}</p>
                {ronda.es_final === 1 && (
                  <p className="text-gray-400 text-2xl mt-2">Ronda Final - Incluye acumulado</p>
                )}
              </div>
              {ronda.es_final !== 1 && (
                <div className="px-10 py-12 card-muted rounded">
                  <p className="text-gray-300 text-3xl">Acumulado</p>
                  <p className="text-6xl sm:text-7xl font-extrabold mt-3 bounce-soft bounce-soft-delay">{formatCOP(acumulado)}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}


