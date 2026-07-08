import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import type { User, WorkGroup, WorkGroupDataScopeFilter, WorkGroupFilterField, WorkGroupFilterOperator, WorkGroupType } from "@/types";
import ConfirmDialog from "./ConfirmDialog";

const GROUP_TYPES: WorkGroupType[] = ["Operations", "Customer Service", "OHA", "Finance", "Warehouse", "Management", "Other"];
const FILTER_FIELDS: WorkGroupFilterField[] = ["Client", "Region", "Country", "POL", "POD", "Transport Mode"];
const OPERATORS: WorkGroupFilterOperator[] = ["=", "!=", "IN", "NOT IN", "<=", ">=", "BETWEEN"];

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function nextWorkGroupNumber(groups: WorkGroup[]) {
  const max = groups.reduce((highest, group) => {
    const match = group.workGroupNumber?.match(/WG(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `WG${String(max + 1).padStart(3, "0")}`;
}

function uniq(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function summarizeFilters(filters: WorkGroupDataScopeFilter[]) {
  if (!filters.length) return "-";
  return filters.map((filter) => `${filter.field} ${filter.operator} ${filter.values.join(", ") || "-"}`).join(" | ");
}

export default function WorkGroupsPage() {
  const [state, setState] = useState(() => loadState());
  const [editingGroup, setEditingGroup] = useState<WorkGroup | null>(null);
  const [draft, setDraft] = useState<WorkGroup | null>(null);
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [newFilterField, setNewFilterField] = useState<WorkGroupFilterField>("Client");

  const groups = state.workGroups || [];
  const users: User[] = state.users || [];

  const valueOptions = useMemo<Record<WorkGroupFilterField, string[]>>(() => {
    const clients = uniq((state.clients || []).flatMap((client: any) => [client.clientCode, client.customerCode]));
    const countries = uniq([
      ...(state.clients || []).map((client: any) => client.operationalCountry || client.address?.country),
      ...(state.locations || []).map((location: any) => location.country),
      ...(state.organizations || []).map((org: any) => org.country || org.address?.country),
    ]);
    const regions = uniq((state.locations || []).map((location: any) => location.region));
    const locationCodes = uniq((state.locations || []).map((location: any) => location.unLOCODE || location.unLocode || location.locationCode || location.locationId));
    const transportModes = uniq((state.transportModes || []).map((mode: any) => mode.code || mode.name));
    return {
      Client: clients,
      Country: countries,
      Region: regions,
      POL: locationCodes,
      POD: locationCodes,
      "Transport Mode": transportModes,
    };
  }, [state]);

  const openCreate = () => {
    const number = nextWorkGroupNumber(groups);
    setEditingGroup(null);
    setDraftMemberIds([]);
    setDraft({
      id: number,
      workGroupNumber: number,
      workGroupName: "",
      workGroupType: "Operations",
      owner: "",
      description: "",
      status: "Active",
      filters: [],
      taskQueueEnabled: true,
      assignmentEnabled: true,
      createdAt: nowStamp(),
      createdBy: "Current User",
      updatedAt: nowStamp(),
      updatedBy: "Current User",
    });
    setFormError("");
  };

  const openEdit = (group: WorkGroup) => {
    setEditingGroup(group);
    setDraft({ ...group, filters: [...(group.filters || [])] });
    setDraftMemberIds(users.filter((user) => (user.workGroupIds || []).includes(group.id)).map((user) => user.id));
    setFormError("");
  };

  const closeEditor = () => {
    setEditingGroup(null);
    setDraft(null);
    setDraftMemberIds([]);
    setFormError("");
  };

  const updateDraft = (patch: Partial<WorkGroup>) => {
    setDraft((current) => current ? { ...current, ...patch } : current);
  };

  const addOrFocusFilter = () => {
    if (!draft) return;
    if (draft.filters.some((filter) => filter.field === newFilterField)) return;
    const options = valueOptions[newFilterField] || [];
    updateDraft({
      filters: [
        ...draft.filters,
        { id: `wgf-${Date.now()}`, field: newFilterField, operator: options.length > 1 ? "IN" : "=", values: [] },
      ],
    });
  };

  const updateFilter = (id: string, patch: Partial<WorkGroupDataScopeFilter>) => {
    if (!draft) return;
    const nextFilters = draft.filters.map((filter) => filter.id === id ? { ...filter, ...patch } : filter);
    updateDraft({ filters: nextFilters });
  };

  const removeFilter = (id: string) => {
    if (!draft) return;
    updateDraft({ filters: draft.filters.filter((filter) => filter.id !== id) });
  };

  const groupMembers = (groupId: string) => users.filter((user) => (user.workGroupIds || []).includes(groupId));

  const toggleDraftMember = (userId: string) => {
    setDraftMemberIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const handleSave = () => {
    if (!draft) return;
    setFormError("");

    const name = draft.workGroupName.trim();
    if (!draft.id || !name) {
      setFormError("Work Group ID and Name are required.");
      return;
    }
    if (groups.some((group) => group.id === draft.id && group.id !== editingGroup?.id)) {
      setFormError("Work Group ID must be unique.");
      return;
    }
    if (!draft.filters.length) {
      setFormError("At least one data scope filter is required.");
      return;
    }
    const invalidFilter = draft.filters.find((filter) => !filter.values.length || filter.values.some((value) => !(valueOptions[filter.field] || []).includes(value)));
    if (invalidFilter) {
      setFormError("Each data scope filter must select values from the configured dropdown options.");
      return;
    }

    const normalized: WorkGroup = {
      ...draft,
      workGroupName: name,
      updatedAt: nowStamp(),
      updatedBy: "Current User",
    };
    const nextGroups = editingGroup ? groups.map((group) => group.id === editingGroup.id ? normalized : group) : [...groups, normalized];
    const memberSet = new Set(draftMemberIds);
    const previousGroupId = editingGroup?.id || normalized.id;
    const nextUsers = users.map((user) => {
      const currentIds = (user.workGroupIds || []).filter((id) => id !== previousGroupId && id !== normalized.id);
      return memberSet.has(user.id)
        ? { ...user, workGroupIds: [...currentIds, normalized.id], updatedAt: nowStamp(), updatedBy: "Current User" }
        : { ...user, workGroupIds: currentIds, updatedAt: nowStamp(), updatedBy: "Current User" };
    });
    const nextState = { ...state, users: nextUsers, workGroups: nextGroups };
    setState(nextState);
    saveState(nextState);
    closeEditor();
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const nextUsers = (state.users || []).map((user) => ({ ...user, workGroupIds: (user.workGroupIds || []).filter((id) => id !== deleteConfirmId) }));
    const nextState = { ...state, users: nextUsers, workGroups: groups.filter((group) => group.id !== deleteConfirmId) };
    setState(nextState);
    saveState(nextState);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Work Groups</h2>
          <p className="text-sm text-muted-foreground">Manage work groups for data access, assignment, and task queues.</p>
        </div>
        <button onClick={openCreate} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
          <Plus size={14} />
          Add Work Group
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm font-semibold">Work Group ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Members</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Data Scope</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Task Queue</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-t border-border">
                <td className="px-4 py-3 text-sm font-mono">{group.workGroupNumber}</td>
                <td className="px-4 py-3 text-sm font-semibold">{group.workGroupName}</td>
                <td className="px-4 py-3 text-sm">{group.workGroupType}</td>
                <td className="px-4 py-3 text-sm">{group.owner || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {groupMembers(group.id).length ? groupMembers(group.id).map((user) => (
                      <span key={user.id} className="inline-block rounded-full bg-blue-soft px-2 py-0.5 text-xs text-blue">
                        {user.name}
                      </span>
                    )) : <span className="text-muted-foreground">-</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm max-w-xl truncate" title={summarizeFilters(group.filters || [])}>{summarizeFilters(group.filters || [])}</td>
                <td className="px-4 py-3 text-sm">{group.taskQueueEnabled ? "Enabled" : "Disabled"}</td>
                <td className="px-4 py-3 text-sm">{group.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(group)} className="text-brand hover:text-brand-strong text-sm flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirmId(group.id)} className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={(event) => event.target === event.currentTarget && closeEditor()}>
          <div className="w-full max-w-[860px] h-full bg-white shadow-lg flex flex-col">
            <div className="p-5 border-b">
              <h2 className="text-xl font-bold">{editingGroup ? "Edit Work Group" : "Add Work Group"}</h2>
              <p className="text-sm text-muted-foreground">Data scope filters are consolidated by field. Values must come from master data or configuration center.</p>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-5">
              {formError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1 text-sm font-semibold">
                  <span>Work Group ID</span>
                  <input value={draft.id} disabled={!!editingGroup} onChange={(event) => updateDraft({ id: event.target.value.toUpperCase(), workGroupNumber: event.target.value.toUpperCase() })} className="w-full border rounded-md px-3 py-2 disabled:bg-gray-100" />
                </label>
                <label className="space-y-1 text-sm font-semibold">
                  <span>Work Group Name</span>
                  <input value={draft.workGroupName} onChange={(event) => updateDraft({ workGroupName: event.target.value })} className="w-full border rounded-md px-3 py-2" />
                </label>
                <label className="space-y-1 text-sm font-semibold">
                  <span>Type</span>
                  <select value={draft.workGroupType} onChange={(event) => updateDraft({ workGroupType: event.target.value as WorkGroupType })} className="w-full border rounded-md px-3 py-2">
                    {GROUP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-semibold">
                  <span>Owner</span>
                  <input value={draft.owner} onChange={(event) => updateDraft({ owner: event.target.value })} className="w-full border rounded-md px-3 py-2" />
                </label>
                <label className="space-y-1 text-sm font-semibold">
                  <span>Status</span>
                  <select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value as WorkGroup["status"] })} className="w-full border rounded-md px-3 py-2">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!draft.taskQueueEnabled} onChange={(event) => updateDraft({ taskQueueEnabled: event.target.checked })} /> Task Queue</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!draft.assignmentEnabled} onChange={(event) => updateDraft({ assignmentEnabled: event.target.checked })} /> Assignment</label>
                </div>
                <label className="space-y-1 text-sm font-semibold col-span-2">
                  <span>Description</span>
                  <textarea value={draft.description || ""} onChange={(event) => updateDraft({ description: event.target.value })} className="w-full border rounded-md px-3 py-2 min-h-[80px]" />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Members</h3>
                  <p className="text-xs text-muted-foreground">Select user accounts that belong to this Work Group. The User page will show the same group membership automatically.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-border p-3">
                  {users.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No user accounts available.</div>
                  ) : users.map((user) => (
                    <label key={user.id} className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${draftMemberIds.includes(user.id) ? "border-brand bg-brand-soft/60" : "border-border bg-white"}`}>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email || user.userNumber}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={draftMemberIds.includes(user.id)}
                        onChange={() => toggleDraftMember(user.id)}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Data Scope Filters</h3>
                    <p className="text-xs text-muted-foreground">One row per data field. Add Country once, then select multiple values in the same consolidated row.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={newFilterField} onChange={(event) => setNewFilterField(event.target.value as WorkGroupFilterField)} className="border rounded-md px-3 py-2 text-sm">
                      {FILTER_FIELDS.filter((field) => !draft.filters.some((filter) => filter.field === field)).map((field) => <option key={field} value={field}>{field}</option>)}
                    </select>
                    <button onClick={addOrFocusFilter} className="px-3 py-2 rounded-md border hover:bg-muted text-sm">Add Filter</button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Filter Type</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Operator</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.filters.length === 0 ? (
                        <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">No filters configured.</td></tr>
                      ) : draft.filters.map((filter) => (
                        <tr key={filter.id} className="border-t">
                          <td className="px-3 py-2 text-sm font-semibold">{filter.field}</td>
                          <td className="px-3 py-2">
                            <select value={filter.operator} onChange={(event) => updateFilter(filter.id, { operator: event.target.value as WorkGroupFilterOperator })} className="border rounded-md px-2 py-1.5 text-sm">
                              {OPERATORS.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select multiple value={filter.values} onChange={(event) => updateFilter(filter.id, { values: Array.from(event.target.selectedOptions).map((option) => option.value) })} className="w-full min-h-[88px] border rounded-md px-2 py-1.5 text-sm">
                              {(valueOptions[filter.field] || []).map((value) => <option key={value} value={value}>{value}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeFilter(filter.id)} className="text-red-600 text-sm">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <button onClick={closeEditor} className="px-4 py-2 border rounded-md hover:bg-muted">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-strong">Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          title="Confirm Delete"
          message="Delete this Work Group? Users assigned to it will lose this data-scope assignment."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
