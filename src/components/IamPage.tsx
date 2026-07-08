import { useState } from "react";
import { Users, ShieldCheck, UsersRound, Grid3x3 } from "lucide-react";
import UsersPage from "./UsersPage";
import RolesPage from "./RolesPage";
import WorkGroupsPage from "./WorkGroupsPage";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";
import type { CurrentUser, PageAccess } from "@/types";

const iamTabs = [
  { id: "users", label: "Users", table: "users", icon: Users },
  { id: "roles", label: "Roles", table: "roles", icon: ShieldCheck },
  { id: "workGroups", label: "Work Groups", table: "workGroups", icon: UsersRound },
  { id: "matrix", label: "Permission Matrix", icon: Grid3x3 },
];

const permissionMatrix = [
  { module: "User Management", action: "View all users", Admin: true },
  { module: "User Management", action: "Create user", Admin: true },
  { module: "User Management", action: "Edit user", Admin: true },
  { module: "Master Data", action: "View master data", Admin: true, Ops: true },
  { module: "Booking Matrix", action: "View / export", Admin: true, "Allocation Manager": true },
];

const defaultRoles = ["Admin", "Allocation Manager", "Team Manager", "Ops", "CS", "OHA", "Finance", "Vendor Manager", "WMS User"];

type IamPageProps = {
  currentUser: CurrentUser;
  pageAccess: PageAccess;
};

export default function IamPage({ currentUser, pageAccess }: IamPageProps) {
  const lang = getCurrentLanguage();
  const [currentTab, setCurrentTab] = useState("users");

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="flex gap-1 p-2 border-b bg-muted/50 overflow-x-auto">
          {iamTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${
                currentTab === tab.id
                  ? "bg-brand-soft text-brand-strong border border-brand-soft"
                  : "hover:bg-card hover:border"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {currentTab === "users" ? (
            <UsersPage currentUser={currentUser} access={pageAccess} />
          ) : currentTab === "roles" ? (
            <RolesPage currentUser={currentUser} access={pageAccess} />
          ) : currentTab === "workGroups" ? (
            <WorkGroupsPage />
          ) : (
            <PermissionMatrix />
          )}
        </div>
      </div>
    </div>
  );
}

function PermissionMatrix() {
  const lang = getCurrentLanguage();
  return (
    <div>
      <div className="px-4 py-3 border-b">
        <h2 className="text-base font-semibold">{t(lang, 'permissionMatrixTab')}</h2>
        <p className="text-xs text-muted-foreground mt-1">PRD Phase 1 minimum permission matrix; multi-role users get union of permissions.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-semibold">Module</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Action</th>
              {defaultRoles.map((role) => (
                <th key={role} className="px-3 py-2 text-left text-xs font-semibold">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2 text-sm">{row.module}</td>
                <td className="px-3 py-2 text-sm">{row.action}</td>
                {defaultRoles.map((role) => (
                  <td key={role} className="px-3 py-2 text-sm">
                    {row[role as keyof typeof row] ? "✓" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
