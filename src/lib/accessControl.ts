import type {
  AppState,
  Client,
  CurrentUser,
  EffectiveDataScope,
  Organization,
  OrganizationDataScope,
  PermissionAction,
  PORecord,
  Role,
  RolePermissions,
  WorkGroup,
  WorkGroupDataScopeFilter,
} from "@/types";
import { pageCatalog } from "@/app/pageCatalog";

const roleAliases: Record<string, string> = {
  Admin: "ADMIN",
  "System Admin": "ADMIN",
  Ops: "OPS",
  Operations: "OPS",
  OHA: "OHA",
  "OHA Partner": "OHA",
  "Allocation Manager": "ALLOC_MGR",
  "Team Manager": "TEAM_MGR",
  CS: "CS",
  "Customer Service": "CS",
  Finance: "FINANCE",
  "Vendor Manager": "VENDOR_MGR",
  "WMS User": "WMS_USER",
};

export const permissionActions: PermissionAction[] = ["View", "Add", "Modify", "Delete"];

export function getAllPageIds(): string[] {
  return pageCatalog.flatMap((group) => group.items.map((item) => item.id));
}

const rolePageGrants: Record<string, string[]> = {
  OPS: [
    "master-customers",
    "master-organizations",
    "master-carriers",
    "master-locations",
    "master-products",
    "master-equipment",
    "master-vessels",
    "execution-po",
    "execution-shipment",
    "tasks-my",
    "tasks-team",
    "quality-exceptions",
    "reports-task",
  ],
  ALLOC_MGR: [
    "master-customers",
    "master-organizations",
    "master-carriers",
    "master-locations",
    "master-products",
    "master-equipment",
    "master-vessels",
    "execution-po",
    "execution-allocation",
    "execution-shipment",
    "tasks-my",
    "tasks-team",
    "tasks-sla",
    "tasks-assignment",
    "quality-exceptions",
    "quality-sla",
    "reports-task",
    "reports-exception",
    "reports-workload",
  ],
  TEAM_MGR: [
    "master-customers",
    "master-organizations",
    "master-locations",
    "master-products",
    "execution-po",
    "execution-shipment",
    "tasks-my",
    "tasks-team",
    "tasks-sla",
    "tasks-assignment",
    "quality-exceptions",
    "reports-task",
    "reports-workload",
  ],
  CS: ["master-customers", "master-organizations", "execution-shipment", "tasks-my", "quality-exceptions", "reports-task"],
  OHA: ["execution-shipment", "tasks-my"],
  FINANCE: ["execution-allocation", "reports-task", "reports-export"],
  VENDOR_MGR: ["master-organizations", "execution-allocation", "reports-workload", "reports-export"],
  WMS_USER: ["execution-shipment", "tasks-my"],
};

const editableRoles = new Set(["OPS", "ALLOC_MGR", "TEAM_MGR", "VENDOR_MGR"]);

export function buildDefaultRolePermissions(role: Role): RolePermissions {
  const isAdmin = role.id === "ADMIN" || role.roleName === "System Admin";
  const pageGrants = new Set(isAdmin ? getAllPageIds() : rolePageGrants[role.id] || []);
  const canEdit = editableRoles.has(role.id);

  return {
    roleId: role.id,
    permissions: pageCatalog.map((group) => ({
      menuId: group.group,
      menuName: group.group,
      permissions: {
        View: isAdmin || group.items.some((item) => pageGrants.has(item.id)),
        Add: isAdmin || group.items.some((item) => pageGrants.has(item.id)) && canEdit,
        Modify: isAdmin || group.items.some((item) => pageGrants.has(item.id)) && canEdit,
        Delete: isAdmin,
      },
      subMenus: group.items.map((item) => ({
        subMenuId: item.id,
        subMenuName: item.label,
        permissions: {
          View: isAdmin || pageGrants.has(item.id),
          Add: isAdmin || (pageGrants.has(item.id) && canEdit),
          Modify: isAdmin || (pageGrants.has(item.id) && canEdit),
          Delete: isAdmin,
        },
      })),
    })),
  };
}

export function resolveIamUser(state: AppState, currentUser: CurrentUser) {
  return state.users.find((user) => user.email?.toLowerCase() === currentUser.email.toLowerCase());
}

export function resolveRoleIds(state: AppState, currentUser: CurrentUser): string[] {
  const iamUser = resolveIamUser(state, currentUser);
  if (iamUser?.roleIds?.length) return iamUser.roleIds;

  const roleInputs = currentUser.roles?.length ? currentUser.roles : [currentUser.role];
  return Array.from(new Set(roleInputs.map((role) => {
    const exact = state.roles.find((item) => item.id === role || item.roleName === role);
    return exact?.id || roleAliases[role] || role;
  })));
}

export function isAdminUser(state: AppState, currentUser: CurrentUser): boolean {
  const roleIds = resolveRoleIds(state, currentUser);
  return roleIds.includes("ADMIN") || currentUser.role === "Admin" || currentUser.roles?.includes("Admin");
}

function findRolePermission(state: AppState, roleId: string): RolePermissions | undefined {
  const existing = state.rolePermissions?.find((permission) => permission.roleId === roleId);
  const pageIds = getAllPageIds();
  const existingUsesCurrentPages = existing?.permissions.some((menu) =>
    pageIds.includes(menu.menuId) || menu.subMenus?.some((subMenu) => pageIds.includes(subMenu.subMenuId)),
  );
  if (existing && existingUsesCurrentPages) return existing;
  const role = state.roles.find((item) => item.id === roleId || item.roleName === roleId);
  return role ? buildDefaultRolePermissions(role) : undefined;
}

export function hasPermission(state: AppState, currentUser: CurrentUser, pageId: string, action: PermissionAction = "View"): boolean {
  if (pageId === "home" || pageId === "profile") return true;
  if (isAdminUser(state, currentUser)) return true;

  return resolveRoleIds(state, currentUser).some((roleId) => {
    const rolePermission = findRolePermission(state, roleId);
    return rolePermission?.permissions.some((menu) =>
      menu.menuId === pageId
        ? menu.permissions[action]
        : menu.subMenus?.some((subMenu) => subMenu.subMenuId === pageId && subMenu.permissions[action]),
    );
  });
}

export function getAccessiblePageIds(state: AppState, currentUser: CurrentUser): Set<string> {
  return new Set(["home", "profile", ...getAllPageIds().filter((pageId) => hasPermission(state, currentUser, pageId, "View"))]);
}

function emptyScope(allData = false): EffectiveDataScope {
  return {
    allData,
    clientIds: new Set(),
    clientCodes: new Set(),
    countries: new Set(),
    regions: new Set(),
    pols: new Set(),
    pods: new Set(),
    transportModes: new Set(),
  };
}

function getDescendantOrgIds(state: AppState, orgIds: string[]): string[] {
  const result = new Set(orgIds);
  let changed = true;
  while (changed) {
    changed = false;
    state.orgs.forEach((org) => {
      if (org.parentId && result.has(org.parentId) && !result.has(org.id)) {
        result.add(org.id);
        changed = true;
      }
    });
  }
  return Array.from(result);
}

export function getEffectiveDataScope(state: AppState, currentUser: CurrentUser): EffectiveDataScope {
  if (isAdminUser(state, currentUser)) {
    return emptyScope(true);
  }

  const iamUser = resolveIamUser(state, currentUser);
  const userWorkGroupIds = iamUser?.workGroupIds?.length ? iamUser.workGroupIds : [];
  const activeWorkGroups = (state.workGroups || []).filter((group: WorkGroup) => group.status === "Active" && userWorkGroupIds.includes(group.id));

  if (activeWorkGroups.length) {
    const scope = emptyScope(false);
    const clients = state.clients || [];
    const addClient = (clientId: string) => {
      scope.clientIds.add(clientId);
      const client = clients.find((item) => item.id === clientId || item.clientCode === clientId || item.customerCode === clientId);
      if (client) {
        scope.clientCodes.add(client.clientCode);
        scope.clientCodes.add(client.customerCode);
        scope.clientCodes.add(client.clientName);
        scope.clientCodes.add(client.customerName);
      } else {
        scope.clientCodes.add(clientId);
      }
    };

    activeWorkGroups.flatMap((group) => group.filters || []).forEach((filter: WorkGroupDataScopeFilter) => {
      if (filter.operator === "!=" || filter.operator === "NOT IN") return;
      filter.values.forEach((value) => {
        if (filter.field === "Client") addClient(value);
        if (filter.field === "Country") scope.countries.add(value.toUpperCase());
        if (filter.field === "Region") scope.regions.add(value);
        if (filter.field === "POL") scope.pols.add(value);
        if (filter.field === "POD") scope.pods.add(value);
        if (filter.field === "Transport Mode") scope.transportModes.add(value);
      });
    });
    return scope;
  }

  const orgIds = getDescendantOrgIds(state, iamUser?.organizationIds || []);
  const scopes = (state.organizationDataScopes || []).filter((scope: OrganizationDataScope) => scope.active && orgIds.includes(scope.organizationId));
  const allData = scopes.some((scope) => scope.allData);
  if (allData) {
    return emptyScope(true);
  }
  const clients = state.clients || [];
  const clientIds = new Set<string>();
  const clientCodes = new Set<string>();
  const countries = new Set<string>();
  const regions = new Set<string>();

  scopes.forEach((scope) => {
    scope.clientIds.forEach((clientId) => {
      clientIds.add(clientId);
      const client = clients.find((item) => item.id === clientId || item.clientCode === clientId || item.customerCode === clientId);
      if (client) {
        clientCodes.add(client.clientCode);
        clientCodes.add(client.customerCode);
        clientCodes.add(client.clientName);
        clientCodes.add(client.customerName);
      }
    });
    scope.countries.forEach((country) => countries.add(country.toUpperCase()));
    scope.regions.forEach((region) => regions.add(region));
  });

  return {
    allData: false,
    clientIds,
    clientCodes,
    countries,
    regions,
    pols: new Set(),
    pods: new Set(),
    transportModes: new Set(),
  };
}

function hasAnyScope(scope: EffectiveDataScope): boolean {
  return scope.allData || scope.clientIds.size > 0 || scope.clientCodes.size > 0 || scope.countries.size > 0 || scope.regions.size > 0 || scope.pols.size > 0 || scope.pods.size > 0 || scope.transportModes.size > 0;
}

function countryMatches(country: string | undefined, scope: EffectiveDataScope): boolean {
  if (!country) return false;
  const normalized = country.toUpperCase();
  return scope.countries.has(normalized) || scope.countries.has(country);
}

function regionMatches(region: string | undefined, scope: EffectiveDataScope): boolean {
  return !!region && scope.regions.has(region);
}

export function filterClientsByScope(clients: Client[], scope: EffectiveDataScope): Client[] {
  if (scope.allData) return clients;
  if (!hasAnyScope(scope)) return [];
  return clients.filter((client) =>
    scope.clientIds.has(client.id)
    || scope.clientCodes.has(client.clientCode)
    || scope.clientCodes.has(client.customerCode)
    || countryMatches(client.operationalCountry, scope)
    || countryMatches(client.address?.country, scope),
  );
}

export function filterOrganizationsByScope(organizations: Organization[], scope: EffectiveDataScope): Organization[] {
  if (scope.allData) return organizations;
  if (!hasAnyScope(scope)) return [];
  return organizations.filter((org) =>
    (!!org.client && scope.clientCodes.has(org.client))
    || countryMatches(org.address?.country, scope),
  );
}

export function filterPOsByScope(records: PORecord[], scope: EffectiveDataScope): PORecord[] {
  if (scope.allData) return records;
  if (!hasAnyScope(scope)) return [];
  return records.filter((record) => {
    const clientOk = scope.clientCodes.size === 0 || Array.from(scope.clientCodes).some((client) =>
      record.partyInfo?.consigneeName?.toLowerCase().includes(client.toLowerCase())
      || record.partyInfo?.notifyPartyName?.toLowerCase().includes(client.toLowerCase())
      || record.orderNumber?.toLowerCase().includes(client.toLowerCase()),
    );
    const polOk = scope.pols.size === 0
      || scope.pols.has(record.locationInfo?.originPortBooked || "")
      || scope.pols.has(record.locationInfo?.originPort || "");
    const podOk = scope.pods.size === 0
      || scope.pods.has(record.locationInfo?.destinationPortBooked || "")
      || scope.pods.has(record.locationInfo?.destinationPort || "");
    const modeOk = scope.transportModes.size === 0 || scope.transportModes.has(record.locationInfo?.transportMode || "");
    const geoOk = scope.countries.size === 0 && scope.regions.size === 0
      ? true
      : countryMatches(record.locationInfo?.originCountry, scope)
        || countryMatches(record.locationInfo?.destinationPortBooked?.slice(0, 2), scope)
        || regionMatches(record.locationInfo?.originPort, scope)
        || regionMatches(record.locationInfo?.destinationPort, scope);
    return clientOk && geoOk && polOk && podOk && modeOk;
  });
}
