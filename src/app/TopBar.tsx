import { ChevronDown, CircleUserRound, Globe, LogOut } from "lucide-react";
import type { CurrentUser } from "@/types";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { roleProfiles } from "@/lib/store";
import type { ResolvedPage } from "./pageCatalog";

type TopBarProps = {
  currentPageData: ResolvedPage;
  currentUser: CurrentUser;
  lang: Language;
  roles: string[];
  userMenuOpen: boolean;
  onLanguageChange: (lang: Language) => void;
  onUserMenuOpenChange: (open: boolean) => void;
  onNavigate: (pageId: string) => void;
  onLogout: () => void;
};

function currentRoleLabel(roles: string[]): string {
  return roles.map((role) => roleProfiles[role]?.label || role).join(", ");
}

export default function TopBar({
  currentPageData,
  currentUser,
  lang,
  roles,
  userMenuOpen,
  onLanguageChange,
  onUserMenuOpenChange,
  onNavigate,
  onLogout,
}: TopBarProps) {
  const roleLabel = currentRoleLabel(roles);

  return (
    <header className="sticky top-0 z-40 h-[68px] bg-white border-b flex justify-between items-center gap-3 px-6">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold truncate">{t(lang, currentPageData.label)}</h1>
        <p className="text-sm text-muted-foreground truncate">{t(lang, currentPageData.group)}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <button className="btn-ghost inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            <Globe className="w-4 h-4" />
            {lang === "zh" ? "语言" : "Language"}
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
            <button
              onClick={() => onLanguageChange("zh")}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted first:rounded-t-lg ${lang === "zh" ? "bg-brand-soft text-brand-strong" : ""}`}
            >
              {lang === "zh" ? "中文" : "Chinese"}
            </button>
            <button
              onClick={() => onLanguageChange("en")}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted last:rounded-b-lg ${lang === "en" ? "bg-brand-soft text-brand-strong" : ""}`}
            >
              English
            </button>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => onUserMenuOpenChange(!userMenuOpen)}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-muted"
            aria-expanded={userMenuOpen}
          >
            <CircleUserRound className="w-8 h-8 text-brand" />
            <div className="hidden sm:block text-left">
              <strong className="block text-sm leading-tight">{currentUser.name}</strong>
              <span className="block text-xs text-muted-foreground leading-tight">{roleLabel}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <strong className="block text-sm">{currentUser.name}</strong>
                <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <button
                onClick={() => onNavigate("profile")}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <CircleUserRound className="w-4 h-4" />
                {t(lang, "profile")}
              </button>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                {t(lang, "logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
