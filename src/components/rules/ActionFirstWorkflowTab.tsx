import { useMemo, useState } from "react";
import { CheckCircle2, CircleDot, ClipboardList, GitBranch, Layers3, MousePointerClick, Play, Plus, Route, Save } from "lucide-react";
import type { ActionRegistryItem, MilestoneDefinition, PORecord, ProcessTemplate, TaskDefinition, TaskInstance } from "@/types";
import { findPage } from "@/app/pageCatalog";
import { getCurrentLanguage, t, type Language } from "@/lib/i18n";

type Mode = "actions" | "tasks" | "milestones" | "processes" | "simulation";

type Props = {
  mode: Mode;
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
};

type BusinessContext = {
  id: string;
  label: string;
  objectType: "PO";
  customer: string;
  transportMode: string;
  originRegion: string;
  destinationRegion: string;
  pol: string;
  pod: string;
};

const copy = {
  zh: {
    actionRegistry: "Action Registry",
    taskLibrary: "Task Library",
    milestoneLibrary: "Milestone Library",
    processTemplates: "Process Templates",
    simulation: "Simulation",
    systemManaged: "系统预置",
    noCreateAction: "Action 是系统能力目录，由 Product / Developer 注册；业务管理员只能启用、停用和设置业务显示名。",
    businessLabel: "业务显示名",
    action: "动作",
    target: "目标页面",
    permission: "权限",
    event: "完成事件",
    createTask: "从 Action 创建 Task",
    primaryAction: "主 Action",
    supportingActions: "辅助 Action",
    generationCondition: "生成条件",
    assignmentScope: "派单范围",
    createMilestone: "创建 Milestone",
    businessStage: "业务阶段",
    completionRule: "完成规则",
    includedTasks: "包含 Task",
    processPath: "业务路径",
    matchResult: "匹配结果",
    generateInstances: "生成 Task Instances",
    generatedTasks: "已生成任务",
    noTasks: "暂无任务",
    noMatch: "无匹配流程，不生成业务任务",
    conflict: "匹配到多个流程，需人工处理",
    exactlyOne: "唯一匹配",
  },
  en: {
    actionRegistry: "Action Registry",
    taskLibrary: "Task Library",
    milestoneLibrary: "Milestone Library",
    processTemplates: "Process Templates",
    simulation: "Simulation",
    systemManaged: "System managed",
    noCreateAction: "Actions are registered by Product / Developer. Business admins can enable, disable, and rename them, but cannot create non-existent system actions.",
    businessLabel: "Business Label",
    action: "Action",
    target: "Target Page",
    permission: "Permission",
    event: "Completion Event",
    createTask: "Create Task from Action",
    primaryAction: "Primary Action",
    supportingActions: "Supporting Actions",
    generationCondition: "Generation Condition",
    assignmentScope: "Assignment Scope",
    createMilestone: "Create Milestone",
    businessStage: "Business Stage",
    completionRule: "Completion Rule",
    includedTasks: "Included Tasks",
    processPath: "Process Path",
    matchResult: "Match Result",
    generateInstances: "Generate Task Instances",
    generatedTasks: "Generated Tasks",
    noTasks: "No tasks",
    noMatch: "No matching process. No business tasks generated.",
    conflict: "Multiple processes matched. Manual resolution required.",
    exactlyOne: "Exactly one match",
  },
} satisfies Record<Language, Record<string, string>>;

function normalize(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeMode(value?: string) {
  const mode = normalize(value);
  if (["sea", "ocean", "oceanfreight"].includes(mode)) return "ocean";
  if (["multi", "multimodal"].includes(mode)) return "multimodal";
  return mode;
}

function inferCustomer(record: PORecord) {
  const text = `${record.partyInfo?.consigneeName || ""} ${record.partyInfo?.notifyPartyName || ""} ${record.orderNumber || ""}`;
  if (/pepco/i.test(text)) return "Pepco";
  if (/lidl/i.test(text)) return "LIDL";
  return "Unknown";
}

function inferDestinationRegion(pod?: string) {
  return /^(DE|NL|PL|BE|FR|IT|ES|GB)/i.test(pod || "") ? "Europe" : "Unknown";
}

function contextFromPO(record: PORecord): BusinessContext {
  const pol = record.locationInfo?.originPortBooked || record.locationInfo?.originLocationBooked || "";
  const pod = record.locationInfo?.destinationPortBooked || record.locationInfo?.destinationLocationBooked || "";
  const mode = normalizeMode(record.locationInfo?.transportMode || "");
  return {
    id: record.id,
    label: `${record.orderNumber} - ${inferCustomer(record)}`,
    objectType: "PO",
    customer: inferCustomer(record),
    transportMode: mode === "multimodal" ? "Multi-modal" : mode === "ocean" ? "Ocean" : record.locationInfo?.transportMode || "",
    originRegion: "Asia",
    destinationRegion: inferDestinationRegion(pod),
    pol,
    pod,
  };
}

function templateValue(template: ProcessTemplate, key: string) {
  const values = template.subjectValues || {};
  return values[key] || (template as any)[key] || "";
}

function templateMatches(template: ProcessTemplate, context: BusinessContext) {
  if (template.status !== "Active") return false;
  if ((template.objectType || "PO") !== context.objectType) return false;
  const checks: Array<[string, string]> = [
    [templateValue(template, "customer"), context.customer],
    [templateValue(template, "transportMode"), context.transportMode],
    [templateValue(template, "originRegion"), context.originRegion],
    [templateValue(template, "destinationRegion"), context.destinationRegion],
    [templateValue(template, "pol"), context.pol],
    [templateValue(template, "pod"), context.pod],
  ];
  return checks.every(([expected, actual]) => !expected || normalizeMode(expected) === normalizeMode(actual) || normalize(expected) === normalize(actual));
}

function statusPill(status?: string) {
  const active = status === "Active" || status === "Open" || status === "In Progress";
  return `inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${active ? "bg-green-soft text-green" : "bg-gray-soft text-gray"}`;
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function ActionFirstWorkflowTab({ mode, state, setState, saveState }: Props) {
  const lang = getCurrentLanguage();
  const labels = copy[lang];
  const actions: ActionRegistryItem[] = state.actionRegistry || [];
  const taskDefinitions: TaskDefinition[] = state.taskDefinitions || [];
  const milestoneDefinitions: MilestoneDefinition[] = state.milestoneDefinitions || [];
  const processTemplates: ProcessTemplate[] = state.processTemplates || [];
  const taskInstances: TaskInstance[] = state.taskInstances || [];
  const [selectedPOId, setSelectedPOId] = useState(state.purchaseOrders?.[0]?.id || "");
  const [taskDraft, setTaskDraft] = useState({ taskName: "", taskType: "", primaryActionId: actions[0]?.id || "", generationCondition: "", assignmentScope: "", supportingActionIds: [] as string[] });
  const [milestoneDraft, setMilestoneDraft] = useState({ milestoneName: "", businessStage: "", completionRule: "All Tasks", taskDefinitionIds: [] as string[] });

  const persist = (patch: any) => {
    const nextState = { ...state, ...patch };
    setState(nextState);
    saveState(nextState);
  };

  const selectedPO = (state.purchaseOrders || []).find((item: PORecord) => item.id === selectedPOId) || state.purchaseOrders?.[0];
  const selectedContext = selectedPO ? contextFromPO(selectedPO) : null;
  const matchedTemplates = selectedContext ? processTemplates.filter((template) => templateMatches(template, selectedContext)) : [];

  const actionLabel = (id?: string) => {
    const action = actions.find((item) => item.id === id);
    return action?.businessLabel || action?.label || id || "-";
  };

  const taskLabel = (id?: string) => taskDefinitions.find((item) => item.id === id)?.taskName || id || "-";

  const updateAction = (id: string, patch: Partial<ActionRegistryItem>) => {
    persist({ actionRegistry: actions.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };

  const addTaskDefinition = () => {
    if (!taskDraft.taskName || !taskDraft.primaryActionId) return;
    const primaryAction = actions.find((item) => item.id === taskDraft.primaryActionId);
    const nextTask: TaskDefinition = {
      id: `td-${Date.now()}`,
      taskName: taskDraft.taskName,
      taskType: taskDraft.taskType || taskDraft.taskName,
      businessObjectType: primaryAction?.businessObjectType || "PO",
      primaryActionId: taskDraft.primaryActionId,
      supportingActionIds: taskDraft.supportingActionIds,
      generationMode: "Conditional",
      generationCondition: taskDraft.generationCondition || "Configured business condition",
      assignmentScope: taskDraft.assignmentScope || "",
      status: "Active",
      remark: "",
    };
    persist({ taskDefinitions: [...taskDefinitions, nextTask] });
    setTaskDraft({ taskName: "", taskType: "", primaryActionId: actions[0]?.id || "", generationCondition: "", assignmentScope: "", supportingActionIds: [] });
  };

  const addMilestoneDefinition = () => {
    if (!milestoneDraft.milestoneName) return;
    const nextMilestone: MilestoneDefinition = {
      id: `md-${Date.now()}`,
      milestoneName: milestoneDraft.milestoneName,
      businessStage: milestoneDraft.businessStage || milestoneDraft.milestoneName,
      displaySeq: milestoneDefinitions.length + 1,
      completionRule: milestoneDraft.completionRule as MilestoneDefinition["completionRule"],
      taskDefinitionIds: milestoneDraft.taskDefinitionIds,
      status: "Active",
      remark: "",
    };
    persist({ milestoneDefinitions: [...milestoneDefinitions, nextMilestone] });
    setMilestoneDraft({ milestoneName: "", businessStage: "", completionRule: "All Tasks", taskDefinitionIds: [] });
  };

  const updateProcessMilestones = (templateId: string, milestoneDefinitionIds: string[]) => {
    persist({ processTemplates: processTemplates.map((item) => item.id === templateId ? { ...item, milestoneDefinitionIds } : item) });
  };

  const resolveAssignment = (task: TaskDefinition, context: BusinessContext, template: ProcessTemplate) => {
    const customer = normalize(context.customer);
    const workGroupId = customer.includes("pepco") ? "WG002" : "WG001";
    const matchingRule = (state.userAssignmentRules || []).find((rule: any) =>
      rule.status === "Active"
      && (rule.templateId === template.id || !rule.templateId)
      && (rule.taskId === task.id || rule.taskType === task.taskType || !rule.taskId)
      && (rule.workGroupId === workGroupId || !rule.workGroupId)
    );
    const fallbackUser = workGroupId === "WG002" ? "u4" : "u2";
    return { workGroupId, userId: matchingRule?.targetUser || fallbackUser };
  };

  const generateTaskInstances = () => {
    if (!selectedContext || matchedTemplates.length !== 1) return;
    const template = matchedTemplates[0];
    const processInstanceId = `pi-${selectedContext.id}-${Date.now()}`;
    const selectedMilestones = milestoneDefinitions.filter((milestone) => (template.milestoneDefinitionIds || []).includes(milestone.id));
    const milestoneInstances = selectedMilestones.map((milestone) => ({
      id: `mi-${milestone.id}-${Date.now()}`,
      processInstanceId,
      milestoneDefinitionId: milestone.id,
      status: "In Progress" as const,
    }));
    const newTasks = selectedMilestones.flatMap((milestone, milestoneIndex) => {
      const milestoneInstance = milestoneInstances[milestoneIndex];
      return milestone.taskDefinitionIds
        .map((taskId) => taskDefinitions.find((task) => task.id === taskId))
        .filter(Boolean)
        .map((task) => {
          const assignment = resolveAssignment(task as TaskDefinition, selectedContext, template);
          return {
            id: `ti-${task!.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            taskDefinitionId: task!.id,
            businessObjectType: task!.businessObjectType,
            businessObjectId: selectedContext.id,
            processInstanceId,
            milestoneInstanceId: milestoneInstance.id,
            primaryActionId: task!.primaryActionId,
            assigneeWorkGroupId: assignment.workGroupId,
            assigneeUserId: assignment.userId,
            status: "Open" as const,
            priority: "High" as const,
            slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " "),
            createdAt: new Date().toISOString(),
          };
        });
    });
    persist({
      processInstances: [...(state.processInstances || []), { id: processInstanceId, processTemplateId: template.id, businessObjectType: "PO", businessObjectId: selectedContext.id, status: "Active", startedAt: new Date().toISOString() }],
      milestoneInstances: [...(state.milestoneInstances || []), ...milestoneInstances],
      taskInstances: [...taskInstances, ...newTasks],
    });
  };

  if (mode === "actions") {
    return (
      <Panel title={labels.actionRegistry} icon={<MousePointerClick className="h-4 w-4 text-brand" />}>
        <p className="mb-4 text-sm text-muted-foreground">{labels.noCreateAction}</p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-gray-50">
              <tr>{[labels.action, labels.businessLabel, labels.target, labels.permission, labels.event, t(lang, "status"), t(lang, "actions")].map((head) => <th key={head} className="px-3 py-2 text-left font-medium">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {actions.map((action) => {
                const page = findPage(action.pageId);
                return (
                  <tr key={action.id}>
                    <td className="px-3 py-2"><div className="font-medium">{action.label}</div><div className="text-xs text-muted-foreground">{action.systemManaged ? labels.systemManaged : ""}</div></td>
                    <td className="px-3 py-2"><input value={action.businessLabel || ""} onChange={(event) => updateAction(action.id, { businessLabel: event.target.value })} className="field-input h-8" /></td>
                    <td className="px-3 py-2">{page ? t(lang, page.label) : action.pageId}<span className="text-muted-foreground"> / {action.tabId || "-"}</span></td>
                    <td className="px-3 py-2">{action.requiredPermission}</td>
                    <td className="px-3 py-2">{action.completionEventId}</td>
                    <td className="px-3 py-2"><span className={statusPill(action.status)}>{action.status}</span></td>
                    <td className="px-3 py-2"><button onClick={() => updateAction(action.id, { status: action.status === "Active" ? "Inactive" : "Active" })} className="rounded-md border px-2 py-1 text-xs hover:bg-muted">{action.status === "Active" ? t(lang, "inactive") : t(lang, "active")}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    );
  }

  if (mode === "tasks") {
    return (
      <div className="space-y-4">
        <Panel title={labels.createTask} icon={<Plus className="h-4 w-4 text-brand" />}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <input value={taskDraft.taskName} onChange={(event) => setTaskDraft({ ...taskDraft, taskName: event.target.value })} placeholder={t(lang, "taskName")} className="field-input" />
            <input value={taskDraft.taskType} onChange={(event) => setTaskDraft({ ...taskDraft, taskType: event.target.value })} placeholder={t(lang, "taskType")} className="field-input" />
            <select value={taskDraft.primaryActionId} onChange={(event) => setTaskDraft({ ...taskDraft, primaryActionId: event.target.value })} className="field-input">
              {actions.filter((action) => action.status === "Active").map((action) => <option key={action.id} value={action.id}>{action.businessLabel || action.label}</option>)}
            </select>
            <input value={taskDraft.generationCondition} onChange={(event) => setTaskDraft({ ...taskDraft, generationCondition: event.target.value })} placeholder={labels.generationCondition} className="field-input" />
            <input value={taskDraft.assignmentScope} onChange={(event) => setTaskDraft({ ...taskDraft, assignmentScope: event.target.value })} placeholder={labels.assignmentScope} className="field-input" />
            <button onClick={addTaskDefinition} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand-strong"><Plus className="h-4 w-4" />{t(lang, "add")}</button>
          </div>
        </Panel>
        <Panel title={labels.taskLibrary} icon={<ClipboardList className="h-4 w-4 text-brand" />}>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50"><tr>{[t(lang, "taskName"), labels.primaryAction, labels.supportingActions, labels.generationCondition, labels.assignmentScope, t(lang, "status")].map((head) => <th key={head} className="px-3 py-2 text-left font-medium">{head}</th>)}</tr></thead>
              <tbody className="divide-y">{taskDefinitions.map((task) => <tr key={task.id}><td className="px-3 py-2"><div className="font-medium">{task.taskName}</div><div className="text-xs text-muted-foreground">{task.taskType}</div></td><td className="px-3 py-2">{actionLabel(task.primaryActionId)}</td><td className="px-3 py-2">{task.supportingActionIds?.map(actionLabel).join(", ") || "-"}</td><td className="px-3 py-2">{task.generationCondition || "-"}</td><td className="px-3 py-2">{task.assignmentScope || "-"}</td><td className="px-3 py-2"><span className={statusPill(task.status)}>{task.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
      </div>
    );
  }

  if (mode === "milestones") {
    return (
      <div className="space-y-4">
        <Panel title={labels.createMilestone} icon={<Plus className="h-4 w-4 text-brand" />}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <input value={milestoneDraft.milestoneName} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, milestoneName: event.target.value })} placeholder={t(lang, "milestone")} className="field-input" />
            <input value={milestoneDraft.businessStage} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, businessStage: event.target.value })} placeholder={labels.businessStage} className="field-input" />
            <select value={milestoneDraft.completionRule} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, completionRule: event.target.value })} className="field-input"><option>All Tasks</option><option>Key Tasks</option><option>Manual</option></select>
            <button onClick={addMilestoneDefinition} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand-strong"><Plus className="h-4 w-4" />{t(lang, "add")}</button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {taskDefinitions.map((task) => <label key={task.id} className="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" checked={milestoneDraft.taskDefinitionIds.includes(task.id)} onChange={() => setMilestoneDraft({ ...milestoneDraft, taskDefinitionIds: milestoneDraft.taskDefinitionIds.includes(task.id) ? milestoneDraft.taskDefinitionIds.filter((id) => id !== task.id) : [...milestoneDraft.taskDefinitionIds, task.id] })} />{task.taskName}</label>)}
          </div>
        </Panel>
        <Panel title={labels.milestoneLibrary} icon={<Layers3 className="h-4 w-4 text-brand" />}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {milestoneDefinitions.map((milestone) => <div key={milestone.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><strong>{milestone.displaySeq}. {milestone.milestoneName}</strong><span className={statusPill(milestone.status)}>{milestone.status}</span></div><div className="mt-1 text-sm text-muted-foreground">{milestone.businessStage} · {milestone.completionRule}</div><div className="mt-3 flex flex-wrap gap-2">{milestone.taskDefinitionIds.map((id) => <span key={id} className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-strong">{taskLabel(id)}</span>)}</div></div>)}
          </div>
        </Panel>
      </div>
    );
  }

  if (mode === "processes") {
    return (
      <Panel title={labels.processTemplates} icon={<Route className="h-4 w-4 text-brand" />}>
        <div className="space-y-4">
          {processTemplates.map((template) => (
            <div key={template.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><strong>{template.templateName}</strong><div className="text-sm text-muted-foreground">{template.customer} · {template.transportMode} · {template.pol}-{template.pod}</div></div>
                <span className={statusPill(template.status)}>{template.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {milestoneDefinitions.map((milestone) => {
                  const selected = (template.milestoneDefinitionIds || []).includes(milestone.id);
                  return <label key={milestone.id} className={`flex items-center gap-2 rounded-md border p-2 text-sm ${selected ? "border-brand bg-brand-soft" : ""}`}><input type="checkbox" checked={selected} onChange={() => updateProcessMilestones(template.id, selected ? (template.milestoneDefinitionIds || []).filter((id) => id !== milestone.id) : [...(template.milestoneDefinitionIds || []), milestone.id])} />{milestone.milestoneName}</label>;
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title={labels.simulation} icon={<Play className="h-4 w-4 text-brand" />}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="space-y-1 text-sm font-semibold"><span>PO</span><select value={selectedPOId} onChange={(event) => setSelectedPOId(event.target.value)} className="field-input">{(state.purchaseOrders || []).slice(0, 20).map((po: PORecord) => <option key={po.id} value={po.id}>{po.orderNumber} - {inferCustomer(po)}</option>)}</select></label>
          <div className="rounded-md border p-3 text-sm"><div className="text-muted-foreground">{labels.matchResult}</div><div className="font-medium">{matchedTemplates.length === 1 ? `${labels.exactlyOne}: ${matchedTemplates[0].templateName}` : matchedTemplates.length === 0 ? labels.noMatch : labels.conflict}</div></div>
          <button disabled={matchedTemplates.length !== 1} onClick={generateTaskInstances} className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-brand px-3 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"><GitBranch className="h-4 w-4" />{labels.generateInstances}</button>
        </div>
      </Panel>
      <Panel title={labels.generatedTasks} icon={<CheckCircle2 className="h-4 w-4 text-brand" />}>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-gray-50"><tr>{[t(lang, "taskName"), labels.action, "Business Object", "Process / Milestone", labels.assignmentScope, t(lang, "status")].map((head) => <th key={head} className="px-3 py-2 text-left font-medium">{head}</th>)}</tr></thead>
            <tbody className="divide-y">
              {taskInstances.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">{labels.noTasks}</td></tr> : taskInstances.map((task) => <tr key={task.id}><td className="px-3 py-2">{taskLabel(task.taskDefinitionId)}</td><td className="px-3 py-2">{actionLabel(task.primaryActionId)}</td><td className="px-3 py-2">{task.businessObjectType} · {task.businessObjectId}</td><td className="px-3 py-2">{task.processInstanceId}<div className="text-xs text-muted-foreground">{task.milestoneInstanceId}</div></td><td className="px-3 py-2">{task.assigneeWorkGroupId || "-"} / {task.assigneeUserId || "-"}</td><td className="px-3 py-2"><span className={statusPill(task.status)}>{task.status}</span></td></tr>)}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
