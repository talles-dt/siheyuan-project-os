import { NucleoPlaceholder } from "@/components/NucleoPlaceholder";

export default function Page() {
  return (
    <NucleoPlaceholder
      title="Decisões e aprovações"
      subtitle="Diário de projeto: decisão, opções, impacto no programa, custo, risco, quem aprovou, data, reversibilidade e relação com os princípios canônicos."
    >
      <p className="text-sm text-mineral-500">
        O diário de decisões já está funcional em <strong>Compras & Decisões</strong>, com a pergunta central e a
        detecção de conflitos canônicos. Esta tela trará a visão consolidada de aprovações por papéis e trilha de
        auditoria completa.
      </p>
    </NucleoPlaceholder>
  );
}
