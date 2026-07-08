import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, Plus, Trash2, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { loadState, saveState } from "@/lib/store";
import type { AppState, PageAccess } from "@/types";
import type { MasterEntitySchema, MasterFieldDefinition } from "@/lib/masterDataSchemas";
import { applyColumnFilters, getFilterOptions, type ColumnFilter, type ColumnFilterState } from "@/lib/columnFilters";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";
import ColumnFilterHeader from "./ColumnFilterHeader";
import DrawerForm from "./DrawerForm";
import ConfirmDialog from "./ConfirmDialog";

type MasterDataEntityPageProps = {
  schema: MasterEntitySchema;
  access?: PageAccess;
  preFilter?: (rows: Record<string, any>[], state: AppState) => Record<string, any>[];
  tableHeaderStart?: ReactNode;
};

const zhEntityNames: Record<string, string> = {
  clients: "客户",
  organizations: "业务伙伴",
  carriers: "承运商",
  locations: "位置",
  sku: "SKU",
  equipment: "设备",
  vessel: "船舶",
  voyage: "航次",
};

const fieldAliases: Record<string, Record<string, string[]>> = {
  clients: {
    clientID: ["clientID", "clientId", "customerId", "id"],
    clientName: ["clientName", "customerName", "name"],
    clientCode: ["clientCode", "customerCode", "code"],
    clientType: ["clientType"],
    countryOperational: ["operationalCountry", "country"],
    status: ["status"],
    invoiceLegalEntity: ["invoiceLegalEntity"],
    invoiceCurrency: ["invoiceCurrency"],
    contactEmail: ["contactEmail", "email"],
    contactPhone: ["contactPhone", "phone"],
    active: ["active"],
    industrySector: ["industrySector"],
    addressLine1And2: ["billingAddress", "address.addressLine1"],
    city: ["address.city", "city"],
    stateProvince: ["address.stateProvince"],
    postalCode: ["address.postalCode"],
    countryAddress: ["address.country"],
    contactPerson: ["contactPerson"],
    notes: ["notes"],
  },
  organizations: {
    bpID: ["bpID", "bpId", "organizationCode", "id"],
    companyName: ["companyName", "organizationName", "name"],
    country: ["address.country", "country"],
    contactEmail: ["contactEmail", "email"],
    contactPhone: ["contactPhone", "phone"],
    roleID: ["roleID", "roleId", "organizationType"],
    customerID: ["customerID", "customerId", "client"],
    partyTypeRoleType: ["partyTypeRoleType", "organizationType"],
    active: ["active"],
    addressLine1: ["address.addressLine1"],
    addressLine2: ["address.addressLine2"],
    city: ["address.city"],
    stateProvince: ["address.stateProvince"],
    postalCodeZipCode: ["address.postalCode"],
    contactPerson: ["contactPerson"],
  },
  carriers: {
    carrierID: ["carrierID", "carrierId", "id"],
    carrierName: ["carrierName", "name"],
    carrierCode: ["carrierCode", "carrierCode"],
    carrierType: ["carrierType", "mode"],
    status: ["status"],
    active: ["active"],
    scac: ["scac", "scacIata"],
    iataCode: ["iataCode", "scacIata"],
    contactEmail: ["contactEmail"],
    contactPhone: ["contactPhone"],
  },
  locations: {
    locationID: ["locationID", "locationId", "id"],
    locationName: ["locationName", "name"],
    locationCode: ["locationCode", "unLocode"],
    locationType: ["locationType", "type"],
    unLOCODE: ["unLOCODE", "unLocode", "locationId"],
    country: ["country"],
    city: ["city"],
    region: ["region"],
    isActive: ["active"],
    status: ["status"],
  },
  products: {
    skuID: ["skuID", "skuId", "productId", "id"],
    skuCode: ["skuCode", "productCode"],
    skuDescription: ["skuDescription", "productDescription"],
    productGroup: ["productGroup"],
    productStatus: ["productStatus", "status"],
    baseUnitOfMeasure: ["baseUnitOfMeasure"],
    grossWeightKg: ["grossWeightKg", "defaultWeight"],
    volumeCBM: ["volumeCBM", "volumeCbm"],
    commodityCodeHSCode: ["commodityCodeHSCode", "commodityCodeHsCode", "commodityCode"],
    countryOfOrigin: ["countryOfOrigin"],
    hazardousMaterialFlag: ["hazardousMaterialFlag"],
    active: ["active"],
    widthCm: ["width"],
    heightCm: ["height"],
    lengthCm: ["length"],
    unNumber: ["unNumber"],
    dangerousGoodsClass: ["dangerousGoods"],
  },
  equipment: {
    equipmentID: ["equipmentID", "equipmentId", "id"],
    equipmentCode: ["equipmentCode", "equipmentId"],
    equipmentType: ["equipmentType", "type"],
    equipmentCategory: ["equipmentCategory", "unitType"],
    equipmentStatus: ["equipmentStatus", "status"],
    ownerType: ["ownerType"],
    ownerCarrierProfile: ["ownerCarrierProfile", "carrier"],
    active: ["active"],
    lengthFt: ["lengthFt", "length"],
    widthFt: ["widthFt", "width"],
    heightFt: ["heightFt", "height"],
    weightTare: ["weightTare"],
    maxPayloadGrossWeight: ["maxWeight"],
    teuCapacity: ["teuCapacity"],
    containerTypeUnitType: ["unitType"],
    volumeCapacityCBM: ["volumeCapacityCBM"],
    isHazardousApproved: ["isHazardousApproved"],
    notes: ["notes"],
  },
  vessels: {
    vesselID: ["vesselID", "vesselId", "id"],
    vesselName: ["vesselName", "name"],
    vesselCode: ["vesselCode"],
    vesselType: ["vesselType"],
    imoNumber: ["imoNumber"],
    vesselStatus: ["vesselStatus", "status"],
    active: ["active"],
    ownerOperator: ["carrier"],
  },
  voyages: {
    voyageID: ["voyageID", "voyageId", "id"],
    voyageNumber: ["voyageNumber"],
    vesselID: ["vesselID", "vesselId"],
    carrierID: ["carrierID", "carrierId"],
    voyageType: ["voyageType"],
    voyageStatus: ["voyageStatus", "status"],
    isActive: ["isActive", "active"],
    isCurrent: ["isCurrent"],
    effectiveFrom: ["effectiveFrom"],
    effectiveTo: ["effectiveTo"],
  },
};

function getNestedValue(record: Record<string, any>, path: string) {
  return path.split(".").reduce<any>((value, key) => (value == null ? undefined : value[key]), record);
}

function getFieldValue(record: Record<string, any>, schema: MasterEntitySchema, field: MasterFieldDefinition) {
  if (record[field.key] !== undefined && record[field.key] !== null && record[field.key] !== "") return record[field.key];
  const aliases = fieldAliases[schema.stateKey]?.[field.key] || [];
  for (const alias of aliases) {
    const value = alias.includes(".") ? getNestedValue(record, alias) : record[alias];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function displayValue(value: any) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return String(value);
}

function isNumericField(field: MasterFieldDefinition) {
  return /(BIGINT|DECIMAL|NUMERIC|INT|FLOAT|DOUBLE)/i.test(field.dataType);
}

function isSystemManagedField(field: MasterFieldDefinition) {
  return /system-generated|auto-generated|auto-updated/i.test(`${field.addValidation} ${field.editValidation}`)
    || ["createdAt", "createdBy", "updatedAt", "updatedBy"].includes(field.key);
}

function getAllowedOptions(field: MasterFieldDefinition) {
  const match = `${field.addValidation} ${field.editValidation}`.match(/allowed:\s*([^.;]+)/i);
  if (!match) return undefined;
  return match[1].split(",").map((option) => option.trim()).filter(Boolean);
}

function getNextNumericPrimary(rows: Record<string, any>[], schema: MasterEntitySchema, field: MasterFieldDefinition) {
  const values = rows.map((row) => Number(getFieldValue(row, schema, field))).filter((value) => Number.isFinite(value));
  const fallback = Number(field.sample || 1);
  return String(values.length ? Math.max(...values) + 1 : fallback);
}

function getNextTextPrimary(rows: Record<string, any>[], schema: MasterEntitySchema, field: MasterFieldDefinition) {
  const prefix = schema.idPrefix || schema.id.toUpperCase();
  const values = rows
    .map((row) => String(getFieldValue(row, schema, field) || ""))
    .map((value) => {
      const match = value.match(/(\d+)$/);
      return match ? Number(match[1]) : NaN;
    })
    .filter((value) => Number.isFinite(value));
  const next = values.length ? Math.max(...values) + 1 : 1;
  return `${prefix}${String(next).padStart(6, "0")}`;
}

function normalizeForSave(field: MasterFieldDefinition, value: string) {
  if (/BOOLEAN/i.test(field.dataType)) return value === "TRUE" || value === "true";
  if (isNumericField(field) && value !== "") return Number(value);
  if (/uppercase/i.test(field.addValidation) || /uppercase/i.test(field.editValidation)) return value.toUpperCase();
  return value;
}

function buildRecordValues(record: Record<string, any>, schema: MasterEntitySchema) {
  return Object.fromEntries(schema.fields.map((field) => [field.key, getFieldValue(record, schema, field)]));
}

export default function MasterDataEntityPage({ schema, access, preFilter, tableHeaderStart }: MasterDataEntityPageProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [state, setState] = useState(() => loadState());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<ColumnFilterState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(null);
  const [formError, setFormError] = useState("");

  const pageAccess = access || { canView: true, canAdd: true, canModify: true, canDelete: true };
  const entityLabel = lang === "zh" ? zhEntityNames[schema.id] || schema.entityName : schema.entityName;
  const labels = {
    masterData: lang === "zh" ? "\u4e3b\u6570\u636e" : "Master Data",
    newRecord: lang === "zh" ? `\u65b0\u589e${entityLabel}` : `New ${entityLabel}`,
    editRecord: lang === "zh" ? `\u7f16\u8f91${entityLabel}` : `Edit ${entityLabel}`,
    actions: lang === "zh" ? "\u64cd\u4f5c" : "Actions",
    showing: lang === "zh" ? "\u663e\u793a" : "Showing",
    of: lang === "zh" ? "\u5171" : "of",
    rowsPerPage: lang === "zh" ? "\u6bcf\u9875\u884c\u6570" : "Rows per page",
    selectAllRows: lang === "zh" ? "\u9009\u62e9\u5168\u90e8\u884c" : "Select all rows",
    collapseRow: lang === "zh" ? "\u6536\u8d77\u884c\u8be6\u60c5" : "Collapse row details",
    expandRow: lang === "zh" ? "\u5c55\u5f00\u884c\u8be6\u60c5" : "Expand row details",
    confirmDelete: lang === "zh" ? "\u786e\u8ba4\u5220\u9664" : "Confirm Delete",
    deleteSelected: lang === "zh" ? "\u5220\u9664" : "Delete",
    deleteMessage: (count: number) => lang === "zh"
      ? `\u786e\u5b9a\u5220\u9664\u6240\u9009 ${count} \u6761${entityLabel}\u8bb0\u5f55\u5417\uff1f\u6b64\u64cd\u4f5c\u65e0\u6cd5\u64a4\u9500\u3002`
      : `Delete ${count} selected ${entityLabel} record${count === 1 ? "" : "s"}? This action cannot be undone.`,
    noRowsSelected: lang === "zh" ? "\u8bf7\u5148\u9009\u62e9\u9700\u8981\u5220\u9664\u7684\u8bb0\u5f55" : "Select records before deleting.",
  };
  const mainFields = schema.fields.filter((field) => field.level === "Main");
  const subFields = schema.fields.filter((field) => field.level === "Sub");
  const rawRows = ((state as any)[schema.stateKey] || []) as Record<string, any>[];
  const rows = preFilter ? preFilter(rawRows, state) : rawRows;
  const rowIdentityField = schema.fields.find((field) => field.primaryKey) || mainFields[0];

  const columns: ColumnFilter<Record<string, any>>[] = mainFields.map((field) => ({
    key: field.key,
    label: field.label,
    getValue: (row) => getFieldValue(row, schema, field),
  }));

  const filteredRows = applyColumnFilters(rows, columns, columnFilters);
  const filteredRowIds = filteredRows.map((row) => String(getFieldValue(row, schema, rowIdentityField) || row.id));
  const selectedVisibleCount = filteredRowIds.filter((id) => selectedRowIds.has(id)).length;
  const allVisibleSelected = filteredRowIds.length > 0 && selectedVisibleCount === filteredRowIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const formFields = useMemo(
    () => schema.fields.map((field, index) => ({
      key: field.key,
      label: field.label,
      type: isSystemManagedField(field) ? "hidden" as const : /BOOLEAN/i.test(field.dataType) || getAllowedOptions(field) ? "select" as const : isNumericField(field) ? "numeric" as const : field.dataType.includes("TEXT") || field.label.toLowerCase().includes("notes") ? "textarea" as const : "text" as const,
      options: /BOOLEAN/i.test(field.dataType) ? ["TRUE", "FALSE"] : getAllowedOptions(field),
      required: field.required === "Yes",
      disabled: field.primaryKey || isSystemManagedField(field) || (!!editingRecord && /immutable/i.test(field.editValidation)),
      systemManaged: isSystemManagedField(field),
      full: field.level === "Sub" && (field.dataType.includes("TEXT") || field.label.toLowerCase().includes("notes") || index % 7 === 0),
      placeholder: field.sample || field.addValidation,
    })),
    [editingRecord, schema.fields],
  );

  const currentValues = editingRecord
    ? buildRecordValues(editingRecord, schema)
    : Object.fromEntries(schema.fields.map((field) => {
      if (field.primaryKey && isNumericField(field)) return [field.key, getNextNumericPrimary(rawRows, schema, field)];
      if (field.primaryKey) return [field.key, getNextTextPrimary(rawRows, schema, field)];
      if (/BOOLEAN/i.test(field.dataType)) return [field.key, field.sample || "TRUE"];
      if (field.key === "createdAt" || field.key === "updatedAt") return [field.key, new Date().toISOString().slice(0, 19).replace("T", " ")];
      if (field.key === "createdBy" || field.key === "updatedBy") return [field.key, "Current User"];
      return [field.key, ""];
    }));

  const toggleExpand = (id: string) => {
    setExpandedRows((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderFilterHeader = (column: ColumnFilter<Record<string, any>>) => (
    <ColumnFilterHeader
      label={column.label}
      options={getFilterOptions(rows, column, t(lang, "blank"))}
      selectedValues={columnFilters[column.key]}
      searchPlaceholder={t(lang, "filterSearchPlaceholder")}
      selectAllLabel={t(lang, "selectAll")}
      deselectAllLabel={t(lang, "deselectAll")}
      noMatchesLabel={t(lang, "noMatches")}
      onChange={(values) => setColumnFilters((previous) => ({ ...previous, [column.key]: values }))}
    />
  );

  const toggleSelectAllVisible = (checked: boolean) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      filteredRowIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const toggleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      if (checked) next.add(rowId);
      else next.delete(rowId);
      return next;
    });
  };

  const openEditor = (row: Record<string, any>) => {
    if (!pageAccess.canModify) return;
    setEditingRecord(row);
    setFormError("");
    setDrawerOpen(true);
  };

  const validateValues = (values: Record<string, any>) => {
    for (const field of schema.fields) {
      const value = values[field.key];
      if (field.required === "Yes" && !isSystemManagedField(field) && (value === undefined || value === null || value === "")) {
        return `${field.label} is required.`;
      }
      const maxMatch = `${field.addValidation} ${field.editValidation}`.match(/max (\d+) characters/i);
      if (maxMatch && String(value || "").length > Number(maxMatch[1])) {
        return `${field.label} must be ${maxMatch[1]} characters or fewer.`;
      }
      if (isNumericField(field) && value !== "" && Number.isNaN(Number(value))) {
        return `${field.label} must be numeric.`;
      }
      if (isNumericField(field) && /must be >= 0/i.test(`${field.addValidation} ${field.editValidation}`) && value !== "" && Number(value) < 0) {
        return `${field.label} must be greater than or equal to 0.`;
      }
    }

    if (schema.id === "equipment" && values.equipmentType === "Container") {
      if (values.teuCapacity === "" || Number(values.teuCapacity) <= 0) return "TEU Capacity is required for Container and must be greater than 0.";
      if (!values.containerTypeUnitType) return "Container Type (Unit Type) is required for Container.";
    }

    for (const field of schema.fields) {
      if (!field.primaryKey && !/unique/i.test(`${field.addValidation} ${field.editValidation}`)) continue;
      const newValue = String(values[field.key] || "").toLowerCase();
      if (!newValue) continue;
      const duplicate = rawRows.find((row) => {
        const rowId = String(getFieldValue(row, schema, rowIdentityField));
        const editingId = editingRecord ? String(getFieldValue(editingRecord, schema, rowIdentityField)) : "";
        return rowId !== editingId && String(getFieldValue(row, schema, field)).toLowerCase() === newValue;
      });
      if (duplicate) return `${field.label} must be unique.`;
    }

    return "";
  };

  const handleSave = (values: Record<string, any>) => {
    if (values.__validationError__) {
      setFormError(values.__validationError__);
      return;
    }
    if ((editingRecord && !pageAccess.canModify) || (!editingRecord && !pageAccess.canAdd)) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const currentUser = "Current User";
    const normalizedValues = Object.fromEntries(schema.fields.map((field) => {
      if (field.key === "createdAt") return [field.key, editingRecord ? getFieldValue(editingRecord, schema, field) : timestamp];
      if (field.key === "createdBy") return [field.key, editingRecord ? getFieldValue(editingRecord, schema, field) : currentUser];
      if (field.key === "updatedAt") return [field.key, timestamp];
      if (field.key === "updatedBy") return [field.key, currentUser];
      return [field.key, normalizeForSave(field, values[field.key] || "")];
    }));
    const validationError = validateValues(normalizedValues);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const editingId = editingRecord ? String(getFieldValue(editingRecord, schema, rowIdentityField)) : "";
    const nextRecord = {
      ...(editingRecord || {}),
      ...normalizedValues,
      id: editingRecord?.id || `${schema.id}-${Date.now()}`,
      updatedAt: timestamp,
      updatedBy: currentUser,
    };

    const nextRows = editingRecord
      ? rawRows.map((row) => String(getFieldValue(row, schema, rowIdentityField)) === editingId ? nextRecord : row)
      : [...rawRows, { ...nextRecord, createdAt: timestamp, createdBy: currentUser }];

    const nextState = { ...state, [schema.stateKey]: nextRows } as AppState;
    setState(nextState);
    saveState(nextState);
    setDrawerOpen(false);
    setEditingRecord(null);
    setFormError("");
  };

  const confirmDelete = () => {
    if (!deleteConfirmIds?.length || !pageAccess.canDelete) return;
    const deleteSet = new Set(deleteConfirmIds);
    const nextRows = rawRows.filter((row) => !deleteSet.has(String(getFieldValue(row, schema, rowIdentityField))));
    const nextState = { ...state, [schema.stateKey]: nextRows } as AppState;
    setState(nextState);
    saveState(nextState);
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      deleteConfirmIds.forEach((id) => next.delete(id));
      return next;
    });
    setDeleteConfirmIds(null);
  };

  const exportCsv = () => {
    const header = schema.fields.map((field) => field.label).join(",");
    const body = filteredRows.map((row) => schema.fields.map((field) => `"${displayValue(getFieldValue(row, schema, field)).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${schema.id}-master-data.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const renderToolbar = () => (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
        <Upload size={14} />
        {t(lang, "import")}
      </button>
      <button onClick={exportCsv} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
        <Download size={14} />
        {t(lang, "export")}
      </button>
      {pageAccess.canAdd && (
        <button
          onClick={() => {
            setEditingRecord(null);
            setFormError("");
            setDrawerOpen(true);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong"
        >
          <Plus size={14} />
          {labels.newRecord}
        </button>
      )}
      {pageAccess.canDelete && (
        <button
          onClick={() => {
            const ids = Array.from(selectedRowIds);
            if (ids.length > 0) setDeleteConfirmIds(ids);
            else setFormError(labels.noRowsSelected);
          }}
          disabled={selectedRowIds.size === 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 px-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={14} />
          {labels.deleteSelected}
        </button>
      )}
    </div>
  );

  return (
    <div className={`min-w-0 ${tableHeaderStart ? "" : "space-y-4"}`}>
      {!tableHeaderStart && (
        <div className="flex justify-end">
          {renderToolbar()}
        </div>
      )}

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {tableHeaderStart && (
          <div className="flex flex-col gap-2 border-b border-border bg-muted p-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 overflow-x-auto">
              {tableHeaderStart}
            </div>
            <div className="shrink-0">
              {renderToolbar()}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px]">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-3 w-12 text-left text-xs font-semibold text-muted-foreground">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    aria-label={labels.selectAllRows}
                    checked={allVisibleSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someVisibleSelected;
                    }}
                    onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                  />
                </th>
                <th className="px-3 py-3 w-10 text-left text-xs font-semibold text-muted-foreground"></th>
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-3 text-left text-sm font-semibold text-muted-foreground">
                    {renderFilterHeader(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={mainFields.length + 2} className="px-4 py-16 text-center text-muted-foreground">
                    {t(lang, "noData")}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const rowId = String(getFieldValue(row, schema, rowIdentityField) || row.id);
                  const isExpanded = expandedRows.has(rowId);

                  return (
                    <Fragment key={rowId}>
                      <tr className="border-t border-border hover:bg-muted/40">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            aria-label={`Select ${rowId}`}
                            checked={selectedRowIds.has(rowId)}
                            onChange={(event) => toggleSelectRow(rowId, event.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          {subFields.length > 0 && (
                            <button
                              onClick={() => toggleExpand(rowId)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                              aria-label={isExpanded ? labels.collapseRow : labels.expandRow}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </td>
                        {mainFields.map((field) => {
                          const value = getFieldValue(row, schema, field);
                          const isInactive = field.label.toLowerCase().includes("active") && (value === false || String(value).toLowerCase() === "false");
                          return (
                            <td key={field.key} className="px-3 py-3 text-sm max-w-[220px] truncate" title={displayValue(value)}>
                              {field.primaryKey ? (
                                <button
                                  type="button"
                                  onClick={() => openEditor(row)}
                                  disabled={!pageAccess.canModify}
                                  className="font-medium text-brand underline-offset-2 hover:text-brand-strong hover:underline disabled:text-foreground disabled:no-underline"
                                >
                                  {displayValue(value)}
                                </button>
                              ) : field.label.toLowerCase().includes("status") || field.label.toLowerCase().includes("active") ? (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isInactive ? "bg-gray-soft text-gray" : "bg-green-soft text-green"}`}>
                                  {displayValue(value)}
                                </span>
                              ) : (
                                displayValue(value)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-border bg-card">
                          <td></td>
                          <td colSpan={mainFields.length + 1} className="px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
                              {subFields.map((field) => (
                                <div key={field.key} className="min-w-0">
                                  <div className="text-[11px] font-semibold text-muted-foreground">{field.label}</div>
                                  <div className="mt-1 text-sm text-foreground break-words">{displayValue(getFieldValue(row, schema, field))}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{labels.showing} {filteredRows.length === 0 ? 0 : 1}-{filteredRows.length} {labels.of} {filteredRows.length}</span>
          <span>{labels.rowsPerPage}: 20</span>
        </div>
      </div>

      {drawerOpen && (
        <DrawerForm
          title={editingRecord ? labels.editRecord : labels.newRecord}
          fields={formFields}
          values={currentValues}
          error={formError}
          onSave={handleSave}
          onClose={() => {
            setDrawerOpen(false);
            setEditingRecord(null);
            setFormError("");
          }}
        />
      )}

      {deleteConfirmIds && (
        <ConfirmDialog
          title={labels.confirmDelete}
          message={labels.deleteMessage(deleteConfirmIds.length)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmIds(null)}
        />
      )}
    </div>
  );
}

