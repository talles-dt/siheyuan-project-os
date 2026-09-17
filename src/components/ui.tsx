import type { ReactNode } from "react";

const STATUS_COLORS: Record<string, string> = {
  descoberta: "bg-mineral-100 text-mineral-600",
  visita: "bg-blue-100 text-blue-700",
  diligencia: "bg-ocher-500/15 text-ocher-600",
  finalista: "bg-leaf-500/15 text-leaf-700",
  descartado: "bg-red-100 text-red-700",
  adquirido: "bg-leaf-500 text-white",

  conceito: "bg-mineral-100 text-mineral-600",
  aprovado: "bg-leaf-500/15 text-leaf-700",
  "em-revisao": "bg-ocher-500/15 text-ocher-600",
  executado: "bg-mineral-800 text-white",

  pendente: "bg-ocher-500/15 text-ocher-600",
  proibida: "bg-red-100 text-red-700",
  rejeitada: "bg-mineral-200 text-mineral-500",
  aprovada: "bg-leaf-500/15 text-leaf-700",

  "nao-iniciada": "bg-mineral-100 text-mineral-500",
  "em-andamento": "bg-blue-100 text-blue-700",
  concluida: "bg-leaf-500/15 text-leaf-700",
  bloqueada: "bg-red-100 text-red-700",

  "a-fazer": "bg-mineral-100 text-mineral-600",

  cotado: "bg-blue-100 text-blue-700",
  amostra: "bg-ocher-500/15 text-ocher-600",
  pedido: "bg-purple-100 text-purple-700",
  recebido: "bg-mineral-200 text-mineral-700",
  instalado: "bg-leaf-500/15 text-leaf-700",
  garantia: "bg-mineral-800 text-white",

  reversivel: "bg-leaf-500/15 text-leaf-700",
  parcial: "bg-ocher-500/15 text-ocher-600",
  irreversivel: "bg-red-100 text-red-700",
};

export function StatusChip({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-mineral-100 text-mineral-600";
  return <span className={`chip ${color}`}>{status}</span>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl text-mineral-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mineral-500">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card card-pad flex min-h-[120px] items-center justify-center text-center text-sm text-mineral-400">
      {message}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warn" | "ok" | "danger";
}) {
  const toneClass =
    tone === "warn"
      ? "border-ocher-500/40"
      : tone === "ok"
        ? "border-leaf-500/40"
        : tone === "danger"
          ? "border-red-300"
          : "";
  return (
    <div className={`card card-pad ${toneClass}`}>
      <div className="label">{label}</div>
      <div className="mt-1 font-serif text-2xl text-mineral-800">{value}</div>
      {hint && <div className="mt-1 text-xs text-mineral-400">{hint}</div>}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "danger" | "ok" }) {
  const c =
    tone === "danger"
      ? "bg-red-100 text-red-700"
      : tone === "ok"
        ? "bg-leaf-500/15 text-leaf-700"
        : "bg-mineral-100 text-mineral-600";
  return <span className={`chip ${c}`}>{children}</span>;
}

export function money(v: number, moeda = "BRL"): string {
  if (!v && v !== 0) return "—";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${moeda} ${v.toLocaleString("pt-BR")}`;
  }
}

export function area(v: number): string {
  if (!v) return "—";
  return `${v.toLocaleString("pt-BR")} m²`;
}
