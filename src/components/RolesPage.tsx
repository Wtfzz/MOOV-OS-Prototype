import { useMemo, useState } from "react";
import { Download, Key, Pencil, Plus, Search, ShieldOff, Upload } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import { buildDefaultRolePermissions } from "@/lib/accessControl";
import type { CurrentUser, PageAccess, Role } from "@/types";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";
import DrawerForm from "./DrawerForm";
import ConfirmDialog from "./ConfirmDialog";
import RolePermissionsPanel from "./RolePermissionsPanel";

type RolesPageProps = {
  currentUser: CurrentUser;
  access?: PageAccess;
};

type SortKey = "roleNumber" | "id" | "roleName" | "roleType" | "active";

const ROLE_TYPES: Role["roleType"][] = ["System", "Operations", "Customer Service", "Finance", "Warehouse", "Management", "Other"];
const PAGE_SIZE = 10;

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function nextRoleNumber(roles: Role[]) {
  const max = roles.reduce((highest, role) => {
    const match = role.roleNumber?.match(/R(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `R${String(max + 1).padStart(3, "0")}`;
}

export default function RolesPage({ currentUser, access }: RolesPageProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [state, setState] = useState(() => loadState());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("roleNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);

  const pageAccess = access || { canView: true, canAdd: true, canModify: true, canDelete: true };
  const labels = {
    subtitle: lang === "zh" ? "\u5b9a\u4e49\u89d2\u8272\u5e76\u914d\u7f6e\u83dc\u5355/\u5b50\u83dc\u5355\u6743\u9650\u3002" : "Define roles and configure menu/submenu permissions.",
    createRole: lang === "zh" ? "\u521b\u5efa\u89d2\u8272" : "Create Role",
    editRole: lang === "zh" ? "\u7f16\u8f91\u89d2\u8272" : "Edit Role",
    searchPlaceholder: lang === "zh" ? "\u641c\u7d22 Role Name \u6216 Role ID" : "Search Role Name or Role ID",
    allTypes: lang === "zh" ? "\u5168\u90e8\u7c7b\u578b" : "All Types",
    allStatus: lang === "zh" ? "\u5168\u90e8\u72b6\u6001" : "All Status",
    deactivate: lang === "zh" ? "\u505c\u7528" : "Deactivate",
    confirmDeactivate: lang === "zh" ? "\u786e\u8ba4\u505c\u7528\u89d2\u8272" : "Confirm Role Deactivation",
    deactivateMessage: lang === "zh" ? "\u505c\u7528\u540e\uff0c\u8be5\u89d2\u8272\u4e0d\u518d\u53ef\u5206\u914d\u7ed9\u65b0\u7528\u6237\uff0c\u5df2\u5206\u914d\u7528\u6237\u4fdd\u7559\u5e76\u663e\u793a\u4e3a\u5df2\u505c\u7528\u89d2\u8272\u3002" : "After deactivation, this role is no longer assignable to new users. Existing users keep it and it is visually flagged.",
    permissions: lang === "zh" ? "\u6743\u9650" : "Permissions",
    rows: lang === "zh" ? "\u6761" : "rows",
    page: lang === "zh" ? "\u9875" : "Page",
  };

  const data: Role[] = state.roles || [];

  const appendAudit = (baseState: typeof state, action: string, objectName: string, detail: string) => ({
    ...baseState,
    audit: [
      ...(baseState.audit || []),
      {
        id: `audit-${Date.now()}`,
        time: nowStamp(),
        userId: currentUser.email,
        user: currentUser.name,
        action,
        module: "Role Management",
        objectType: "Role",
        objectName,
        detail,
        status: "Success",
        ip: "127.0.0.1",
        sessionId: currentUser.sessionId || "-",
      },
    ],
  });

  const roleFields = [
    { key: "roleNumber", label: t(lang, "roleNumber") || "Role Number", required: true, disabled: true },
    { key: "id", label: t(lang, "roleId") || "Role ID", required: true, disabled: !!editingRole, placeholder: "OPS_MANAGER" },
    { key: "roleName", label: t(lang, "roleName") || "Role Name", required: true },
    { key: "roleType", label: t(lang, "roleType") || "Role Type", type: "select" as const, options: ROLE_TYPES, required: true },
    { key: "description", label: t(lang, "description") || "Description", type: "textarea" as const },
    { key: "active", label: t(lang, "active") || "Active", type: "select" as const, options: ["true", "false"], required: true },
  ];

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rows = data.filter((row) => {
      const matchesSearch = !normalizedSearch || row.roleName.toLowerCase().includes(normalizedSearch) || row.id.toLowerCase().includes(normalizedSearch);
      const matchesType = !typeFilter || row.roleType === typeFilter;
      const matchesActive = !activeFilter || String(row.active) === activeFilter;
      return matchesSearch && matchesType && matchesActive;
    });
    return [...rows].sort((a, b) => {
      const aValue = sortKey === "active" ? String(a.active) : String(a[sortKey] || "");
      const bValue = sortKey === "active" ? String(b.active) : String(b[sortKey] || "");
      const result = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? result : -result;
    });
  }, [activeFilter, data, search, sortDirection, sortKey, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageRows = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDirection((current) => (sortKey === key && current === "asc" ? "desc" : "asc"));
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 font-semibold">
      {label}
      <span className="text-[10px]">{sortKey === key ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
    </button>
  );

  const openCreate = () => {
    setFormError("");
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const openEdit = (role: Role) => {
    setFormError("");
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const confirmDeactivate = () => {
    if (!deactivateConfirmId) return;
    const target = data.find((role) => role.id === deactivateConfirmId);
    if (!target) return;
    if (target.id === "ADMIN") {
      setFormError("System Admin role cannot be deactivated from the UI.");
      setDeactivateConfirmId(null);
      return;
    }
    const updatedRoles = data.map((role) => role.id === deactivateConfirmId ? { ...role, active: false, updatedAt: nowStamp(), updatedBy: currentUser.email } : role);
    const nextState = appendAudit({ ...state, roles: updatedRoles }, "Deactivate role", target.id, "Role deactivated; existing users retain assignment but new users cannot select it.");
    setState(nextState);
    saveState(nextState);
    setDeactivateConfirmId(null);
  };

  const handleSave = (values: Record<string, any>) => {
    setFormError("");
    const roleId = String(values.id || "").trim().toUpperCase();
    const roleName = String(values.roleName || "").trim();
    const description = String(values.description || "").trim();

    if (!roleId || !roleName || !values.roleType) {
      setFormError("Role ID, Role Name, and Role Type are required.");
      return;
    }
    if (!/^[A-Z0-9_]{1,20}$/.test(roleId)) {
      setFormError("Role ID must be uppercase and 20 characters or fewer.");
      return;
    }
    if (roleName.length > 100) {
      setFormError("Role Name must be 100 characters or fewer.");
      return;
    }
    if (description.length > 500) {
      setFormError("Description must be 500 characters or fewer.");
      return;
    }
    if (!ROLE_TYPES.includes(values.roleType)) {
      setFormError("Role Type is not valid.");
      return;
    }
    const duplicateRoleId = data.find((role) => role.id.toLowerCase() === roleId.toLowerCase() && role.id !== editingRole?.id);
    if (duplicateRoleId) {
      setFormError("Role ID must be unique.");
      return;
    }
    const duplicateRoleName = data.find((role) => role.roleName.toLowerCase() === roleName.toLowerCase() && role.id !== editingRole?.id);
    if (duplicateRoleName) {
      setFormError("Role Name must be unique.");
      return;
    }

    const roleData: Role = {
      ...(editingRole || {}),
      id: editingRole?.id || roleId,
      roleNumber: editingRole?.roleNumber || nextRoleNumber(data),
      roleName,
      roleType: values.roleType as Role["roleType"],
      description,
      active: values.active === "true",
      createdAt: editingRole?.createdAt || nowStamp(),
      createdBy: editingRole?.createdBy || currentUser.email,
      updatedAt: nowStamp(),
      updatedBy: currentUser.email,
    };

    if (roleData.id === "ADMIN" && !roleData.active) {
      setFormError("System Admin role cannot be deactivated from the UI.");
      return;
    }

    const updatedRoles = editingRole ? data.map((role) => role.id === editingRole.id ? roleData : role) : [...data, roleData];
    const nextBaseState = { ...state, roles: updatedRoles };
    const withDefaultPermissions = editingRole
      ? nextBaseState
      : { ...nextBaseState, rolePermissions: [...(nextBaseState.rolePermissions || []), buildDefaultRolePermissions(roleData)] };
    const auditAction = editingRole ? "Edit role" : "Create role";
    const auditDetail = editingRole
      ? `Before type=${editingRole.roleType}, active=${editingRole.active}; after type=${roleData.roleType}, active=${roleData.active}.`
      : "Role created with default permission template ready for configuration.";
    const nextState = appendAudit(withDefaultPermissions, auditAction, roleData.id, auditDetail);
    setState(nextState);
    saveState(nextState);
    setDrawerOpen(false);
    setEditingRole(null);
    setPage(1);
  };

  if (showPermissionsPanel && editingRole) {
    return (
      <RolePermissionsPanel
        roleId={editingRole.id}
        currentUser={currentUser}
        onClose={() => {
          setShowPermissionsPanel(false);
          setEditingRole(null);
          setState(loadState());
        }}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t(lang, "rolesTab")}</h2>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          {pageAccess.canAdd && <button onClick={openCreate} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted"><Plus size={14} />{labels.createRole}</button>}
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted"><Download size={14} />{t(lang, "export")}</button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"><Upload size={14} />{t(lang, "import")}</button>
        </div>
      </div>

      {formError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={labels.searchPlaceholder} className="w-full pl-9 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">{labels.allTypes}</option>
          {ROLE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value); setPage(1); }} className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">{labels.allStatus}</option>
          <option value="true">{t(lang, "active")}</option>
          <option value="false">{t(lang, "inactive")}</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1040px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("roleNumber", "Role Number")}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("id", "Role ID")}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("roleName", "Role Name")}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("roleType", "Role Type")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("active", "Active")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{t(lang, "operations")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">{t(lang, "noData")}</td></tr>
            ) : pageRows.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-4 py-3 text-sm font-medium">{row.roleNumber}</td>
                <td className="px-4 py-3 text-sm font-mono">{row.id}</td>
                <td className="px-4 py-3 text-sm font-semibold">{row.roleName}</td>
                <td className="px-4 py-3 text-sm"><span className="inline-block px-2 py-0.5 text-xs bg-blue-soft text-blue rounded-full">{row.roleType}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{row.description || "-"}</td>
                <td className="px-4 py-3 text-sm"><span className={`inline-block px-2 py-0.5 text-xs rounded-full ${row.active ? "bg-green-soft text-green" : "bg-gray-soft text-gray"}`}>{row.active ? t(lang, "active") : t(lang, "inactive")}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {pageAccess.canModify && <button onClick={() => openEdit(row)} className="icon-btn p-2 border border-border rounded hover:bg-muted text-sm flex items-center gap-1"><Pencil size={14} />{t(lang, "edit")}</button>}
                    {pageAccess.canModify && <button onClick={() => { setEditingRole(row); setShowPermissionsPanel(true); }} className="icon-btn p-2 border border-brand rounded hover:bg-brand-soft text-brand text-sm flex items-center gap-1"><Key size={14} />{labels.permissions}</button>}
                    {pageAccess.canDelete && row.active && <button onClick={() => setDeactivateConfirmId(row.id)} className="icon-btn p-2 border border-border rounded hover:bg-red-50 text-sm flex items-center gap-1 text-red-600"><ShieldOff size={14} />{labels.deactivate}</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredData.length} {labels.rows}</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span>{labels.page} {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>

      {drawerOpen && (
        <DrawerForm
          title={editingRole ? labels.editRole : labels.createRole}
          fields={roleFields}
          values={editingRole ? { ...editingRole, active: String(editingRole.active) } : { roleNumber: nextRoleNumber(data), roleType: "Operations", active: "true" }}
          onSave={handleSave}
          onClose={() => { setDrawerOpen(false); setEditingRole(null); setFormError(""); }}
          error={formError}
        />
      )}

      {deactivateConfirmId && (
        <ConfirmDialog
          title={labels.confirmDeactivate}
          message={labels.deactivateMessage}
          onConfirm={confirmDeactivate}
          onCancel={() => setDeactivateConfirmId(null)}
        />
      )}
    </div>
  );
}
