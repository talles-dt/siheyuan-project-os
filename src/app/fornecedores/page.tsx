import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Fornecedores e cotações"
      subtitle="Cotações, fornecedores, alternativas equivalentes, preços, validade, prazos, amostras, aprovação estética/técnica, pedido, recebimento e instalação."
    >
      <p className="text-sm text-mineral-500">
        Entidades <code>Fornecedor</code> e <code>Cotação</code> já estão definidas no modelo de dados, prontas para
        a interface de gestão de cotações comparativas.
      </p>
    </NucleoPlaceholder>
  );
}
