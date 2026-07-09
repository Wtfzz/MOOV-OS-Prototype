import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Check, ChevronDown, Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import type { ApplicableBusiness, SlaTypeConfig, WorkCalendarConfig, WorkCalendarType } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import DrawerForm from "../../DrawerForm";
import ConfirmDialog from "../../ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

interface SlaTypesTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

type ActiveTab = "rules" | "calendars";
type DrawerTarget = "sla" | "calendar";
type Option = { value: string; label: string };

const ALL_VALUE = "ALL";
const DEFAULT_CALENDAR_CODE = "STANDARD_5D";
const BUSINESS_OPTIONS: ApplicableBusiness[] = ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"];
const OFFSET_UNITS = ["Hours", "Days", "Workday", "Months"];
const BASE_DATE_OPTIONS = [
  "PO_CREATED",
  "CRD",
  "ETD",
  "ETA",
  "LDD",
  "MILESTONE_START",
  "TASK_CREATED",
  "BOOKING_CONFIRMED",
  "SHIPMENT_CREATED",
  "HOD",
  "BOOKING_RECEIVED",
  "BOOKING_APPROVAL",
  "PEPCO_SCORING",
  "SO_RELEASE",
  "CONTAINER_LOADING",
  "SI_CUTOFF",
  "DEPARTURE",
];
const TIMEZONE_OPTIONS = [
  "UTC (UTC+00:00)",
  "Shanghai (UTC+08:00)",
  "Kuala Lumpur (UTC+08:00)",
  "Singapore (UTC+08:00)",
  "Amsterdam (UTC+01:00 / UTC+02:00 DST)",
  "Berlin (UTC+01:00 / UTC+02:00 DST)",
  "Warsaw (UTC+01:00 / UTC+02:00 DST)",
  "London (UTC+00:00 / UTC+01:00 DST)",
  "New York (UTC-05:00 / UTC-04:00 DST)",
  "Los Angeles (UTC-08:00 / UTC-07:00 DST)",
];
const WEEKDAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CALENDAR_TYPE_OPTIONS: WorkCalendarType[] = ["Standard", "Local Adjustment"];

const copy = {
  zh: {
    slaRules: "SLA Rules",
    workCalendarMaster: "Work Calendar Master",
    addSla: "新增 SLA Rule",
    editSla: "编辑 SLA Rule",
    addCalendar: "新增 Work Calendar",
    editCalendar: "编辑 Work Calendar",
    applicableBusiness: "适用业务",
    workCalendar: "Work Calendar",
    calendarCode: "Calendar Code",
    calendarName: "Calendar Name",
    calendarType: "Calendar Type",
    timezone: "Timezone",
    workingWeek: "Working Week",
    extraHolidays: "Extra Holidays",
    extraWorkingDays: "Extra Working Days",
    applicableWorkGroups: "Applicable Workgroups",
    applicableUsers: "Applicable Users",
    calendarHint: "Work Calendar 只维护可计算日历；节假日和调休通过日期点选维护，适用范围只绑定 Workgroup/User。",
    status: "状态",
    actions: "操作",
    remark: "备注",
    all: "All",
    empty: "-",
    selectedDates: "Selected dates",
    select: "Select",
    search: "搜索",
    noMatches: "No matches",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    cancel: "取消",
    save: "保存",
  },
  en: {
    slaRules: "SLA Rules",
    workCalendarMaster: "Work Calendar Master",
    addSla: "Add SLA Rule",
    editSla: "Edit SLA Rule",
    addCalendar: "Add Work Calendar",
    editCalendar: "Edit Work Calendar",
    applicableBusiness: "Applicable Business",
    workCalendar: "Work Calendar",
    calendarCode: "Calendar Code",
    calendarName: "Calendar Name",
    calendarType: "Calendar Type",
    timezone: "Timezone",
    workingWeek: "Working Week",
    extraHolidays: "Extra Holidays",
    extraWorkingDays: "Extra Working Days",
    applicableWorkGroups: "Applicable Workgroups",
    applicableUsers: "Applicable Users",
    calendarHint: "Work Calendar defines computable calendars only; holidays and adjusted working days are maintained by date selection, and scope binds only to Workgroup/User.",
    status: "Status",
    actions: "Actions",
    remark: "Remark",
    all: "All",
    empty: "-",
    selectedDates: "Selected dates",
    select: "Select",
    search: "Search",
    noMatches: "No matches",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    cancel: "Cancel",
    save: "Save",
  },
};

const normalizeUnit = (unit?: string) => (unit === "Business Days" ? "Workday" : unit || "Days");
const normalizeCalendarCode = (code?: string) => (code && code !== "AUTO_MATCH" ? code : DEFAULT_CALENDAR_CODE);
const sortDates = (dates: string[]) => Array.from(new Set(dates)).sort((a, b) => a.localeCompare(b));
const dateStringsToDates = (dates: string[]) => dates.map((date) => parseISO(date));
const datesToDateStrings = (dates?: Date[]) => sortDates((dates || []).map((date) => format(date, "yyyy-MM-dd")));

const joinList = (value?: string[], labelMap?: Record<string, string>, allLabel = "All", emptyLabel = "-") => {
  if (!value || value.length === 0) return emptyLabel;
  if (value.includes(ALL_VALUE)) return allLabel;
  return value.map((item) => labelMap?.[item] || item).join(", ");
};

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  allowAll = false,
  allLabel = "All",
}: {
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  allowAll?: boolean;
  allLabel?: string;
}) {
  const isAll = values.includes(ALL_VALUE);

  const toggleValue = (value: string) => {
    if (value === ALL_VALUE) {
      onChange(isAll ? [] : [ALL_VALUE]);
      return;
    }
    const next = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values.filter((item) => item !== ALL_VALUE), value];
    onChange(next);
  };

  const renderedOptions = allowAll ? [{ value: ALL_VALUE, label: allLabel }, ...options] : options;

  return (
    <div className="col-span-2">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {renderedOptions.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggleValue(option.value)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SearchableMultiSelect({
  label,
  options,
  values,
  onChange,
  labels,
  allowAll = false,
}: {
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  labels: typeof copy.en;
  allowAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const renderedOptions = allowAll ? [{ value: ALL_VALUE, label: labels.all }, ...options] : options;
  const filteredOptions = renderedOptions.filter((option) =>
    `${option.label} ${option.value}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selectedOptions = values.includes(ALL_VALUE)
    ? [{ value: ALL_VALUE, label: labels.all }]
    : values.map((value) => renderedOptions.find((option) => option.value === value) || { value, label: value });
  const selectableFiltered = filteredOptions.filter((option) => option.value !== ALL_VALUE);
  const allFilteredSelected = selectableFiltered.length > 0 && selectableFiltered.every((option) => values.includes(option.value));

  const toggleValue = (value: string) => {
    if (value === ALL_VALUE) {
      onChange(values.includes(ALL_VALUE) ? [] : [ALL_VALUE]);
      return;
    }
    const withoutAll = values.filter((item) => item !== ALL_VALUE);
    onChange(withoutAll.includes(value) ? withoutAll.filter((item) => item !== value) : [...withoutAll, value]);
  };

  const toggleFiltered = () => {
    if (allFilteredSelected) {
      onChange(values.filter((value) => !selectableFiltered.some((option) => option.value === value)));
      return;
    }
    const next = Array.from(new Set([...values.filter((value) => value !== ALL_VALUE), ...selectableFiltered.map((option) => option.value)]));
    onChange(next);
  };

  return (
    <div className="relative col-span-2">
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm font-normal outline-none transition-colors hover:bg-gray-50 focus:border-brand focus:ring-2 focus:ring-brand-soft"
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selectedOptions.length === 0 ? (
            <span className="text-muted">{labels.select}</span>
          ) : (
            selectedOptions.map((option) => (
              <span key={option.value} className="inline-flex max-w-full items-center rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                <span className="truncate">{option.label}</span>
              </span>
            ))
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open && (
        <div className="absolute z-[60] mt-1 w-full rounded-md border border-border bg-white shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={labels.search}
                className="w-full rounded-md border border-input py-1.5 pl-7 pr-2 text-sm outline-none focus:ring-2 focus:ring-brand-soft"
              />
            </div>
            <button type="button" onClick={toggleFiltered} className="mt-2 text-xs font-medium text-brand hover:underline">
              {allFilteredSelected ? labels.deselectAll : labels.selectAll}
            </button>
          </div>
          <div className="max-h-56 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted">{labels.noMatches}</div>
            ) : filteredOptions.map((option) => {
              const selected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-brand bg-brand text-white" : "border-border"}`}>
                    {selected && <Check size={12} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateMultiPicker({
  label,
  dates,
  onChange,
  selectedDatesLabel,
}: {
  label: string;
  dates: string[];
  onChange: (dates: string[]) => void;
  selectedDatesLabel: string;
}) {
  const selectedDates = dateStringsToDates(dates);

  return (
    <div className="col-span-2 rounded-md border border-gray-200 p-3">
      <div className="mb-2 text-sm font-semibold text-gray-700">{label}</div>
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={(nextDates) => onChange(datesToDateStrings(nextDates))}
        captionLayout="dropdown"
        className="rounded-md border"
      />
      <div className="mt-3">
        <div className="mb-2 text-xs font-medium text-muted">{selectedDatesLabel}</div>
        {dates.length === 0 ? (
          <div className="text-sm text-muted">-</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => onChange(dates.filter((item) => item !== date))}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                {date}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkCalendarDrawer({
  title,
  values,
  workGroupOptions,
  userOptions,
  labels,
  onSave,
  onClose,
}: {
  title: string;
  values?: WorkCalendarConfig | null;
  workGroupOptions: Option[];
  userOptions: Option[];
  labels: typeof copy.en;
  onSave: (values: WorkCalendarConfig) => void;
  onClose: () => void;
}) {
  const [calendarCode, setCalendarCode] = useState(values?.calendarCode || "");
  const [calendarName, setCalendarName] = useState(values?.calendarName || "");
  const [calendarType, setCalendarType] = useState<WorkCalendarType>(values?.calendarType || "Standard");
  const [timezone, setTimezone] = useState(values?.timezone || "UTC (UTC+00:00)");
  const [workingWeek, setWorkingWeek] = useState<string[]>(values?.workingWeek || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [extraHolidays, setExtraHolidays] = useState<string[]>(sortDates(values?.extraHolidays || []));
  const [extraWorkingDays, setExtraWorkingDays] = useState<string[]>(sortDates(values?.extraWorkingDays || []));
  const [applicableWorkGroups, setApplicableWorkGroups] = useState<string[]>(values?.applicableWorkGroups || []);
  const [applicableUsers, setApplicableUsers] = useState<string[]>(values?.applicableUsers || []);
  const [status, setStatus] = useState<"Active" | "Inactive">(values?.status || "Active");
  const [remark, setRemark] = useState(values?.remark || "");
  const [error, setError] = useState("");

  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!calendarCode.trim() || !calendarName.trim()) {
      setError("Calendar Code and Calendar Name are required.");
      return;
    }
    onSave({
      id: values?.id || `wc-${Date.now()}`,
      calendarCode: calendarCode.trim(),
      calendarName: calendarName.trim(),
      calendarType,
      timezone,
      workingWeek,
      extraHolidays,
      extraWorkingDays,
      applicableWorkGroups,
      applicableUsers,
      status,
      remark,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex h-full w-full max-w-[760px] animate-in flex-col bg-white shadow-lg slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.calendarCode}<span className="ml-0.5 text-red-600">*</span></label>
              <input value={calendarCode} onChange={(event) => setCalendarCode(event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.calendarName}<span className="ml-0.5 text-red-600">*</span></label>
              <input value={calendarName} onChange={(event) => setCalendarName(event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.calendarType}</label>
              <select value={calendarType} onChange={(event) => setCalendarType(event.target.value as WorkCalendarType)} className={inputClass}>
                {CALENDAR_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.timezone}</label>
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className={inputClass}>
                {TIMEZONE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <CheckboxGroup label={labels.workingWeek} options={WEEKDAY_OPTIONS.map((day) => ({ value: day, label: day }))} values={workingWeek} onChange={setWorkingWeek} />
            <DateMultiPicker label={labels.extraHolidays} dates={extraHolidays} onChange={setExtraHolidays} selectedDatesLabel={labels.selectedDates} />
            <DateMultiPicker label={labels.extraWorkingDays} dates={extraWorkingDays} onChange={setExtraWorkingDays} selectedDatesLabel={labels.selectedDates} />
            <SearchableMultiSelect label={labels.applicableWorkGroups} options={workGroupOptions} values={applicableWorkGroups} onChange={setApplicableWorkGroups} labels={labels} allowAll />
            <SearchableMultiSelect label={labels.applicableUsers} options={userOptions} values={applicableUsers} onChange={setApplicableUsers} labels={labels} allowAll />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.status}</label>
              <select value={status} onChange={(event) => setStatus(event.target.value as "Active" | "Inactive")} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">{labels.remark}</label>
              <textarea value={remark} onChange={(event) => setRemark(event.target.value)} rows={3} className={`${inputClass} resize-vertical`} />
            </div>
          </div>
        </form>

        <div className="mt-auto flex justify-end gap-3 border-t p-5">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
            {labels.cancel}
          </button>
          <button type="button" onClick={() => document.querySelector("form")?.requestSubmit()} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-white transition-colors hover:bg-brand-strong">
            <Save size={16} />
            {labels.save}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SlaTypesTab({ state, setState, saveState }: SlaTypesTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const label = copy[lang];
  const [activeTab, setActiveTab] = useState<ActiveTab>("rules");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget>("sla");
  const [editingSla, setEditingSla] = useState<SlaTypeConfig | null>(null);
  const [editingCalendar, setEditingCalendar] = useState<WorkCalendarConfig | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const workCalendars: WorkCalendarConfig[] = state.workCalendars || [];
  const slaItems: SlaTypeConfig[] = state.slaTypeConfigs || [];

  const calendarOptions = useMemo(() => {
    const codes = workCalendars.map((calendar) => calendar.calendarCode).filter((code) => code !== "AUTO_MATCH");
    return Array.from(new Set(codes.length > 0 ? codes : [DEFAULT_CALENDAR_CODE]));
  }, [workCalendars]);

  const calendarNameByCode = useMemo(() => {
    const names: Record<string, string> = {};
    workCalendars.forEach((calendar) => {
      names[calendar.calendarCode] = calendar.calendarName;
    });
    return names;
  }, [workCalendars]);

  const workGroupOptions = useMemo<Option[]>(
    () => (state.workGroups || []).map((group: any) => ({ value: group.id, label: `${group.id} - ${group.workGroupName || group.name || group.id}` })).filter((group: Option) => group.value),
    [state.workGroups],
  );
  const userOptions = useMemo<Option[]>(
    () => (state.users || []).map((user: any) => ({ value: user.id, label: `${user.id} - ${user.name || user.email || user.id}` })).filter((user: Option) => user.value),
    [state.users],
  );
  const workGroupLabelMap = useMemo(() => Object.fromEntries(workGroupOptions.map((option) => [option.value, option.label])), [workGroupOptions]);
  const userLabelMap = useMemo(() => Object.fromEntries(userOptions.map((option) => [option.value, option.label])), [userOptions]);

  const slaFields = [
    { key: "id", label: t(lang, "slaTypeId") || "SLA ID", required: true },
    { key: "applicableBusinesses", label: label.applicableBusiness, type: "multiselect" as const, options: BUSINESS_OPTIONS, full: true },
    { key: "baseDateCode", label: t(lang, "baseDateCode"), type: "select" as const, options: BASE_DATE_OPTIONS },
    { key: "direction", label: t(lang, "direction"), type: "select" as const, options: ["Before", "After"] },
    { key: "offsetValue", label: t(lang, "offsetValue"), type: "numeric" as const },
    { key: "offsetUnit", label: t(lang, "offsetUnit"), type: "select" as const, options: OFFSET_UNITS },
    { key: "calendarCode", label: label.workCalendar, type: "select" as const, options: calendarOptions, required: true },
    { key: "status", label: label.status, type: "select" as const, options: ["Active", "Inactive"] },
    { key: "remark", label: label.remark, type: "textarea" as const, full: true },
  ];

  const openAdd = () => {
    setDrawerMode("add");
    setDrawerTarget(activeTab === "rules" ? "sla" : "calendar");
    setEditingSla(null);
    setEditingCalendar(null);
    setDrawerOpen(true);
  };

  const openEditSla = (item: SlaTypeConfig) => {
    setDrawerMode("edit");
    setDrawerTarget("sla");
    setEditingSla(item);
    setDrawerOpen(true);
  };

  const openEditCalendar = (item: WorkCalendarConfig) => {
    setDrawerMode("edit");
    setDrawerTarget("calendar");
    setEditingCalendar(item);
    setDrawerOpen(true);
  };

  const handleSaveSla = (data: any) => {
    if (data.__validationError__) return;
    const nextItem: SlaTypeConfig = {
      id: data.id,
      slaRule: {
        baseDateCode: data.baseDateCode || "TASK_CREATED",
        direction: data.direction || "After",
        offsetValue: Number(data.offsetValue) || 0,
        offsetUnit: normalizeUnit(data.offsetUnit) as any,
      },
      applicableBusinesses: data.applicableBusinesses?.length ? data.applicableBusinesses : BUSINESS_OPTIONS,
      calendarCode: normalizeCalendarCode(data.calendarCode || calendarOptions[0]),
      objectScope: editingSla?.objectScope || "Task",
      reminderThreshold: editingSla?.reminderThreshold,
      reminderUnit: editingSla?.reminderUnit,
      status: data.status || "Active",
      remark: data.remark || "",
    };

    const updated = drawerMode === "add"
      ? [...slaItems, nextItem]
      : slaItems.map((item) => (item.id === editingSla?.id ? nextItem : item));
    setState((prev: any) => ({ ...prev, slaTypeConfigs: updated }));
    saveState({ ...state, slaTypeConfigs: updated });
    setDrawerOpen(false);
  };

  const handleSaveCalendar = (nextItem: WorkCalendarConfig) => {
    const updated = drawerMode === "add"
      ? [...workCalendars, nextItem]
      : workCalendars.map((item) => (item.id === editingCalendar?.id ? nextItem : item));
    setState((prev: any) => ({ ...prev, workCalendars: updated }));
    saveState({ ...state, workCalendars: updated });
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (activeTab === "rules") {
      const updated = slaItems.filter((item) => item.id !== itemToDelete);
      setState((prev: any) => ({ ...prev, slaTypeConfigs: updated }));
      saveState({ ...state, slaTypeConfigs: updated });
    } else {
      const updated = workCalendars.filter((item) => item.id !== itemToDelete);
      setState((prev: any) => ({ ...prev, workCalendars: updated }));
      saveState({ ...state, workCalendars: updated });
    }
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const drawerTitle = drawerTarget === "sla"
    ? drawerMode === "add" ? label.addSla : label.editSla
    : drawerMode === "add" ? label.addCalendar : label.editCalendar;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border-b border-border bg-muted/50 p-2">
          {[
            { key: "rules", name: label.slaRules },
            { key: "calendars", name: label.workCalendarMaster },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ActiveTab)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key ? "border border-brand-soft bg-brand-soft text-brand-strong" : "text-foreground hover:bg-card"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"
        >
          <Plus className="h-3.5 w-3.5" />
          {activeTab === "rules" ? label.addSla : label.addCalendar}
        </button>
      </div>

      {activeTab === "rules" ? (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "slaTypeId") || "SLA ID"}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.applicableBusiness}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "baseDateCode")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "direction")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "offsetValue")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, "offsetUnit")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.workCalendar}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.status}</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {slaItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td>
                </tr>
              ) : (
                slaItems.map((item) => {
                  const code = normalizeCalendarCode(item.calendarCode);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{item.id}</td>
                      <td className="px-4 py-3 text-sm">{joinList(item.applicableBusinesses, undefined, label.all, label.empty)}</td>
                      <td className="px-4 py-3 text-sm">{item.slaRule?.baseDateCode || "-"}</td>
                      <td className="px-4 py-3 text-sm">{item.slaRule?.direction || "-"}</td>
                      <td className="px-4 py-3 text-sm">{item.slaRule?.offsetValue ?? "-"}</td>
                      <td className="px-4 py-3 text-sm">{normalizeUnit(item.slaRule?.offsetUnit)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span>{calendarNameByCode[code] || code}</span>
                          <span className="text-xs text-muted">{code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => openEditSla(item)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{label.calendarHint}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.calendarCode}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.calendarName}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.calendarType}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.timezone}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.workingWeek}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.extraHolidays}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.extraWorkingDays}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.applicableWorkGroups}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.applicableUsers}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.status}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{label.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workCalendars.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">{t(lang, "noData")}</td>
                  </tr>
                ) : (
                  workCalendars.map((calendar) => (
                    <tr key={calendar.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{calendar.calendarCode}</td>
                      <td className="px-4 py-3 text-sm">{calendar.calendarName}</td>
                      <td className="px-4 py-3 text-sm">{calendar.calendarType}</td>
                      <td className="px-4 py-3 text-sm">{calendar.timezone}</td>
                      <td className="px-4 py-3 text-sm">{joinList(calendar.workingWeek, undefined, label.all, label.empty)}</td>
                      <td className="px-4 py-3 text-sm">{calendar.extraHolidays?.length || 0}</td>
                      <td className="px-4 py-3 text-sm">{calendar.extraWorkingDays?.length || 0}</td>
                      <td className="px-4 py-3 text-sm">{joinList(calendar.applicableWorkGroups, workGroupLabelMap, label.all, label.empty)}</td>
                      <td className="px-4 py-3 text-sm">{joinList(calendar.applicableUsers, userLabelMap, label.all, label.empty)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          calendar.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {calendar.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => openEditCalendar(calendar)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(calendar.id)} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
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
      )}

      {drawerOpen && drawerTarget === "sla" && (
        <DrawerForm
          title={drawerTitle}
          fields={slaFields}
          values={editingSla ? {
            id: editingSla.id,
            applicableBusinesses: editingSla.applicableBusinesses || [],
            baseDateCode: editingSla.slaRule?.baseDateCode,
            direction: editingSla.slaRule?.direction,
            offsetValue: editingSla.slaRule?.offsetValue,
            offsetUnit: normalizeUnit(editingSla.slaRule?.offsetUnit),
            calendarCode: normalizeCalendarCode(editingSla.calendarCode),
            status: editingSla.status,
            remark: editingSla.remark,
          } : {
            applicableBusinesses: BUSINESS_OPTIONS,
            baseDateCode: "TASK_CREATED",
            direction: "After",
            offsetValue: 1,
            offsetUnit: "Workday",
            calendarCode: calendarOptions[0] || DEFAULT_CALENDAR_CODE,
            status: "Active",
          }}
          onSave={handleSaveSla}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {drawerOpen && drawerTarget === "calendar" && (
        <WorkCalendarDrawer
          title={drawerTitle}
          values={editingCalendar}
          workGroupOptions={workGroupOptions}
          userOptions={userOptions}
          labels={label}
          onSave={handleSaveCalendar}
          onClose={() => setDrawerOpen(false)}
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
