import { useState } from "react";
import { Plus, Edit, Trash2, Truck, AlertTriangle, Tag, Bell, FolderCog, ListTree } from "lucide-react";
import type { CustomConfigCategory, CustomConfigItem, ExceptionType, NotificationTemplate, ReasonCode, TransportMode } from "@/types";
import DrawerForm from "../DrawerForm";
import ConfirmDialog from "../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface BasicConfigTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

type ConfigTab = {
  id: string;
  label: string;
  icon: any;
  categoryId?: string;
};

const statusOptions = ["Active", "Inactive"];
const notificationTypeOptions = ["System Message", "Task Reminder", "Task Completion", "SLA Reminder", "Exception Alert"];
const channelOptions = ["In-app", "Email", "Both"];

export default function BasicConfigTab({ state, setState, saveState }: BasicConfigTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [activeConfigTab, setActiveConfigTab] = useState("transportModes");
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [configDrawerMode, setConfigDrawerMode] = useState<"add" | "edit">("add");
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);

  const customCategories = [...(state.customConfigCategories || [])]
    .sort((a: CustomConfigCategory, b: CustomConfigCategory) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const configSubTabs: ConfigTab[] = [
    { id: "transportModes", label: t(lang, "transportModes"), icon: Truck },
    { id: "exceptionTypes", label: t(lang, "exceptionTypes"), icon: AlertTriangle },
    { id: "reasonCodes", label: t(lang, "reasonCodes"), icon: Tag },
    { id: "systemNotificationTemplates", label: t(lang, "systemNotificationTemplates"), icon: Bell },
    { id: "configCategoryManagement", label: t(lang, "configCategoryManagement"), icon: FolderCog },
    ...customCategories
      .filter((category: CustomConfigCategory) => category.status === "Active")
      .map((category: CustomConfigCategory) => ({
        id: `custom:${category.id}`,
        label: category.name,
        icon: ListTree,
        categoryId: category.id,
      })),
  ];

  const getDictionaryFields = () => [
    { key: "code", label: t(lang, "code"), required: true },
    { key: "name", label: t(lang, "name"), required: true },
    { key: "description", label: t(lang, "description"), type: "textarea" as const, full: true },
    { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
    { key: "sortOrder", label: t(lang, "sortOrder"), type: "numeric" as const },
    { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
  ];

  const getConfigFormFields = (): any[] => {
    if (activeConfigTab.startsWith("custom:")) return getDictionaryFields();

    switch (activeConfigTab) {
      case "transportModes":
        return [
          { key: "code", label: t(lang, "code"), required: true },
          { key: "name", label: t(lang, "name"), required: true },
          { key: "applicableRegion", label: t(lang, "applicableRegion") },
          { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
          { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
        ];
      case "exceptionTypes":
        return [
          { key: "code", label: t(lang, "code"), required: true },
          { key: "name", label: t(lang, "name"), required: true },
          { key: "severity", label: t(lang, "severity"), type: "select" as const, options: ["Low", "Medium", "High", "Critical"] },
          { key: "description", label: t(lang, "description"), type: "textarea" as const, full: true },
          { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
          { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
        ];
      case "reasonCodes":
        return [
          { key: "code", label: t(lang, "code"), required: true },
          { key: "name", label: t(lang, "name"), required: true },
          { key: "scenario", label: t(lang, "scenario") },
          { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
          { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
        ];
      case "systemNotificationTemplates":
        return [
          { key: "templateName", label: t(lang, "templateName"), required: true },
          { key: "notificationType", label: t(lang, "notificationType"), type: "select" as const, options: notificationTypeOptions, required: true },
          { key: "scenario", label: t(lang, "scenario"), required: true },
          { key: "channel", label: t(lang, "channel"), type: "select" as const, options: channelOptions, required: true },
          { key: "subject", label: t(lang, "titleSubject"), required: true },
          { key: "body", label: t(lang, "body"), type: "textarea" as const, full: true, required: true },
          { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
          { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
        ];
      case "configCategoryManagement":
        return getDictionaryFields();
      default:
        return [];
    }
  };

  const handleAdd = () => {
    setConfigDrawerMode("add");
    setEditingConfig({ status: "Active", sortOrder: getItems().length + 1 });
    setConfigDrawerOpen(true);
  };

  const handleAddCategory = () => {
    setActiveConfigTab("configCategoryManagement");
    setConfigDrawerMode("add");
    setEditingConfig({ status: "Active", sortOrder: customCategories.length + 1 });
    setConfigDrawerOpen(true);
  };

  const handleEdit = (item: any) => {
    setConfigDrawerMode("edit");
    setEditingConfig(item);
    setConfigDrawerOpen(true);
  };

  const persist = (patch: any) => {
    const nextState = { ...state, ...patch };
    setState(nextState);
    saveState(nextState);
  };

  const handleSave = (data: any) => {
    if (data.__validationError__) return;

    if (activeConfigTab.startsWith("custom:")) {
      const categoryId = activeConfigTab.replace("custom:", "");
      const currentItems = state.customConfigItems || [];
      const normalized: CustomConfigItem = {
        ...(configDrawerMode === "edit" ? editingConfig : {}),
        id: configDrawerMode === "edit" ? editingConfig.id : `cfgitem-${Date.now()}`,
        categoryId,
        code: data.code,
        name: data.name,
        description: data.description || "",
        status: data.status || "Active",
        sortOrder: Number(data.sortOrder || 0),
        remark: data.remark || "",
      };
      const updated = configDrawerMode === "edit"
        ? currentItems.map((item: CustomConfigItem) => item.id === editingConfig.id ? normalized : item)
        : [...currentItems, normalized];
      persist({ customConfigItems: updated });
      setConfigDrawerOpen(false);
      return;
    }

    const handlers: Record<string, { listKey: string; build: (data: any) => any }> = {
      transportModes: {
        listKey: "transportModes",
        build: (form) => ({
          ...(configDrawerMode === "edit" ? editingConfig : {}),
          id: configDrawerMode === "edit" ? editingConfig.id : `tm-${Date.now()}`,
          code: form.code,
          name: form.name,
          applicableRegion: form.applicableRegion || "",
          status: form.status || "Active",
          remark: form.remark || "",
        } as TransportMode),
      },
      exceptionTypes: {
        listKey: "exceptionTypes",
        build: (form) => ({
          ...(configDrawerMode === "edit" ? editingConfig : {}),
          id: configDrawerMode === "edit" ? editingConfig.id : `et-${Date.now()}`,
          code: form.code,
          name: form.name,
          severity: form.severity || "Medium",
          description: form.description || "",
          status: form.status || "Active",
          remark: form.remark || "",
        } as ExceptionType),
      },
      reasonCodes: {
        listKey: "reasonCodes",
        build: (form) => ({
          ...(configDrawerMode === "edit" ? editingConfig : {}),
          id: configDrawerMode === "edit" ? editingConfig.id : `rc-${Date.now()}`,
          code: form.code,
          name: form.name,
          scenario: form.scenario || "",
          remarkRequired: Boolean(editingConfig?.remarkRequired),
          status: form.status || "Active",
          remark: form.remark || "",
        } as ReasonCode),
      },
      systemNotificationTemplates: {
        listKey: "notificationTemplates",
        build: (form) => ({
          ...(configDrawerMode === "edit" ? editingConfig : {}),
          id: configDrawerMode === "edit" ? editingConfig.id : `nt-${Date.now()}`,
          templateName: form.templateName,
          notificationType: form.notificationType || "System Message",
          scenario: form.scenario,
          channel: form.channel || "In-app",
          subject: form.subject,
          body: form.body || "",
          status: form.status || "Active",
          remark: form.remark || "",
        } as NotificationTemplate),
      },
      configCategoryManagement: {
        listKey: "customConfigCategories",
        build: (form) => ({
          ...(configDrawerMode === "edit" ? editingConfig : {}),
          id: configDrawerMode === "edit" ? editingConfig.id : `cfgcat-${Date.now()}`,
          code: form.code,
          name: form.name,
          description: form.description || "",
          status: form.status || "Active",
          sortOrder: Number(form.sortOrder || 0),
          remark: form.remark || "",
        } as CustomConfigCategory),
      },
    };

    const handler = handlers[activeConfigTab];
    if (!handler) return;

    const currentList = state[handler.listKey] || [];
    const normalized = handler.build(data);
    const updated = configDrawerMode === "edit"
      ? currentList.map((item: any) => item.id === editingConfig.id ? normalized : item)
      : [...currentList, normalized];

    persist({ [handler.listKey]: updated });
    setConfigDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setItemToDelete({ type: activeConfigTab, id });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type.startsWith("custom:")) {
      const updated = (state.customConfigItems || []).filter((item: CustomConfigItem) => item.id !== itemToDelete.id);
      persist({ customConfigItems: updated });
    } else if (itemToDelete.type === "configCategoryManagement") {
      const updatedCategories = (state.customConfigCategories || []).filter((item: CustomConfigCategory) => item.id !== itemToDelete.id);
      const updatedItems = (state.customConfigItems || []).filter((item: CustomConfigItem) => item.categoryId !== itemToDelete.id);
      persist({ customConfigCategories: updatedCategories, customConfigItems: updatedItems });
      if (activeConfigTab === `custom:${itemToDelete.id}`) setActiveConfigTab("configCategoryManagement");
    } else {
      const listKey = itemToDelete.type === "systemNotificationTemplates" ? "notificationTemplates" : itemToDelete.type;
      const updatedList = (state[listKey] || []).filter((item: any) => item.id !== itemToDelete.id);
      persist({ [listKey]: updatedList });
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const getColumns = () => {
    if (activeConfigTab.startsWith("custom:") || activeConfigTab === "configCategoryManagement") {
      return [
        { key: "code", label: t(lang, "code") },
        { key: "name", label: t(lang, "name") },
        { key: "description", label: t(lang, "description") },
        { key: "status", label: t(lang, "status") },
        { key: "sortOrder", label: t(lang, "sortOrder") },
      ];
    }

    switch (activeConfigTab) {
      case "transportModes":
        return [
          { key: "code", label: t(lang, "code") },
          { key: "name", label: t(lang, "name") },
          { key: "applicableRegion", label: t(lang, "applicableRegion") },
          { key: "status", label: t(lang, "status") },
        ];
      case "exceptionTypes":
        return [
          { key: "code", label: t(lang, "code") },
          { key: "name", label: t(lang, "name") },
          { key: "severity", label: t(lang, "severity") },
          { key: "status", label: t(lang, "status") },
        ];
      case "reasonCodes":
        return [
          { key: "code", label: t(lang, "code") },
          { key: "name", label: t(lang, "name") },
          { key: "scenario", label: t(lang, "scenario") },
          { key: "status", label: t(lang, "status") },
        ];
      case "systemNotificationTemplates":
        return [
          { key: "templateName", label: t(lang, "templateName") },
          { key: "notificationType", label: t(lang, "notificationType") },
          { key: "scenario", label: t(lang, "scenario") },
          { key: "channel", label: t(lang, "channel") },
          { key: "subject", label: t(lang, "titleSubject") },
          { key: "status", label: t(lang, "status") },
        ];
      default:
        return [];
    }
  };

  const getItems = () => {
    if (activeConfigTab.startsWith("custom:")) {
      const categoryId = activeConfigTab.replace("custom:", "");
      return (state.customConfigItems || [])
        .filter((item: CustomConfigItem) => item.categoryId === categoryId)
        .sort((a: CustomConfigItem, b: CustomConfigItem) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    if (activeConfigTab === "systemNotificationTemplates") return state.notificationTemplates || [];
    if (activeConfigTab === "configCategoryManagement") return customCategories;
    return state[activeConfigTab] || [];
  };

  const renderStatus = (value: any) => {
    const isActive = value === "Active" || value === true;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
        {isActive ? t(lang, "active") : t(lang, "inactive")}
      </span>
    );
  };

  const columns = getColumns();
  const items = getItems();
  const activeLabel = configSubTabs.find((tab) => tab.id === activeConfigTab)?.label || "";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleAddCategory}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand px-2.5 text-xs font-medium text-brand-strong transition-colors hover:bg-brand-soft"
        >
          <FolderCog className="h-3.5 w-3.5" />
          {t(lang, "addConfigCategory")}
        </button>
      </div>

      <div className="flex gap-1 p-2 border-b border-border bg-muted/50 overflow-x-auto mb-4">
        {configSubTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveConfigTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeConfigTab === tab.id ? "bg-brand-soft text-brand-strong border border-brand-soft" : "hover:bg-card"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center gap-3">
          <h3 className="text-lg font-semibold">{activeLabel}</h3>
          <button
            onClick={handleAdd}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"
          >
            <Plus className="h-3.5 w-3.5" />
            {t(lang, "add")}
          </button>
        </div>
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{col.label}</th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm align-top">
                        {col.key === "status" ? renderStatus(item[col.key]) : (item[col.key] || "-")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft transition-colors"
                          title={t(lang, "edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          title={t(lang, "delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {configDrawerOpen && (
        <DrawerForm
          title={`${configDrawerMode === "add" ? t(lang, "add") : t(lang, "edit")} ${activeLabel}`}
          fields={getConfigFormFields()}
          values={editingConfig || {}}
          onSave={handleSave}
          onClose={() => setConfigDrawerOpen(false)}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmDialog
          title={t(lang, "confirmDelete")}
          message={t(lang, "confirmDeleteMessage")}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}
