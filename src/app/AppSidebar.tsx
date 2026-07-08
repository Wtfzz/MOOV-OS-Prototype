import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import type { PageConfig } from "@/types";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { pageCatalog } from "./pageCatalog";
import moovOsIcon from "@/assets/moov-icon-white-orange.png";

type AppSidebarProps = {
  currentPage: string;
  lang: Language;
  accessiblePageIds: Set<string>;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onNavigate: (pageId: string) => void;
};

function PageIcon({ page }: { page: PageConfig }) {
  const Icon = page.icon as LucideIcon;
  return <Icon className="w-4 h-4 shrink-0" />;
}

export default function AppSidebar({
  currentPage,
  lang,
  accessiblePageIds,
  collapsed,
  onCollapsedChange,
  onNavigate,
}: AppSidebarProps) {
  return (
    <aside className="sticky top-0 h-dvh min-h-0 bg-brand-strong text-white flex flex-col min-w-0">
      <div className={`h-[68px] px-3 flex items-center border-b border-white/10 ${collapsed ? "justify-center" : "justify-between gap-3"}`}>
        <div className={`flex items-center min-w-0 ${collapsed ? "justify-center" : "gap-3"}`}>
          <img
            src={moovOsIcon}
            alt="MOOV OS"
            className="w-[34px] h-[34px] rounded-lg object-contain shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <strong className="text-white">MOOV OS</strong>
              <span className="block text-xs text-white/70">{t(lang, "p1Mvp")}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            title={lang === "zh" ? "收起侧边栏" : "Collapse sidebar"}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="mx-3 mt-3 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          title={lang === "zh" ? "展开侧边栏" : "Expand sidebar"}
        >
          <PanelLeftOpen className="w-4 h-4 mx-auto" />
        </button>
      )}
      <nav className={`sidebar-scrollbar ${collapsed ? "p-2" : "p-3"} flex-1 min-h-0 overflow-y-auto overscroll-contain`}>
        <div className="mb-2">
          <button
            onClick={() => onNavigate("home")}
            title={t(lang, "home")}
            className={`w-full border-0 rounded-md bg-transparent text-white/90 px-2.5 py-2 flex gap-2.5 items-center text-left text-sm hover:bg-white/10 hover:text-white transition-colors ${collapsed ? "justify-center" : ""} ${currentPage === "home" ? "bg-white/10 text-white" : ""}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t(lang, "home")}</span>}
          </button>
        </div>
        {pageCatalog.map((group) => {
          const allowedItems = group.items.filter((item) => accessiblePageIds.has(item.id));
          if (!allowedItems.length) return null;
          return (
            <div key={group.group} className="mb-2">
              {!collapsed && <div className="px-2.5 py-2 text-xs text-white/60">{t(lang, group.group)}</div>}
              {allowedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={t(lang, item.label)}
                  className={`w-full border-0 rounded-md bg-transparent text-white/90 px-2.5 py-2 flex gap-2.5 items-center text-left text-sm hover:bg-white/10 hover:text-white transition-colors ${collapsed ? "justify-center" : ""} ${currentPage === item.id ? "bg-white/10 text-white" : ""}`}
                >
                  <PageIcon page={item} />
                  {!collapsed && <span>{t(lang, item.label)}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
