"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  grupo: string;
  mvp?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard geral", grupo: "MVP", mvp: true },
  { href: "/terrenos", label: "Terrenos candidatos", grupo: "MVP", mvp: true },
  { href: "/roadmap", label: "Roadmap do projeto", grupo: "MVP", mvp: true },
  { href: "/compras-decisoes", label: "Compras & Decisões", grupo: "MVP", mvp: true },
  { href: "/briefing", label: "Briefing canônico", grupo: "Núcleos" },
  { href: "/pranchas", label: "Pranchas e vistas", grupo: "Núcleos" },
  { href: "/implantacoes", label: "Terrenos & implantações", grupo: "Núcleos" },
  { href: "/decisoes", label: "Decisões e aprovações", grupo: "Núcleos" },
  { href: "/fornecedores", label: "Fornecedores e cotações", grupo: "Núcleos" },
  { href: "/ambientes", label: "Ambiente por ambiente", grupo: "Núcleos" },
  { href: "/operacao", label: "Operação e entrega final", grupo: "Núcleos" },
  { href: "/riscos", label: "Riscos e conflitos canônicos", grupo: "Núcleos" },
  { href: "/documentos", label: "Documentos e acervo", grupo: "Núcleos" },
  { href: "/config", label: "Configuração / permissões", grupo: "Sistema" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const groups = NAV.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.grupo] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-mineral-200 bg-mineral-50 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-mineral-200 px-5 py-4">
            <Link href="/" className="block" onClick={() => setOpen(false)}>
              <div className="font-serif text-lg leading-tight text-mineral-800">
                Siheyuan
              </div>
              <div className="text-xs text-mineral-400">Project OS</div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            {Object.entries(groups).map(([grupo, items]) => (
              <div key={grupo} className="mb-5">
                <div className="label mb-2 px-2">{grupo}</div>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${
                            active
                              ? "bg-mineral-800 text-white"
                              : "text-mineral-600 hover:bg-mineral-100 hover:text-mineral-800"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.mvp && !active && (
                            <span className="chip bg-leaf-500/10 text-leaf-700">MVP</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-mineral-200 px-5 py-3">
            <p className="font-serif text-xs italic text-mineral-400">
              Nada é escondido de quem habita a casa.
            </p>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-mineral-900/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-mineral-200 bg-mineral-50/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            className="btn-ghost lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="text-lg">☰</span>
          </button>
          <div className="hidden text-sm text-mineral-400 lg:block">
            Sistema vivo para proteger e realizar a intenção arquitetônica
          </div>
          <Link href="/riscos" className="btn-ghost text-xs">
            Conflitos canônicos →
          </Link>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
