import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Operação e entrega final"
      subtitle="Manual da propriedade, manutenção de sistemas, inventário de equipamentos, documentos de garantia, mapas de infraestrutura, registro fotográfico, checklist de entrega por ambiente, artefatos pendentes e encerramento formal do projeto."
    >
      <p className="text-sm text-mineral-500">
        A obra só encerra quando o conjunto — inclusive o último artefato decorativo — estiver implantado. O
        encerramento formal exige checklist de entrega por ambiente completo.
      </p>
    </NucleoPlaceholder>
  );
}
