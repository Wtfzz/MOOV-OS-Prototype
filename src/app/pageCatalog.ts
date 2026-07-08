import {
  Activity,
  AlarmClock,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Building2,
  ClipboardList,
  Download,
  FileClock,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  Package,
  PanelTop,
  PieChart,
  ScanSearch,
  Send,
  Settings,
  ShieldCheck,
  Ship,
  Timer,
  TriangleAlert,
  Truck,
  UsersRound,
  Workflow,
  CircleUserRound,
} from "lucide-react";
import type { PageConfig } from "@/types";
import { roleProfiles } from "@/lib/store";

export type PageCatalogGroup = {
  group: string;
  items: PageConfig[];
};

export type ResolvedPage = PageConfig & { group: string };

export const pageCatalog: PageCatalogGroup[] = [
  {
    group: "systemManagement",
    items: [
      { id: "system-iam", label: "userPermission", icon: ShieldCheck, type: "iam" },
      { id: "system-workflow-config", label: "workflowConfig", icon: Workflow, type: "workflowConfig" },
      { id: "system-config", label: "systemConfig", icon: Settings, type: "systemConfig" },
      { id: "system-audit", label: "auditLog", icon: FileClock, type: "audit" },
      { id: "system-files", label: "fileManagement", icon: FolderOpen, type: "table", table: "files" },
    ],
  },
  {
    group: "masterData",
    items: [
      { id: "master-customers", label: "clientMaster", icon: Building2, type: "table", table: "clients" },
      { id: "master-organizations", label: "organizationMaster", icon: Building2, type: "table", table: "organizations" },
      { id: "master-carriers", label: "carrierMaster", icon: Truck, type: "table", table: "carriers" },
      { id: "master-locations", label: "locationMaster", icon: MapPin, type: "table", table: "locations" },
      { id: "master-products", label: "productMaster", icon: Package, type: "table", table: "products" },
      { id: "master-equipment", label: "equipmentMaster", icon: Boxes, type: "table", table: "equipment" },
      { id: "master-vessels", label: "vesselMaster", icon: Ship, type: "table", table: "vessels" },
    ],
  },
  {
    group: "businessExecution",
    items: [
      { id: "execution-po", label: "poManagement", icon: ClipboardList, type: "table", table: "purchaseOrders" },
      {
        id: "execution-allocation",
        label: "spaceAllocation",
        icon: Boxes,
        type: "reserved",
        externalUrl: "https://moov-logistics.github.io/smartallocation/",
      },
      { id: "execution-shipment", label: "shipmentDetail", icon: PanelTop, type: "reserved" },
    ],
  },
  {
    group: "taskWorkbench",
    items: [
      { id: "tasks-my", label: "myTasks", icon: Inbox, type: "reserved" },
      { id: "tasks-team", label: "teamTasks", icon: UsersRound, type: "reserved" },
      { id: "tasks-sla", label: "slaView", icon: Timer, type: "reserved" },
      { id: "tasks-assignment", label: "manualAssignment", icon: Send, type: "reserved" },
    ],
  },
  {
    group: "exceptionQuality",
    items: [
      { id: "quality-exceptions", label: "exceptionManagement", icon: TriangleAlert, type: "reserved" },
      { id: "quality-sla", label: "exceptionSla", icon: AlarmClock, type: "reserved" },
      { id: "quality-validation", label: "dataValidation", icon: ListChecks, type: "reserved" },
      { id: "quality-check", label: "qualityCheck", icon: BadgeCheck, type: "reserved" },
    ],
  },
  {
    group: "automationNotification",
    items: [
      { id: "auto-validation", label: "autoValidation", icon: ScanSearch, type: "reserved" },
      { id: "auto-email", label: "autoEmail", icon: Mail, type: "reserved" },
      { id: "auto-notice", label: "notificationRecord", icon: Bell, type: "reserved" },
      { id: "auto-rpa", label: "rpaReserved", icon: Bot, type: "reserved" },
    ],
  },
  {
    group: "reportDashboard",
    items: [
      { id: "reports-task", label: "taskDashboard", icon: BarChart3, type: "reserved" },
      { id: "reports-exception", label: "exceptionDashboard", icon: PieChart, type: "reserved" },
      { id: "reports-workload", label: "workloadDashboard", icon: Activity, type: "reserved" },
      { id: "reports-export", label: "exportReserved", icon: Download, type: "reserved" },
    ],
  },
];

export function canAccess(pageId: string, roles: string[]): boolean {
  const menus = roles.flatMap((role) => roleProfiles[role]?.menus || []);
  return menus.includes("*") || menus.includes(pageId);
}

export function findPage(id: string): ResolvedPage | null {
  if (id === "home") {
    return { id: "home", label: "home", icon: LayoutDashboard, type: "home", group: "home" };
  }
  if (id === "profile") {
    return { id: "profile", label: "profile", icon: CircleUserRound, type: "profile", group: "home" };
  }

  for (const group of pageCatalog) {
    const found = group.items.find((item) => item.id === id);
    if (found) return { ...found, group: group.group };
  }
  return null;
}

export function getCurrentPageData(pageId: string): ResolvedPage {
  return findPage(pageId) || { id: "home", label: "home", icon: LayoutDashboard, type: "home", group: "home" };
}
