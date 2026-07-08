import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { SlaTypeConfig } from "@/types";
import DrawerForm from "../../DrawerForm";
import ConfirmDialog from "../../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface SlaTypesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

export default function SlaTypesTab({ state, setState, saveState }: SlaTypesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<SlaTypeConfig | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fields = [
    { key: "id", label: t(lang, 'slaTypeId') || "SLA ID", required: true },
    { key: "baseDateCode", label: t(lang, 'baseDateCode'), type: "select" as const, options: ["ETD", "CRD", "TASK_CREATED", "HOD", "BOOKING_RECEIVED", "ATD", "ATA", "POD", "DELIVERY", "CUSTOMS_CLEARANCE"] },
    { key: "direction", label: t(lang, 'direction'), type: "select" as const, options: ["Before", "After"] },
    { key: "offsetValue", label: t(lang, 'offsetValue'), type: "numeric" as const },
    { key: "offsetUnit", label: t(lang, 'offsetUnit'), type: "select" as const, options: ["Hours", "Days", "Business Days", "Months"] },
    { key: "calendarCode", label: t(lang, 'calendarCode') },
    { key: "objectScope", label: t(lang, 'objectScope'), type: "select" as const, options: ["Task", "Milestone", "Booking", "Shipment"] },
    { key: "status", label: t(lang, 'status'), type: "select" as const, options: ["Active", "Inactive"] },
  ];

  const handleAdd = () => {
    setDrawerMode("add");
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: SlaTypeConfig) => {
    setDrawerMode("edit");
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSave = (data: any) => {
    if (drawerMode === "add") {
      const newItem: SlaTypeConfig = {
        id: data.id,
        slaRule: {
          baseDateCode: data.baseDateCode || "ETD",
          direction: (data.direction as any) || "After",
          offsetValue: Number(data.offsetValue) || 0,
          offsetUnit: (data.offsetUnit as any) || "Days",
        },
        calendarCode: data.calendarCode || "",
        objectScope: (data.objectScope as any) || "Task",
        status: (data.status as any) || "Active",
      };
      const updated = [...(state.slaTypeConfigs || []), newItem];
      setState((prev: any) => ({ ...prev, slaTypeConfigs: updated }));
      saveState({ ...state, slaTypeConfigs: updated });
    } else if (editingItem) {
      const updated = (state.slaTypeConfigs || []).map((item: SlaTypeConfig) =>
        item.id === editingItem.id ? {
          ...item,
          slaRule: {
            baseDateCode: data.baseDateCode || item.slaRule?.baseDateCode || "ETD",
            direction: (data.direction as any) || item.slaRule?.direction || "After",
            offsetValue: Number(data.offsetValue) || item.slaRule?.offsetValue || 0,
            offsetUnit: (data.offsetUnit as any) || item.slaRule?.offsetUnit || "Days",
          },
          calendarCode: data.calendarCode || item.calendarCode,
          objectScope: (data.objectScope as any) || item.objectScope,
          status: (data.status as any) || item.status,
        } : item
      );
      setState((prev: any) => ({ ...prev, slaTypeConfigs: updated }));
      saveState({ ...state, slaTypeConfigs: updated });
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = (state.slaTypeConfigs || []).filter((item: SlaTypeConfig) => item.id !== itemToDelete);
    setState((prev: any) => ({ ...prev, slaTypeConfigs: updated }));
    saveState({ ...state, slaTypeConfigs: updated });
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const items = state.slaTypeConfigs || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t(lang, 'slaTypes')}</h3>
        <button
          onClick={handleAdd}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"
        >
          <Plus className="h-3.5 w-3.5" />
          {t(lang, 'add')}
        </button>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'slaTypeId') || "SLA ID"}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'baseDateCode')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'direction')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'offsetValue')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'offsetUnit')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'objectScope')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {t(lang, 'noData')}
                </td>
              </tr>
            ) : (
              items.map((item: SlaTypeConfig) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.id}</td>
                  <td className="px-4 py-3 text-sm">{item.slaRule?.baseDateCode || "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.slaRule?.direction || "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.slaRule?.offsetValue ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.slaRule?.offsetUnit || "-"}</td>
                  <td className="px-4 py-3 text-sm">{item.objectScope || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
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
          title={drawerMode === "add" ? t(lang, 'add') : t(lang, 'edit')}
          fields={fields}
          values={editingItem ? {
            id: editingItem.id,
            baseDateCode: editingItem.slaRule?.baseDateCode,
            direction: editingItem.slaRule?.direction,
            offsetValue: editingItem.slaRule?.offsetValue,
            offsetUnit: editingItem.slaRule?.offsetUnit,
            calendarCode: editingItem.calendarCode,
            objectScope: editingItem.objectScope,
            status: editingItem.status,
          } : {}}
          onSave={handleSave}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmDialog
          title={t(lang, 'confirmDelete')}
          message={t(lang, 'confirmDeleteMessage')}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}
