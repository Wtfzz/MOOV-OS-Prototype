import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Upload, UserX } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import type { CurrentUser, PageAccess, User } from "@/types";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";
import DrawerForm from "./DrawerForm";
import ConfirmDialog from "./ConfirmDialog";

type UsersPageProps = {
  currentUser: CurrentUser;
  access?: PageAccess;
};

type SortKey = "userNumber" | "name" | "email" | "phone" | "roles" | "workGroups" | "active";

const PAGE_SIZE = 10;

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function nextUserNumber(users: User[]) {
  const max = users.reduce((highest, user) => {
    const match = user.userNumber?.match(/U(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `U${String(max + 1).padStart(3, "0")}`;
}

function isCompanyEmail(email: string) {
  return /^[^\s@]+@(moov\.local|moov\.com|moovlogistics\.com)$/i.test(email);
}

function stringifyList(values: string[]) {
  return values.length ? values.join(", ") : "-";
}

export default function UsersPage({ currentUser, access }: UsersPageProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [state, setState] = useState(() => loadState());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [workGroupFilter, setWorkGroupFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivateConfirmId, setDeactivateConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const pageAccess = access || { canView: true, canAdd: true, canModify: true, canDelete: true };
  const labels = {
    subtitle: lang === "zh" ? "\u7ba1\u7406\u7528\u6237\u8d26\u53f7\u3001\u89d2\u8272\u548c\u5de5\u4f5c\u7ec4\u6210\u5458\u8d44\u683c\u3002" : "Manage user accounts, role assignments, and work group assignments.",
    createUser: lang === "zh" ? "\u521b\u5efa\u7528\u6237" : "Create User",
    editUser: lang === "zh" ? "\u7f16\u8f91\u7528\u6237" : "Edit User",
    searchPlaceholder: lang === "zh" ? "\u641c\u7d22\u59d3\u540d\u6216\u90ae\u7bb1" : "Search name or email",
    allRoles: lang === "zh" ? "\u5168\u90e8\u89d2\u8272" : "All Roles",
    allWorkGroups: lang === "zh" ? "\u5168\u90e8\u5de5\u4f5c\u7ec4" : "All Work Groups",
    allStatus: lang === "zh" ? "\u5168\u90e8\u72b6\u6001" : "All Status",
    deactivate: lang === "zh" ? "\u505c\u7528" : "Deactivate",
    confirmDeactivate: lang === "zh" ? "\u786e\u8ba4\u505c\u7528" : "Confirm Deactivation",
    deactivateMessage: lang === "zh" ? "\u505c\u7528\u7528\u6237\u540e\uff0c\u8be5\u7528\u6237\u5c06\u65e0\u6cd5\u767b\u5f55\uff0c\u73b0\u6709\u4f1a\u8bdd\u4e5f\u4f1a\u7ed3\u675f\u3002" : "Deactivated users cannot log in, and active sessions will be terminated.",
    rows: lang === "zh" ? "\u6761" : "rows",
    page: lang === "zh" ? "\u9875" : "Page",
    inactiveRole: lang === "zh" ? "\u5df2\u505c\u7528\u89d2\u8272" : "inactive role",
  };

  const data: User[] = state.users || [];
  const roles = state.roles || [];
  const workGroups = state.workGroups || [];
  const activeRoles = roles.filter((role) => role.active || editingUser?.roleIds.includes(role.id));

  const roleOptions = activeRoles.map((role) => role.id);
  const workGroupOptions = workGroups.filter((group) => group.status === "Active" || editingUser?.workGroupIds?.includes(group.id)).map((group) => group.id);

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
        module: "User Management",
        objectType: "User",
        objectName,
        detail,
        status: "Success",
        ip: "127.0.0.1",
        sessionId: currentUser.sessionId || "-",
      },
    ],
  });

  const userFields = [
    { key: "userNumber", label: "User ID", required: true, disabled: true },
    { key: "name", label: t(lang, "userName"), required: true },
    { key: "email", label: t(lang, "userEmail"), required: true, disabled: !!editingUser },
    { key: "phone", label: t(lang, "userPhone") },
    { key: "roleIds", label: t(lang, "userRoles"), type: "multiselect" as const, options: roleOptions, required: true },
    { key: "workGroupIds", label: t(lang, "userWorkGroups"), type: "multiselect" as const, options: workGroupOptions, required: true },
    { key: "active", label: t(lang, "userActive"), type: "select" as const, options: ["true", "false"], required: true },
  ];

  const displayRole = (roleId: string) => {
    const role = roles.find((item) => item.id === roleId);
    return role ? `${role.roleName}${role.active ? "" : ` (${labels.inactiveRole})`}` : roleId;
  };

  const displayWorkGroup = (groupId: string) => workGroups.find((item) => item.id === groupId)?.workGroupName || groupId;

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rows = data.filter((row) => {
      const matchesSearch = !normalizedSearch || row.name.toLowerCase().includes(normalizedSearch) || (row.email || "").toLowerCase().includes(normalizedSearch);
      const matchesRole = !roleFilter || row.roleIds.includes(roleFilter);
      const matchesWorkGroup = !workGroupFilter || (row.workGroupIds || []).includes(workGroupFilter);
      const matchesActive = !activeFilter || String(row.active) === activeFilter;
      return matchesSearch && matchesRole && matchesWorkGroup && matchesActive;
    });

    const valueForSort = (row: User) => {
      if (sortKey === "roles") return row.roleIds.map(displayRole).join(" ");
      if (sortKey === "workGroups") return (row.workGroupIds || []).map(displayWorkGroup).join(" ");
      if (sortKey === "active") return row.active ? "1" : "0";
      return String(row[sortKey] || "");
    };

    return [...rows].sort((a, b) => {
      const result = valueForSort(a).localeCompare(valueForSort(b), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? result : -result;
    });
  }, [activeFilter, data, workGroupFilter, roleFilter, search, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const pageRows = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSortKey(key);
    setSortDirection((current) => (sortKey === key && current === "asc" ? "desc" : "asc"));
  };

  const openCreate = () => {
    setFormError("");
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const openEdit = (user: User) => {
    setFormError("");
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleDeactivate = () => {
    if (!deactivateConfirmId) return;
    const target = data.find((user) => user.id === deactivateConfirmId);
    if (!target) return;
    if (target.roleIds.includes("ADMIN")) {
      setFormError("System admin accounts cannot be deactivated from the UI.");
      setDeactivateConfirmId(null);
      return;
    }

    const updatedUsers = data.map((user) => user.id === deactivateConfirmId ? { ...user, active: false, updatedAt: nowStamp(), updatedBy: currentUser.email } : user);
    const updatedSessions = (state.sessions || []).map((session) =>
      session.userEmail === target.email && !session.endedAt ? { ...session, endedAt: nowStamp(), current: false } : session,
    );
    const nextState = appendAudit({ ...state, users: updatedUsers, sessions: updatedSessions }, "Deactivate user", target.email || target.name, "User deactivated and active sessions terminated.");
    setState(nextState);
    saveState(nextState);
    setDeactivateConfirmId(null);
  };

  const handleSave = (values: Record<string, any>) => {
    setFormError("");

    const email = String(values.email || "").trim().toLowerCase();
    const selectedRoles = Array.isArray(values.roleIds) ? values.roleIds : [];
    const selectedWorkGroups = Array.isArray(values.workGroupIds) ? values.workGroupIds : [];
    if (!values.name || !email) {
      setFormError("Name and Email are required.");
      return;
    }
    if (String(values.name).length > 100) {
      setFormError("Name must be 100 characters or fewer.");
      return;
    }
    if (!isCompanyEmail(email)) {
      setFormError("Email must be a valid company email.");
      return;
    }
    if (selectedRoles.length === 0) {
      setFormError("At least one active role must be selected.");
      return;
    }
    if (selectedWorkGroups.length === 0) {
      setFormError("At least one active Work Group must be selected.");
      return;
    }
    const invalidRole = selectedRoles.find((roleId) => !roles.find((role) => role.id === roleId && (role.active || editingUser?.roleIds.includes(roleId))));
    if (invalidRole) {
      setFormError("Selected role is not available for assignment.");
      return;
    }
    const invalidWorkGroup = selectedWorkGroups.find((groupId) => !workGroups.find((group) => group.id === groupId && (group.status === "Active" || editingUser?.workGroupIds?.includes(groupId))));
    if (invalidWorkGroup) {
      setFormError("Selected Work Group is not available for assignment.");
      return;
    }
    const duplicateEmail = data.find((user) => (user.email || "").toLowerCase() === email && user.id !== editingUser?.id);
    if (duplicateEmail) {
      setFormError("Email must be unique.");
      return;
    }

    const previous = editingUser;
    const userData: User = {
      ...(previous || {}),
      id: previous?.id || `user-${Date.now()}`,
      userNumber: previous?.userNumber || nextUserNumber(data),
      name: String(values.name || "").trim(),
      email: previous?.email || email,
      phone: values.phone ? String(values.phone).trim() : undefined,
      roleIds: selectedRoles,
      workGroupIds: selectedWorkGroups,
      active: values.active === "true",
      temporaryPasswordIssued: previous?.temporaryPasswordIssued ?? true,
      forcePasswordChange: previous?.forcePasswordChange ?? true,
      createdBy: previous?.createdBy || currentUser.email,
      createdAt: previous?.createdAt || nowStamp(),
      updatedAt: nowStamp(),
      updatedBy: currentUser.email,
    };

    if (!userData.active && userData.roleIds.includes("ADMIN")) {
      setFormError("System admin accounts cannot be deactivated from the UI.");
      return;
    }

    const updatedUsers = previous ? data.map((user) => user.id === previous.id ? userData : user) : [...data, userData];
    const updatedSessions = !userData.active
      ? (state.sessions || []).map((session) => session.userEmail === userData.email && !session.endedAt ? { ...session, endedAt: nowStamp(), current: false } : session)
      : state.sessions;

    const auditAction = previous ? "Edit user" : "Create user";
    const auditDetail = previous
      ? `Before roles=${stringifyList(previous.roleIds)}, workGroups=${stringifyList(previous.workGroupIds || [])}, active=${previous.active}; after roles=${stringifyList(userData.roleIds)}, workGroups=${stringifyList(userData.workGroupIds || [])}, active=${userData.active}.`
      : "Account created; welcome email and temporary password queued for delivery.";
    const nextState = appendAudit({ ...state, users: updatedUsers, sessions: updatedSessions }, auditAction, userData.email || userData.name, auditDetail);

    setState(nextState);
    saveState(nextState);
    setDrawerOpen(false);
    setEditingUser(null);
    setPage(1);
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 font-semibold">
      {label}
      <span className="text-[10px]">{sortKey === key ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
    </button>
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t(lang, "userAccounts")}</h2>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          {pageAccess.canAdd && (
            <button onClick={openCreate} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
              <Plus size={14} />
              {labels.createUser}
            </button>
          )}
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Download size={14} />
            {t(lang, "export")}
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
            <Upload size={14} />
            {t(lang, "import")}
          </button>
        </div>
      </div>

      {formError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={labels.searchPlaceholder} className="w-full pl-9 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
        <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">{labels.allRoles}</option>
          {roles.map((role) => <option key={role.id} value={role.id}>{role.roleName}</option>)}
        </select>
        <select value={workGroupFilter} onChange={(event) => { setWorkGroupFilter(event.target.value); setPage(1); }} className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">{labels.allWorkGroups}</option>
          {workGroups.map((group) => <option key={group.id} value={group.id}>{group.workGroupName}</option>)}
        </select>
        <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value); setPage(1); }} className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand">
          <option value="">{labels.allStatus}</option>
          <option value="true">{t(lang, "active")}</option>
          <option value="false">{t(lang, "inactive")}</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1080px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("userNumber", "User ID")}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("name", t(lang, "userName"))}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("email", t(lang, "userEmail"))}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("phone", t(lang, "userPhone"))}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("roles", t(lang, "userRoles"))}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("workGroups", t(lang, "userWorkGroups"))}</th>
              <th className="px-4 py-3 text-left text-sm text-muted-foreground">{sortableHeader("active", t(lang, "userActive"))}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{t(lang, "operations")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">{t(lang, "noData")}</td></tr>
            ) : pageRows.map((row) => (
              <tr key={row.id} onClick={() => pageAccess.canModify && openEdit(row)} className="border-t border-border hover:bg-muted/40 cursor-pointer">
                <td className="px-4 py-3 text-sm font-medium">{row.userNumber}</td>
                <td className="px-4 py-3 text-sm">{row.name}</td>
                <td className="px-4 py-3 text-sm">{row.email || "-"}</td>
                <td className="px-4 py-3 text-sm">{row.phone || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">{row.roleIds.map((roleId) => <span key={roleId} className="inline-block px-2 py-0.5 text-xs bg-blue-soft text-blue rounded-full">{displayRole(roleId)}</span>)}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">{(row.workGroupIds || []).map((groupId) => <span key={groupId} className="inline-block px-2 py-0.5 text-xs bg-brand-soft text-brand rounded-full">{displayWorkGroup(groupId)}</span>)}</div>
                </td>
                <td className="px-4 py-3 text-sm"><span className={`inline-block px-2 py-0.5 text-xs rounded-full ${row.active ? "bg-green-soft text-green" : "bg-gray-soft text-gray"}`}>{row.active ? t(lang, "active") : t(lang, "inactive")}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                    {pageAccess.canModify && <button onClick={() => openEdit(row)} className="icon-btn p-2 border border-border rounded hover:bg-muted text-sm flex items-center gap-1"><Pencil size={14} />{t(lang, "edit")}</button>}
                    {pageAccess.canDelete && row.active && <button onClick={() => setDeactivateConfirmId(row.id)} className="icon-btn p-2 border border-border rounded hover:bg-red-50 text-sm flex items-center gap-1 text-red-600"><UserX size={14} />{labels.deactivate}</button>}
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
          title={editingUser ? labels.editUser : labels.createUser}
          fields={userFields}
          values={editingUser ? { ...editingUser, active: String(editingUser.active) } : { userNumber: nextUserNumber(data), active: "true" }}
          onSave={handleSave}
          onClose={() => { setDrawerOpen(false); setEditingUser(null); setFormError(""); }}
          error={formError}
        />
      )}

      {deactivateConfirmId && (
        <ConfirmDialog
          title={labels.confirmDeactivate}
          message={labels.deactivateMessage}
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateConfirmId(null)}
        />
      )}
    </div>
  );
}
