import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Download, Upload, RotateCcw } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import type { Service } from "@/types";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";
import DrawerForm from "./DrawerForm";
import ConfirmDialog from "./ConfirmDialog";

export default function ServicesPage() {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [state, setState] = useState(() => loadState());
  const [nameSearch, setNameSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [transportModeFilter, setTransportModeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const pageSize = 10;

  const data: Service[] = state.services || [];

  const serviceFields = [
    { key: "serviceId", label: t(lang, 'serviceId') || "Service ID", required: true },
    { key: "serviceName", label: t(lang, 'serviceName') || "Service Name", required: true, full: true },
    { key: "serviceCode", label: t(lang, 'serviceCode') || "Service Code", required: true },
    { key: "serviceType", label: t(lang, 'serviceType') || "Service Type", type: "select" as const, options: ["FCL", "LCL", "Air", "Rail", "Road", "Door-to-Door", "Other"], required: true },
    { key: "transportMode", label: t(lang, 'transportMode') || "Transport Mode", type: "select" as const, options: ["Ocean", "Air", "Rail", "Road", "Multimodal"], required: true },
    { key: "transitTimeMin", label: t(lang, 'transitTimeMin') || "Transit Time Min (days)", type: "text" as const },
    { key: "transitTimeMax", label: t(lang, 'transitTimeMax') || "Transit Time Max (days)", type: "text" as const },
    { key: "pol", label: t(lang, 'pol') || "POL" },
    { key: "pod", label: t(lang, 'pod') || "POD" },
    { key: "tsPorts", label: t(lang, 'tsPorts') || "T/S Ports", full: true },
    { key: "defaultOrganization", label: t(lang, 'defaultOrganization') || "Default Organization" },
    { key: "active", label: t(lang, 'active') || "Active", type: "select" as const, options: ["true", "false"] },
  ];

  const handleAdd = () => {
    setEditingService(null);
    setDrawerOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const updatedServices = data.filter((s) => s.id !== deleteConfirmId);
    const newState = { ...state, services: updatedServices };
    saveState(newState);
    setState(newState);
    setDeleteConfirmId(null);
  };

  const handleSave = (values: Record<string, any>) => {
    const serviceData: Service = {
      id: editingService?.id || `s${Date.now()}`,
      serviceId: values.serviceId,
      serviceName: values.serviceName,
      serviceCode: values.serviceCode,
      serviceType: values.serviceType,
      transportMode: values.transportMode,
      transitTimeMin: values.transitTimeMin ? Number(values.transitTimeMin) : undefined,
      transitTimeMax: values.transitTimeMax ? Number(values.transitTimeMax) : undefined,
      pol: values.pol || undefined,
      pod: values.pod || undefined,
      tsPorts: values.tsPorts || undefined,
      defaultOrganization: values.defaultOrganization || undefined,
      active: values.active === "true",
    };

    let updatedServices;
    if (editingService) {
      updatedServices = data.map((s) => (s.id === editingService.id ? serviceData : s));
    } else {
      updatedServices = [...data, serviceData];
    }

    const newState = { ...state, services: updatedServices };
    saveState(newState);
    setState(newState);
    setDrawerOpen(false);
    setEditingService(null);
  };

  const filteredData = data.filter((row) => {
    const matchesName = !nameSearch || row.serviceName.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesCode = !codeSearch || row.serviceCode.toLowerCase().includes(codeSearch.toLowerCase());
    const matchesServiceType = !serviceTypeFilter || row.serviceType === serviceTypeFilter;
    const matchesTransportMode = !transportModeFilter || row.transportMode === transportModeFilter;
    return matchesName && matchesCode && matchesServiceType && matchesTransportMode;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueServiceTypes = [...new Set(data.map((r) => r.serviceType))].sort();
  const uniqueTransportModes = [...new Set(data.map((r) => r.transportMode))].sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t(lang, 'serviceMaster')}</h2>
          <p className="text-sm text-muted-foreground">Service Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder={t(lang, 'pleaseInput') + ' Name'}
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <input
          type="text"
          placeholder={t(lang, 'pleaseInput') + ' Code'}
          value={codeSearch}
          onChange={(e) => setCodeSearch(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={serviceTypeFilter}
          onChange={(e) => setServiceTypeFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">{t(lang, 'allServiceTypes')}</option>
          {uniqueServiceTypes.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={transportModeFilter}
          onChange={(e) => setTransportModeFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">{t(lang, 'allTransportModes')}</option>
          {uniqueTransportModes.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Plus size={14} />
            {t(lang, 'add')}
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-yellow-400 px-2.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-50">
            <Download size={14} />
            {t(lang, 'export')}
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Upload size={14} />
            {t(lang, 'import')}
          </button>
        </div>
        <div className="flex gap-2">
          <button className="icon-btn p-2 border border-border rounded hover:bg-muted" title={t(lang, 'reset')}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Service ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Service Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Transport Mode</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Transit Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">POL</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">POD</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">T/S Ports</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Default Org</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Active</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{t(lang, 'operations')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                  {t(lang, 'noData')}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3 text-sm font-medium">{row.serviceId}</td>
                  <td className="px-4 py-3 text-sm">{row.serviceName}</td>
                  <td className="px-4 py-3 text-sm">{row.serviceCode}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-soft text-blue rounded-full">
                      {row.serviceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{row.transportMode}</td>
                  <td className="px-4 py-3 text-sm">
                    {row.transitTimeMin && row.transitTimeMax ? `${row.transitTimeMin}-${row.transitTimeMax}d` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.pol || "-"}</td>
                  <td className="px-4 py-3 text-sm">{row.pod || "-"}</td>
                  <td className="px-4 py-3 text-sm">{row.tsPorts || "-"}</td>
                  <td className="px-4 py-3 text-sm">{row.defaultOrganization || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${row.active ? 'bg-green-soft text-green' : 'bg-gray-soft text-gray'}`}>
                      {row.active ? t(lang, 'active') : t(lang, 'inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-brand hover:text-brand-strong text-sm flex items-center gap-1"
                      >
                        <Pencil size={14} />
                        {t(lang, 'edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        {t(lang, 'delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t(lang, 'total')} {filteredData.length}</span>
        <div className="flex items-center gap-2">
          <select className="px-2 py-1 border border-border rounded">
            <option>10{t(lang, 'page')}</option>
            <option>20{t(lang, 'page')}</option>
            <option>50{t(lang, 'page')}</option>
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-brand text-white border-brand"
                    : "border-border hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 8 && <span className="px-2 py-1">...</span>}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
          <span>{t(lang, 'goTo')}</span>
          <input
            type="number"
            defaultValue={currentPage}
            min={1}
            max={totalPages}
            className="w-12 px-2 py-1 border border-border rounded text-center"
          />
        </div>
      </div>

      {/* DrawerForm for Add/Edit */}
      {drawerOpen && (
        <DrawerForm
          title={editingService ? "编辑服务" : "新增服务"}
          fields={serviceFields}
          values={editingService || {}}
          onSave={handleSave}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {/* ConfirmDialog for Delete */}
      {deleteConfirmId && (
        <ConfirmDialog
          title="确认删除"
          message="确定要删除此服务吗？此操作不可恢复。"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
