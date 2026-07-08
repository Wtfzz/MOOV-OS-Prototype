import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { TransportMode } from "@/types";
import DrawerForm from "../../DrawerForm";
import ConfirmDialog from "../../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface TransportModesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

export default function TransportModesTab({ state, setState, saveState }: TransportModesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<TransportMode | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fields = [
    { key: "code", label: t(lang, 'code'), required: true },
    { key: "name", label: t(lang, 'name'), required: true },
    { key: "applicableRegion", label: t(lang, 'applicableRegion') },
    { key: "status", label: t(lang, 'status'), type: "select" as const, options: ["Active", "Inactive"] },
  ];

  const handleAdd = () => {
    setDrawerMode("add");
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: TransportMode) => {
    setDrawerMode("edit");
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSave = (data: any) => {
    if (drawerMode === "add") {
      const newItem: TransportMode = {
        id: `tm-${Date.now()}`,
        code: data.code,
        name: data.name,
        applicableRegion: data.applicableRegion || "",
        status: (data.status as 'Active' | 'Inactive') || "Active",
      };
      const updated = [...(state.transportModes || []), newItem];
      setState((prev: any) => ({ ...prev, transportModes: updated }));
      saveState({ ...state, transportModes: updated });
    } else if (editingItem) {
      const updated = (state.transportModes || []).map((item: TransportMode) =>
        item.id === editingItem.id ? { ...item, ...data } : item
      );
      setState((prev: any) => ({ ...prev, transportModes: updated }));
      saveState({ ...state, transportModes: updated });
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = (state.transportModes || []).filter((item: TransportMode) => item.id !== itemToDelete);
    setState((prev: any) => ({ ...prev, transportModes: updated }));
    saveState({ ...state, transportModes: updated });
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const items = state.transportModes || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t(lang, 'transportModes')}</h3>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'code')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'applicableRegion')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {t(lang, 'noData')}
                </td>
              </tr>
            ) : (
              items.map((item: TransportMode) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.code}</td>
                  <td className="px-4 py-3 text-sm">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.applicableRegion || "-"}</td>
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
          values={editingItem || {}}
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
