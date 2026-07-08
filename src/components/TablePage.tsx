import { useState } from "react";
import { Search, RotateCcw, Plus, Pencil, Ban, CircleCheck, Trash2 } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import type { TableConfig } from "@/types";
import { t, getCurrentLanguage } from "@/lib/i18n";

const tables: Record<string, TableConfig> = {
  users: {
    title: "Users",
    subtitle: "Manage user accounts, role assignments, and organization memberships.",
    primary: "Add User",
    search: "Search by name, email, or role",
    filters: [
      { key: "active", label: "Status", all: "All Status" },
    ],
    columns: [
      { key: "userNumber", label: "User Number" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "roleIds", label: "Roles" },
      { key: "organizationIds", label: "Organizations" },
      { key: "active", label: "Active", badge: true },
    ],
    fields: [],
  },
  roles: {
    title: "Roles",
    subtitle: "Define roles and configure menu/submenu permissions (View/Add/Modify/Delete).",
    primary: "Add Role",
    search: "Search by role name or Role ID",
    filters: [
      { key: "roleType", label: "Role Type", all: "All Types" },
      { key: "active", label: "Status", all: "All Status" },
    ],
    columns: [
      { key: "roleNumber", label: "Role Number" },
      { key: "id", label: "Role ID" },
      { key: "roleName", label: "Role Name" },
      { key: "roleType", label: "Role Type" },
      { key: "description", label: "Description" },
      { key: "active", label: "Active", badge: true },
    ],
    fields: [],
  },
  orgs: {
    title: "Organizations",
    subtitle: "Manage MOOV teams, OHA teams, regional and functional teams.",
    primary: "Add Organization",
    search: "Search by organization name, country, or owner",
    filters: [{ key: "orgType", label: "Org Type", all: "All Org Types" }],
    columns: [
      { key: "orgName", label: "Organization Name" },
      { key: "orgType", label: "Org Type" },
      { key: "region", label: "Region" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", badge: true },
    ],
    fields: [],
  },
  containers: {
    title: "集装箱主数据",
    subtitle: "维护集装箱类型、TEU、皮重、KPI体积等基础信息。",
    primary: "新增集装箱",
    search: "搜索类型、TEU",
    filters: [
      { key: "isReefer", label: "冷藏箱", all: "全部" },
    ],
    columns: [
      { key: "type", label: "Type" },
      { key: "teu", label: "TEU" },
      { key: "tareWeight", label: "Tare Weight" },
      { key: "kpiVolume", label: "Kpi volume (cbm)" },
      { key: "isReefer", label: "Is Reefer Container" },
      { key: "createTime", label: "Create Time" },
    ],
    fields: [],
  },
  workAssignmentRules: {
    title: "工作分配规则",
    subtitle: "配置任务自动分配给指定角色或用户的规则。",
    primary: "新增规则",
    search: "搜索客户、任务类型、区域",
    filters: [
      { key: "customer", label: "客户", all: "全部客户" },
      { key: "taskType", label: "任务类型", all: "全部任务类型" },
      { key: "status", label: "状态", all: "全部状态" },
    ],
    columns: [
      { key: "customer", label: "客户" },
      { key: "taskType", label: "任务类型" },
      { key: "region", label: "区域" },
      { key: "target", label: "分配目标" },
      { key: "priority", label: "优先级", badge: true },
      { key: "status", label: "状态", badge: true },
    ],
    fields: [],
  },
  allocationRules: {
    title: "舱位分配规则",
    subtitle: "配置承运商舱位分配比例和覆盖规则。",
    primary: "新增规则",
    search: "搜索客户、航线、承运商",
    filters: [
      { key: "customer", label: "客户", all: "全部客户" },
      { key: "carrier", label: "承运商", all: "全部承运商" },
      { key: "status", label: "状态", all: "全部状态" },
    ],
    columns: [
      { key: "customer", label: "客户" },
      { key: "lane", label: "航线" },
      { key: "carrier", label: "承运商" },
      { key: "allocationShare", label: "分配比例" },
      { key: "priority", label: "优先级", badge: true },
      { key: "status", label: "状态", badge: true },
    ],
    fields: [],
  },
  configs: {
    title: "基础配置",
    subtitle: "维护运输模式、异常类型、SLA类型、原因代码等系统配置。",
    primary: "新增配置",
    search: "搜索配置类型、代码、名称",
    filters: [
      { key: "configType", label: "配置类型", all: "全部类型" },
      { key: "status", label: "状态", all: "全部状态" },
    ],
    columns: [
      { key: "configType", label: "配置类型" },
      { key: "code", label: "代码" },
      { key: "name", label: "名称" },
      { key: "value", label: "值" },
      { key: "owner", label: "负责人" },
      { key: "status", label: "状态", badge: true },
    ],
    fields: [],
  },
};

interface TablePageProps {
  tableKey: string;
  onEdit?: (id: string) => void;
  onAdd?: () => void;
  embedded?: boolean;
}

export default function TablePage({ tableKey, onEdit, onAdd }: TablePageProps) {
  const [state, setState] = useState(() => loadState());
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const config = tables[tableKey];
  if (!config) return <div>Table not found</div>;

  const data = state[tableKey as keyof typeof state] as any[] || [];

  const filteredData = data.filter((row) => {
    const matchesSearch = !search || Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchesFilters = Object.entries(filters).every(([key, value]) => !value || row[key] === value);
    return matchesSearch && matchesFilters;
  });

  const uniqueValues = (key: string) => [...new Set(data.map((r) => r[key]).filter(Boolean))].sort();

  const getBadgeClass = (value: string) => {
    return String(value || "").toLowerCase().replace(/\s+/g, "-");
  };

  const handleToggle = (id: string) => {
    const nextData = data.map((row) =>
      row.id === id ? { ...row, status: row.status === "Active" ? "Inactive" : "Active" } : row
    );
    const nextState = { ...state, [tableKey]: nextData };
    setState(nextState);
    saveState(nextState);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAdd} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
          <Plus size={14} />
          {config.primary}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder={config.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        {config.filters.map((filter) => (
          <select
            key={filter.key}
            value={filters[filter.key] || ""}
            onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">{filter.all}</option>
            {uniqueValues(filter.key).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
        <button onClick={() => { setSearch(""); setFilters({}); }} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
          <RotateCcw size={14} />
          重置
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-muted">
              {config.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {config.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.badge ? (
                        <span className={`badge badge-${getBadgeClass(row[col.key])}`}>
                          {String(row[col.key])}
                        </span>
                      ) : (
                        Array.isArray(row[col.key]) ? row[col.key].join(", ") : String(row[col.key])
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit?.(row.id)} className="icon-btn p-2 border border-border rounded hover:bg-muted" title="编辑">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleToggle(row.id)} className="icon-btn p-2 border border-border rounded hover:bg-muted" title={row.status === "Active" ? "停用" : "启用"}>
                        {row.status === "Active" ? <Ban size={16} /> : <CircleCheck size={16} />}
                      </button>
                      {tableKey === "users" && (
                        <button className="icon-btn p-2 border border-border rounded hover:bg-muted" title="删除">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
