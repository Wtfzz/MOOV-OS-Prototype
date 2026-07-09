// MOOV OS P1 类型定义

export interface User {
  id: string;
  userNumber: string; // User number, unique
  name: string; // Full legal name
  email?: string; // Company email, unique
  phone?: string; // Contact phone
  roleIds: string[]; // Multi-select role IDs
  workGroupIds: string[]; // Multi-select work group IDs
  organizationIds?: string[]; // Legacy compatibility only
  active: boolean;
  temporaryPasswordIssued?: boolean;
  forcePasswordChange?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Role {
  id: string; // Role_ID - short unique identifier
  roleNumber: string; // Auto-generated, read-only
  roleName: string; // Display name
  roleType: 'System' | 'Operations' | 'Customer Service' | 'Finance' | 'Warehouse' | 'Management' | 'Other';
  description?: string;
  active: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Org {
  id: string;
  orgNumber?: string;
  orgName: string;
  orgType: 'Internal' | 'External' | 'Partner' | 'MOOV Team' | 'OHA Team' | 'Regional Team' | 'Functional Team';
  parentId?: string;
  region: string;
  country: string;
  functionTeam: string;
  owner: string;
  sourceSystem?: 'Manual' | 'OrgSystem' | 'PartnerMaster';
  externalOrgId?: string;
  syncStatus?: 'Manual' | 'Synced' | 'Stale' | 'Error';
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface ProcessTemplate {
  id: string;
  templateName: string;
  // Legacy fields for backward compatibility
  customer: string;
  pol: string;
  pod: string;
  lane: string;
  transportMode: string;
  region: string;
  // New dynamic subject values
  subjectValues?: Record<string, string>;
  effectiveDate: string;
  version: string;
  tags: string;
  status: 'Active' | 'Inactive' | 'Draft';
  remark?: string;
}

// Template Subject Field Configuration - PRD: Dynamic template dimensions
export type SubjectFieldType = 'select' | 'multiselect' | 'text';
export type SubjectFieldSource = 'customers' | 'locations' | 'transportModes' | 'organizations' | 'countries' | 'regions';

export interface TemplateSubjectField {
  key: string;
  label: string;
  type: SubjectFieldType;
  source?: SubjectFieldSource;
  required: boolean;
  enabled: boolean;
  sortOrder: number;
  options?: string[]; // For static options
}

// SLA Rule Structure - PRD: Calculable SLA rules
export type SlaDirection = 'Before' | 'After';
export type SlaUnit = 'Hours' | 'Days' | 'Workday' | 'Business Days' | 'Months';
export type ApplicableBusiness = 'Pepco' | 'LIDL US' | 'LIDL FOOD' | 'LIDL Non-FOOD';
export type WorkCalendarType = 'Standard' | 'Local Adjustment';
export type BaseDateCode =
  | 'PO_CREATED'
  | 'CRD'
  | 'ETD'
  | 'ETA'
  | 'LDD'
  | 'MILESTONE_START'
  | 'TASK_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'SHIPMENT_CREATED'
  | 'HOD'
  | 'BOOKING_RECEIVED'
  | 'BOOKING_APPROVAL'
  | 'PEPCO_SCORING'
  | 'SO_RELEASE'
  | 'CONTAINER_LOADING'
  | 'SI_CUTOFF'
  | 'DEPARTURE';

export interface SlaRule {
  baseDateCode: BaseDateCode;
  direction: SlaDirection;
  offsetValue: number;
  offsetUnit: SlaUnit;
  calendarCode?: string; // Reference to work calendar
  reminderValue?: number;
  reminderUnit?: SlaUnit;
}

// Helper function to format SLA rule as readable text
export function formatSlaRule(rule: SlaRule, lang: 'zh' | 'en' = 'zh'): string {
  const directionText = lang === 'en'
    ? (rule.direction === 'Before' ? 'before' : 'after')
    : (rule.direction === 'Before' ? '前' : '后');
  const unitText = lang === 'en'
    ? (rule.offsetUnit === 'Business Days' ? 'Workday' : rule.offsetUnit)
    : rule.offsetUnit === 'Hours' ? '小时'
      : rule.offsetUnit === 'Days' ? '自然日'
      : rule.offsetUnit === 'Workday' || rule.offsetUnit === 'Business Days' ? '工作日'
      : '月';
  return `${rule.baseDateCode}${directionText}${rule.offsetValue}${unitText}`;
}

export interface Milestone {
  id: string;
  templateId: string;
  milestoneSeq: number; // Sequence number for ordering
  milestoneName: string;
  predecessor: string;
  sla: string | SlaRule; // Legacy field for backward compatibility
  slaTypeId?: string; // Reference to SlaTypeConfig (new primary field)
  skippable: 'Yes' | 'No';
  skipCondition: string;
  requiredFiles: string;
  automation: 'Manual' | 'Semi-auto' | 'Auto';
  status: 'Active' | 'Inactive';
}

// Milestone Task - PRD: Task level under Milestone
export interface MilestoneTask {
  id: string;
  templateId: string;
  milestoneId: string;
  customer?: string;
  taskName: string;
  taskType: string;
  sla: string | SlaRule; // Legacy field for backward compatibility
  slaTypeId?: string; // Reference to SlaTypeConfig (new primary field)
  requiredFiles: string;
  automation: 'Manual' | 'Semi-auto' | 'Auto';
  status: 'Active' | 'Inactive' | 'Draft';
  remark?: string;
}

export interface WorkAssignmentRule {
  id: string;
  objectType: string;
  customer: string;
  taskType: string;
  region: string;
  country: string;
  pol: string;
  pod: string;
  lane: string;
  transportMode: string;
  assignmentLevel: string;
  target: string;
  manualAdjust: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Inactive' | 'Draft';
  // New fields for Task-level assignment
  templateId?: string;
  milestoneId?: string;
  milestoneTaskId?: string;
  remark?: string;
}

// Two-tier Assignment Rules - PRD v2.0
export interface TeamAssignmentRule {
  id: string;
  customers?: string[];
  regions?: string[];
  countries?: string[];
  templateId?: string;
  targetWorkGroupId?: string;
  customer?: string;
  originRegion?: string;
  destinationRegion?: string;
  pol?: string;
  pod?: string;
  lane?: string;
  transportMode?: string;
  exceptionType?: string;
  priority?: 'High' | 'Medium' | 'Low';
  targetTeam: string; // Team / Department / Queue
  assignerRole?: 'Department Head' | 'Operation Manager' | 'Admin';
  scopeOwnerRole?: 'Department Head' | 'Admin';
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface UserAssignmentRule {
  id: string;
  workGroupId?: string;
  customers?: string[];
  regions?: string[];
  countries?: string[];
  pols?: string[];
  teamId: string; // Legacy team/work group reference
  templateId?: string;
  milestoneId?: string;
  taskId?: string;
  taskType?: string;
  roleRequired?: string;
  targetUser: string; // Specific user
  backupUser?: string;
  workloadStrategy?: 'Round Robin' | 'Least Loaded' | 'Manual';
  assignerRole?: 'Team Leader' | 'Team Manager';
  scopeOwnerRole?: 'Team Leader';
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface FallbackAssignmentRule {
  id: string;
  condition: string;
  fallbackQueue: string;
  escalationRole: string;
  escalationSla: string;
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface AllocationRule {
  id: string;
  customer: string;
  lane: string;
  carrier: string;
  transportMode: string;
  effectiveFrom: string;
  effectiveTo: string;
  allocationShare: string;
  capacityThreshold: string;
  priority: 'High' | 'Medium' | 'Low';
  overrideRule: string;
  reasonCode: string;
  status: 'Active' | 'Inactive' | 'Draft';
  remark?: string;
}

// Transport Mode - PRD: Basic Config Tab
export interface TransportMode {
  id: string;
  code: string;
  name: string;
  applicableRegion: string;
  status: 'Active' | 'Inactive';
  remark?: string;
}

// Exception Type - PRD: Basic Config Tab
export interface ExceptionType {
  id: string;
  code: string;
  name: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  defaultSla: string;
  escalation: boolean;
  status: 'Active' | 'Inactive';
  remark?: string;
}

// SLA Type Config - PRD: Basic Config Tab (uses SlaRule structure)
export interface SlaTypeConfig {
  id: string;
  slaRule: SlaRule;
  applicableBusinesses?: ApplicableBusiness[];
  calendarCode?: string;
  objectScope?: 'Task' | 'Milestone' | 'Booking' | 'Shipment';
  reminderThreshold?: number;
  reminderUnit?: SlaUnit;
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface WorkCalendarConfig {
  id: string;
  calendarCode: string;
  calendarName: string;
  calendarType: WorkCalendarType;
  timezone: string;
  workingWeek: string[];
  extraHolidays: string[];
  extraWorkingDays: string[];
  applicableWorkGroups: string[];
  applicableUsers: string[];
  status: 'Active' | 'Inactive';
  remark?: string;
}

// Reason Code - PRD: Basic Config Tab
export interface ReasonCode {
  id: string;
  code: string;
  name: string;
  scenario: string;
  remarkRequired: boolean;
  status: 'Active' | 'Inactive';
  remark?: string;
}

// Notification Template - PRD: Basic Config Tab
export interface NotificationTemplate {
  id: string;
  templateName: string;
  notificationType: 'System Message' | 'Task Reminder' | 'Task Completion' | 'SLA Reminder' | 'Exception Alert';
  scenario: string;
  channel: 'In-app' | 'Email' | 'Both';
  subject: string;
  body: string;
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface EmailNotificationTemplate {
  id: string;
  templateName: string;
  clientCode: string;
  processTemplateId: string;
  milestoneId?: string;
  taskId?: string;
  triggerEvent: 'Task Created' | 'Task Completed' | 'Milestone Delayed' | 'Exception Raised' | 'Manual Send';
  subject: string;
  body: string;
  status: 'Active' | 'Inactive';
  remark?: string;
}

export interface CustomConfigCategory {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  isSystem?: boolean;
  status: 'Active' | 'Inactive';
  sortOrder: number;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CustomConfigItem {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  description?: string;
  parentValueCode?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  usageCount?: number;
  referencedBy?: string[];
  status: 'Active' | 'Inactive';
  sortOrder: number;
  remark?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Legacy generic config item (for backward compatibility)
export interface ConfigItem {
  id: string;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  time: string;
  userId: string;
  user: string;
  action: string;
  module: string;
  objectType: string;
  objectName: string;
  detail: string;
  status: string;
  ip: string;
  sessionId: string;
}

export interface Session {
  id: string;
  userEmail: string;
  device: string;
  browser: string;
  ip: string;
  loginAt: string;
  lastActivity: string;
  current: boolean;
  endedAt?: string;
}

export interface LoginHistory {
  id: string;
  userEmail: string;
  userName: string;
  ip: string;
  timestamp: string;
  status: string;
}

export interface AppState {
  users: User[];
  roles: Role[];
  orgs: Org[];
  organizationDataScopes: OrganizationDataScope[];
  workGroups: WorkGroup[];
  workflows: any[];
  assignmentRules: any[];
  // Legacy generic configs (backward compatibility, not primary display)
  configs: any[];
  processTemplates: ProcessTemplate[];
  milestones: Milestone[];
  milestoneTasks: MilestoneTask[];
  workAssignmentRules: WorkAssignmentRule[];
  allocationRules: AllocationRule[];
  // Basic Config - Independent tabs per PRD
  transportModes: TransportMode[];
  exceptionTypes: ExceptionType[];
  workCalendars: WorkCalendarConfig[];
  slaTypeConfigs: SlaTypeConfig[];
  reasonCodes: ReasonCode[];
  notificationTemplates: NotificationTemplate[];
  emailNotificationTemplates: EmailNotificationTemplate[];
  customConfigCategories: CustomConfigCategory[];
  customConfigItems: CustomConfigItem[];
  templateSubjectFields: TemplateSubjectField[]; // Template subject dimension configuration
  files: ConfigItem[];
  // Master Data domains per PRD
  clients: Client[];
  organizations: Organization[];
  carriers: Carrier[];
  locations: Location[];
  products: Product[];
  equipment: Equipment[];
  vessels: Vessel[];
  voyages: any[];
  services: Service[];
  audit: AuditLog[];
  sessions: Session[];
  loginHistory: LoginHistory[];
}

// Permission Management Types - PRD v2.0
export type PermissionAction = 'View' | 'Add' | 'Modify' | 'Delete';

export interface MenuPermission {
  menuId: string;
  menuName: string;
  subMenus?: SubMenuPermission[];
  permissions: Record<PermissionAction, boolean>;
}

export interface SubMenuPermission {
  subMenuId: string;
  subMenuName: string;
  permissions: Record<PermissionAction, boolean>;
}

export interface RolePermissions {
  roleId: string;
  permissions: MenuPermission[];
}

export interface OrganizationDataScope {
  id: string;
  organizationId: string;
  clientIds: string[];
  countries: string[];
  regions: string[];
  allData?: boolean;
  active: boolean;
}

export type WorkGroupType = 'Operations' | 'Customer Service' | 'OHA' | 'Finance' | 'Warehouse' | 'Management' | 'Other';
export type WorkGroupFilterField = 'Client' | 'Region' | 'Country' | 'POL' | 'POD' | 'Transport Mode';
export type WorkGroupFilterOperator = '=' | '!=' | 'IN' | 'NOT IN' | '<=' | '>=' | 'BETWEEN';

export interface WorkGroupDataScopeFilter {
  id: string;
  field: WorkGroupFilterField;
  operator: WorkGroupFilterOperator;
  values: string[];
}

export interface WorkGroup {
  id: string;
  workGroupNumber: string;
  workGroupName: string;
  workGroupType: WorkGroupType;
  owner: string;
  description?: string;
  status: 'Active' | 'Inactive';
  filters: WorkGroupDataScopeFilter[];
  taskQueueEnabled?: boolean;
  assignmentEnabled?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EffectiveDataScope {
  allData: boolean;
  clientIds: Set<string>;
  clientCodes: Set<string>;
  countries: Set<string>;
  regions: Set<string>;
  pols: Set<string>;
  pods: Set<string>;
  transportModes: Set<string>;
}

export interface PageAccess {
  canView: boolean;
  canAdd: boolean;
  canModify: boolean;
  canDelete: boolean;
}

// System Menu Structure for Permission Configuration
export interface SystemMenu {
  id: string;
  name: string;
  subMenus?: SystemSubMenu[];
}

export interface SystemSubMenu {
  id: string;
  name: string;
}

export type ClientType = 'Global' | 'Country';
export type ClientStatus = 'Active' | 'Inactive' | 'Prospect' | 'On Hold';

// Client master data
export interface ClientAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}

export interface Client {
  [key: string]: any;
  id: string;
  clientId: number;
  clientName: string;
  clientCode: string;
  clientType: ClientType;
  operationalCountry?: string;
  industrySector?: string;
  status: ClientStatus;
  invoiceLegalEntity: string;
  invoiceCurrency: string;
  paymentTerms?: string;
  taxRegistrationNumber?: string;
  billingAddress?: string;
  invoiceFormat?: string;
  creditLimit?: number;
  discountProfile?: string;
  address?: ClientAddress;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  timezone?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  active: boolean;
  notes?: string;
  // Backward-compatible aliases used by existing related modules.
  customerCode: string;
  customerName: string;
}

// Business Partner (formerly Organization) - Simplified partner master data
export interface OrganizationAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
}

export interface Organization {
  [key: string]: any;
  id: string;
  organizationCode: string; // Primary key - unique code (3-char)
  organizationName: string; // Full name of business partner
  address?: OrganizationAddress;
  organizationType: 'Supplier' | 'Producer' | 'Trucker';
  client?: string; // LINK: Client Master (renamed from customer)
  contactPerson?: string;
  contactEmail?: string;
  active: boolean;
}

// Carrier - Separate Master Data for carriers/shipping lines
export interface Carrier {
  [key: string]: any;
  id: string;
  carrierCode: string; // Primary key - unique code
  carrierName: string;
  scac: string; // Standard Carrier Alpha Code
  mode: 'OCEAN' | 'AIR' | 'Truck';
  country: string;
  active: boolean;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
}

// Location - PRD 5.2.3
export interface Location {
  [key: string]: any;
  id: string;
  locationId: string;
  locationName: string;
  locationType: 'Port' | 'Airport' | 'Warehouse' | 'Depot' | 'Yard' | 'Office' | 'City' | 'Country' | 'Region';
  unLocode?: string;
  iataCode?: string;
  country: string;
  region: string;
  timezone?: string;
  terminals?: string;
  parentLocation?: string;
  active: boolean;
}

// Product - PRD 5.2.4
export interface Product {
  [key: string]: any;
  id: string;
  productId: string; // SKU ID (primary key)
  productCode: string;
  alternativeProductCode?: string;
  productDescription: string;
  commodityCode?: string;
  hazardousMaterialFlag: boolean;
  unNumber?: string;
  dangerousGoods?: 'Y' | 'N';
  defaultWeight?: number;
  width?: number; // cm
  height?: number; // cm
  length?: number; // cm
  active: boolean;
}

// Equipment - PRD 5.2.5
export interface Equipment {
  [key: string]: any;
  id: string;
  equipmentID?: number;
  equipmentId: string;
  equipmentCode: string;
  equipmentType: 'Container' | 'Trailer' | 'Railcar' | 'Aircraft Container' | 'Vehicle' | 'Flatbed' | 'Tank' | 'Other';
  equipmentCategory: string;
  equipmentStatus: 'Available' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Scrapped' | 'Lost';
  ownerType: 'Owned' | 'Leased' | 'Rented' | 'Customer Owned';
  ownerCarrierProfile?: string | number;
  active: boolean;
  length?: number;
  lengthFt?: number;
  widthFt?: number;
  height?: number;
  heightFt?: number;
  weightTare?: number;
  maxPayloadGrossWeight?: number;
  teuCapacity?: number;
  volumeCapacityCBM?: number;
  containerTypeUnitType?: 'FCL' | 'LCL' | 'Hazmat' | 'Reefer' | string;
  isHazardousApproved?: boolean;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Vessel/Voyage - PRD 5.2.6
export interface Vessel {
  [key: string]: any;
  id: string;
  vesselId: string;
  vesselName: string;
  vesselCode?: string;
  vesselType?: string;
  imoNumber?: string;
  vesselStatus?: string;
  flagState?: string;
  ownerOperator?: string;
  teuCapacity?: number;
  lengthOverallLoa?: number;
  beam?: number;
  draft?: number;
  voyageNumber?: string;
  carrier?: string; // LINK: Organization Master
  schedule?: string;
  active: boolean;
}

// Service - PRD 5.2.7
export interface Service {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  serviceType: 'FCL' | 'LCL' | 'Air' | 'Rail' | 'Road' | 'Door-to-Door' | 'Other';
  transportMode: 'Ocean' | 'Air' | 'Rail' | 'Road' | 'Multimodal';
  transitTimeMin?: number;
  transitTimeMax?: number;
  pol?: string; // LINK: Location Master
  pod?: string; // LINK: Location Master
  tsPorts?: string;
  defaultOrganization?: string; // LINK: Organization Master
  active: boolean;
}

export interface CurrentUser {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  team: string;
  department: string;
  phone: string;
  sessionId: string;
}

import type { LucideIcon } from "lucide-react";

export interface PageConfig {
  id: string;
  label: string;
  icon: LucideIcon | string;
  type: 'home' | 'profile' | 'iam' | 'workflowConfig' | 'systemConfig' | 'table' | 'audit' | 'reserved';
  table?: string;
  group?: string;
  externalUrl?: string;
}

export interface TableConfig {
  title: string;
  subtitle: string;
  primary: string;
  search: string;
  filters: Array<{ key: string; label: string; all: string }>;
  columns: Array<{ key: string; label: string; badge?: boolean }>;
  fields: Array<{
    key: string;
    label: string;
    type?: string;
    options?: string[];
    required?: boolean;
    full?: boolean;
    placeholder?: string;
  }>;
}

// PO Management - Order Management
export interface POItem {
  itemNumber: string;
  tcId: string;
  orderedOuterCartons: number;
  orderedInnerCartons: number;
  orderedPieces: number;
  orderedVolumeCbm: number;
  bookedOuterCartons?: number;
  bookedInnerCartons?: number;
  bookedPieces?: number;
  outerSizeLWH?: string;
  bookedVolumeCbm?: number;
  grossWeightKg?: number;
}

export interface CarrierBookingInfo {
  shipmentRef: string;
  bookingNumber: string;
  blNumber: string;
  shippedTogetherWith: string[];
  carrier: string;
  vesselVoyage: string;
  contractNumber: string;
  shippedTeu: number;
  week: string;
  bookedEtd: string;
  bookedEta: string;
  atd: string;
  ata: string;
  containers: string;
  shippedContainers: string;
  transportStatus: string;
}

export interface LocationInfo {
  originCountry: string;
  originPort: string;
  destinationPort: string;
  requestedBookingDate: string;
  handoverDate: string;
  ahod: string;
  incoterm: string;
  namedPlace: string;
  transportMode: string;
  originLocationBooked: string;
  originPortBooked: string;
  destinationPortBooked: string;
  destinationLocationBooked: string;
  destinationDc: string;
}

export interface PartyInfo {
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  notifyPartyName: string;
  notifyPartyAddress: string;
  supplierContact: string;
  supplierEmail: string;
}

export interface MilestoneInfo {
  milestoneName: string;
  plannedDate: string;
  actualDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
  remark?: string;
}

export interface DocumentInfo {
  documentType: string;
  documentName: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface TransportPlanHistory {
  version: string;
  createdDate: string;
  createdBy: string;
  changes: string;
  status: 'Active' | 'Superseded';
}

export interface ChangeLogEntry {
  changeDate: string;
  changedBy: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface CommentEntry {
  commentDate: string;
  commentedBy: string;
  content: string;
}

export interface PORecord {
  id: string;
  orderNumber: string;
  supplierName: string;
  pendingStatus: 'Destination In Process' | 'Cancel' | 'Hold' | 'Completed';
  processProgress: number; // 0-100
  processTotal: number;
  hod: string;
  plannedCrd: string;
  supplierCrd: string;
  ahod: string;
  inDcDate: string;
  bookingDate?: string;
  bookedEtd?: string;
  bookedEta?: string;
  etd?: string;
  eta?: string;
  atd?: string;
  ata?: string;
  poTag?: string[];
  containerNo?: string;
  merchCode?: string;
  items: POItem[];
  bookedOuterCartons?: number;
  bookedInnerCartons?: number;
  bookedPieces?: number;
  outerSizeLWH?: string;
  bookedVolumeCbm?: number;
  grossWeightKg?: number;
  // Sub-tab data
  generalInfo?: {
    customerPoNumber: string;
    poCreationDate: string;
    poType: string;
    currency: string;
    totalValue: number;
    paymentTerms: string;
    deliveryTerms: string;
    remarks: string;
  };
  locationInfo?: LocationInfo;
  partyInfo?: PartyInfo;
  carrierBooking?: CarrierBookingInfo;
  milestones?: MilestoneInfo[];
  documents?: DocumentInfo[];
  transportPlanHistory?: TransportPlanHistory[];
  changeLog?: ChangeLogEntry[];
  comments?: CommentEntry[];
  cargoReadyDate?: string;
  actualHandoverDate?: string;
}

export interface AppState {
  users: User[];
  roles: Role[];
  orgs: Org[];
  organizationDataScopes: OrganizationDataScope[];
  workGroups: WorkGroup[];
  workflows: any[];
  assignmentRules: any[];
  // Legacy generic configs (backward compatibility, not primary display)
  configs: any[];
  processTemplates: ProcessTemplate[];
  milestones: Milestone[];
  milestoneTasks: MilestoneTask[];
  workAssignmentRules: WorkAssignmentRule[];
  // Two-tier Assignment Rules - PRD v2.0
  teamAssignmentRules: TeamAssignmentRule[];
  userAssignmentRules: UserAssignmentRule[];
  fallbackAssignmentRules: FallbackAssignmentRule[];
  allocationRules: AllocationRule[];
  // Basic Config - Independent tabs per PRD
  transportModes: TransportMode[];
  exceptionTypes: ExceptionType[];
  workCalendars: WorkCalendarConfig[];
  slaTypeConfigs: SlaTypeConfig[];
  reasonCodes: ReasonCode[];
  notificationTemplates: NotificationTemplate[];
  emailNotificationTemplates: EmailNotificationTemplate[];
  customConfigCategories: CustomConfigCategory[];
  customConfigItems: CustomConfigItem[];
  templateSubjectFields: TemplateSubjectField[]; // Template subject dimension configuration
  files: ConfigItem[];
  // Master Data domains per PRD
  clients: Client[];
  organizations: Organization[];
  carriers: Carrier[];
  locations: Location[];
  products: Product[];
  equipment: Equipment[];
  vessels: Vessel[];
  voyages: any[];
  services: Service[];
  // Business Execution
  purchaseOrders: PORecord[];
  audit: AuditLog[];
  sessions: Session[];
  loginHistory: LoginHistory[];
  // Permission Management - PRD v2.0
  rolePermissions: RolePermissions[];
}
