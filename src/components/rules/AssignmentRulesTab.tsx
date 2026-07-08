import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, ChevronDown, Edit, Plus, Search, Trash2 } from "lucide-react";
import type { FallbackAssignmentRule, TeamAssignmentRule, UserAssignmentRule } from "@/types";
import ConfirmDialog from "../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface AssignmentRulesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

type Option = { value: string; label: string; meta?: string };

type RuleDraft = Record<string, any> & {
  customers?: string[];
  regions?: string[];
  countries?: string[];
  pols?: string[];
  workGroupId?: string;
  targetWorkGroupId?: string;
};

function uniq(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function getClientValue(client: any) {
  return client.clientCode || client.customerCode || client.clientName || client.customerName || client.name || client.id || "";
}

function getClientLabel(client: any) {
  const code = client.clientCode || client.customerCode || client.id || "";
  const name = client.clientName || client.customerName || client.name || "";
  return name && code && name !== code ? `${code} - ${name}` : name || code;
}

function normalizeArray(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

function displayList(values: string[] | undefined, options: Option[]) {
  if (!values?.length) return "-";
  return values.map((value) => options.find((option) => option.value === value)?.label || value).join(", ");
}

function MultiSelectDropdown({
  label,
  values,
  options,
  onChange,
  required,
}: {
  label: string;
  values: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredOptions = options.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(search.toLowerCase()));
  const selectedLabels = values.map((value) => options.find((option) => option.value === value)?.label || value);
  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every((option) => values.includes(option.value));

  const toggleValue = (value: string) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const toggleFiltered = () => {
    if (allFilteredSelected) {
      onChange(values.filter((value) => !filteredOptions.some((option) => option.value === value)));
    } else {
      onChange(uniq([...values, ...filteredOptions.map((option) => option.value)]));
    }
  };

  return (
    <label className="relative space-y-1 text-sm font-semibold">
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-white px-3 py-2 text-left text-sm font-normal"
      >
        <span className={`truncate ${selectedLabels.length ? "text-foreground" : "text-muted-foreground"}`}>
          {selectedLabels.length ? selectedLabels.join(", ") : "Select"}
        </span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-md border border-input py-1.5 pl-7 pr-2 text-sm outline-none focus:ring-2 focus:ring-brand-soft"
              />
            </div>
            <button type="button" onClick={toggleFiltered} className="mt-2 text-xs font-medium text-brand hover:underline">
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="max-h-56 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No matches</div>
            ) : filteredOptions.map((option) => {
              const selected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-brand bg-brand text-white" : "border-border"}`}>
                    {selected && <Check size={12} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.meta && <span className="text-xs text-muted-foreground">{option.meta}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </label>
  );
}

export default function AssignmentRulesTab({ state, setState, saveState }: AssignmentRulesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [activeAssignmentTab, setActiveAssignmentTab] = useState<"team" | "user" | "fallback">("team");
  const [assignmentDrawerOpen, setAssignmentDrawerOpen] = useState(false);
  const [assignmentDrawerMode, setAssignmentDrawerMode] = useState<"add" | "edit">("add");
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [draft, setDraft] = useState<RuleDraft>({});
  const [formError, setFormError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "team" | "user" | "fallback"; id: string } | null>(null);

  const labels = {
    addRule: t(lang, "addRule"),
    editRule: t(lang, "editRule"),
    customer: t(lang, "customer"),
    regionCountry: lang === "zh" ? "区域/国家" : "Region / Country",
    regionCountryPol: lang === "zh" ? "区域/国家/POL" : "Region / Country / POL",
    processTemplate: t(lang, "processTemplate"),
    targetWorkGroup: lang === "zh" ? "目标工作组" : "Target Work Group",
    workGroup: lang === "zh" ? "工作组" : "Work Group",
    status: t(lang, "status"),
    remark: t(lang, "remark"),
    actions: t(lang, "actions"),
    milestone: t(lang, "milestone"),
    task: t(lang, "task"),
    targetUser: t(lang, "targetUser"),
    backupUser: lang === "zh" ? "备选用户" : "Backup User",
    selectWorkGroup: lang === "zh" ? "请选择工作组" : "Select Work Group",
    selectProcessTemplate: lang === "zh" ? "请选择流程模板" : "Select Process Template",
    selectMilestone: lang === "zh" ? "请选择里程碑" : "Select Milestone",
    selectTask: lang === "zh" ? "请选择任务" : "Select Task",
    selectTargetUser: lang === "zh" ? "请选择目标用户" : "Select Target User",
    noBackupUser: lang === "zh" ? "无备选用户" : "No Backup User",
    requiredTemplate: lang === "zh" ? "流程模板为必填项。" : "Process Template is required.",
    requiredWorkGroup: lang === "zh" ? "工作组为必填项。" : "Work Group is required.",
    requiredCustomer: lang === "zh" ? "客户为必填项。" : "Customer is required.",
    requiredTargetUser: lang === "zh" ? "目标用户为必填项。" : "Target User is required.",
    invalidTargetUser: lang === "zh" ? "目标用户必须是所选工作组下的有效成员。" : "Target User must be an active member of the selected Work Group.",
    invalidBackupUser: lang === "zh" ? "备选用户必须是所选工作组下的有效成员。" : "Backup User must be an active member of the selected Work Group.",
    duplicateBackupUser: lang === "zh" ? "备选用户不能与目标用户相同。" : "Backup User cannot be the same as Target User.",
    noMembers: lang === "zh" ? "该工作组暂无可用成员" : "No active members in this Work Group",
  };

  const clientOptions = useMemo<Option[]>(() => (state.clients || [])
    .filter((client: any) => client.active !== false)
    .map((client: any) => ({ value: getClientValue(client), label: getClientLabel(client) }))
    .filter((option: Option) => option.value), [state.clients]);

  const regionOptions = useMemo<Option[]>(() => uniq((state.locations || []).map((location: any) => location.region))
    .map((region) => ({ value: region, label: region })), [state.locations]);

  const countryOptions = useMemo<Option[]>(() => {
    const selectedRegions = draft.regions || [];
    const locations = state.locations || [];
    const countries = uniq(locations
      .filter((location: any) => selectedRegions.length === 0 || selectedRegions.includes(location.region))
      .map((location: any) => location.country));
    return countries.map((country) => ({ value: country, label: country }));
  }, [draft.regions, state.locations]);

  const polOptions = useMemo<Option[]>(() => uniq((state.locations || [])
    .filter((location: any) => !draft.countries?.length || draft.countries.includes(location.country))
    .map((location: any) => location.unLOCODE || location.unLocode || location.locationCode || location.locationID || location.locationId))
    .map((pol) => ({ value: pol, label: pol })), [draft.countries, state.locations]);

  const templateOptions = useMemo<Option[]>(() => (state.processTemplates || [])
    .filter((template: any) => template.status !== "Inactive")
    .map((template: any) => ({ value: template.id, label: template.templateName })), [state.processTemplates]);

  const workGroupOptions = useMemo<Option[]>(() => (state.workGroups || [])
    .filter((group: any) => group.status === "Active" && group.assignmentEnabled !== false)
    .map((group: any) => ({ value: group.id, label: group.workGroupName, meta: group.id })), [state.workGroups]);

  const milestoneOptions = useMemo<Option[]>(() => (state.milestones || [])
    .filter((milestone: any) => !draft.templateId || milestone.templateId === draft.templateId)
    .map((milestone: any) => ({ value: milestone.id, label: milestone.milestoneName || milestone.name || milestone.id })), [draft.templateId, state.milestones]);

  const taskOptions = useMemo<Option[]>(() => (state.milestoneTasks || [])
    .filter((task: any) => !draft.milestoneId || task.milestoneId === draft.milestoneId)
    .map((task: any) => ({ value: task.id, label: task.taskName || task.name || task.id })), [draft.milestoneId, state.milestoneTasks]);

  const userOptions = useMemo<Option[]>(() => (state.users || [])
    .filter((user: any) => user.active && (draft.workGroupId ? (user.workGroupIds || []).includes(draft.workGroupId) : true))
    .map((user: any) => ({ value: user.id, label: user.name || user.email || user.id, meta: user.email })), [draft.workGroupId, state.users]);

  const roleOptions = useMemo<Option[]>(() => (state.roles || [])
    .filter((role: any) => role.active)
    .map((role: any) => ({ value: role.roleName || role.id, label: role.roleName || role.id })), [state.roles]);

  const templateLabel = (id?: string) => templateOptions.find((option) => option.value === id)?.label || id || "-";
  const workGroupLabel = (id?: string) => workGroupOptions.find((option) => option.value === id)?.label || id || "-";
  const userLabel = (id?: string) => userOptions.find((option) => option.value === id)?.label || (state.users || []).find((user: any) => user.id === id)?.name || id || "-";

  const normalizeTeamRule = (rule: TeamAssignmentRule): RuleDraft => {
    const legacyRegions = uniq([rule.originRegion, rule.destinationRegion]);
    const legacyWorkGroup = (state.workGroups || []).find((group: any) => group.id === rule.targetTeam || group.workGroupName === rule.targetTeam);
    return {
      ...rule,
      customers: rule.customers?.length ? rule.customers : normalizeArray(rule.customer),
      regions: rule.regions?.length ? rule.regions : legacyRegions,
      countries: rule.countries || [],
      templateId: rule.templateId || "",
      targetWorkGroupId: rule.targetWorkGroupId || legacyWorkGroup?.id || rule.targetTeam || "",
      status: rule.status === "Inactive" ? "Inactive" : "Active",
    };
  };

  const normalizeUserRule = (rule: UserAssignmentRule): RuleDraft => ({
    ...rule,
    workGroupId: rule.workGroupId || rule.teamId || "",
    customers: rule.customers || [],
    regions: rule.regions || [],
    countries: rule.countries || [],
    pols: rule.pols || [],
    status: rule.status === "Inactive" ? "Inactive" : "Active",
  });

  const updateDraft = (patch: RuleDraft) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const openTeamRule = (rule?: TeamAssignmentRule) => {
    setActiveAssignmentTab("team");
    setAssignmentDrawerMode(rule ? "edit" : "add");
    setEditingAssignment(rule || null);
    setDraft(rule ? normalizeTeamRule(rule) : { customers: [], regions: [], countries: [], templateId: "", targetWorkGroupId: "", status: "Active", remark: "" });
    setFormError("");
    setAssignmentDrawerOpen(true);
  };

  const openUserRule = (rule?: UserAssignmentRule) => {
    setActiveAssignmentTab("user");
    setAssignmentDrawerMode(rule ? "edit" : "add");
    setEditingAssignment(rule || null);
    setDraft(rule ? normalizeUserRule(rule) : { workGroupId: "", customers: [], regions: [], countries: [], pols: [], templateId: "", milestoneId: "", taskId: "", targetUser: "", backupUser: "", status: "Active", remark: "" });
    setFormError("");
    setAssignmentDrawerOpen(true);
  };

  const openFallbackRule = (rule?: FallbackAssignmentRule) => {
    setActiveAssignmentTab("fallback");
    setAssignmentDrawerMode(rule ? "edit" : "add");
    setEditingAssignment(rule || null);
    setDraft(rule || { condition: "", fallbackQueue: "", escalationRole: "", escalationSla: "", status: "Active", remark: "" });
    setFormError("");
    setAssignmentDrawerOpen(true);
  };

  const closeDrawer = () => {
    setAssignmentDrawerOpen(false);
    setEditingAssignment(null);
    setDraft({});
    setFormError("");
  };

  const saveTeamRule = () => {
    if (!draft.templateId) return setFormError(labels.requiredTemplate);
    if (!draft.customers?.length) return setFormError(labels.requiredCustomer);
    if (!draft.targetWorkGroupId) return setFormError(labels.requiredWorkGroup);
    const rule: TeamAssignmentRule = {
      ...(editingAssignment || {}),
      id: editingAssignment?.id || `team-${Date.now()}`,
      customers: draft.customers || [],
      regions: draft.regions || [],
      countries: draft.countries || [],
      templateId: draft.templateId,
      targetWorkGroupId: draft.targetWorkGroupId,
      targetTeam: draft.targetWorkGroupId,
      status: draft.status === "Inactive" ? "Inactive" : "Active",
      remark: draft.remark || "",
    };
    const rules = state.teamAssignmentRules || [];
    const updated = editingAssignment ? rules.map((item: TeamAssignmentRule) => item.id === editingAssignment.id ? rule : item) : [...rules, rule];
    const nextState = { ...state, teamAssignmentRules: updated };
    setState(nextState);
    saveState(nextState);
    closeDrawer();
  };

  const saveUserRule = () => {
    if (!draft.workGroupId) return setFormError(labels.requiredWorkGroup);
    if (!draft.templateId) return setFormError(labels.requiredTemplate);
    if (!draft.targetUser) return setFormError(labels.requiredTargetUser);
    const selectedMemberIds = new Set(userOptions.map((option) => option.value));
    if (!selectedMemberIds.has(draft.targetUser)) return setFormError(labels.invalidTargetUser);
    if (draft.backupUser && !selectedMemberIds.has(draft.backupUser)) return setFormError(labels.invalidBackupUser);
    if (draft.backupUser && draft.backupUser === draft.targetUser) return setFormError(labels.duplicateBackupUser);
    const rule: UserAssignmentRule = {
      ...(editingAssignment || {}),
      id: editingAssignment?.id || `user-${Date.now()}`,
      workGroupId: draft.workGroupId,
      teamId: draft.workGroupId || "",
      customers: draft.customers || [],
      regions: draft.regions || [],
      countries: draft.countries || [],
      pols: draft.pols || [],
      templateId: draft.templateId,
      milestoneId: draft.milestoneId || "",
      taskId: draft.taskId || "",
      targetUser: draft.targetUser || "",
      backupUser: draft.backupUser || "",
      status: draft.status === "Inactive" ? "Inactive" : "Active",
      remark: draft.remark || "",
    };
    const rules = state.userAssignmentRules || [];
    const updated = editingAssignment ? rules.map((item: UserAssignmentRule) => item.id === editingAssignment.id ? rule : item) : [...rules, rule];
    const nextState = { ...state, userAssignmentRules: updated };
    setState(nextState);
    saveState(nextState);
    closeDrawer();
  };

  const saveFallbackRule = () => {
    const rule: FallbackAssignmentRule = {
      ...(editingAssignment || {}),
      id: editingAssignment?.id || `fallback-${Date.now()}`,
      condition: draft.condition || "",
      fallbackQueue: draft.fallbackQueue || "",
      escalationRole: draft.escalationRole || "",
      escalationSla: draft.escalationSla || "",
      status: draft.status === "Inactive" ? "Inactive" : "Active",
      remark: draft.remark || "",
    };
    const rules = state.fallbackAssignmentRules || [];
    const updated = editingAssignment ? rules.map((item: FallbackAssignmentRule) => item.id === editingAssignment.id ? rule : item) : [...rules, rule];
    const nextState = { ...state, fallbackAssignmentRules: updated };
    setState(nextState);
    saveState(nextState);
    closeDrawer();
  };

  const handleSave = () => {
    if (activeAssignmentTab === "team") saveTeamRule();
    else if (activeAssignmentTab === "user") saveUserRule();
    else saveFallbackRule();
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const key = itemToDelete.type === "team" ? "teamAssignmentRules" : itemToDelete.type === "user" ? "userAssignmentRules" : "fallbackAssignmentRules";
    const nextState = { ...state, [key]: (state[key] || []).filter((item: any) => item.id !== itemToDelete.id) };
    setState(nextState);
    saveState(nextState);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const assignmentSubTabs = [
    { id: "team" as const, label: t(lang, "teamAssignmentRules") },
    { id: "user" as const, label: t(lang, "userAssignmentRules") },
    { id: "fallback" as const, label: t(lang, "fallbackRules") },
  ];

  const renderStatus = (status?: string) => (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status === "Inactive" ? "bg-gray-soft text-gray" : "bg-green-soft text-green"}`}>
      {status === "Inactive" ? t(lang, "inactive") : t(lang, "active")}
    </span>
  );

  const renderTeamRules = () => {
    const rules = (state.teamAssignmentRules || []).map((rule: TeamAssignmentRule) => normalizeTeamRule(rule));
    return (
      <RuleTableShell title={t(lang, "teamAssignmentRules")} addLabel={labels.addRule} onAdd={() => openTeamRule()}>
        <table className="w-full min-w-[1120px]">
          <thead className="bg-gray-50">
            <tr>
              {[labels.customer, labels.regionCountry, labels.processTemplate, labels.targetWorkGroup, labels.status, labels.remark, labels.actions].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rules.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td></tr>
            ) : rules.map((rule: RuleDraft) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{displayList(rule.customers, clientOptions)}</td>
                <td className="px-4 py-3 text-sm">{[displayList(rule.regions, regionOptions), displayList(rule.countries, countryOptions)].filter((value) => value !== "-").join(" / ") || "-"}</td>
                <td className="px-4 py-3 text-sm">{templateLabel(rule.templateId)}</td>
                <td className="px-4 py-3 text-sm">{workGroupLabel(rule.targetWorkGroupId)}</td>
                <td className="px-4 py-3 text-sm">{renderStatus(rule.status)}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-sm text-muted-foreground" title={rule.remark}>{rule.remark || "-"}</td>
                <td className="px-4 py-3 text-sm"><RowActions onEdit={() => openTeamRule(rule as TeamAssignmentRule)} onDelete={() => { setItemToDelete({ type: "team", id: rule.id || "" }); setDeleteConfirmOpen(true); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </RuleTableShell>
    );
  };

  const renderUserRules = () => {
    const rules = (state.userAssignmentRules || []).map((rule: UserAssignmentRule) => normalizeUserRule(rule));
    return (
      <RuleTableShell title={t(lang, "userAssignmentRules")} addLabel={labels.addRule} onAdd={() => openUserRule()}>
        <table className="w-full min-w-[1280px]">
          <thead className="bg-gray-50">
            <tr>
              {[labels.workGroup, labels.customer, labels.regionCountryPol, labels.processTemplate, labels.milestone, labels.task, labels.targetUser, labels.backupUser, labels.status, labels.actions].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rules.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td></tr>
            ) : rules.map((rule: RuleDraft) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{workGroupLabel(rule.workGroupId)}</td>
                <td className="px-4 py-3 text-sm">{displayList(rule.customers, clientOptions)}</td>
                <td className="px-4 py-3 text-sm">{[displayList(rule.regions, regionOptions), displayList(rule.countries, countryOptions), displayList(rule.pols, polOptions)].filter((value) => value !== "-").join(" / ") || "-"}</td>
                <td className="px-4 py-3 text-sm">{templateLabel(rule.templateId)}</td>
                <td className="px-4 py-3 text-sm">{milestoneOptions.find((option) => option.value === rule.milestoneId)?.label || rule.milestoneId || "-"}</td>
                <td className="px-4 py-3 text-sm">{taskOptions.find((option) => option.value === rule.taskId)?.label || rule.taskId || "-"}</td>
                <td className="px-4 py-3 text-sm">{userLabel(rule.targetUser)}</td>
                <td className="px-4 py-3 text-sm">{userLabel(rule.backupUser)}</td>
                <td className="px-4 py-3 text-sm">{renderStatus(rule.status)}</td>
                <td className="px-4 py-3 text-sm"><RowActions onEdit={() => openUserRule(rule as UserAssignmentRule)} onDelete={() => { setItemToDelete({ type: "user", id: rule.id || "" }); setDeleteConfirmOpen(true); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </RuleTableShell>
    );
  };

  const renderFallbackRules = () => {
    const rules = state.fallbackAssignmentRules || [];
    return (
      <RuleTableShell title={t(lang, "fallbackRules")} addLabel={labels.addRule} onAdd={() => openFallbackRule()}>
        <table className="w-full min-w-[880px]">
          <thead className="bg-gray-50">
            <tr>
              {[t(lang, "condition"), t(lang, "fallbackQueue"), t(lang, "escalationRole"), labels.status, labels.actions].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rules.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td></tr>
            ) : rules.map((rule: FallbackAssignmentRule) => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{rule.condition || "-"}</td>
                <td className="px-4 py-3 text-sm">{rule.fallbackQueue || "-"}</td>
                <td className="px-4 py-3 text-sm">{rule.escalationRole || "-"}</td>
                <td className="px-4 py-3 text-sm">{renderStatus(rule.status)}</td>
                <td className="px-4 py-3 text-sm"><RowActions onEdit={() => openFallbackRule(rule)} onDelete={() => { setItemToDelete({ type: "fallback", id: rule.id }); setDeleteConfirmOpen(true); }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </RuleTableShell>
    );
  };

  const renderDrawerBody = () => {
    if (activeAssignmentTab === "team") {
      return (
        <>
          <MultiSelectDropdown label={labels.customer} required values={draft.customers || []} options={clientOptions} onChange={(values) => updateDraft({ customers: values })} />
          <select value={draft.templateId || ""} onChange={(event) => updateDraft({ templateId: event.target.value })} className="field-input" required>
            <option value="">{labels.processTemplate} *</option>
            {templateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <MultiSelectDropdown label={t(lang, "region")} values={draft.regions || []} options={regionOptions} onChange={(values) => updateDraft({ regions: values, countries: [] })} />
          <MultiSelectDropdown label={t(lang, "country")} values={draft.countries || []} options={countryOptions} onChange={(values) => updateDraft({ countries: values })} />
          <label className="space-y-1 text-sm font-semibold">
            <span>{labels.targetWorkGroup}<span className="ml-0.5 text-red-600">*</span></span>
            <select value={draft.targetWorkGroupId || ""} onChange={(event) => updateDraft({ targetWorkGroupId: event.target.value })} className="field-input">
              <option value="">{labels.targetWorkGroup}</option>
              {workGroupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {renderStatusField()}
          {renderRemarkField()}
        </>
      );
    }

    if (activeAssignmentTab === "user") {
      return (
        <>
          <label className="space-y-1 text-sm font-semibold">
            <span>{labels.workGroup}<span className="ml-0.5 text-red-600">*</span></span>
            <select value={draft.workGroupId || ""} onChange={(event) => updateDraft({ workGroupId: event.target.value, targetUser: "", backupUser: "" })} className="field-input">
              <option value="" disabled hidden>{labels.selectWorkGroup}</option>
              {workGroupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <select value={draft.templateId || ""} onChange={(event) => updateDraft({ templateId: event.target.value, milestoneId: "", taskId: "" })} className="field-input">
            <option value="" disabled hidden>{labels.selectProcessTemplate} *</option>
            {templateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <MultiSelectDropdown label={labels.customer} values={draft.customers || []} options={clientOptions} onChange={(values) => updateDraft({ customers: values })} />
          <MultiSelectDropdown label={t(lang, "region")} values={draft.regions || []} options={regionOptions} onChange={(values) => updateDraft({ regions: values, countries: [], pols: [] })} />
          <MultiSelectDropdown label={t(lang, "country")} values={draft.countries || []} options={countryOptions} onChange={(values) => updateDraft({ countries: values, pols: [] })} />
          <MultiSelectDropdown label="POL" values={draft.pols || []} options={polOptions} onChange={(values) => updateDraft({ pols: values })} />
          <select value={draft.milestoneId || ""} onChange={(event) => updateDraft({ milestoneId: event.target.value, taskId: "" })} className="field-input">
            <option value="">{labels.selectMilestone}</option>
            {milestoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={draft.taskId || ""} onChange={(event) => updateDraft({ taskId: event.target.value })} className="field-input">
            <option value="">{labels.selectTask}</option>
            {taskOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <label className="space-y-1 text-sm font-semibold">
            <span>{labels.targetUser}<span className="ml-0.5 text-red-600">*</span></span>
            <select value={draft.targetUser || ""} onChange={(event) => updateDraft({ targetUser: event.target.value })} className="field-input" disabled={!draft.workGroupId}>
              <option value="" disabled hidden>{draft.workGroupId && userOptions.length === 0 ? labels.noMembers : labels.selectTargetUser}</option>
              {userOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>{labels.backupUser}</span>
            <select value={draft.backupUser || ""} onChange={(event) => updateDraft({ backupUser: event.target.value })} className="field-input" disabled={!draft.workGroupId}>
              <option value="">{labels.noBackupUser}</option>
              {userOptions.filter((option) => option.value !== draft.targetUser).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          {renderStatusField()}
          {renderRemarkField()}
        </>
      );
    }

    return (
      <>
        <TextInput label={t(lang, "condition")} value={draft.condition || ""} onChange={(value) => updateDraft({ condition: value })} full />
        <TextInput label={t(lang, "fallbackQueue")} value={draft.fallbackQueue || ""} onChange={(value) => updateDraft({ fallbackQueue: value })} />
        <label className="space-y-1 text-sm font-semibold">
          <span>{t(lang, "escalationRole")}</span>
          <select value={draft.escalationRole || ""} onChange={(event) => updateDraft({ escalationRole: event.target.value })} className="field-input">
            <option value="">{t(lang, "escalationRole")}</option>
            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <TextInput label={t(lang, "escalationSla")} value={draft.escalationSla || ""} onChange={(value) => updateDraft({ escalationSla: value })} />
        {renderStatusField()}
        {renderRemarkField()}
      </>
    );
  };

  const renderStatusField = () => (
    <label className="space-y-1 text-sm font-semibold">
      <span>{labels.status}</span>
      <select value={draft.status || "Active"} onChange={(event) => updateDraft({ status: event.target.value as any })} className="field-input">
        <option value="Active">{t(lang, "active")}</option>
        <option value="Inactive">{t(lang, "inactive")}</option>
      </select>
    </label>
  );

  const renderRemarkField = () => (
    <label className="col-span-2 space-y-1 text-sm font-semibold">
      <span>{labels.remark}</span>
      <textarea value={draft.remark || ""} onChange={(event) => updateDraft({ remark: event.target.value })} className="field-input min-h-[80px]" />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-2 border-b border-border bg-muted/50 overflow-x-auto mb-4">
        {assignmentSubTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAssignmentTab(tab.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeAssignmentTab === tab.id ? "bg-brand-soft text-brand-strong border border-brand-soft" : "hover:bg-card"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeAssignmentTab === "team" ? renderTeamRules() : activeAssignmentTab === "user" ? renderUserRules() : renderFallbackRules()}

      {assignmentDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={(event) => event.target === event.currentTarget && closeDrawer()}>
          <div className="flex h-full w-full max-w-[760px] flex-col bg-white shadow-lg">
            <div className="border-b p-5">
              <h2 className="text-xl font-bold">{assignmentDrawerMode === "add" ? labels.addRule : labels.editRule}</h2>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {formError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                {renderDrawerBody()}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t p-5">
              <button type="button" onClick={closeDrawer} className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50">{t(lang, "cancel")}</button>
              <button type="button" onClick={handleSave} className="rounded-md bg-brand px-4 py-2 text-white hover:bg-brand-strong">{t(lang, "save")}</button>
            </div>
          </div>
        </div>
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

function RuleTableShell({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onAdd} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">{children}</div>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onEdit} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft transition-colors">
        <Edit className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function TextInput({ label, value, onChange, full }: { label: string; value: string; onChange: (value: string) => void; full?: boolean }) {
  return (
    <label className={`space-y-1 text-sm font-semibold ${full ? "col-span-2" : ""}`}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="field-input" />
    </label>
  );
}
