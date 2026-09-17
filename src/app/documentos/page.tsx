import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Documentos e acervo"
      subtitle="Repositório versionado de documentos vinculados a terrenos, etapas, decisões e ambientes."
    >
      <p className="text-sm text-mineral-500">
        Entidade <code>Documento</code> já definida com tipo, entidade vinculada, versão e url. Pronta para a
        interface de acervo versionado.
      </p>
    </NucleoPlaceholder>
  );
}
