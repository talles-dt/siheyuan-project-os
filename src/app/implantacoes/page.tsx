import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Terrenos & implantações"
      subtitle="Comparar visualmente o mesmo núcleo siheyuan em terrenos diferentes sem redesenhar a filosofia."
    >
      <p className="text-sm text-mineral-500">
        As implantações alternativas já são geradas e comparadas dentro de <strong>Terrenos candidatos</strong>.
        Esta tela dedicada trará a visão cruzada: núcleo canônico × terrenos × variantes × custo × conflitos.
      </p>
    </NucleoPlaceholder>
  );
}
