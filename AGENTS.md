# MOOV OS P1 - 主数据管理模块

## Dependencies
- **xlsx** (计划中) - Excel 导入导出功能，用于主数据批量操作

## Architecture
### 主数据域（7个）
- **Client** - 客户主数据（原 Customer，已重命名为 Client；Code 为主键且唯一验证；编辑时 Code 字段禁用并灰色显示；包含结构化地址、联系人、邮箱、电话、启用状态）
- **Business Partner** - 业务伙伴（原 Organization，已重命名为 Business Partner；Code 为3字符主键且唯一验证；Type 分为 Supplier/Producer/Trucker；编辑时 Code 字段禁用并灰色显示；删除了 Org ID/Party Role/SCAC/Mapping Method/Integration Type/Integration Endpoint 列；Customer 改名为 Client；Client 字段为下拉选择框，从 Client Master 中读取已配置的客户代码；包含结构化地址字段 Address Line 1/2、City、State/Province、Postal Code、Country）
- **Carrier** - 承运商主数据（已重命名为 Carrier；支持按名称/代码/SCAC 搜索；按 Mode/Country 筛选；Carrier Code 为主键且唯一验证，编辑时禁用；列包括：Carrier Code、Carrier Name、SCAC/IATA、Mode、Country、Active）
- **Location** - 位置（港口、机场、城市等；Location Type选项为Port/Airport/City，不含Warehouse）
- **Product** - 产品/SKU（已重命名为SKU；SKU ID为主键且唯一验证，编辑时禁用并灰色显示；包含商品编码、替代商品编码、描述、危险品标识(Y/N)、UN编号、重量及三维尺寸(宽/高/长cm)等字段；所有主数据页面统一使用formError状态显示重复主键错误，不再使用alert()）
- **Equipment** - 设备（集装箱类型；Equipment ID为主键且唯一验证，编辑时禁用并灰色显示；设备类型选项为20'GP/40'GP/40'HQ/45'HQ/20'RE/40'RE；已移除Owner字段；数值字段如TEU/Length/Height/MaxWeight需前端验证，非数字输入显示"This is a numeric field."错误）
- **Vessel** - 船舶航次

### 业务执行模块
- **PO Management** - 采购订单管理（统计卡片、筛选栏、可展开行显示订单明细，含12个子tab）

### 导航结构重构
- **工作流配置页** (WorkflowConfigPage) - 包含流程模板、工作分配规则、SLA类型、模板主题配置四个Tab，使用模块化组件 ProcessTemplatesTab、AssignmentRulesTab、SlaTypesTab 和 TemplateSubjectConfigTab
- **系统基础配置页** (SystemConfigPage) - 包含运输模式、异常类型、Reason Code、通知模板四个Tab，使用模块化组件 BasicConfigTab（SLA类型已移至工作流配置页）
- **舱位分配规则已移除** - 原 RulesPage 中的 allocation tab 已被删除

### 模块化组件架构
- **ProcessTemplatesTab** (`src/components/rules/ProcessTemplatesTab.tsx`) - 流程模板管理模块，包含模板CRUD、里程碑表格展示（支持拖拽排序）、点击里程碑展开下方Task明细面板、可选维度选择器；Milestone以表格形式展示，Task面板独立显示在表格下方
- **AssignmentRulesTab** (`src/components/rules/AssignmentRulesTab.tsx`) - 工作分配规则模块，包含团队分配规则、个人分配规则、兜底规则三个子Tab
- **SlaTypesTab** (`src/components/rules/config/SlaTypesTab.tsx`) - SLA类型配置模块，包含SLA规则的CRUD操作，支持基准日期、方向、偏移值、单位等字段配置
- **TemplateSubjectConfigTab** (`src/components/rules/config/TemplateSubjectConfigTab.tsx`) - 模板主题配置模块，管理模板维度的启用/禁用状态，必选维度不可禁用
- **BasicConfigTab** (`src/components/rules/BasicConfigTab.tsx`) - 基础配置模块，包含运输模式、异常类型、Reason Code、通知模板四个子Tab（SLA类型已移至工作流配置页）
- **状态管理模式** - 模块化组件通过 props 接收 state/setState/saveState，实现状态共享和独立复用
- **UI样式规范** - Tab使用 `bg-brand-soft text-brand-strong border border-brand-soft` 选中样式，子Tab使用 `bg-muted/50` 背景；Milestone表格行支持拖拽，点击Tasks列展开/收起下方Task明细面板
- **基础配置子组件拆分** - BasicConfigTab 中的每个子Tab（运输模式、异常类型、Reason Code、通知模板）已拆分为独立组件，存放在 `src/components/rules/config/` 目录下，便于后续扩展和维护

### 流程与规则
- **Process Templates** - 流程模板（客户+航线+运输模式定义），支持增删改和复制
- **Milestones** - 里程碑（原 Task Nodes，流程中的阶段），归属于 Template，支持增删改
- **Milestone Tasks** - 任务（里程碑下的可执行分工单元），支持增删改
- **Work Assignment Rules** - 工作分配规则采用两级架构：团队分配规则（Department Head维护，按客户/区域/运输模式路由到Team）+ 个人分配规则（Team Leader维护，按Template/Milestone/Task分配给具体User）+ 兜底规则；Milestone和Task不再包含ownerRole字段，责任分配通过规则系统实现
- **删除功能** - Template/Milestone/Task 均支持删除，Template 删除时级联删除其 Milestones 和 Tasks，Milestone 删除时级联删除其 Tasks，使用 ConfirmDialog 确认
- **复制模板** - Template 列表底部显示"新增模板"按钮，每个模板项底部有复制按钮，点击后复制模板及其所有 Milestones 和 Tasks，新模板名称添加"(副本)"后缀，状态设为 Draft
- **SLA 规则升级** - SLA 从简单文本升级为可计算规则结构（SlaRule）：baseDateCode（基准日期如 ETD/CRD/TASK_CREATED/HOD/BOOKING_RECEIVED等16种）、direction（Before/After）、offsetValue、offsetUnit（Hours/Days/Business Days/Months）、calendarCode、reminderValue；Milestone 和 Task 的 sla 字段支持 string | SlaRule 联合类型，提供 formatSlaRule() 辅助函数生成可读表达式
- **基础配置Tab拆分** - 基础配置拆分为5个独立Tab：运输模式、异常类型、SLA类型、Reason Code、通知模板，每个Tab有独立字段和表单
- **SLA引用机制** - Milestone和Task的SLA改为从基础配置的SLA类型中选择（slaTypeId下拉框），停用SLA显示"（已停用）"标记但历史记录仍可见
- **Pepco工作流模板** - 根据Pepco_Template.xlsx更新pt2模板，包含21个Milestones和21个Tasks，覆盖从Upload PO到Pre-alert的完整流程
- **状态版本管理** - localStorage添加版本号检查机制（CURRENT_STATE_VERSION），数据结构变化时自动清除旧缓存
- **模板主题可配置** - 工作流模板维度支持动态配置：管理员在"模板主题配置"中启用/禁用可选维度；用户创建模板时默认只显示必选维度（客户、起运区域、目的区域、运输模式），通过"添加维度"按钮从已启用的可选维度中选择需要的字段添加到当前模板；模板名称根据选择的维度自动生成

### 登录与认证
- **语言自适应** - 登录页默认读取浏览器语言(navigator.language)，右上角可手动切换中文/English，选择后保存到localStorage(moov-os-language)
- **SSO模拟登录** - Microsoft按钮映射到admin@moov.local，Google按钮映射到ops@moov.local，复用现有登录逻辑记录session和audit
- **忘记密码流程** - 点击"忘记密码"打开重置面板→输入邮箱调用generateResetToken()生成token保存到localStorage→显示可点击的重置链接(#/reset-password?token=xxx)→跳转到重置密码页验证token→重置成功后更新demoAccounts密码并标记token已使用
- **密码重置Token管理** - PasswordResetToken接口包含token/email/createdAt/expiresAt/used字段，有效期24小时，提供generateResetToken/validateResetToken/markTokenAsUsed/getPasswordResetTokens四个辅助函数

### 用户与权限（PRD v2.0）
- **Users Tab** - 用户管理（User Number/Name/Email/Phone/Roles/Organizations/Active），User Number 为主键且唯一验证，编辑时禁用；Add 按钮位于右上角
- **Roles Tab** - 角色管理（Role Number/ID/Name/Type/Description/Active + Permissions配置）
- **Organizations Tab** - 组织管理（Org Number/Name/Type/Parent/Description/Active）
- **Permission Matrix** - 权限矩阵（模块×动作×角色的交叉表）
- **IAM 标签统一为英文**：Users, Roles, Organizations, Permission Matrix
- **数据库表**：iam_users（user_number/name/email/phone/role_ids/organization_ids/active）、iam_roles（role_number/role_id/role_name/role_type/description/permissions/active）、iam_organizations（org_number/org_name/org_type/parent_id/description/active）
- **Permission Model** - 菜单/子菜单级别的View/Add/Modify/Delete权限

### 数据流
`src/types/index.ts` 定义接口 → `src/lib/store.ts` 提供演示数据 → 各 Page 组件消费

### 数据库表结构（Meoo Cloud）
**工作流配置相关表**：
- `process_templates` - 流程模板表
- `milestones` - 里程碑表（关联template_id，级联删除）
- `milestone_tasks` - 里程碑任务表（关联template_id和milestone_id，级联删除）
- `sla_type_configs` - SLA类型配置表
- `template_subject_fields` - 模板主题字段配置表
- `team_assignment_rules` - 团队分配规则表
- `user_assignment_rules` - 个人分配规则表
- `fallback_assignment_rules` - 兜底规则表

**基础配置相关表**：
- `transport_modes` - 运输模式表
- `exception_types` - 异常类型表
- `reason_codes` - Reason Code表
- `notification_templates` - 通知模板表

**RLS策略**：所有表均启用行级安全，默认允许匿名读写（USING true / WITH CHECK true）

## Patterns / Constraints
- 所有主数据页面遵循统一结构：搜索框 + 筛选器 + 表格 + 分页 + Add/Export/Import 按钮
- Export 按钮使用黄色边框样式，Import 使用品牌色
- 必填字段在表单中标记星号（待实现）
- 危险品标志用红色徽章，非危险品用绿色徽章
- TablePage 组件需预先在 `tables` 对象中注册表配置，否则显示 "Table not found"

## What Didn't Work
- ❌ 旧数据结构（skus, containers, partners, vendors）与新 PRD 不兼容 → 已替换为 7 个标准主数据域
- ❌ RulesPage 中工作分配规则/舱位分配规则/基础配置 tab 未注册表配置导致显示 "Table not found" → 已在 TablePage.tsx 的 `tables` 对象中添加对应配置

## Lessons
- Swarms 生成组件时，子任务无法自行读取文件，必须在调用前确保上下文包含相关文件内容
- 修改 types/index.ts 后必须同步更新 store.ts 中的演示数据，否则 TypeScript 编译失败
- IAM模块独立页面模式：Users/Roles/Organizations Tab使用独立Page组件(UsersPage/RolesPage/OrganizationsPage)而非TablePage，每个组件自带完整CRUD功能；表单保存时需对所有可能为undefined的字段进行类型转换(String()/Array.isArray())和空值保护，避免运行时TypeError

## Internationalization (i18n)
- **统一翻译层**：所有 UI 文案通过 `t(lang, key)` 渲染，不再直接写死中文
- **语言支持**：zh / en，默认读取浏览器语言（navigator.language），用户可在顶部导航栏切换
- **缺失翻译处理**：找不到 key 时显示 fallback，并自动缓存到 localStorage，支持后续批量补齐
- **自动翻译模拟**：提供 `autoTranslateMissing()` 函数模拟中文→英文的简单转换（实际可接入翻译 API）
- **业务数据不翻译**：客户名、港口代码、Task 名等业务数据保持原样，仅翻译 UI 文案
- **语言切换 UI**：顶部导航栏 Globe 图标下拉菜单，hover 显示 zh / en 选项
- **已国际化页面**：ClientsPage、CarriersPage、LocationsPage、ProductsPage、EquipmentPage、VesselsPage、ServicesPage、RolesPage、UsersPage、WorkflowConfigPage、SystemConfigPage 及所有子Tab组件
- **翻译键规范**：表单字段使用语义化key（如 vesselId、serviceName、userNumber），表格列头复用相同key，按钮文本使用通用key（add、edit、delete、search、export、import）

## Theme Colors
- **Primary/Brand**: #004F7C (oklch(0.35 0.08 220)) - 深蓝色主题色，用于侧边栏背景(bg-brand-strong)、主按钮、链接等
- **Accent**: #FE5000 (oklch(0.55 0.18 30)) - 橙色点缀色，用于强调元素、警告、特殊标记
- **整体风格**: 蓝白简洁配色，深色模式下适当提亮
- **侧边栏**: 使用 `bg-brand-strong` 而非硬编码颜色，确保响应主题色变化
- **缓存控制**: index.html 添加了 no-cache meta 标签，防止浏览器缓存旧样式
