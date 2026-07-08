import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, GitBranch, ListChecks, MousePointerClick, Play, RadioTower, Route, ShieldCheck } from "lucide-react";
import type { ActionRegistryItem, EventRegistryItem, Milestone, MilestoneTask, PORecord, ProcessTemplate } from "@/types";
import { findPage } from "@/app/pageCatalog";

type OrchestrationModelTabProps = {
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
  originCountry: string;
  destinationCountry: string;
  pol: string;
  pod: string;
};

const fallbackActions: ActionRegistryItem[] = [
  { id: "act-po-review", label: "Review PO detail", businessObjectType: "PO", pageId: "execution-po", tabId: "generalInformation", actionType: "Review", requiredPermission: "View", completionEventId: "evt-po-reviewed", status: "Active" },
  { id: "act-po-confirm-crd", label: "Confirm PO CRD", businessObjectType: "PO", pageId: "execution-po", tabId: "generalInformation", actionType: "Confirm", requiredPermission: "Modify", completionEventId: "evt-po-crd-confirmed", status: "Active" },
  { id: "act-po-upload-document", label: "Upload PO document", businessObjectType: "PO", pageId: "execution-po", tabId: "documents", actionType: "Upload", requiredPermission: "Modify", completionEventId: "evt-document-uploaded", status: "Active" },
  { id: "act-po-verify-document", label: "Verify document", businessObjectType: "PO", pageId: "execution-po", tabId: "documents", actionType: "Approve", requiredPermission: "Modify", completionEventId: "evt-document-verified", status: "Active" },
  { id: "act-booking-create", label: "Create carrier booking", businessObjectType: "Booking", pageId: "execution-shipment", tabId: "carrierBooking", actionType: "Edit", requiredPermission: "Add", completionEventId: "evt-booking-confirmed", status: "Active" },
  { id: "act-booking-confirm-so", label: "Confirm SO received", businessObjectType: "Booking", pageId: "execution-shipment", tabId: "carrierBooking", actionType: "Confirm", requiredPermission: "Modify", completionEventId: "evt-so-confirmed", status: "Active" },
  { id: "act-manual-assignment", label: "Resolve manual assignment", businessObjectType: "Task", pageId: "tasks-assignment", tabId: "manualAssignment", actionType: "Assign", requiredPermission: "Modify", completionEventId: "evt-task-assigned", status: "Active" },
];

const fallbackEvents: EventRegistryItem[] = [
  { id: "evt-po-reviewed", label: "PO reviewed", sourcePageId: "execution-po", businessObjectType: "PO", effect: "Complete Task", status: "Active" },
  { id: "evt-po-crd-confirmed", label: "PO CRD confirmed", sourcePageId: "execution-po", businessObjectType: "PO", effect: "Complete Task", status: "Active" },
  { id: "evt-document-uploaded", label: "Document uploaded", sourcePageId: "execution-po", businessObjectType: "PO", effect: "Complete Task", status: "Active" },
  { id: "evt-document-verified", label: "Document verified", sourcePageId: "execution-po", businessObjectType: "PO", effect: "Complete Task", status: "Active" },
  { id: "evt-booking-confirmed", label: "Booking confirmed", sourcePageId: "execution-shipment", businessObjectType: "Booking", effect: "Open Next Milestone", status: "Active" },
  { id: "evt-so-confirmed", label: "SO confirmed", sourcePageId: "execution-shipment", businessObjectType: "Booking", effect: "Complete Task", status: "Active" },
  { id: "evt-task-assigned", label: "Task assigned", sourcePageId: "tasks-assignment", businessObjectType: "Task", effect: "Audit Only", status: "Active" },
];

function normalize(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeMode(value?: string) {
  const mode = normalize(value);
  if (["sea", "ocean", "oceanfreight"].includes(mode)) return "ocean";
  if (["multi", "multimodal", "multimodal"].includes(mode)) return "multimodal";
  if (["air", "airfreight"].includes(mode)) return "air";
  if (["rail"].includes(mode)) return "rail";
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
  const mode = record.locationInfo?.transportMode || "";
  return {
    id: record.id,
    label: `${record.orderNumber} - ${inferCustomer(record)}`,
    objectType: "PO",
    customer: inferCustomer(record),
    transportMode: normalizeMode(mode) === "multimodal" ? "Multi-modal" : normalizeMode(mode) === "ocean" ? "Ocean" : mode,
    originRegion: "Asia",
    destinationRegion: inferDestinationRegion(pod),
    originCountry: record.locationInfo?.originCountry || "CN",
    destinationCountry: pod.slice(0, 2),
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

function isOverlapping(a: ProcessTemplate, b: ProcessTemplate) {
  if (a.status !== "Active" || b.status !== "Active") return false;
  if ((a.objectType || "PO") !== (b.objectType || "PO")) return false;
  const keys = ["customer", "transportMode", "originRegion", "destinationRegion", "pol", "pod"];
  return keys.every((key) => {
    const left = templateValue(a, key);
    const right = templateValue(b, key);
    return !left || !right || normalizeMode(left) === normalizeMode(right) || normalize(left) === normalize(right);
  });
}

function defaultActionForTask(task: MilestoneTask) {
  const text = `${task.taskName} ${task.taskType}`.toLowerCase();
  if (text.includes("crd") || text.includes("cargo ready")) return "act-po-confirm-crd";
  if (text.includes("upload") || text.includes("document")) return "act-po-upload-document";
  if (text.includes("verify")) return "act-po-verify-document";
  if (text.includes("booking") || text.includes("carrier")) return "act-booking-create";
  if (text.includes("so ")) return "act-booking-confirm-so";
  return "act-po-review";
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const className = tone === "good"
    ? "bg-green-soft text-green"
    : tone === "warn"
      ? "bg-yellow-soft text-yellow"
      : tone === "bad"
        ? "bg-red-soft text-red"
        : "bg-gray-soft text-gray";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
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

export default function OrchestrationModelTab({ state, setState, saveState }: OrchestrationModelTabProps) {
  const actions: ActionRegistryItem[] = state.actionRegistry?.length ? state.actionRegistry : fallbackActions;
  const events: EventRegistryItem[] = state.eventRegistry?.length ? state.eventRegistry : fallbackEvents;
  const processTemplates: ProcessTemplate[] = state.processTemplates || [];
  const milestones: Milestone[] = state.milestones || [];
  const tasks: MilestoneTask[] = state.milestoneTasks || [];

  const scenarios = useMemo<BusinessContext[]>(() => {
    const samplePOs = (state.purchaseOrders || []).slice(0, 6).map(contextFromPO);
    return [
      { id: "scenario-lidl", label: "Scenario: LIDL PO exact route", objectType: "PO", customer: "LIDL", transportMode: "Ocean", originRegion: "Asia", destinationRegion: "Europe", originCountry: "CN", destinationCountry: "DE", pol: "CNSHA", pod: "DEHAM" },
      { id: "scenario-pepco", label: "Scenario: Pepco PO exact route", objectType: "PO", customer: "Pepco", transportMode: "Multi-modal", originRegion: "Asia", destinationRegion: "Europe", originCountry: "CN", destinationCountry: "PL", pol: "CNSZX", pod: "PLPOZ" },
      ...samplePOs,
    ];
  }, [state.purchaseOrders]);

  const [selectedContextId, setSelectedContextId] = useState(scenarios[0]?.id || "");
  const selectedContext = scenarios.find((item) => item.id === selectedContextId) || scenarios[0];
  const matchedTemplates = processTemplates.filter((template) => selectedContext && templateMatches(template, selectedContext));
  const selectedTemplate = matchedTemplates.length === 1 ? matchedTemplates[0] : processTemplates.find((template) => template.status === "Active") || processTemplates[0];
  const selectedMilestones = milestones
    .filter((milestone) => milestone.templateId === selectedTemplate?.id && milestone.status === "Active")
    .sort((a, b) => a.milestoneSeq - b.milestoneSeq);
  const selectedTasks = tasks.filter((task) => task.templateId === selectedTemplate?.id && task.status === "Active");

  const overlapPairs = useMemo(() => {
    const pairs: Array<[ProcessTemplate, ProcessTemplate]> = [];
    processTemplates.forEach((left, leftIndex) => {
      processTemplates.slice(leftIndex + 1).forEach((right) => {
        if (isOverlapping(left, right)) pairs.push([left, right]);
      });
    });
    return pairs;
  }, [processTemplates]);

  const bindDefaultActions = () => {
    const nextTasks = tasks.map((task) => {
      const actionId = task.targetActionId || defaultActionForTask(task);
      const action = actions.find((item) => item.id === actionId);
      return {
        ...task,
        generationMode: task.generationMode || "Always",
        generationCondition: task.generationCondition || "Milestone is opened and task is active",
        targetActionId: actionId,
        completionEventId: task.completionEventId || action?.completionEventId || "evt-po-reviewed",
      };
    });
    const nextState = { ...state, milestoneTasks: nextTasks, actionRegistry: actions, eventRegistry: events };
    setState(nextState);
    saveState(nextState);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Panel title="Business Object" icon={<GitBranch className="h-4 w-4 text-brand" />}>
          <label className="space-y-2 text-sm font-semibold">
            <span>Simulation context</span>
            <select value={selectedContext?.id || ""} onChange={(event) => setSelectedContextId(event.target.value)} className="field-input">
              {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}
            </select>
          </label>
          {selectedContext && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {["customer", "transportMode", "originRegion", "destinationRegion", "pol", "pod"].map((key) => (
                <div key={key} className="rounded-md border border-border p-2">
                  <div className="text-muted-foreground">{key}</div>
                  <div className="font-medium">{(selectedContext as any)[key]}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Template Resolution" icon={<Route className="h-4 w-4 text-brand" />}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Matched active templates</span>
              <Badge tone={matchedTemplates.length === 1 ? "good" : matchedTemplates.length === 0 ? "warn" : "bad"}>{matchedTemplates.length}</Badge>
            </div>
            <div className="rounded-md bg-muted p-3">
              {matchedTemplates.length === 1 ? (
                <div className="font-medium">{matchedTemplates[0].templateName}</div>
              ) : matchedTemplates.length === 0 ? (
                <div>No route. Create Template Missing exception.</div>
              ) : (
                <div>Conflict. Create Template Conflict resolution task.</div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Invariant: every business object must resolve to exactly one process path before task instances are generated.</div>
          </div>
        </Panel>

        <Panel title="Publish Guard" icon={<ShieldCheck className="h-4 w-4 text-brand" />}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Active template overlaps</span>
              <Badge tone={overlapPairs.length === 0 ? "good" : "bad"}>{overlapPairs.length}</Badge>
            </div>
            {overlapPairs.length === 0 ? (
              <div className="rounded-md bg-green-soft p-3 text-green">No overlap detected in active process routes.</div>
            ) : (
              <div className="space-y-2">
                {overlapPairs.map(([left, right]) => (
                  <div key={`${left.id}-${right.id}`} className="rounded-md bg-red-soft p-2 text-xs text-red">{left.templateName} overlaps {right.templateName}</div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Configuration Hygiene" icon={<ListChecks className="h-4 w-4 text-brand" />}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span>Action registry</span><Badge tone="good">{actions.length}</Badge></div>
            <div className="flex items-center justify-between"><span>Event registry</span><Badge tone="good">{events.length}</Badge></div>
            <div className="flex items-center justify-between"><span>Active task rules</span><Badge>{tasks.filter((task) => task.status === "Active").length}</Badge></div>
            <button onClick={bindDefaultActions} className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
              <MousePointerClick className="h-3.5 w-3.5" />
              Bind default task actions
            </button>
          </div>
        </Panel>
      </div>

      <Panel title="Process Path -> Milestone -> Task Rule -> Action" icon={<Play className="h-4 w-4 text-brand" />}>
        <div className="space-y-4">
          {selectedMilestones.map((milestone) => {
            const milestoneTasks = selectedTasks.filter((task) => task.milestoneId === milestone.id);
            return (
              <div key={milestone.id} className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/50 px-3 py-2">
                  <div className="font-medium">{milestone.milestoneSeq}. {milestone.milestoneName}</div>
                  <div className="flex gap-2"><Badge>{milestoneTasks.length} task rules</Badge><Badge>{milestone.automation}</Badge></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Task rule", "Generation", "Target action", "Page / Tab", "Permission", "Completion event"].map((head) => (
                          <th key={head} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {milestoneTasks.map((task) => {
                        const action = actions.find((item) => item.id === (task.targetActionId || defaultActionForTask(task)));
                        const event = events.find((item) => item.id === (task.completionEventId || action?.completionEventId));
                        const page = action ? findPage(action.pageId) : null;
                        return (
                          <tr key={task.id} className="align-top">
                            <td className="px-3 py-2">
                              <div className="font-medium">{task.taskName}</div>
                              <div className="text-xs text-muted-foreground">{task.taskType}</div>
                            </td>
                            <td className="px-3 py-2">
                              <Badge tone={task.generationMode === "Conditional" ? "warn" : "neutral"}>{task.generationMode || "Always"}</Badge>
                              <div className="mt-1 text-xs text-muted-foreground">{task.generationCondition || "Milestone is opened and task is active"}</div>
                            </td>
                            <td className="px-3 py-2">{action?.label || "Unmapped action"}</td>
                            <td className="px-3 py-2">
                              <div>{page?.label || action?.pageId || "-"}</div>
                              <div className="text-xs text-muted-foreground">{action?.tabId || "-"}</div>
                            </td>
                            <td className="px-3 py-2">{action?.requiredPermission || "-"}</td>
                            <td className="px-3 py-2">
                              <div>{event?.label || action?.completionEventId || "-"}</div>
                              <div className="text-xs text-muted-foreground">{event?.effect || "-"}</div>
                            </td>
                          </tr>
                        );
                      })}
                      {milestoneTasks.length === 0 && (
                        <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No active task rules under this milestone.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Action Registry" icon={<MousePointerClick className="h-4 w-4 text-brand" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Action", "Object", "Page", "Permission", "Completion event"].map((head) => <th key={head} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {actions.map((action) => (
                  <tr key={action.id}>
                    <td className="px-3 py-2 font-medium">{action.label}</td>
                    <td className="px-3 py-2">{action.businessObjectType}</td>
                    <td className="px-3 py-2">{action.pageId}<span className="text-muted-foreground"> / {action.tabId || "-"}</span></td>
                    <td className="px-3 py-2">{action.requiredPermission}</td>
                    <td className="px-3 py-2">{action.completionEventId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Event Registry" icon={<RadioTower className="h-4 w-4 text-brand" />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Event", "Source page", "Object", "Effect"].map((head) => <th key={head} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{head}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-3 py-2 font-medium">{event.label}</td>
                    <td className="px-3 py-2">{event.sourcePageId}</td>
                    <td className="px-3 py-2">{event.businessObjectType}</td>
                    <td className="px-3 py-2">{event.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {matchedTemplates.length === 1 ? <CheckCircle2 className="h-4 w-4 text-green" /> : <AlertTriangle className="h-4 w-4 text-yellow" />}
          <span>Runtime chain:</span>
          <strong>Business Object</strong>
          <ArrowRight className="h-3.5 w-3.5" />
          <strong>Exactly One Process</strong>
          <ArrowRight className="h-3.5 w-3.5" />
          <strong>Milestone Task Rules</strong>
          <ArrowRight className="h-3.5 w-3.5" />
          <strong>Assignment</strong>
          <ArrowRight className="h-3.5 w-3.5" />
          <strong>Executable Action Page</strong>
          <ArrowRight className="h-3.5 w-3.5" />
          <strong>Completion Event</strong>
        </div>
      </div>
    </div>
  );
}
