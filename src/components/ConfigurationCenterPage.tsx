import { useMemo, useState } from "react";
import { Download, Edit, FileUp, Plus, Search, Settings2, SlidersHorizontal, Trash2 } from "lucide-react";
import type { AppState, CustomConfigCategory, CustomConfigItem } from "@/types";
import DrawerForm from "./DrawerForm";
import ConfirmDialog from "./ConfirmDialog";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

type Props = {
  state: AppState;
  setState: (updater: any) => void;
  saveState: (state: AppState) => void;
};

type ConfigType = CustomConfigCategory;
type DrawerMode = "type-add" | "type-edit" | "value-add" | "value-edit" | null;

const statusOptions = ["Active", "Inactive"];
const yesNoOptions = ["No", "Yes"];
const categoryOptions = [
  "Master Data Reference - Common",
  "Master Data Reference - Classifications",
  "Operational Status",
  "Operational Codes",
  "Business Terms",
  "System Settings",
  "Custom",
];

const nowStamp = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const seedTypeDefs: Array<{
  code: string;
  name: string;
  category: string;
  description: string;
  values: string[];
}> = [
  { code: "COUNTRY", name: "Country (ISO 3166-1)", category: "Master Data Reference - Common", description: "Standard country codes used by client, partner, carrier, and location records.", values: ["US", "CN", "VN", "NL", "DE", "JP", "SG", "HK", "GB"] },
  { code: "CURRENCY", name: "Currency (ISO 4217)", category: "Master Data Reference - Common", description: "Invoice and payment currency options.", values: ["USD", "EUR", "CNY", "JPY", "GBP", "SGD", "HKD", "VND"] },
  { code: "TIMEZONE", name: "Time Zone (IANA)", category: "Master Data Reference - Common", description: "IANA time zones for operational calendars and profiles.", values: ["Asia/Shanghai", "Europe/Amsterdam", "America/New_York", "UTC"] },
  { code: "PAYMENT_TERM", name: "Payment Terms", category: "Master Data Reference - Common", description: "Standard payment term values.", values: ["30 days", "45 days", "60 days", "Net 30", "Due on receipt"] },
  { code: "LEGAL_ENTITY", name: "Legal Entity", category: "Master Data Reference - Common", description: "MOOV legal entities used for invoice ownership.", values: ["MOOV NL", "MOOV CN", "MOOV SG"] },
  { code: "REGION", name: "Region", category: "Master Data Reference - Common", description: "Operational region values.", values: ["Asia", "Europe", "Americas", "Africa", "Oceania", "Middle East"] },
  { code: "UOM", name: "Unit of Measure", category: "Master Data Reference - Common", description: "Unit of measure options for product and equipment attributes.", values: ["EA", "KG", "M", "BOX", "CASE", "PALLET", "L", "ML", "TON"] },
  { code: "PARTY_TYPE", name: "Party Type / Role", category: "Master Data Reference - Classifications", description: "Business partner role classifications.", values: ["Shipper", "Consignee", "Notify Party", "Carrier", "Customs Broker", "Supplier", "Producer"] },
  { code: "CARRIER_TYPE", name: "Carrier Type", category: "Master Data Reference - Classifications", description: "Carrier mode/type options.", values: ["Ocean", "Air", "Rail", "Trucking", "Multimodal", "Feeder", "NVOCC"] },
  { code: "SERVICE_TYPE", name: "Service Type", category: "Master Data Reference - Classifications", description: "Service classification values.", values: ["Ocean Freight", "Air Freight", "Trucking", "Warehousing", "Logistics"] },
  { code: "CLIENT_TYPE", name: "Client Type", category: "Master Data Reference - Classifications", description: "Client hierarchy type.", values: ["Global", "Country"] },
  { code: "INDUSTRY_SECTOR", name: "Industry / Sector", category: "Master Data Reference - Classifications", description: "Client industry classification.", values: ["Retail", "Technology", "Automotive", "FMCG", "Pharma", "Machinery"] },
  { code: "INVOICE_FORMAT", name: "Invoice Format", category: "Master Data Reference - Classifications", description: "Invoice presentation format.", values: ["Summary", "Detail", "Summary with Comments"] },
  { code: "EQUIPMENT_TYPE", name: "Equipment Type", category: "Master Data Reference - Classifications", description: "Equipment type options.", values: ["Container", "Trailer", "Railcar", "Aircraft Container", "Vehicle", "Flatbed"] },
  { code: "EQUIPMENT_CATEGORY", name: "Equipment Category", category: "Master Data Reference - Classifications", description: "Equipment category options.", values: ["Dry", "Reefer", "Open-Top", "Flat Rack", "Tank", "Bulk"] },
  { code: "OWNER_TYPE", name: "Owner Type", category: "Master Data Reference - Classifications", description: "Equipment ownership options.", values: ["Owned", "Leased", "Rented", "Customer Owned"] },
  { code: "CONTAINER_TYPE", name: "Container Type (Unit Type)", category: "Master Data Reference - Classifications", description: "Container unit type values.", values: ["FCL", "LCL", "Hazmat", "Reefer"] },
  { code: "LOCATION_TYPE", name: "Location Type", category: "Master Data Reference - Classifications", description: "Location type options.", values: ["Port", "Airport", "Rail Terminal", "Warehouse", "Distribution Center", "City"] },
  { code: "LOCATION_USAGE", name: "Location Usage", category: "Master Data Reference - Classifications", description: "Location usage options.", values: ["Storage", "Production", "Distribution", "Transport Hub", "Administrative"] },
  { code: "LOCATION_CATEGORY", name: "Location Category", category: "Master Data Reference - Classifications", description: "Location category codes.", values: ["PL", "CU", "SU", "NO", "SP"] },
  { code: "FUNCTION_CODE", name: "UN/LOCODE Function Code", category: "Master Data Reference - Classifications", description: "UN/LOCODE function code values.", values: ["1 (Port)", "2 (Rail)", "3 (Road)", "4 (Airport)", "5 (Postal)", "6 (Multimodal)"] },
  { code: "PRODUCT_TYPE", name: "Product Type", category: "Master Data Reference - Classifications", description: "Product type options.", values: ["Physical", "Service", "Kit", "Component", "Consumable"] },
  { code: "PRODUCT_GROUP", name: "Product Group", category: "Master Data Reference - Classifications", description: "Product group options.", values: ["Electronics", "Apparel", "Machinery", "Food", "FMCG", "Automotive"] },
  { code: "PRODUCT_CATEGORY", name: "Product Category", category: "Master Data Reference - Classifications", description: "Product category values under product groups.", values: ["Laptops", "T-Shirts", "Paint", "Furniture", "Home Goods"] },
  { code: "PACKAGING_TYPE", name: "Packaging Type", category: "Master Data Reference - Classifications", description: "Packaging type options.", values: ["POLY_BAG", "CARTON", "PALLET", "DRUM", "BULK"] },
  { code: "PACKAGING_MATERIAL", name: "Packaging Material", category: "Master Data Reference - Classifications", description: "Packaging material options.", values: ["Plastic", "Cardboard", "Wood", "Metal", "Paper", "Foam"] },
  { code: "COSTING_METHOD", name: "Costing Method", category: "Master Data Reference - Classifications", description: "Inventory costing method options.", values: ["Moving Average", "Standard", "FIFO", "LIFO", "Actual"] },
  { code: "DG_CLASS", name: "Dangerous Goods Class", category: "Master Data Reference - Classifications", description: "IMO dangerous goods class values.", values: ["1", "2", "3", "4.1", "4.2", "4.3", "5.1", "5.2", "6.1", "6.2", "7", "8", "9"] },
  { code: "PACKAGING_GROUP", name: "Packaging Group (DG)", category: "Master Data Reference - Classifications", description: "Dangerous goods packaging groups.", values: ["I", "II", "III"] },
  { code: "VESSEL_TYPE", name: "Vessel Type", category: "Master Data Reference - Classifications", description: "Vessel type options.", values: ["Container Ship", "Bulk Carrier", "Ro-Ro", "Tanker", "Feeder"] },
  { code: "VOYAGE_TYPE", name: "Voyage Type", category: "Master Data Reference - Classifications", description: "Voyage direction/type options.", values: ["Eastbound", "Westbound", "Northbound", "Southbound", "Regional", "Feeder"] },
  { code: "SLA_PROFILE", name: "SLA Profile", category: "Master Data Reference - Classifications", description: "SLA profile options.", values: ["CARRIER_PREMIUM", "CARRIER_STANDARD"] },
  { code: "DISCOUNT_PROFILE", name: "Discount Profile", category: "Master Data Reference - Classifications", description: "Client discount profile definitions.", values: ["STANDARD", "LIDL_GLOBAL_DISCOUNT"] },
  { code: "BOOKING_STATUS", name: "Booking Status", category: "Operational Status", description: "Booking lifecycle status.", values: ["Draft", "Confirmed", "Cancelled", "Rejected"] },
  { code: "SHIPMENT_STATUS", name: "Shipment Status", category: "Operational Status", description: "Shipment lifecycle status.", values: ["Planned", "In Transit", "Arrived", "Delivered"] },
  { code: "REASON_CODE", name: "Reason Code", category: "Operational Codes", description: "Reason codes for overrides and exceptions.", values: ["Supplier CRD Change", "Carrier Cancellation", "Client Request"] },
  { code: "EXCEPTION_TYPE", name: "Exception Type", category: "Operational Codes", description: "Operational exception classifications.", values: ["Booking Delay", "Equipment Shortage", "Documentation Issue"] },
  { code: "INCOTERM", name: "Incoterm", category: "Business Terms", description: "Incoterm options.", values: ["FOB", "CIF", "DDP", "EXW", "DAP"] },
  { code: "SESSION_TIMEOUT_MIN", name: "Session Timeout (minutes)", category: "System Settings", description: "Session timeout options.", values: ["30", "60", "120"] },
];

function normalizeCode(value: string) {
  return value.trim().replace(/\s+/g, "_").toUpperCase();
}

function seedTypes(): ConfigType[] {
  return seedTypeDefs.map((type, index) => ({
    id: `cfgtype-${type.code}`,
    code: type.code,
    name: type.name,
    category: type.category,
    description: type.description,
    isSystem: true,
    status: "Active",
    sortOrder: index + 1,
    remark: "Seeded from Configuration Center PRD v1.1",
    createdBy: "System",
    createdAt: "2026-07-07 00:00:00",
    updatedBy: "System",
    updatedAt: "2026-07-07 00:00:00",
  }));
}

function seedValues(types: ConfigType[]): CustomConfigItem[] {
  return seedTypeDefs.flatMap((typeDef) => {
    const type = types.find((item) => item.code === typeDef.code);
    if (!type) return [];
    return typeDef.values.map((value, index) => ({
      id: `cfgvalue-${typeDef.code}-${normalizeCode(value)}`,
      categoryId: type.id,
      code: normalizeCode(value),
      name: value,
      description: "",
      parentValueCode: "",
      effectiveFrom: "",
      effectiveTo: "",
      usageCount: index % 3 === 0 ? index + 1 : 0,
      referencedBy: index % 3 === 0 ? ["Master Data"] : [],
      status: "Active" as const,
      sortOrder: index + 1,
      remark: "Seeded sample value",
      createdBy: "System",
      createdAt: "2026-07-07 00:00:00",
      updatedBy: "System",
      updatedAt: "2026-07-07 00:00:00",
    }));
  });
}

function mergeConfigTypes(stateTypes: CustomConfigCategory[]) {
  const byCode = new Map<string, ConfigType>();
  seedTypes().forEach((type) => byCode.set(type.code, type));
  stateTypes.forEach((type, index) => {
    byCode.set(type.code, {
      ...type,
      category: type.category || "Custom",
      isSystem: Boolean(type.isSystem),
      sortOrder: type.sortOrder || index + 1,
    });
  });
  return Array.from(byCode.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function mergeConfigValues(types: ConfigType[], stateValues: CustomConfigItem[]) {
  const byKey = new Map<string, CustomConfigItem>();
  seedValues(types).forEach((value) => byKey.set(`${value.categoryId}:${value.code}`, value));
  stateValues.forEach((value, index) => {
    byKey.set(`${value.categoryId}:${value.code}`, {
      ...value,
      parentValueCode: value.parentValueCode || "",
      effectiveFrom: value.effectiveFrom || "",
      effectiveTo: value.effectiveTo || "",
      usageCount: value.usageCount || 0,
      referencedBy: value.referencedBy || [],
      sortOrder: value.sortOrder || index + 1,
    });
  });
  return Array.from(byKey.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export default function ConfigurationCenterPage({ state, setState, saveState }: Props) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTypeCode, setSelectedTypeCode] = useState("COUNTRY");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [editingType, setEditingType] = useState<ConfigType | null>(null);
  const [editingValue, setEditingValue] = useState<CustomConfigItem | null>(null);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "type" | "value"; id: string } | null>(null);
  const labels = {
    title: lang === "zh" ? "配置中心" : "Configuration Center",
    subtitle: lang === "zh" ? "集中维护系统级下拉选项、固定列表和参考数据。" : "Centralized maintenance for system-level dropdowns, fixed lists, and reference data.",
    typeList: lang === "zh" ? "配置类型" : "Configuration Types",
    valueList: lang === "zh" ? "配置值" : "Configuration Values",
    createType: lang === "zh" ? "新增类型" : "Create Type",
    addValue: lang === "zh" ? "新增值" : "Add Value",
    import: lang === "zh" ? "导入" : "Import",
    export: lang === "zh" ? "导出" : "Export",
    importPlaceholder: lang === "zh" ? "导入预览将在 P1 后续接入 Excel 模板与逐行校验。" : "Import preview will be connected to the Excel template and row-level validation in the next P1 iteration.",
    search: lang === "zh" ? "搜索 Type Code / Type Name" : "Search Type Code / Type Name",
    allCategories: lang === "zh" ? "全部类别" : "All Categories",
    allStatuses: lang === "zh" ? "全部状态" : "All Statuses",
    typeCode: lang === "zh" ? "类型代码" : "Type Code",
    typeName: lang === "zh" ? "类型名称" : "Type Name",
    isSystem: lang === "zh" ? "系统内置" : "Is System",
    active: lang === "zh" ? "启用" : "Active",
    values: lang === "zh" ? "值数量" : "Values",
    valueCode: lang === "zh" ? "值代码" : "Value Code",
    valueName: lang === "zh" ? "值名称" : "Value Name",
    displayOrder: lang === "zh" ? "显示顺序" : "Display Order",
    parentValueCode: lang === "zh" ? "父级值代码" : "Parent Value Code",
    effectiveFrom: lang === "zh" ? "生效开始" : "Effective From",
    effectiveTo: lang === "zh" ? "生效结束" : "Effective To",
    usage: lang === "zh" ? "使用情况" : "Usage",
    audit: lang === "zh" ? "配置变更历史" : "Configuration Change History",
    timestamp: lang === "zh" ? "时间" : "Timestamp",
    user: lang === "zh" ? "用户" : "User",
    action: lang === "zh" ? "动作" : "Action",
    entity: lang === "zh" ? "对象类型" : "Entity",
    object: lang === "zh" ? "对象" : "Object",
    detail: lang === "zh" ? "详情" : "Detail",
    noUsage: lang === "zh" ? "未使用" : "No active usage",
    inUse: lang === "zh" ? "使用中" : "In use",
    cannotDeleteSystem: lang === "zh" ? "系统内置配置类型不能删除。" : "System-defined configuration types cannot be deleted.",
    deactivateWarning: lang === "zh" ? "该值仍被引用，停用前请确认影响范围。" : "This value is still referenced. Review impact before deactivation.",
    confirmDeleteType: lang === "zh" ? "删除该配置类型会同时删除其所有值，是否继续？" : "Deleting this configuration type also deletes all values. Continue?",
    confirmDeleteValue: lang === "zh" ? "是否删除该配置值？历史数据不会被修改。" : "Delete this configuration value? Historical data will not be changed.",
  };

  const configTypes = useMemo(() => mergeConfigTypes(state.customConfigCategories || []), [state.customConfigCategories]);
  const configValues = useMemo(() => mergeConfigValues(configTypes, state.customConfigItems || []), [configTypes, state.customConfigItems]);
  const selectedType = configTypes.find((type) => type.code === selectedTypeCode) || configTypes[0];
  const selectedTypeValues = configValues
    .filter((value) => value.categoryId === selectedType?.id)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));
  const typeValueCounts = configValues.reduce<Record<string, number>>((acc, value) => {
    acc[value.categoryId] = (acc[value.categoryId] || 0) + 1;
    return acc;
  }, {});

  const visibleTypes = configTypes.filter((type) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || type.code.toLowerCase().includes(keyword) || type.name.toLowerCase().includes(keyword);
    const matchesCategory = categoryFilter === "All" || type.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || type.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const persist = (patch: Partial<AppState>, auditPatch?: { action: string; entity: "TYPE" | "VALUE"; typeCode: string; valueCode?: string; before?: any; after?: any }) => {
    const auditEntry = auditPatch ? {
      id: `audit-config-${Date.now()}`,
      time: nowStamp(),
      userId: "current",
      user: "Current User",
      action: auditPatch.action,
      module: "Configuration Center",
      objectType: auditPatch.entity,
      objectName: auditPatch.valueCode ? `${auditPatch.typeCode}.${auditPatch.valueCode}` : auditPatch.typeCode,
      detail: JSON.stringify({ before: auditPatch.before || null, after: auditPatch.after || null }),
      status: "Success",
      ip: "127.0.0.1",
      sessionId: "local",
    } : null;
    const nextState = { ...state, ...patch, audit: auditEntry ? [auditEntry, ...(state.audit || [])] : state.audit } as AppState;
    setState(nextState);
    saveState(nextState);
  };

  const ensureTypePersisted = (type: ConfigType) => {
    if ((state.customConfigCategories || []).some((item) => item.id === type.id)) return state.customConfigCategories || [];
    return [...(state.customConfigCategories || []), type];
  };

  const openTypeDrawer = (type?: ConfigType) => {
    setFormError("");
    setEditingType(type || null);
    setDrawerMode(type ? "type-edit" : "type-add");
  };

  const openValueDrawer = (value?: CustomConfigItem) => {
    setFormError("");
    setEditingValue(value || null);
    setDrawerMode(value ? "value-edit" : "value-add");
  };

  const saveType = (data: any) => {
    if (data.__validationError__) {
      setFormError(data.__validationError__);
      return;
    }
    const code = normalizeCode(data.code);
    const isEdit = drawerMode === "type-edit" && editingType;
    const duplicateCode = configTypes.some((type) => type.code === code && type.id !== editingType?.id);
    const duplicateName = configTypes.some((type) => type.name.toLowerCase() === String(data.name || "").trim().toLowerCase() && type.id !== editingType?.id);
    if (duplicateCode) {
      setFormError(lang === "zh" ? "Type Code 必须唯一。" : "Type Code must be unique.");
      return;
    }
    if (duplicateName) {
      setFormError(lang === "zh" ? "Type Name 必须唯一。" : "Type Name must be unique.");
      return;
    }
    const normalized: ConfigType = {
      ...(isEdit ? editingType : {}),
      id: isEdit ? editingType.id : `cfgtype-${code}`,
      code: isEdit ? editingType.code : code,
      name: String(data.name || "").trim(),
      category: data.category || "Custom",
      description: data.description || "",
      isSystem: isEdit ? Boolean(editingType.isSystem) : data.isSystem === "Yes",
      status: data.status || "Active",
      sortOrder: Number(data.sortOrder || editingType?.sortOrder || configTypes.length + 1),
      remark: data.remark || "",
      createdBy: editingType?.createdBy || "Current User",
      createdAt: editingType?.createdAt || nowStamp(),
      updatedBy: "Current User",
      updatedAt: nowStamp(),
    };
    const current = state.customConfigCategories || [];
    const nextTypes = isEdit
      ? ensureTypePersisted(editingType).map((item) => item.id === normalized.id ? normalized : item)
      : [...current, normalized];
    persist({ customConfigCategories: nextTypes }, { action: isEdit ? "UPDATE" : "CREATE", entity: "TYPE", typeCode: normalized.code, before: editingType, after: normalized });
    setSelectedTypeCode(normalized.code);
    setDrawerMode(null);
  };

  const saveValue = (data: any) => {
    if (!selectedType) return;
    if (data.__validationError__) {
      setFormError(data.__validationError__);
      return;
    }
    if (data.effectiveFrom && data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
      setFormError(lang === "zh" ? "Effective To 必须晚于或等于 Effective From。" : "Effective To must be greater than or equal to Effective From.");
      return;
    }
    const isEdit = drawerMode === "value-edit" && editingValue;
    const code = normalizeCode(data.code);
    const duplicate = selectedTypeValues.some((value) => value.code === code && value.id !== editingValue?.id);
    if (duplicate) {
      setFormError(lang === "zh" ? "Value Code 在当前类型下必须唯一。" : "Value Code must be unique within this type.");
      return;
    }
    const normalized: CustomConfigItem = {
      ...(isEdit ? editingValue : {}),
      id: isEdit ? editingValue.id : `cfgvalue-${selectedType.code}-${code}`,
      categoryId: selectedType.id,
      code: isEdit ? editingValue.code : code,
      name: String(data.name || "").trim(),
      description: data.description || "",
      parentValueCode: data.parentValueCode || "",
      effectiveFrom: data.effectiveFrom || "",
      effectiveTo: data.effectiveTo || "",
      usageCount: editingValue?.usageCount || 0,
      referencedBy: editingValue?.referencedBy || [],
      status: data.status || "Active",
      sortOrder: Number(data.sortOrder || editingValue?.sortOrder || selectedTypeValues.length + 1),
      remark: data.remark || "",
      createdBy: editingValue?.createdBy || "Current User",
      createdAt: editingValue?.createdAt || nowStamp(),
      updatedBy: "Current User",
      updatedAt: nowStamp(),
    };
    const nextTypes = ensureTypePersisted(selectedType);
    const currentValues = state.customConfigItems || [];
    const nextValues = isEdit
      ? currentValues.map((item) => item.id === normalized.id ? normalized : item)
      : [...currentValues, normalized];
    persist({ customConfigCategories: nextTypes, customConfigItems: nextValues }, { action: isEdit ? "UPDATE" : "CREATE", entity: "VALUE", typeCode: selectedType.code, valueCode: normalized.code, before: editingValue, after: normalized });
    setDrawerMode(null);
  };

  const deleteSelected = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "type") {
      const type = configTypes.find((item) => item.id === deleteTarget.id);
      if (!type || type.isSystem) {
        setFormError(labels.cannotDeleteSystem);
        setDeleteTarget(null);
        return;
      }
      persist({
        customConfigCategories: (state.customConfigCategories || []).filter((item) => item.id !== deleteTarget.id),
        customConfigItems: (state.customConfigItems || []).filter((item) => item.categoryId !== deleteTarget.id),
      }, { action: "DELETE", entity: "TYPE", typeCode: type.code, before: type });
      if (selectedType?.id === deleteTarget.id) setSelectedTypeCode("COUNTRY");
    } else {
      const value = configValues.find((item) => item.id === deleteTarget.id);
      if (!value || !selectedType) return;
      persist({
        customConfigItems: (state.customConfigItems || []).filter((item) => item.id !== deleteTarget.id),
      }, { action: "DELETE", entity: "VALUE", typeCode: selectedType.code, valueCode: value.code, before: value });
    }
    setDeleteTarget(null);
  };

  const exportCsv = () => {
    const rows = [
      ["Type Code", "Type Name", "Category", "Value Code", "Value Name", "Display Order", "Active"],
      ...configTypes.flatMap((type) => configValues.filter((value) => value.categoryId === type.id).map((value) => [
        type.code,
        type.name,
        type.category || "",
        value.code,
        value.name,
        String(value.sortOrder || 0),
        value.status,
      ])),
    ];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "configuration-center.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const typeFields = [
    { key: "code", label: labels.typeCode, required: true, disabled: drawerMode === "type-edit" },
    { key: "name", label: labels.typeName, required: true },
    { key: "category", label: t(lang, "category"), type: "select" as const, options: categoryOptions },
    { key: "description", label: t(lang, "description"), type: "textarea" as const, full: true },
    { key: "isSystem", label: labels.isSystem, type: "select" as const, options: yesNoOptions, disabled: drawerMode === "type-edit" },
    { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
    { key: "sortOrder", label: t(lang, "sortOrder"), type: "numeric" as const },
    { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
  ];

  const valueFields = [
    { key: "code", label: labels.valueCode, required: true, disabled: drawerMode === "value-edit" },
    { key: "name", label: labels.valueName, required: true },
    { key: "sortOrder", label: labels.displayOrder, type: "numeric" as const },
    { key: "description", label: t(lang, "description"), type: "textarea" as const, full: true },
    { key: "parentValueCode", label: labels.parentValueCode, type: "select" as const, options: ["", ...selectedTypeValues.filter((value) => value.id !== editingValue?.id).map((value) => value.code)] },
    { key: "effectiveFrom", label: labels.effectiveFrom },
    { key: "effectiveTo", label: labels.effectiveTo },
    { key: "status", label: t(lang, "status"), type: "select" as const, options: statusOptions },
    { key: "remark", label: t(lang, "remark"), type: "textarea" as const, full: true },
  ];

  const drawerValues = drawerMode?.startsWith("type")
    ? {
      ...(editingType || {}),
      isSystem: editingType?.isSystem ? "Yes" : "No",
      status: editingType?.status || "Active",
      category: editingType?.category || "Custom",
      sortOrder: editingType?.sortOrder || configTypes.length + 1,
    }
    : {
      ...(editingValue || {}),
      status: editingValue?.status || "Active",
      sortOrder: editingValue?.sortOrder || selectedTypeValues.length + 1,
    };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <div className="flex flex-wrap justify-end gap-1.5">
          <button onClick={exportCsv} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Download size={14} />
            {labels.export}
          </button>
          <button onClick={() => setFormError(labels.importPlaceholder)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <FileUp size={14} />
            {labels.import}
          </button>
          <button onClick={() => openTypeDrawer()} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
            <Plus size={14} />
            {labels.createType}
          </button>
        </div>
      </div>

      {formError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-soft" placeholder={labels.search} />
        </div>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-md border border-input bg-card px-3 py-2 text-sm">
          <option value="All">{labels.allCategories}</option>
          {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-input bg-card px-3 py-2 text-sm">
          <option value="All">{labels.allStatuses}</option>
          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <SlidersHorizontal size={18} className="text-brand" />
          <h3 className="font-semibold">{labels.typeList}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-muted/70">
              <tr>
                {[labels.typeCode, labels.typeName, t(lang, "category"), t(lang, "description"), labels.isSystem, labels.active, labels.values, t(lang, "actions")].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleTypes.map((type) => (
                <tr key={type.id} className={selectedType?.id === type.id ? "bg-brand-soft/50" : "hover:bg-muted/40"}>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => setSelectedTypeCode(type.code)} className="font-medium text-brand hover:underline">{type.code}</button>
                  </td>
                  <td className="px-4 py-3 text-sm">{type.name}</td>
                  <td className="px-4 py-3 text-sm">{type.category || "Custom"}</td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-sm text-muted-foreground" title={type.description}>{type.description || "-"}</td>
                  <td className="px-4 py-3 text-sm">{type.isSystem ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${type.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{type.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{typeValueCounts[type.id] || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openTypeDrawer(type)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft" title={t(lang, "edit")}>
                        <Edit size={14} />
                      </button>
                      <button disabled={type.isSystem} onClick={() => setDeleteTarget({ kind: "type", id: type.id })} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" title={t(lang, "delete")}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedType && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Settings2 size={18} className="text-brand" />
              <div>
                <h3 className="font-semibold">{labels.valueList}: {selectedType.code}</h3>
                <p className="text-xs text-muted-foreground">{selectedType.name}</p>
              </div>
            </div>
            <button onClick={() => openValueDrawer()} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
              <Plus size={14} />
              {labels.addValue}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-muted/70">
                <tr>
                  {[labels.valueCode, labels.valueName, labels.displayOrder, labels.parentValueCode, labels.effectiveFrom, labels.effectiveTo, labels.active, labels.usage, t(lang, "actions")].map((head) => (
                    <th key={head} className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedTypeValues.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">{t(lang, "noData")}</td></tr>
                ) : selectedTypeValues.map((value) => (
                  <tr key={value.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm font-medium">{value.code}</td>
                    <td className="px-4 py-3 text-sm">{value.name}</td>
                    <td className="px-4 py-3 text-sm">{value.sortOrder || 0}</td>
                    <td className="px-4 py-3 text-sm">{value.parentValueCode || "-"}</td>
                    <td className="px-4 py-3 text-sm">{value.effectiveFrom || "-"}</td>
                    <td className="px-4 py-3 text-sm">{value.effectiveTo || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${value.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{value.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span title={(value.referencedBy || []).join(", ")}>
                        {(value.usageCount || 0) > 0 ? `${labels.inUse} (${value.usageCount})` : labels.noUsage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openValueDrawer(value)} className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft" title={t(lang, "edit")}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget({ kind: "value", id: value.id })} className="inline-flex items-center justify-center rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50" title={t(lang, "delete")}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold">{labels.audit}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="bg-muted/70">
              <tr>
                {[labels.timestamp, labels.user, labels.action, labels.entity, labels.object, labels.detail].map((head) => (
                  <th key={head} className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(state.audit || []).filter((entry) => entry.module === "Configuration Center").slice(0, 8).map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-sm">{entry.time}</td>
                  <td className="px-4 py-3 text-sm">{entry.user}</td>
                  <td className="px-4 py-3 text-sm">{entry.action}</td>
                  <td className="px-4 py-3 text-sm">{entry.objectType}</td>
                  <td className="px-4 py-3 text-sm">{entry.objectName}</td>
                  <td className="max-w-[360px] truncate px-4 py-3 text-sm text-muted-foreground" title={entry.detail}>{entry.detail}</td>
                </tr>
              ))}
              {(state.audit || []).filter((entry) => entry.module === "Configuration Center").length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">{t(lang, "noData")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawerMode && (
        <DrawerForm
          title={drawerMode.startsWith("type") ? (drawerMode === "type-add" ? labels.createType : `${t(lang, "edit")} ${labels.typeList}`) : (drawerMode === "value-add" ? labels.addValue : `${t(lang, "edit")} ${labels.valueList}`)}
          fields={drawerMode.startsWith("type") ? typeFields : valueFields}
          values={drawerValues}
          error={formError}
          onSave={drawerMode.startsWith("type") ? saveType : saveValue}
          onClose={() => {
            setDrawerMode(null);
            setEditingType(null);
            setEditingValue(null);
            setFormError("");
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={t(lang, "confirmDelete")}
          message={deleteTarget.kind === "type" ? labels.confirmDeleteType : labels.confirmDeleteValue}
          onConfirm={deleteSelected}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
