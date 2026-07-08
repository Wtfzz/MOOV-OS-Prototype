import { useState } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import { loadState, saveState } from "@/lib/store";
import { pageCatalog } from "@/app/pageCatalog";
import { buildDefaultRolePermissions, permissionActions } from "@/lib/accessControl";
import type { CurrentUser, RolePermissions, PermissionAction } from "@/types";

// System menu structure matching the application navigation
const SYSTEM_MENUS = pageCatalog.map((group) => ({
  id: group.group,
  name: group.group,
  subMenus: group.items.map((item) => ({ id: item.id, name: item.label })),
}));

interface RolePermissionsPanelProps {
  roleId: string;
  currentUser?: CurrentUser;
  onClose: () => void;
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export default function RolePermissionsPanel({ roleId, currentUser, onClose }: RolePermissionsPanelProps) {
  const state = loadState();
  const role = state.roles.find((r) => r.id === roleId);
  
  // Load existing permissions or create default
  const [permissions, setPermissions] = useState<RolePermissions>(() => {
    const existing = state.rolePermissions?.find((rp) => rp.roleId === roleId);
    const currentPageIds = pageCatalog.flatMap((group) => group.items.map((item) => item.id));
    const existingUsesCurrentPages = existing?.permissions.some((menu) =>
      currentPageIds.includes(menu.menuId) || menu.subMenus?.some((sub) => currentPageIds.includes(sub.subMenuId)),
    );
    if (existing && existingUsesCurrentPages) return existing;
    
    return role ? buildDefaultRolePermissions(role) : {
      roleId,
      permissions: SYSTEM_MENUS.map((menu) => ({
        menuId: menu.id,
        menuName: menu.name,
        subMenus: menu.subMenus.map((sub) => ({
          subMenuId: sub.id,
          subMenuName: sub.name,
          permissions: { View: false, Add: false, Modify: false, Delete: false },
        })),
        permissions: { View: false, Add: false, Modify: false, Delete: false },
      })),
    };
  });

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Save permissions when closing
  const handleSave = () => {
    const updatedState = { ...state };
    const existingIndex = updatedState.rolePermissions?.findIndex((rp) => rp.roleId === roleId);
    
    if (existingIndex >= 0 && updatedState.rolePermissions) {
      updatedState.rolePermissions[existingIndex] = permissions;
    } else {
      updatedState.rolePermissions = [...(updatedState.rolePermissions || []), permissions];
    }
    const grantedMenuCount = permissions.permissions.filter((menu) => menu.permissions.View).length;
    const grantedSubMenuCount = permissions.permissions.flatMap((menu) => menu.subMenus || []).filter((sub) => sub.permissions.View).length;
    updatedState.audit = [
      ...(updatedState.audit || []),
      {
        id: `audit-${Date.now()}`,
        time: nowStamp(),
        userId: currentUser?.email || "system",
        user: currentUser?.name || "System",
        action: "Update role permissions",
        module: "Role Management",
        objectType: "Role Permission",
        objectName: roleId,
        detail: `Granted menus=${grantedMenuCount}; granted sub-menus=${grantedSubMenuCount}. Permission changes take effect immediately.`,
        status: "Success",
        ip: "127.0.0.1",
        sessionId: currentUser?.sessionId || "-",
      },
    ];
    
    saveState(updatedState);
    onClose();
  };

  const toggleMenuExpand = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const updateMenuPermission = (menuId: string, action: PermissionAction, value: boolean) => {
    setPermissions((prev) => {
      const newPerms = { ...prev };
      const menuIndex = newPerms.permissions.findIndex((m) => m.menuId === menuId);
      if (menuIndex >= 0) {
        newPerms.permissions[menuIndex] = {
          ...newPerms.permissions[menuIndex],
          permissions: {
            ...newPerms.permissions[menuIndex].permissions,
            [action]: value,
          },
        };
        
        // If denying a menu, deny all its sub-menus
        if (!value && action === "View") {
          const menu = newPerms.permissions[menuIndex];
          if (menu.subMenus) {
            menu.subMenus = menu.subMenus.map((sub) => ({
              ...sub,
              permissions: { View: false, Add: false, Modify: false, Delete: false },
            }));
          }
        }
      }
      return newPerms;
    });
  };

  const updateSubMenuPermission = (menuId: string, subMenuId: string, action: PermissionAction, value: boolean) => {
    setPermissions((prev) => {
      const newPerms = { ...prev };
      const menuIndex = newPerms.permissions.findIndex((m) => m.menuId === menuId);
      if (menuIndex >= 0) {
        const menu = newPerms.permissions[menuIndex];
        if (menu.subMenus) {
          const subIndex = menu.subMenus.findIndex((s) => s.subMenuId === subMenuId);
          if (subIndex >= 0) {
            menu.subMenus[subIndex] = {
              ...menu.subMenus[subIndex],
              permissions: {
                ...menu.subMenus[subIndex].permissions,
                [action]: value,
              },
            };
          }
        }
      }
      return newPerms;
    });
  };

  const getPermissionValue = (menuId: string, action: PermissionAction): boolean => {
    const menu = permissions.permissions.find((m) => m.menuId === menuId);
    return menu?.permissions[action] || false;
  };

  const getSubMenuPermissionValue = (menuId: string, subMenuId: string, action: PermissionAction): boolean => {
    const menu = permissions.permissions.find((m) => m.menuId === menuId);
    const subMenu = menu?.subMenus?.find((s) => s.subMenuId === subMenuId);
    return subMenu?.permissions[action] || false;
  };

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            Configure Role Permissions
            <span className="text-sm font-normal text-muted-foreground">- {role.roleName} ({role.id})</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure View/Add/Modify/Delete access for each menu and submenu. Disabling parent View hides all child menus.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-strong text-sm font-semibold"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="p-2 border border-border rounded hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Permissions Tree */}
      <div className="px-4 py-4 space-y-2 max-h-[600px] overflow-y-auto">
        {SYSTEM_MENUS.map((menu) => {
          const isExpanded = expandedMenus.has(menu.id);
          const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
          const menuPerm = permissions.permissions.find((m) => m.menuId === menu.id);
          
          return (
            <div key={menu.id} className="border border-border rounded-lg overflow-hidden">
              {/* Menu Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                {hasSubMenus && (
                  <button
                    onClick={() => toggleMenuExpand(menu.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
                {!hasSubMenus && <div className="w-6" />}
                
                <span className="font-semibold text-sm flex-1">{menu.name}</span>
                
                {/* Permission Checkboxes */}
                <div className="flex gap-4">
                  {permissionActions.map((action) => (
                    <label key={action} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={menuPerm?.permissions[action] || false}
                        onChange={(e) => updateMenuPermission(menu.id, action, e.target.checked)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-muted-foreground">{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sub-Menus */}
              {hasSubMenus && isExpanded && menuPerm?.subMenus && (
                <div className="border-t border-border">
                  {menuPerm.subMenus.map((subMenu) => (
                    <div
                      key={subMenu.subMenuId}
                      className="flex items-center gap-3 px-8 py-2.5 hover:bg-muted/20 border-b border-border last:border-b-0"
                    >
                      <div className="w-6" />
                      <span className="text-sm flex-1">{subMenu.subMenuName}</span>
                      
                      {/* Sub-Menu Permission Checkboxes */}
                      <div className="flex gap-4">
                        {permissionActions.map((action) => (
                          <label key={action} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={subMenu.permissions[action]}
                              onChange={(e) => updateSubMenuPermission(menu.id, subMenu.subMenuId, action, e.target.checked)}
                              disabled={!getPermissionValue(menu.id, "View")}
                              className="w-4 h-4 rounded border-input disabled:opacity-50"
                            />
                            <span className={`text-muted-foreground ${!getPermissionValue(menu.id, "View") ? "opacity-50" : ""}`}>
                              {action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Permission summary</span>
          <span>
            {permissions.permissions.filter((m) => m.permissions.View).length} menus authorized
          </span>
        </div>
      </div>
    </div>
  );
}
