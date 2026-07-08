import type { ReactElement } from "react";
import type { CurrentUser, EffectiveDataScope, PageAccess } from "@/types";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { findPage } from "./pageCatalog";
import DashboardPage from "@/components/DashboardPage";
import IamPage from "@/components/IamPage";
import WorkflowConfigPage from "@/components/WorkflowConfigPage";
import SystemConfigPage from "@/components/SystemConfigPage";
import ProfilePage from "@/components/ProfilePage";
import AuditLogPage from "@/components/AuditLogPage";
import ReservedPage from "@/components/ReservedPage";
import TablePage from "@/components/TablePage";
import OrganizationsPage from "@/components/OrganizationsPage";
import LocationsPage from "@/components/LocationsPage";
import ProductsPage from "@/components/ProductsPage";
import EquipmentPage from "@/components/EquipmentPage";
import VesselsPage from "@/components/VesselsPage";
import ClientsPage from "@/components/ClientsPage";
import CarriersPage from "@/components/CarriersPage";
import POManagementPage from "@/components/POManagementPage";
import TaskQueuePage from "@/components/TaskQueuePage";

type PageRendererProps = {
  currentPage: string;
  currentUser: CurrentUser;
  lang: Language;
  dataScope: EffectiveDataScope;
  pageAccess: PageAccess;
};

const tablePages: Record<string, (dataScope: EffectiveDataScope, pageAccess: PageAccess) => ReactElement> = {
  clients: (dataScope, pageAccess) => <ClientsPage dataScope={dataScope} access={pageAccess} />,
  organizations: (dataScope, pageAccess) => <OrganizationsPage dataScope={dataScope} access={pageAccess} />,
  carriers: () => <CarriersPage />,
  locations: () => <LocationsPage />,
  products: () => <ProductsPage />,
  equipment: () => <EquipmentPage />,
  vessels: () => <VesselsPage />,
  purchaseOrders: (dataScope, pageAccess) => <POManagementPage dataScope={dataScope} access={pageAccess} />,
};

export default function PageRenderer({ currentPage, currentUser, lang, dataScope, pageAccess }: PageRendererProps) {
  const page = findPage(currentPage);
  if (!page) return <DashboardPage />;

  if (page.externalUrl) {
    return (
      <div className="h-full w-full">
        <iframe
          src={page.externalUrl}
          className="w-full h-[calc(100vh-68px)] border-0"
          title={t(lang, page.label)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    );
  }

  switch (page.type) {
    case "home":
      return <DashboardPage />;
    case "profile":
      return <ProfilePage currentUser={currentUser} />;
    case "iam":
      return <IamPage currentUser={currentUser} pageAccess={pageAccess} />;
    case "workflowConfig":
      return <WorkflowConfigPage />;
    case "systemConfig":
      return <SystemConfigPage />;
    case "audit":
      return <AuditLogPage />;
    case "table":
      return page.table && tablePages[page.table] ? tablePages[page.table](dataScope, pageAccess) : <TablePage tableKey={page.table || ""} />;
    case "reserved":
      if (currentPage === "tasks-my") return <TaskQueuePage currentUser={currentUser} mode="my" />;
      if (currentPage === "tasks-team") return <TaskQueuePage currentUser={currentUser} mode="team" />;
      return <ReservedPage page={page} />;
    default:
      return <DashboardPage />;
  }
}
