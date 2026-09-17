import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui";

export function NucleoPlaceholder({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card card-pad border-l-4 border-l-mineral-300">
        <div className="label mb-2">Núcleo previsto</div>
        <p className="text-sm text-mineral-600">
          Este núcleo faz parte da estrutura completa do Siheyuan Project OS. As entidades e o modelo de dados
          já estão definidos; a interface está pronta para expansão.
        </p>
        {children && <div className="mt-4 border-t border-mineral-100 pt-4">{children}</div>}
      </div>
    </div>
  );
}
