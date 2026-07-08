import { useState, useRef, type MouseEvent, type ReactNode } from "react";
import { Plus, Edit, Trash2, Copy, GripVertical, ListTree, ArrowRight } from "lucide-react";
import type { ProcessTemplate, Milestone, MilestoneTask, SlaTypeConfig, TemplateSubjectField, Client, TransportMode as TransportModeType, Location, Organization } from "@/types";
import { formatSlaRule } from "@/types";
import DrawerForm from "../DrawerForm";
import ConfirmDialog from "../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface ProcessTemplatesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

export default function ProcessTemplatesTab({ state, setState, saveState }: ProcessTemplatesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [selectedTemplateId, setSelectedTemplateId] = useState(state.processTemplates[0]?.id || "");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [milestoneDrawerOpen, setMilestoneDrawerOpen] = useState(false);
  const [milestoneDrawerMode, setMilestoneDrawerMode] = useState<"add" | "edit">("add");
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [taskDrawerMode, setTaskDrawerMode] = useState<"add" | "edit">("add");
  const [editingTask, setEditingTask] = useState<MilestoneTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingTemplate, setEditingTemplate] = useState<ProcessTemplate | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'template' | 'milestone' | 'task'; id: string } | null>(null);
  const [selectedOptionalDimensions, setSelectedOptionalDimensions] = useState<string[]>([]);
  const [showDimensionSelector, setShowDimensionSelector] = useState(false);
  const [draggedMilestoneId, setDraggedMilestoneId] = useState<string | null>(null);
  const dragOverRef = useRef<string | null>(null);

  const selectedTemplate = state.processTemplates.find((t: ProcessTemplate) => t.id === selectedTemplateId);
  const templateMilestones = state.milestones.filter((m: Milestone) => m.templateId === selectedTemplateId);
  const labels = {
    templateList: t(lang, "templateList"),
    addTemplate: t(lang, "addTemplate"),
    edit: t(lang, "edit"),
    delete: t(lang, "delete"),
    duplicate: t(lang, "duplicateTemplate"),
    milestones: t(lang, "milestoneCount"),
    addMilestone: t(lang, "addMilestone"),
    actions: t(lang, "actions"),
    taskDetail: t(lang, "taskDetail"),
    addTask: t(lang, "addTask"),
    noTasks: t(lang, "noTasks"),
    optionalDimensions: t(lang, "optionalDimensions"),
    closeSelector: t(lang, "closeSelector"),
    addDimension: t(lang, "addDimension"),
    noAvailableDimensions: t(lang, "noAvailableDimensions"),
    close: t(lang, "close"),
    inactiveTag: t(lang, "inactiveTag"),
    confirmDelete: t(lang, "confirmDelete"),
    confirmDeleteTemplate: t(lang, "confirmDeleteTemplate"),
    confirmDeleteMilestone: t(lang, "confirmDeleteMilestone"),
    confirmDeleteTask: t(lang, "confirmDeleteTask"),
    copySuffix: t(lang, "copySuffix"),
  };

  const subjectFieldLabels: Record<string, string> = {
    customer: t(lang, "client"),
    originRegion: t(lang, "originRegion"),
    destinationRegion: t(lang, "destinationRegion"),
    transportMode: t(lang, "transportMode"),
    pol: "POL",
    pod: "POD",
    originCountry: t(lang, "originCountry"),
    destinationCountry: t(lang, "destinationCountry"),
    supplier: t(lang, "supplier"),
    consignee: t(lang, "consignee"),
    serviceType: t(lang, "serviceType"),
    incoterm: t(lang, "incoterm"),
  };

  const fieldLabel = (field: TemplateSubjectField) => subjectFieldLabels[field.key] || field.label;
  const copySuffix = labels.copySuffix;
  const inactiveSuffix = labels.inactiveTag;

  const ActionButton = ({ tone = "default", icon, label, onClick }: { tone?: "default" | "danger" | "success"; icon: ReactNode; label: string; onClick: (event: MouseEvent<HTMLButtonElement>) => void }) => {
    const toneClass = tone === "danger"
      ? "text-red-600 border-red-200 hover:bg-red-50"
      : tone === "success"
        ? "text-green-700 border-green-200 hover:bg-green-50"
        : "text-brand border-border hover:bg-brand-soft";
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${toneClass}`}
        title={label}
      >
        {icon}
        {label}
      </button>
    );
  };

  // Helper functions
  const getEnabledSubjectFields = (): TemplateSubjectField[] => {
    return (state.templateSubjectFields || [])
      .filter((f: TemplateSubjectField) => f.enabled)
      .sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder);
  };

  const getRequiredSubjectFields = (): TemplateSubjectField[] => {
    return (state.templateSubjectFields || [])
      .filter((f: TemplateSubjectField) => f.required && f.enabled)
      .sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder);
  };

  const getOptionalEnabledFields = (): TemplateSubjectField[] => {
    return (state.templateSubjectFields || [])
      .filter((f: TemplateSubjectField) => !f.required && f.enabled)
      .sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder);
  };

  const getOptionalDimensionCandidates = (): TemplateSubjectField[] => {
    const optionalFields = (state.templateSubjectFields || [])
      .filter((field: TemplateSubjectField) => !field.required)
      .sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder);
    return optionalFields.filter((field: TemplateSubjectField) => field.enabled || selectedOptionalDimensions.includes(field.key));
  };

  const getTemplateFormFields = () => {
    const requiredFields = getRequiredSubjectFields();
    const fields: any[] = [
      { key: "templateName", label: t(lang, 'templateName'), required: false, full: true },
    ];

    requiredFields.forEach((field: TemplateSubjectField) => {
      let fieldConfig: any = { key: field.key, label: fieldLabel(field), required: field.required };
      if (field.type === 'select') {
        fieldConfig.type = 'select';
        if (field.source === 'customers') {
          fieldConfig.options = (state.clients || []).filter((c: Client) => c.active).map((c: Client) => c.customerName);
        } else if (field.source === 'transportModes') {
          fieldConfig.options = (state.transportModes || []).filter((t: TransportModeType) => t.status === 'Active').map((t: TransportModeType) => t.name);
        } else if (field.source === 'locations') {
          fieldConfig.options = (state.locations || []).filter((l: Location) => l.active && l.locationType === 'Port').map((l: Location) => l.locationId);
        } else if (field.source === 'organizations') {
          fieldConfig.options = (state.organizations || []).filter((o: Organization) => o.active).map((o: Organization) => o.organizationName);
        } else if (field.key === 'originRegion' || field.key === 'destinationRegion') {
          fieldConfig.options = ["Asia", "Europe", "Americas", "Africa", "Oceania", "Middle East"];
        } else if (field.key === 'originCountry' || field.key === 'destinationCountry') {
          fieldConfig.options = [...new Set((state.locations || []).map((l: Location) => l.country))].filter(Boolean);
        } else if (field.options) {
          fieldConfig.options = field.options;
        }
      }
      fields.push(fieldConfig);
    });

    selectedOptionalDimensions.forEach((dimKey: string) => {
      const field = state.templateSubjectFields?.find((f: TemplateSubjectField) => f.key === dimKey);
      if (!field || !field.enabled) return;
      let fieldConfig: any = { key: field.key, label: fieldLabel(field), required: field.required };
      if (field.type === 'select') {
        fieldConfig.type = 'select';
        if (field.source === 'customers') {
          fieldConfig.options = (state.clients || []).filter((c: Client) => c.active).map((c: Client) => c.customerName);
        } else if (field.source === 'transportModes') {
          fieldConfig.options = (state.transportModes || []).filter((t: TransportModeType) => t.status === 'Active').map((t: TransportModeType) => t.name);
        } else if (field.source === 'locations') {
          fieldConfig.options = (state.locations || []).filter((l: Location) => l.active && l.locationType === 'Port').map((l: Location) => l.locationId);
        } else if (field.source === 'organizations') {
          fieldConfig.options = (state.organizations || []).filter((o: Organization) => o.active).map((o: Organization) => o.organizationName);
        } else if (field.key === 'originRegion' || field.key === 'destinationRegion') {
          fieldConfig.options = ["Asia", "Europe", "Americas", "Africa", "Oceania", "Middle East"];
        } else if (field.key === 'originCountry' || field.key === 'destinationCountry') {
          fieldConfig.options = [...new Set((state.locations || []).map((l: Location) => l.country))].filter(Boolean);
        } else if (field.options) {
          fieldConfig.options = field.options;
        }
      }
      fields.push(fieldConfig);
    });

    fields.push(
      { key: "effectiveDate", label: t(lang, 'effectiveDate'), type: "text" as const },
      { key: "version", label: t(lang, 'version') },
      { key: "status", label: t(lang, 'status'), type: "select", options: ["Active", "Inactive", "Draft"] },
      { key: "remark", label: t(lang, 'remark'), type: "textarea", full: true },
    );

    return fields;
  };

  const handleAddOptionalDimension = (dimKey: string) => {
    const field = state.templateSubjectFields?.find((f: TemplateSubjectField) => f.key === dimKey);
    if (!field?.enabled) return;
    if (!selectedOptionalDimensions.includes(dimKey)) {
      setSelectedOptionalDimensions([...selectedOptionalDimensions, dimKey]);
    }
  };

  const handleRemoveOptionalDimension = (dimKey: string) => {
    setSelectedOptionalDimensions(selectedOptionalDimensions.filter((k: string) => k !== dimKey));
  };

  const handleAddTemplate = () => {
    setDrawerMode("add");
    setEditingTemplate(null);
    setSelectedOptionalDimensions([]);
    setShowDimensionSelector(true);
    setDrawerOpen(true);
  };

  const handleEditTemplate = (template: ProcessTemplate) => {
    setDrawerMode("edit");
    setEditingTemplate(template);
    if (template.subjectValues) {
      const optionalKeys = Object.keys(template.subjectValues).filter((key: string) => {
        const field = state.templateSubjectFields?.find((f: TemplateSubjectField) => f.key === key);
        return field && !field.required;
      });
      setSelectedOptionalDimensions(optionalKeys);
    } else {
      setSelectedOptionalDimensions([]);
    }
    setShowDimensionSelector(false);
    setDrawerOpen(true);
  };

  const generateTemplateName = (subjectValues: Record<string, string>): string => {
    const enabledFields = (state.templateSubjectFields || []).filter((f: TemplateSubjectField) => f.enabled).sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder);
    const parts: string[] = [];
    const customer = subjectValues.customer || "";
    const originRegion = subjectValues.originRegion || "";
    const destinationRegion = subjectValues.destinationRegion || "";
    const transportMode = subjectValues.transportMode || "";
    const pol = subjectValues.pol || "";
    const pod = subjectValues.pod || "";

    if (customer) parts.push(customer);
    if (originRegion && destinationRegion) {
      parts.push(`${originRegion} -> ${destinationRegion}`);
    } else if (originRegion) {
      parts.push(originRegion);
    } else if (destinationRegion) {
      parts.push(destinationRegion);
    }

    const polEnabled = enabledFields.some((f: TemplateSubjectField) => f.key === "pol" && f.enabled);
    const podEnabled = enabledFields.some((f: TemplateSubjectField) => f.key === "pod" && f.enabled);
    if ((polEnabled || podEnabled) && (pol || pod)) {
      if (pol && pod) {
        parts.push(`${pol} -> ${pod}`);
      } else if (pol) {
        parts.push(pol);
      } else if (pod) {
        parts.push(pod);
      }
    }

    if (transportMode) parts.push(transportMode);
    return parts.join(" | ");
  };

  const handleSaveTemplate = (data: any) => {
    const subjectValues: Record<string, string> = {};
    const enabledFields = (state.templateSubjectFields || []).filter((f: TemplateSubjectField) => f.enabled);
    enabledFields.forEach((field: TemplateSubjectField) => {
      if (data[field.key]) {
        subjectValues[field.key] = data[field.key];
      }
    });

    const generatedName = generateTemplateName(subjectValues);
    const templateName = data.templateName || generatedName;

    if (drawerMode === "add") {
      const newTemplate: ProcessTemplate = {
        id: `pt-${Date.now()}`,
        templateName: templateName,
        customer: data.customer || "",
        pol: data.pol || "",
        pod: data.pod || "",
        lane: data.lane || ((data.pol && data.pod) ? `${data.pol}-${data.pod}` : ""),
        transportMode: data.transportMode || "",
        region: data.originRegion || data.region || "",
        subjectValues,
        effectiveDate: data.effectiveDate || "",
        version: data.version || "v1.0",
        tags: data.tags || "",
        status: data.status || "Active",
        remark: data.remark || "",
      };
      setState((prev: any) => ({
        ...prev,
        processTemplates: [...prev.processTemplates, newTemplate],
      }));
      setSelectedTemplateId(newTemplate.id);
    } else if (editingTemplate) {
      setState((prev: any) => ({
        ...prev,
        processTemplates: prev.processTemplates.map((t: ProcessTemplate) =>
          t.id === editingTemplate.id ? { ...t, ...data, templateName, subjectValues, lane: data.lane || ((data.pol && data.pod) ? `${data.pol}-${data.pod}` : t.lane) } : t
        ),
      }));
    }
    saveState(state);
    setDrawerOpen(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setItemToDelete({ type: 'template', id: templateId });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;

    if (type === 'template') {
      setState((prev: any) => {
        const milestoneIds = prev.milestones.filter((m: Milestone) => m.templateId === id).map((m: Milestone) => m.id);
        return {
          ...prev,
          processTemplates: prev.processTemplates.filter((t: ProcessTemplate) => t.id !== id),
          milestones: prev.milestones.filter((m: Milestone) => m.templateId !== id),
          milestoneTasks: prev.milestoneTasks.filter((t: MilestoneTask) => !milestoneIds.includes(t.milestoneId)),
        };
      });
      if (selectedTemplateId === id) {
        setSelectedTemplateId(state.processTemplates[0]?.id || "");
      }
    } else if (type === 'milestone') {
      setState((prev: any) => ({
        ...prev,
        milestones: prev.milestones.filter((m: Milestone) => m.id !== id),
        milestoneTasks: prev.milestoneTasks.filter((t: MilestoneTask) => t.milestoneId !== id),
      }));
      if (selectedMilestoneId === id) {
        setSelectedMilestoneId(null);
      }
    } else if (type === 'task') {
      setState((prev: any) => ({
        ...prev,
        milestoneTasks: prev.milestoneTasks.filter((t: MilestoneTask) => t.id !== id),
      }));
    }

    saveState(state);
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDuplicateTemplate = (template: ProcessTemplate) => {
    const newTemplateId = `pt-${Date.now()}`;
    const newTemplate: ProcessTemplate = {
      ...template,
      id: newTemplateId,
      templateName: `${template.templateName} ${copySuffix}`,
      version: "v1.0",
      effectiveDate: new Date().toISOString().split('T')[0],
      status: "Draft" as const,
    };

    const sourceMilestones = state.milestones.filter((m: Milestone) => m.templateId === template.id);
    const newMilestones: Milestone[] = [];
    const newTasks: MilestoneTask[] = [];
    const milestoneIdMap = new Map<string, string>();

    sourceMilestones.forEach((milestone: Milestone) => {
      const newMilestoneId = `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      milestoneIdMap.set(milestone.id, newMilestoneId);
      newMilestones.push({ ...milestone, id: newMilestoneId, templateId: newTemplateId });

      const sourceTasks = state.milestoneTasks.filter((t: MilestoneTask) => t.milestoneId === milestone.id);
      sourceTasks.forEach((task: MilestoneTask) => {
        newTasks.push({
          ...task,
          id: `mt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: newTemplateId,
          milestoneId: newMilestoneId,
        });
      });
    });

    setState((prev: any) => ({
      ...prev,
      processTemplates: [...prev.processTemplates, newTemplate],
      milestones: [...prev.milestones, ...newMilestones],
      milestoneTasks: [...prev.milestoneTasks, ...newTasks],
    }));

    setSelectedTemplateId(newTemplateId);
    saveState(state);
  };

  const handleAddMilestone = () => {
    setMilestoneDrawerMode("add");
    setEditingMilestone(null);
    setMilestoneDrawerOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setMilestoneDrawerMode("edit");
    setEditingMilestone(milestone);
    setMilestoneDrawerOpen(true);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setItemToDelete({ type: 'milestone', id: milestoneId });
    setDeleteConfirmOpen(true);
  };

  const getSlaTypeIdFromText = (displayText: string): string | undefined => {
    const config = (state.slaTypeConfigs || []).find((s: SlaTypeConfig) => formatSlaRule(s.slaRule, lang) === displayText);
    return config?.id;
  };

  const getSlaDisplayText = (slaTypeId?: string): string => {
    if (!slaTypeId) return '-';
    const slaConfig = state.slaTypeConfigs?.find((s: SlaTypeConfig) => s.id === slaTypeId);
    if (!slaConfig) return slaTypeId;
    const ruleText = formatSlaRule(slaConfig.slaRule, lang);
    const statusTag = slaConfig.status === 'Inactive' ? ` ${inactiveSuffix}` : '';
    return `${ruleText}${statusTag}`;
  };

  const getActiveSlaTypeOptions = (): string[] => {
    return (state.slaTypeConfigs || [])
      .filter((s: SlaTypeConfig) => s.status === 'Active')
      .map((s: SlaTypeConfig) => formatSlaRule(s.slaRule, lang));
  };

  const handleSaveMilestone = (data: any) => {
    if (!selectedTemplateId) return;
    const slaTypeId = data.slaDisplay ? getSlaTypeIdFromText(data.slaDisplay) : undefined;
    delete data.slaDisplay;

    if (milestoneDrawerMode === "add") {
      const existingMilestones = state.milestones.filter((m: Milestone) => m.templateId === selectedTemplateId);
      const nextSeq = existingMilestones.length > 0 ? Math.max(...existingMilestones.map((m: Milestone) => m.milestoneSeq)) + 1 : 1;

      const newMilestone: Milestone = {
        id: `ms-${Date.now()}`,
        templateId: selectedTemplateId,
        milestoneSeq: nextSeq,
        milestoneName: data.milestoneName || "",
        predecessor: data.predecessor || "",
        sla: "",
        slaTypeId,
        skippable: data.skippable || "No",
        skipCondition: data.skipCondition || "",
        requiredFiles: data.requiredFiles || "",
        automation: data.automation || "Manual",
        status: data.status || "Active",
      };
      setState((prev: any) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
    } else if (editingMilestone) {
      setState((prev: any) => ({
        ...prev,
        milestones: prev.milestones.map((m: Milestone) => m.id === editingMilestone.id ? { ...m, ...data, slaTypeId } : m),
      }));
    }
    saveState(state);
    setMilestoneDrawerOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, milestoneId: string) => {
    setDraggedMilestoneId(milestoneId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, milestoneId: string) => {
    e.preventDefault();
    dragOverRef.current = milestoneId;
  };

  const handleDrop = (e: React.DragEvent, targetMilestoneId: string) => {
    e.preventDefault();
    if (!draggedMilestoneId || draggedMilestoneId === targetMilestoneId) {
      setDraggedMilestoneId(null);
      return;
    }

    const templateMilestones = state.milestones
      .filter((m: Milestone) => m.templateId === selectedTemplateId)
      .sort((a: Milestone, b: Milestone) => a.milestoneSeq - b.milestoneSeq);

    const draggedIndex = templateMilestones.findIndex((m: Milestone) => m.id === draggedMilestoneId);
    const targetIndex = templateMilestones.findIndex((m: Milestone) => m.id === targetMilestoneId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedMilestoneId(null);
      return;
    }

    const reordered = [...templateMilestones];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const updatedMilestones = reordered.map((milestone: Milestone, index: number) => {
      const newSeq = index + 1;
      const newPredecessor = index === 0 ? "Start" : reordered[index - 1].milestoneName;
      return { ...milestone, milestoneSeq: newSeq, predecessor: newPredecessor };
    });

    setState((prev: any) => ({
      ...prev,
      milestones: prev.milestones.map((m: Milestone) => {
        const updated = updatedMilestones.find((um: Milestone) => um.id === m.id);
        return updated ? updated : m;
      }),
    }));

    saveState(state);
    setDraggedMilestoneId(null);
    dragOverRef.current = null;
  };

  const handleAddTask = () => {
    if (!selectedTemplateId || !selectedMilestoneId) return;
    setTaskDrawerMode("add");
    setEditingTask(null);
    setTaskDrawerOpen(true);
  };

  const handleEditTask = (task: MilestoneTask) => {
    setTaskDrawerMode("edit");
    setEditingTask(task);
    setTaskDrawerOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setItemToDelete({ type: 'task', id: taskId });
    setDeleteConfirmOpen(true);
  };

  const handleSaveTask = (data: any) => {
    if (!selectedTemplateId || !selectedMilestoneId) return;
    const slaTypeId = data.slaDisplay ? getSlaTypeIdFromText(data.slaDisplay) : undefined;
    delete data.slaDisplay;

    if (taskDrawerMode === "add") {
      const newTask: MilestoneTask = {
        id: `mt-${Date.now()}`,
        templateId: selectedTemplateId,
        milestoneId: selectedMilestoneId,
        taskName: data.taskName || "",
        taskType: data.taskType || "",
        sla: "",
        slaTypeId,
        requiredFiles: data.requiredFiles || "",
        automation: data.automation || "Manual",
        status: data.status || "Active",
        remark: data.remark || "",
      };
      setState((prev: any) => ({ ...prev, milestoneTasks: [...prev.milestoneTasks, newTask] }));
    } else if (editingTask) {
      setState((prev: any) => ({
        ...prev,
        milestoneTasks: prev.milestoneTasks.map((t: MilestoneTask) => t.id === editingTask.id ? { ...t, ...data, slaTypeId } : t),
      }));
    }
    saveState(state);
    setTaskDrawerOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Template Selector Sidebar */}
        <aside className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="p-3 border-b border-border">
            <h4 className="font-medium">{labels.templateList}</h4>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-2 space-y-1">
            {state.processTemplates.map((t: ProcessTemplate) => (
              <div
                key={t.id}
                className={`p-3 rounded-md cursor-pointer border ${selectedTemplateId === t.id ? 'bg-brand-soft border-brand' : 'hover:bg-muted border-transparent'}`}
                onClick={() => setSelectedTemplateId(t.id)}
              >
                <div className="font-medium text-sm">{t.templateName}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.customer} | {t.transportMode}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <ActionButton label={labels.edit} icon={<Edit size={12} />} onClick={(e) => { e.stopPropagation(); handleEditTemplate(t); }} />
                  <ActionButton tone="success" label={labels.duplicate} icon={<Copy size={12} />} onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(t); }} />
                  <ActionButton tone="danger" label={labels.delete} icon={<Trash2 size={12} />} onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} />
                </div>
              </div>
            ))}
            {state.processTemplates.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">{t(lang, 'noData')}</p>
              </div>
            )}
          </div>
          {/* Add Template Button at bottom of sidebar */}
          <div className="px-2 pb-2">
            <button
              onClick={handleAddTemplate}
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"
            >
              <Plus size={14} />
              {labels.addTemplate}
            </button>
          </div>
        </aside>

        {/* Milestones and Tasks */}
        <div className="md:col-span-2 space-y-4">
          {selectedTemplate && (
            <>
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{labels.milestones} ({templateMilestones.length})</h4>
                <button onClick={handleAddMilestone} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
                  <Plus size={14} />
                  {labels.addMilestone}
                </button>
              </div>

              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold w-10"></th>
                      <th className="px-3 py-2 text-left font-semibold">Seq</th>
                      <th className="px-3 py-2 text-left font-semibold">{t(lang, 'nodeName')}</th>
                      <th className="px-3 py-2 text-left font-semibold">{t(lang, 'predecessor')}</th>
                      <th className="px-3 py-2 text-left font-semibold">SLA</th>
                      <th className="px-3 py-2 text-left font-semibold">Tasks</th>
                      <th className="px-3 py-2 text-left font-semibold">{t(lang, 'status')}</th>
                      <th className="px-3 py-2 text-left font-semibold">{labels.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateMilestones
                      .sort((a: Milestone, b: Milestone) => a.milestoneSeq - b.milestoneSeq)
                      .map((node: Milestone) => {
                        const nodeTasks = state.milestoneTasks?.filter((nt: MilestoneTask) => nt.milestoneId === node.id) || [];
                        return (
                          <tr
                            key={node.id}
                            className="border-t border-border cursor-move hover:bg-muted/50"
                            draggable
                            onDragStart={(e) => handleDragStart(e, node.id)}
                            onDragOver={(e) => handleDragOver(e, node.id)}
                            onDrop={(e) => handleDrop(e, node.id)}
                          >
                            <td className="px-3 py-2">
                              <GripVertical size={14} className="text-muted-foreground" />
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">{node.milestoneSeq}</td>
                            <td className="px-3 py-2 font-medium">{node.milestoneName}</td>
                            <td className="px-3 py-2 text-muted-foreground">{node.predecessor}</td>
                            <td className="px-3 py-2">{node.slaTypeId ? getSlaDisplayText(node.slaTypeId) : '-'}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => setSelectedMilestoneId(selectedMilestoneId === node.id ? null : node.id)}
                                className="flex items-center gap-1 text-brand hover:text-brand-strong text-xs"
                              >
                                <ListTree size={14} />
                                {nodeTasks.length} task{nodeTasks.length !== 1 ? 's' : ''}
                                <ArrowRight size={12} className={`transition-transform ${selectedMilestoneId === node.id ? 'rotate-90' : ''}`} />
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                                node.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {node.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-2">
                                <ActionButton label={labels.edit} icon={<Edit size={12} />} onClick={() => handleEditMilestone(node)} />
                                <ActionButton tone="danger" label={labels.delete} icon={<Trash2 size={12} />} onClick={() => handleDeleteMilestone(node.id)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {templateMilestones.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                          {t(lang, 'noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Task Detail Panel */}
              {selectedMilestoneId && (() => {
                const selectedMilestone = templateMilestones.find((n: Milestone) => n.id === selectedMilestoneId);
                const milestoneTasks = state.milestoneTasks?.filter((nt: MilestoneTask) => nt.milestoneId === selectedMilestoneId) || [];
                if (!selectedMilestone) return null;
                return (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <ListTree size={16} />
                        {selectedMilestone.milestoneName} - {labels.taskDetail}
                      </h4>
                      <button
                        onClick={handleAddTask}
                        className="btn-primary px-2 py-1 text-xs rounded-md bg-brand text-white hover:bg-brand-strong flex items-center gap-1"
                      >
                        <Plus size={12} />
                        {labels.addTask}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-2 py-1.5 text-left font-medium">Task Name</th>
                            <th className="px-2 py-1.5 text-left font-medium">Task Type</th>
                            <th className="px-2 py-1.5 text-left font-medium">SLA</th>
                            <th className="px-2 py-1.5 text-left font-medium">Required Files</th>
                            <th className="px-2 py-1.5 text-left font-medium">Status</th>
                            <th className="px-2 py-1.5 text-left font-medium">Remark</th>
                            <th className="px-2 py-1.5 text-left font-medium">{labels.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestoneTasks.map((task: MilestoneTask) => (
                            <tr key={task.id} className="border-t border-border">
                              <td className="px-2 py-1.5">{task.taskName}</td>
                              <td className="px-2 py-1.5">{task.taskType}</td>
                              <td className="px-2 py-1.5">{task.slaTypeId ? getSlaDisplayText(task.slaTypeId) : '-'}</td>
                              <td className="px-2 py-1.5">{task.requiredFiles}</td>
                              <td className="px-2 py-1.5">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                                  task.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-muted-foreground">{task.remark || '-'}</td>
                              <td className="px-2 py-1.5">
                                <div className="flex flex-wrap gap-2">
                                  <ActionButton label={labels.edit} icon={<Edit size={12} />} onClick={() => handleEditTask(task)} />
                                  <ActionButton tone="danger" label={labels.delete} icon={<Trash2 size={12} />} onClick={() => handleDeleteTask(task.id)} />
                                </div>
                              </td>
                            </tr>
                          ))}
                          {milestoneTasks.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-2 py-4 text-center text-muted-foreground">
                                {labels.noTasks}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Template DrawerForm */}
      {drawerOpen && (
        <DrawerForm
          title={drawerMode === "add" ? labels.addTemplate : t(lang, "editTemplate")}
          fields={getTemplateFormFields()}
          values={editingTemplate || {}}
          onSave={handleSaveTemplate}
          onClose={() => { setDrawerOpen(false); setEditingTemplate(null); setSelectedOptionalDimensions([]); }}
        >
          {/* Optional Dimension Selector */}
          <div className="col-span-2 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{labels.optionalDimensions}</span>
              <button
                type="button"
                onClick={() => setShowDimensionSelector(!showDimensionSelector)}
                className="text-xs text-brand hover:underline"
              >
                {showDimensionSelector ? labels.closeSelector : labels.addDimension}
              </button>
            </div>

            {selectedOptionalDimensions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedOptionalDimensions.map((dimKey: string) => {
                  const field = state.templateSubjectFields?.find((f: TemplateSubjectField) => f.key === dimKey);
                  return field ? (
                    <span key={dimKey} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-brand-soft text-brand rounded-full">
                      {fieldLabel(field)}
                      <button type="button" onClick={() => handleRemoveOptionalDimension(dimKey)} className="hover:text-red-600">×</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {showDimensionSelector && (
              <div className="border border-border rounded-md p-3 bg-muted/30">
                <div className="space-y-2">
                  {getOptionalDimensionCandidates().map((field: TemplateSubjectField) => {
                    const isSelected = selectedOptionalDimensions.includes(field.key);
                    const isDisabled = !field.enabled;
                    return (
                      <label key={field.key} className={`flex items-center gap-2 p-2 rounded ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted"}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {
                            if (isSelected) {
                              handleRemoveOptionalDimension(field.key);
                            } else {
                              handleAddOptionalDimension(field.key);
                            }
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm">{fieldLabel(field)}</span>
                        <span className="text-xs text-muted-foreground ml-auto">({field.key})</span>
                      </label>
                    );
                  })}
                  {getOptionalDimensionCandidates().length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{labels.noAvailableDimensions}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowDimensionSelector(false)} className="px-4 py-2 text-sm rounded border border-border hover:bg-muted">{labels.close}</button>
                </div>
              </div>
            )}
          </div>
        </DrawerForm>
      )}

      {/* Milestone DrawerForm */}
      {milestoneDrawerOpen && (
        <DrawerForm
          title={milestoneDrawerMode === "add" ? labels.addMilestone : t(lang, "editMilestone")}
          fields={[
            { key: "milestoneName", label: t(lang, "nodeName"), required: true, full: true },
            { key: "predecessor", label: t(lang, "predecessor") },
            { key: "slaDisplay", label: "SLA", type: "select", options: getActiveSlaTypeOptions(), required: true },
            { key: "requiredFiles", label: t(lang, "requiredFiles"), full: true },
            { key: "automation", label: t(lang, "automation"), type: "select", options: ["Manual", "Semi-auto", "Auto"] },
            { key: "status", label: t(lang, "status"), type: "select", options: ["Active", "Inactive"] },
            { key: "skippable", label: t(lang, "skippable"), type: "select", options: ["Yes", "No"] },
            { key: "skipCondition", label: t(lang, "skipCondition"), full: true },
          ]}
          values={editingMilestone ? { ...editingMilestone, slaDisplay: editingMilestone.slaTypeId ? getSlaDisplayText(editingMilestone.slaTypeId).replace(` ${inactiveSuffix}`, '') : '' } : {}}
          onSave={handleSaveMilestone}
          onClose={() => setMilestoneDrawerOpen(false)}
        />
      )}

      {/* Task DrawerForm */}
      {taskDrawerOpen && (
        <DrawerForm
          title={taskDrawerMode === "add" ? labels.addTask : t(lang, "editTask")}
          fields={[
            { key: "taskName", label: t(lang, "taskName"), required: true, full: true },
            { key: "taskType", label: t(lang, "taskType"), required: true },
            { key: "slaDisplay", label: "SLA", type: "select", options: getActiveSlaTypeOptions(), required: true },
            { key: "requiredFiles", label: t(lang, "requiredFiles"), full: true },
            { key: "automation", label: t(lang, "automation"), type: "select", options: ["Manual", "Semi-auto", "Auto"] },
            { key: "status", label: t(lang, "status"), type: "select", options: ["Active", "Inactive", "Draft"] },
            { key: "remark", label: t(lang, "remark"), type: "textarea", full: true },
          ]}
          values={editingTask ? { ...editingTask, slaDisplay: editingTask.slaTypeId ? getSlaDisplayText(editingTask.slaTypeId).replace(` ${inactiveSuffix}`, '') : '' } : {}}
          onSave={handleSaveTask}
          onClose={() => setTaskDrawerOpen(false)}
        />
      )}

      {/* ConfirmDialog */}
      {deleteConfirmOpen && (
        <ConfirmDialog
          title={labels.confirmDelete}
          message={itemToDelete?.type === 'template' ? labels.confirmDeleteTemplate : itemToDelete?.type === 'milestone' ? labels.confirmDeleteMilestone : labels.confirmDeleteTask}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setDeleteConfirmOpen(false); setItemToDelete(null); }}
        />
      )}
    </div>
  );
}
