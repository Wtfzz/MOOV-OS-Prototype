import { useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { EmailNotificationTemplate, Milestone, MilestoneTask, ProcessTemplate } from "@/types";
import DrawerForm from "../../DrawerForm";
import ConfirmDialog from "../../ConfirmDialog";
import { getCurrentLanguage, t, type Language } from "@/lib/i18n";

interface EmailNotificationTemplatesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

const triggerEvents = ["Task Created", "Task Completed", "Milestone Delayed", "Exception Raised", "Manual Send"];
const statusOptions = ["Active", "Inactive"];

export default function EmailNotificationTemplatesTab({ state, setState, saveState }: EmailNotificationTemplatesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<EmailNotificationTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const processTemplateName = useMemo<Map<string, string>>(
    () => new Map((state.processTemplates || []).map((item: ProcessTemplate) => [item.id, item.templateName])),
    [state.processTemplates]
  );
  const milestoneName = useMemo<Map<string, string>>(
    () => new Map((state.milestones || []).map((item: Milestone) => [item.id, item.milestoneName])),
    [state.milestones]
  );
  const taskName = useMemo<Map<string, string>>(
    () => new Map((state.milestoneTasks || []).map((item: MilestoneTask) => [item.id, item.taskName])),
    [state.milestoneTasks]
  );

  const clientOptions = (state.clients || []).map((client: any) => client.clientCode || client.customerCode).filter(Boolean);
  const processOptions = (state.processTemplates || []).map((item: ProcessTemplate) => item.id);
  const milestoneOptions = ["", ...(state.milestones || []).map((item: Milestone) => item.id)];
  const taskOptions = ["", ...(state.milestoneTasks || []).map((item: MilestoneTask) => item.id)];

  const fields = [
    { key: "templateName", label: t(lang, "templateName"), required: true },
    { key: "clientCode", label: t(lang, "client"), type: "select" as const, options: clientOptions, required: true },
    { key: "processTemplateId", label: t(lang, "processTemplate"), type: "select" as const, options: processOptions, required: true },
    { key: "milestoneId", label: t(lang, "milestone"), type: "select" as const, options: milestoneOptions },
    { key: "taskId", label: t(lang, "task"), type: "select" as const, options: taskOptions },
    { key: "triggerEvent", label: t(lang, "triggerEvent"), type: "select" as const, options: triggerEvents, required: true },
    { key: "subject", label: t(lang, "subject"), required: true },
    { key: "body", label: t(lang, "body"), type: "textarea" as const, full: true, required: true },
    { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
    { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
  ];

  const persist = (templates: EmailNotificationTemplate[]) => {
    const nextState = { ...state, emailNotificationTemplates: templates };
    setState(nextState);
    saveState(nextState);
  };

  const handleAdd = () => {
    setDrawerMode("add");
    setEditingItem({
      id: "",
      templateName: "",
      clientCode: clientOptions[0] || "",
      processTemplateId: processOptions[0] || "",
      milestoneId: "",
      taskId: "",
      triggerEvent: "Task Created",
      subject: "",
      body: "",
      status: "Active",
      remark: "",
    });
    setDrawerOpen(true);
  };

  const handleEdit = (item: EmailNotificationTemplate) => {
    setDrawerMode("edit");
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSave = (data: any) => {
    if (data.__validationError__) return;

    const normalized: EmailNotificationTemplate = {
      ...(drawerMode === "edit" ? editingItem : {}),
      id: drawerMode === "edit" && editingItem ? editingItem.id : `ent-${Date.now()}`,
      templateName: data.templateName,
      clientCode: data.clientCode,
      processTemplateId: data.processTemplateId,
      milestoneId: data.milestoneId || "",
      taskId: data.taskId || "",
      triggerEvent: data.triggerEvent || "Task Created",
      subject: data.subject,
      body: data.body || "",
      status: data.status || "Active",
      remark: data.remark || "",
    };

    const current = state.emailNotificationTemplates || [];
    const updated = drawerMode === "edit"
      ? current.map((item: EmailNotificationTemplate) => item.id === normalized.id ? normalized : item)
      : [...current, normalized];

    persist(updated);
    setDrawerOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteId) return;
    persist((state.emailNotificationTemplates || []).filter((item: EmailNotificationTemplate) => item.id !== deleteId));
    setDeleteId(null);
  };

  const renderStatus = (status: string) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
      {status === "Active" ? t(lang, "active") : t(lang, "inactive")}
    </span>
  );

  const items = state.emailNotificationTemplates || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h3 className="text-lg font-semibold">{t(lang, "emailNotificationTemplates")}</h3>
        <button onClick={handleAdd} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
          <Plus className="h-3.5 w-3.5" />
          {t(lang, "add")}
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "templateName")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "client")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "processTemplate")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "milestone")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "task")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "triggerEvent")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "status")}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td>
              </tr>
            ) : (
              items.map((item: EmailNotificationTemplate) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{item.templateName}</td>
                  <td className="px-4 py-3 text-sm">{item.clientCode}</td>
                  <td className="px-4 py-3 text-sm">{processTemplateName.get(item.processTemplateId) || item.processTemplateId}</td>
                  <td className="px-4 py-3 text-sm">{item.milestoneId ? milestoneName.get(item.milestoneId) || item.milestoneId : "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.taskId ? taskName.get(item.taskId) || item.taskId : "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.triggerEvent}</td>
                  <td className="px-4 py-3 text-sm">{renderStatus(item.status)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft transition-colors" title={t(lang, "edit")}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors" title={t(lang, "delete")}>
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

      {drawerOpen && (
        <DrawerForm
          title={`${drawerMode === "add" ? t(lang, "add") : t(lang, "edit")} ${t(lang, "emailNotificationTemplates")}`}
          fields={fields}
          values={editingItem || {}}
          onSave={handleSave}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title={t(lang, "confirmDelete")}
          message={t(lang, "confirmDeleteMessage")}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
