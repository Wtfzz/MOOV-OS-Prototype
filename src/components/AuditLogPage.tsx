import { useState } from "react";
import { Download } from "lucide-react";
import { loadState, escapeHtml } from "@/lib/store";
import { t, getCurrentLanguage } from "@/lib/i18n";
import type { AuditLog } from "@/types";

export default function AuditLogPage() {
  const lang = getCurrentLanguage();
  const [filters, setFilters] = useState({ user: "", module: "", action: "", status: "", target: "", fromDate: "", toDate: "" });
  const state = loadState();
  const logs = [...state.audit].reverse();

  const filteredLogs = logs.filter((log) => {
    const logDate = log.time.slice(0, 10);
    return (!filters.user || log.user === filters.user) &&
      (!filters.module || log.module === filters.module) &&
      (!filters.action || log.action === filters.action) &&
      (!filters.status || log.status === filters.status) &&
      (!filters.target || log.objectName === filters.target) &&
      (!filters.fromDate || logDate >= filters.fromDate) &&
      (!filters.toDate || logDate <= filters.toDate);
  });

  const uniqueValues = (key: keyof AuditLog) => [...new Set(logs.map((log) => log[key]).filter(Boolean))] as string[];

  const exportCSV = () => {
    const headers = ["time", "userId", "user", "action", "module", "objectType", "objectName", "ip", "sessionId", "status", "detail"];
    const rows = filteredLogs.map((log) => [
      log.time, log.userId, log.user, log.action, log.module, log.objectType, log.objectName, log.ip, log.sessionId, log.status, log.detail,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const badgeClass = (value: string) => {
    const normalized = String(value || "").toLowerCase().replace(/\s+/g, "-");
    return `badge badge-${normalized}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={exportCSV} className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-2.5 text-xs font-medium transition-colors hover:bg-gray-50">
          <Download size={14} />
          {t(lang, "exportCsv")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-3">
        <select value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">{t(lang, "allUsers")}</option>
          {uniqueValues("user").map((user) => <option key={user} value={user}>{escapeHtml(user)}</option>)}
        </select>
        <select value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">{t(lang, "allModules")}</option>
          {uniqueValues("module").map((module) => <option key={module} value={module}>{escapeHtml(module)}</option>)}
        </select>
        <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">{t(lang, "allActions")}</option>
          {uniqueValues("action").map((action) => <option key={action} value={action}>{escapeHtml(action)}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">{t(lang, "allStatuses")}</option>
          {uniqueValues("status").map((status) => <option key={status} value={status}>{escapeHtml(status)}</option>)}
        </select>
        <select value={filters.target} onChange={(e) => setFilters({ ...filters, target: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">{lang === "zh" ? "\u5168\u90e8\u5bf9\u8c61" : "All Targets"}</option>
          {uniqueValues("objectName").map((target) => <option key={target} value={target}>{escapeHtml(target)}</option>)}
        </select>
        <input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" aria-label={lang === "zh" ? "\u5f00\u59cb\u65e5\u671f" : "From date"} />
        <input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" aria-label={lang === "zh" ? "\u7ed3\u675f\u65e5\u671f" : "To date"} />
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{lang === "zh" ? "\u65f6\u95f4" : "Time"}</th>
              <th className="px-4 py-3 text-left font-semibold">User ID</th>
              <th className="px-4 py-3 text-left font-semibold">User Name</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Module</th>
              <th className="px-4 py-3 text-left font-semibold">{lang === "zh" ? "\u76ee\u6807\u5bf9\u8c61" : "Target"}</th>
              <th className="px-4 py-3 text-left font-semibold">IP</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">{lang === "zh" ? "\u8be6\u60c5" : "Detail"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? filteredLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3">{escapeHtml(log.time)}</td>
                <td className="px-4 py-3">{escapeHtml(log.userId)}</td>
                <td className="px-4 py-3">{escapeHtml(log.user)}</td>
                <td className="px-4 py-3">{escapeHtml(log.action)}</td>
                <td className="px-4 py-3">{escapeHtml(log.module)}</td>
                <td className="px-4 py-3">{escapeHtml(log.objectName)}</td>
                <td className="px-4 py-3">{escapeHtml(log.ip)}</td>
                <td className="px-4 py-3"><span className={badgeClass(log.status)}>{escapeHtml(log.status)}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{escapeHtml(log.detail)}</td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">{t(lang, "noData")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
