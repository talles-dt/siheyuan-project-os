import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Ambiente por ambiente"
      subtitle="Checklist de entrega por ambiente e artefatos decorativos ainda pendentes."
    >
      <p className="text-sm text-mineral-500">
        Entidades <code>Ambiente</code> e <code>Artefato</code> já estão definidas. Cada ambiente terá checklist de
        entrega e vínculo com prancha, decisão e compra.
      </p>
    </NucleoPlaceholder>
  );
}
