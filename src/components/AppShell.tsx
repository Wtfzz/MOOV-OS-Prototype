import { useEffect, useState } from "react";
import type { CurrentUser, PageAccess } from "@/types";
import { getCurrentLanguage, setCurrentLanguage, type Language } from "@/lib/i18n";
import { loadState } from "@/lib/store";
import { getAccessiblePageIds, getEffectiveDataScope, hasPermission } from "@/lib/accessControl";
import { getCurrentPageData } from "@/app/pageCatalog";
import AppSidebar from "@/app/AppSidebar";
import PageRenderer from "@/app/PageRenderer";
import TopBar from "@/app/TopBar";

interface AppShellProps {
  currentUser: CurrentUser;
  onLogout: () => void;
}

export default function AppShell({ currentUser, onLogout }: AppShellProps) {
  const [currentPage, setCurrentPage] = useState("home");
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appState] = useState(() => loadState());
  const roles = currentUser.roles || [currentUser.role];
  const accessiblePageIds = getAccessiblePageIds(appState, currentUser);
  const dataScope = getEffectiveDataScope(appState, currentUser);
  const pageAccess: PageAccess = {
    canView: hasPermission(appState, currentUser, currentPage, "View"),
    canAdd: hasPermission(appState, currentUser, currentPage, "Add"),
    canModify: hasPermission(appState, currentUser, currentPage, "Modify"),
    canDelete: hasPermission(appState, currentUser, currentPage, "Delete"),
  };
  const currentPageData = getCurrentPageData(currentPage);

  useEffect(() => {
    setCurrentLanguage(lang);
  }, [lang]);

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    setUserMenuOpen(false);
  };

  const changeLanguage = (newLang: Language) => {
    setCurrentLanguage(newLang);
    setLang(newLang);
  };

  return (
    <div
      className="min-h-dvh grid transition-[grid-template-columns] duration-200"
      style={{ gridTemplateColumns: sidebarCollapsed ? "72px 1fr" : "260px 1fr" }}
    >
      <AppSidebar
        currentPage={currentPage}
        lang={lang}
        accessiblePageIds={accessiblePageIds}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        onNavigate={handleNavigate}
      />
      <main className="min-w-0 flex flex-col">
        <TopBar
          currentPageData={currentPageData}
          currentUser={currentUser}
          lang={lang}
          roles={roles}
          userMenuOpen={userMenuOpen}
          onLanguageChange={changeLanguage}
          onUserMenuOpenChange={setUserMenuOpen}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <section key={`${lang}-${currentPage}`} className="app-content p-6 flex-1 min-w-0">
          <PageRenderer currentPage={currentPage} currentUser={currentUser} lang={lang} dataScope={dataScope} pageAccess={pageAccess} />
        </section>
      </main>
    </div>
  );
}
