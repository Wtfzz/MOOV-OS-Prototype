// 国际化配置
export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // 通用
    login: '登录',
    logout: '退出',
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    add: '新增',
    search: '搜索',
    reset: '重置',
    status: '状态',
    active: '启用',
    inactive: '停用',
    
    // 登录页
    username: '用户名 / 邮箱',
    password: '密码',
    forgotPassword: '忘记密码',
    demoAccounts: '演示账号：admin@moov.local / Admin123!；ops@moov.local / Ops123!!；supplier@moov.local / Supplier123!。密码规则：至少 8 位，包含大写字母、小写字母、数字和特殊字符。',
    passwordRule: '至少 8 位，包含大写字母、小写字母、数字和特殊字符。',
    continueWithMicrosoft: '使用 Microsoft 登录',
    continueWithGoogle: '使用 Google 登录',
    resetPassword: '重置密码',
    resetPasswordTitle: '重置您的密码',
    enterEmailForReset: '输入您的邮箱以获取密码重置链接',
    emailAddress: '邮箱地址',
    sendResetLink: '发送重置链接',
    backToLogin: '返回登录',
    resetLinkSent: '密码重置链接已发送！请点击下方演示链接：',
    clickToReset: '点击此处重置密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    resetPasswordBtn: '重置密码',
    passwordResetSuccess: '密码重置成功！您现在可以使用新密码登录。',
    invalidToken: '无效或已过期的重置令牌',
    passwordsNotMatch: '两次输入的密码不一致',
    passwordTooWeak: '密码必须至少8位，包含大写字母、小写字母、数字和特殊字符',
    tokenExpired: '重置令牌已过期',
    tokenAlreadyUsed: '重置令牌已被使用',
    ssoLoginFailed: 'SSO 登录失败',
    userAccountDisabled: '用户账号已停用',
    passwordRequirements: '至少8位，包含大小写字母、数字和特殊字符',
    passwordMismatch: '两次输入的密码不一致',
    weakPassword: '密码强度不足',
    returningToLogin: '正在返回登录页...',
    continue: '继续',
    
    // 导航
    home: '首页',
    profile: '我的资料',
    systemManagement: '系统管理',
    userPermission: '用户与权限',
    processRules: '流程与规则配置',
    workflowConfig: '工作流配置',
    systemConfig: '系统基础配置',
    auditLog: '审计日志',
    fileManagement: '文件管理底座',
    masterData: '主数据中心',
    customerMaster: '客户主数据',
    clientMaster: '客户主数据',
    partnerMaster: '业务伙伴',
    vendorMaster: 'MOOV供应商',
    locationMaster: '位置主数据',
    skuMaster: 'SKU/产品',
    containerMaster: '集装箱主数据',
    organizationMaster: '业务伙伴',
    carrierMaster: '承运商主数据',
    businessExecution: '业务执行中心',
    poManagement: 'PO 管理',
    transportPlan: '运输计划',
    carrierBooking: '承运人订舱',
    spaceAllocation: '舱位分配',
    shipmentDetail: 'Shipment/Booking 详情',
    taskWorkbench: '任务工作台',
    myTasks: '我的待办',
    teamTasks: '团队待办',
    slaView: 'SLA 视图',
    manualAssignment: '手工分配',
    exceptionQuality: '异常与质量',
    exceptionManagement: '异常管理',
    exceptionSla: '异常 SLA',
    dataValidation: '数据校验结果',
    qualityCheck: '质量检查',
    automationNotification: '自动化与通知',
    autoValidation: '自动校验规则',
    autoEmail: '自动邮件模板',
    notificationRecord: '通知记录',
    rpaReserved: 'RPA 预留',
    reportDashboard: '报表看板',
    taskDashboard: '任务看板',
    exceptionDashboard: '异常看板',
    workloadDashboard: '工作量看板',
    exportReserved: '导出功能预留',
    
    // 工作台
    welcomeBack: '欢迎回来',
    workSummary: '这里汇总今天需要关注的工作队列、SLA 风险和业务提醒。',
    myTodo: '我的待办',
    upcomingOverdue: '即将逾期',
    pendingExceptions: '待处理异常',
    pendingApproval: '待审批',
    workQueueBrief: '工作队列简报',
    priorityAggregate: '按优先级聚合待办事项',
    workReminder: '工作提醒',
    priorityAttention: '需要今天优先关注的提示',
    
    // 用户与权限
    iamTitle: 'User & Permission',
    iamSubtitle: 'Manage user accounts, roles, work groups, and permission matrix.',
    usersTab: 'Users',
    rolesTab: 'Roles',
    organizationsTab: 'Organizations',
    workGroupsTab: 'Work Groups',
    permissionMatrixTab: 'Permission Matrix',
    
    // 流程与规则
    rulesTitle: '流程与规则配置',
    rulesSubtitle: '集中维护流程模板、工作分配、舱位分配规则和基础配置',
    processTemplates: '流程模板',
    assignmentRules: '工作分配规则',
    allocationRules: '舱位分配规则',
    basicConfig: '基础配置',
    transportModes: '运输模式',
    exceptionTypes: '异常类型',
    slaTypes: 'SLA 配置',
    slaTypeId: 'SLA 类型ID',
    baseDateCode: '基准日期',
    direction: '方向',
    offsetValue: '偏移值',
    offsetUnit: '偏移单位',
    calendarCode: '日历代码',
    objectScope: '对象范围',
    reasonCodes: 'Reason Code',
    notificationTemplates: '通知模板',
    emailNotificationTemplates: '邮件通知模板',
    systemNotificationTemplates: '系统通知模板',
    configCategoryManagement: '配置分类管理',
    addConfigCategory: '新增配置分类',
    customConfigTabs: '自定义配置',
    notificationType: '通知类型',
    channel: '渠道',
    titleSubject: '标题/主题',
    subject: '主题',
    body: '正文',
    scenario: '场景',
    severity: '严重程度',
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除此项吗？此操作不可恢复。',
    triggerEvent: '触发事件',
    processTemplate: '流程模板',
    milestone: '里程碑',
    task: '任务',
    systemMessage: '系统消息',
    taskReminder: '任务提醒',
    taskCompletion: '任务完成',
    slaReminder: 'SLA 提醒',
    exceptionAlert: '异常提醒',
    inApp: '站内消息',
    both: '两者',
    templateSubjectConfig: '工作流维度管理',
    templateSubjectDesc: '配置工作流模板的维度字段。客户和运输模式为固定必填维度，其余维度可按需启用。',
    fieldKey: '字段Key',
    displayName: '显示名称',
    dataSource: '数据源',
    required: '必填',
    enabled: '启用',
    disabled: '已禁用',
    sortOrder: '排序',
    yes: '是',
    no: '否',
    note: '说明：',
    templateSubjectNote1: '固定必填维度（客户、运输模式）不可禁用，其余维度均为可选配置',
    templateSubjectNote2: '启用POL/POD后，新建模板表单将显示港口选择框，并自动生成Lane',
    templateSubjectNote3: '修改配置后，只影响后续新增/编辑的模板，历史模板保留原有值',
    templateSubjectNote4: '模板名称将根据启用的维度自动生成',

    // 流程模板相关
    templateName: '模板名称',
    effectiveDate: '生效日期',
    version: '版本',
    remark: '备注',
    nodeName: '节点名称',
    predecessor: '前置节点',
    skippable: '可跳过',
    skipCondition: '跳过条件',
    requiredFiles: '必需文件',
    automation: '自动化程度',
    taskName: '任务名称',
    taskType: '任务类型',
    targetTeam: '目标团队',
    targetUser: '目标用户',
    customer: '客户',
    priority: '优先级',
    team: '团队',
    template: '模板',
    originRegion: '起运区域',
    destinationRegion: '目的区域',
    originCountry: '起运国家',
    destinationCountry: '目的国家',
    consignee: '收货人',
    incoterm: '贸易条款',
    workloadStrategy: '负载策略',
    condition: '触发条件',
    fallbackQueue: '兜底队列',
    escalationRole: '升级角色',
    escalationSla: '升级SLA',
    addRule: '添加规则',
    editRule: '编辑规则',
    teamAssignmentRules: '团队分配规则',
    userAssignmentRules: '个人分配规则',
    fallbackRules: '兜底规则',
    milestoneList: '里程碑列表',
    addTemplate: '新增模板',
    editTemplate: '编辑模板',
    duplicateTemplate: '复制模板',
    deleteTemplate: '删除模板',
    milestoneDetail: '里程碑明细',
    addMilestone: '新增里程碑',
    editMilestone: '编辑里程碑',
    deleteMilestone: '删除里程碑',
    taskDetail: 'Task明细',
    addTask: '新增Task',
    editTask: '编辑Task',
    deleteTask: '删除Task',
    noTasks: '该里程碑暂无Task配置',
    optionalDimensions: '可选维度',
    closeSelector: '关闭选择器',
    addDimension: '+ 添加维度',
    noAvailableDimensions: '暂无可用的可选维度，请先在"工作流维度管理"中启用',
    close: '关闭',
    confirmDeleteTemplate: '确定要删除此模板吗？这将同时删除其所有里程碑和任务。',
    confirmDeleteMilestone: '确定要删除此里程碑吗？这将同时删除其所有任务。',
    confirmDeleteTask: '确定要删除此任务吗？',
    copySuffix: '(副本)',
    inactiveTag: '(已停用)',
    milestoneCount: '里程碑',
    taskCount: 'Task',
    templateList: '模板列表',

    // 我的资料
    myProfile: '我的资料',
    profileSubtitle: '维护个人联系方式、修改密码，并查看最近登录与活跃会话。',
    personalInfo: '个人资料',
    readOnlyNote: 'Email 和 Role(s) 按 PRD 要求只读。',
    changePassword: '修改密码',
    recentLogins: '最近 10 次登录',
    activeSessions: '活跃会话',
    endSession: '终止',
    
    // 审计日志
    auditTitle: '审计日志',
    auditSubtitle: '记录 User ID、Action、Module、Timestamp、IP、Session、Status。日志不可被修改或删除。',
    exportCsv: '导出 CSV',
    allUsers: '全部用户',
    allModules: '全部模块',
    allActions: '全部动作',
    allStatuses: '全部状态',
    allCustomers: '全部客户',
    
    // 预留模块
    comingSoon: 'Coming Soon / 功能预留中',
    reservedDesc: '该模块已预留菜单、路由和页面入口，后续阶段启用业务逻辑。',
    
    // 表格操作
    noData: '暂无数据',
    adjustFilter: '调整筛选条件或新增一条记录',
    operations: '操作',
    selectAll: '全选',
    deselectAll: '取消全选',
    blank: '空白',
    noMatches: '无匹配项',
    filterSearchPlaceholder: ' ',

    // SKU/Product
    productName: '产品名称',
    productChineseName: '产品中文名称',
    category: '类别',
    productCode: '产品代码',
    unit: '单位',
    width: '宽度',
    height: '高度',
    length: '长度',
    weight: '重量',
    widthCm: '宽度 (cm)',
    heightCm: '高度 (cm)',
    lengthCm: '长度 (cm)',
    weightKg: '重量 (kg)',
    operate: '操作',
    unitConversation: '单位换算',
    modify: '修改',
    goTo: '跳至',
    total: '总计',
    export: '导出',
    import: '导入',
    code: '代码',
    name: '名称',
    type: '类型',
    email: '邮箱',
    phone: '电话',
    address: '地址',
    description: '描述',

    // Master Data domains
    productMaster: 'SKU',
    equipmentMaster: '设备主数据',
    vesselMaster: '船舶/航次',
    serviceMaster: '服务主数据',
    clientConfiguration: '客户配置',
    businessPartnerManagement: '业务伙伴管理',
    carrierManagement: '承运商管理',
    locationManagement: '位置管理',
    productConfiguration: '产品配置',
    equipmentConfiguration: '设备配置',
    vesselConfiguration: '船舶航次配置',

    // Vessel fields
    vesselId: '船舶 ID',
    vesselName: '船舶名称',
    imoNumber: 'IMO 编号',
    voyageNumber: '航次号',
    carrier: '承运商',
    schedule: '船期',
    allVessels: '全部船舶',

    // Service fields
    serviceId: 'Service ID',
    serviceName: 'Service Name',
    serviceCode: 'Service Code',
    serviceType: 'Service Type',
    transportMode: 'Transport Mode',
    transitTimeMin: 'Transit Time Min (days)',
    transitTimeMax: 'Transit Time Max (days)',
    pol: 'POL',
    pod: 'POD',
    tsPorts: 'T/S Ports',
    defaultOrganization: 'Default Organization',

    // Role fields
    configurePermissions: 'Configure Permissions',

    // User fields
    userNumber: 'User Number',
    userName: 'Name',
    userEmail: 'Email',
    userPhone: 'Phone',
    userRoles: 'Roles',
    userOrgs: 'Organizations',
    userWorkGroups: 'Work Groups',
    userActive: 'Active',

    // Equipment fields
    equipmentId: '设备 ID',
    equipmentName: '设备名称',
    equipmentType: '设备类型',
    teuCapacity: 'TEU 容量',
    teu: 'TEU',
    lengthFt: '长度 (ft)',
    heightFt: '高度 (ft)',
    maxWeight: '最大重量',
    maxWeightKg: '最大重量 (kg)',
    unitType: '单位类型',

    // Product fields
    skuId: 'SKU ID',
    alternativeProductCode: '替代产品代码',
    commodityCode: '商品代码',
    hazardous: '危险品',
    hazardousMaterial: '危险品',
    unNumber: 'UN 编号',
    dangerousGoods: '危险货物',
    defaultWeight: '默认重量 (kg)',

    // Carrier fields
    carrierCode: '承运商代码',
    carrierName: '承运商名称',
    scac: 'SCAC',
    scacIata: 'SCAC/IATA',
    mode: '模式',
    country: '国家',
    contactPerson: '联系人',
    contactEmail: '联系邮箱',
    notes: '备注',

    // Location fields
    locationId: '位置 ID',
    locationCode: '位置代码',
    locationName: '位置名称',
    locationType: '位置类型',
    unLocode: 'UN/LOCODE',
    region: '区域',
    addressLine1: '地址行 1',
    addressLine2: '地址行 2',
    city: '城市',
    stateProvince: '省/州',
    postalCode: '邮政编码',

    // Client fields
    customerCode: '客户代码',
    customerName: '客户名称',
    clientId: '客户 ID',
    clientName: '客户名称',
    clientCode: '客户代码',
    clientType: '客户类型',
    operationalCountry: '运营国家',
    industrySector: '行业/领域',
    invoiceLegalEntity: '开票法律实体',
    invoiceCurrency: '开票币种',
    paymentTerms: '付款条款',
    taxRegistrationNumber: '税务登记号',
    billingAddress: '账单地址',
    invoiceFormat: '发票格式',
    creditLimit: '信用额度',
    discountProfile: '折扣配置',
    addressCountry: '地址国家',
    contactPhone: '联系电话',
    timezone: '时区',
    client: '客户',
    businessPartnerNamePlaceholder: '业务伙伴完整名称',
    supplier: 'Supplier',
    producer: 'Producer',
    trucker: 'Trucker',

    // Common actions
    pleaseInput: 'Please input',
    allRegions: 'All Regions',
    allTypes: 'All Types',
    allProducts: 'All Products',
    hazardousOnly: 'Hazardous Only',
    nonHazardousOnly: 'Non-Hazardous Only',
    allCarriers: 'All Carriers',
    allServiceTypes: 'All Service Types',
    allTransportModes: 'All Transport Modes',
    allUnitTypes: 'All Unit Types',
    applicableRegion: '适用区域',
    actions: '操作',
    page: '/page',
    
    // 其他
    p1Mvp: 'P1 MVP',
    operationalFoundation: 'Operational foundation',
    systemSetup: 'System setup and master data first, business modules reserved for later phases.',
    readyForP1: 'Ready for P1 maintenance and review.',
    executionReserved: 'Execution, tasks, quality, automation and reports have stable entry points.',
  },
  en: {
    // Common
    login: 'Login',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    
    // Login Page
    username: 'Username / Email',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    demoAccounts: 'Demo accounts: admin@moov.local / Admin123!; ops@moov.local / Ops123!!; supplier@moov.local / Supplier123!. Password rule: At least 8 characters, including uppercase, lowercase, numbers, and special characters.',
    passwordRule: 'At least 8 characters, including uppercase, lowercase, numbers, and special characters.',
    continueWithMicrosoft: 'Continue with Microsoft',
    continueWithGoogle: 'Continue with Google',
    resetPassword: 'Reset Password',
    resetPasswordTitle: 'Reset Your Password',
    enterEmailForReset: 'Enter your email address to receive a password reset link',
    emailAddress: 'Email Address',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    resetLinkSent: 'Password reset link sent! Check the demo link below:',
    clickToReset: 'Click here to reset your password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    resetPasswordBtn: 'Reset Password',
    passwordResetSuccess: 'Password reset successful! You can now login with your new password.',
    invalidToken: 'Invalid or expired reset token',
    passwordsNotMatch: 'Passwords do not match',
    passwordTooWeak: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    tokenExpired: 'Reset token has expired',
    tokenAlreadyUsed: 'Reset token has already been used',
    ssoLoginFailed: 'SSO login failed',
    userAccountDisabled: 'User account is disabled',
    passwordRequirements: 'At least 8 characters with uppercase, lowercase, numbers and special characters',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password is too weak',
    returningToLogin: 'Returning to login page...',
    continue: 'Continue',
    
    // Navigation
    home: 'Home',
    profile: 'My Profile',
    systemManagement: 'System Management',
    userPermission: 'User & Permission',
    processRules: 'Process & Rules',
    workflowConfig: 'Workflow Config',
    systemConfig: 'System Config',
    auditLog: 'Audit Log',
    fileManagement: 'File Management',
    masterData: 'Master Data',
    customerMaster: 'Customer Master',
    clientMaster: 'Client',
    partnerMaster: 'Business Partners',
    vendorMaster: 'MOOV Vendor',
    locationMaster: 'Location',
    skuMaster: 'SKU/Product',
    containerMaster: 'Container Master',
    organizationMaster: 'Business Partner',
    carrierMaster: 'Carrier',
    businessExecution: 'Business Execution',
    poManagement: 'PO Management',
    transportPlan: 'Transport Plan',
    carrierBooking: 'Carrier Booking',
    spaceAllocation: 'Space Allocation',
    shipmentDetail: 'Shipment/Booking Detail',
    taskWorkbench: 'Task Workbench',
    myTasks: 'My Tasks',
    teamTasks: 'Team Tasks',
    slaView: 'SLA View',
    manualAssignment: 'Manual Assignment',
    exceptionQuality: 'Exception & Quality',
    exceptionManagement: 'Exception Mgmt',
    exceptionSla: 'Exception SLA',
    dataValidation: 'Data Validation',
    qualityCheck: 'Quality Check',
    automationNotification: 'Automation & Notification',
    autoValidation: 'Auto Validation',
    autoEmail: 'Email Templates',
    notificationRecord: 'Notifications',
    rpaReserved: 'RPA Reserved',
    reportDashboard: 'Reports & Dashboard',
    taskDashboard: 'Task Dashboard',
    exceptionDashboard: 'Exception Dashboard',
    workloadDashboard: 'Workload Dashboard',
    exportReserved: 'Export Reserved',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    workSummary: 'Here is a summary of today\'s work queues, SLA risks, and business reminders.',
    myTodo: 'My Tasks',
    upcomingOverdue: 'Upcoming Overdue',
    pendingExceptions: 'Pending Exceptions',
    pendingApproval: 'Pending Approval',
    workQueueBrief: 'Work Queue Brief',
    priorityAggregate: 'Aggregated tasks by priority',
    workReminder: 'Work Reminders',
    priorityAttention: 'Items requiring attention today',
    
    // IAM
    iamTitle: 'User & Permission',
    iamSubtitle: 'Manage user accounts, roles, work groups, and permission matrix.',
    usersTab: 'Users',
    rolesTab: 'Roles',
    organizationsTab: 'Organizations',
    workGroupsTab: 'Work Groups',
    permissionMatrixTab: 'Permission Matrix',
    
    // Rules
    rulesTitle: 'Process & Rules Configuration',
    rulesSubtitle: 'Manage process templates, work assignments, allocation rules, and basic configurations',
    processTemplates: 'Process Templates',
    assignmentRules: 'Work Assignment Rules',
    allocationRules: 'Space Allocation Rules',
    basicConfig: 'Basic Configuration',
    transportModes: 'Transport Modes',
    exceptionTypes: 'Exception Types',
    slaTypes: 'SLA Config',
    slaTypeId: 'SLA Type ID',
    baseDateCode: 'Base Date',
    direction: 'Direction',
    offsetValue: 'Offset Value',
    offsetUnit: 'Offset Unit',
    calendarCode: 'Calendar Code',
    objectScope: 'Object Scope',
    reasonCodes: 'Reason Codes',
    notificationTemplates: 'Notification Templates',
    emailNotificationTemplates: 'Email Notification Templates',
    systemNotificationTemplates: 'System Notification Templates',
    configCategoryManagement: 'Config Category Management',
    addConfigCategory: 'Add Config Category',
    customConfigTabs: 'Custom Config Tabs',
    notificationType: 'Notification Type',
    channel: 'Channel',
    titleSubject: 'Title/Subject',
    subject: 'Subject',
    body: 'Body',
    scenario: 'Scenario',
    severity: 'Severity',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
    triggerEvent: 'Trigger Event',
    processTemplate: 'Process Template',
    milestone: 'Milestone',
    task: 'Task',
    systemMessage: 'System Message',
    taskReminder: 'Task Reminder',
    taskCompletion: 'Task Completion',
    slaReminder: 'SLA Reminder',
    exceptionAlert: 'Exception Alert',
    inApp: 'In-app',
    both: 'Both',
    templateSubjectConfig: 'Workflow Dimension Management',
    templateSubjectDesc: 'Configure dimension fields for workflow templates. Customer and Transport Mode are fixed required dimensions; all other dimensions are configurable.',
    fieldKey: 'Field Key',
    displayName: 'Display Name',
    dataSource: 'Data Source',
    required: 'Required',
    enabled: 'Enabled',
    disabled: 'Disabled',
    sortOrder: 'Sort Order',
    yes: 'Yes',
    no: 'No',
    note: 'Note:',
    templateSubjectNote1: 'Fixed required dimensions (Customer, Transport Mode) cannot be disabled; all other dimensions are optional configuration',
    templateSubjectNote2: 'After enabling POL/POD, new template forms will show port selectors and auto-generate Lane',
    templateSubjectNote3: 'Changes only affect newly created/edited templates; historical templates retain original values',
    templateSubjectNote4: 'Template names will be auto-generated based on enabled dimensions',

    // Process Templates
    templateName: 'Template Name',
    effectiveDate: 'Effective Date',
    version: 'Version',
    remark: 'Remark',
    nodeName: 'Node Name',
    predecessor: 'Predecessor',
    skippable: 'Skippable',
    skipCondition: 'Skip Condition',
    requiredFiles: 'Required Files',
    automation: 'Automation Level',
    taskName: 'Task Name',
    taskType: 'Task Type',
    targetTeam: 'Target Team',
    targetUser: 'Target User',
    customer: 'Customer',
    priority: 'Priority',
    team: 'Team',
    template: 'Template',
    originRegion: 'Origin Region',
    destinationRegion: 'Destination Region',
    originCountry: 'Origin Country',
    destinationCountry: 'Destination Country',
    consignee: 'Consignee',
    incoterm: 'Incoterm',
    workloadStrategy: 'Workload Strategy',
    condition: 'Trigger Condition',
    fallbackQueue: 'Fallback Queue',
    escalationRole: 'Escalation Role',
    escalationSla: 'Escalation SLA',
    addRule: 'Add Rule',
    editRule: 'Edit Rule',
    teamAssignmentRules: 'Team Assignment Rules',
    userAssignmentRules: 'User Assignment Rules',
    fallbackRules: 'Fallback Rules',
    milestoneList: 'Milestone List',
    addTemplate: 'Add Template',
    editTemplate: 'Edit Template',
    duplicateTemplate: 'Duplicate Template',
    deleteTemplate: 'Delete Template',
    milestoneDetail: 'Milestone Detail',
    addMilestone: 'Add Milestone',
    editMilestone: 'Edit Milestone',
    deleteMilestone: 'Delete Milestone',
    taskDetail: 'Task Detail',
    addTask: 'Add Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    noTasks: 'No tasks configured for this milestone',
    optionalDimensions: 'Optional Dimensions',
    closeSelector: 'Close Selector',
    addDimension: '+ Add Dimension',
    noAvailableDimensions: 'No available optional dimensions. Please enable them in "Workflow Dimension Management" first.',
    close: 'Close',
    confirmDeleteTemplate: 'Are you sure you want to delete this template? This will also delete all its milestones and tasks.',
    confirmDeleteMilestone: 'Are you sure you want to delete this milestone? This will also delete all its tasks.',
    confirmDeleteTask: 'Are you sure you want to delete this task?',
    copySuffix: '(Copy)',
    inactiveTag: '(Inactive)',
    milestoneCount: 'Milestones',
    taskCount: 'Tasks',
    templateList: 'Template List',

    // Profile
    myProfile: 'My Profile',
    profileSubtitle: 'Manage personal contact info, change password, and view recent logins and active sessions.',
    personalInfo: 'Personal Information',
    readOnlyNote: 'Email and Role(s) are read-only per PRD requirements.',
    changePassword: 'Change Password',
    recentLogins: 'Recent 10 Logins',
    activeSessions: 'Active Sessions',
    endSession: 'End',
    
    // Audit Log
    auditTitle: 'Audit Log',
    auditSubtitle: 'Records User ID, Action, Module, Timestamp, IP, Session, Status. Logs cannot be modified or deleted.',
    exportCsv: 'Export CSV',
    allUsers: 'All Users',
    allModules: 'All Modules',
    allActions: 'All Actions',
    allStatuses: 'All Statuses',
    allCustomers: 'All Customers',
    
    // Reserved
    comingSoon: 'Coming Soon',
    reservedDesc: 'This module has reserved menu, route, and page entry points. Business logic will be enabled in later phases.',
    
    // Table
    noData: 'No data',
    adjustFilter: 'Adjust filters or add a new record',
    operations: 'Actions',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    blank: 'Blank',
    noMatches: 'No matches',
    filterSearchPlaceholder: ' ',

    // SKU/Product
    productName: 'Product Name',
    productChineseName: 'Product Chinese name',
    category: 'Category',
    productCode: 'Product Code',
    unit: 'Unit',
    width: 'Width (CM)',
    height: 'Height (CM)',
    length: 'Length (CM)',
    weight: 'Weight (KG)',
    widthCm: 'Width (cm)',
    heightCm: 'Height (cm)',
    lengthCm: 'Length (cm)',
    weightKg: 'Weight (kg)',
    operate: 'Operate',
    unitConversation: 'Unit Conversation',
    modify: 'Modify',
    goTo: 'Go to',
    total: 'Total',
    export: 'Export',
    import: 'Import',
    code: 'Code',
    name: 'Name',
    type: 'Type',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    description: 'Description',

    // Master Data domains
    productMaster: 'SKU',
    equipmentMaster: 'Equipment',
    vesselMaster: 'Vessel/Voyage',
    serviceMaster: 'Service Master',
    clientConfiguration: 'Client Configuration',
    businessPartnerManagement: 'Business Partner Management',
    carrierManagement: 'Carrier Management',
    locationManagement: 'Location Management',
    productConfiguration: 'Product Configuration',
    equipmentConfiguration: 'Equipment Configuration',
    vesselConfiguration: 'Vessel Configuration',

    // Vessel fields
    vesselId: 'Vessel ID',
    vesselName: 'Vessel Name',
    imoNumber: 'IMO Number',
    voyageNumber: 'Voyage Number',
    carrier: 'Carrier',
    schedule: 'Schedule',
    allVessels: 'All Vessels',

    // Service fields
    serviceId: 'Service ID',
    serviceName: 'Service Name',
    serviceCode: 'Service Code',
    serviceType: 'Service Type',
    transportMode: 'Transport Mode',
    transitTimeMin: 'Transit Time Min (days)',
    transitTimeMax: 'Transit Time Max (days)',
    pol: 'POL',
    pod: 'POD',
    tsPorts: 'T/S Ports',
    defaultOrganization: 'Default Organization',

    // Role fields
    configurePermissions: 'Configure Permissions',

    // User fields
    userNumber: 'User Number',
    userName: 'Name',
    userEmail: 'Email',
    userPhone: 'Phone',
    userRoles: 'Roles',
    userOrgs: 'Organizations',
    userWorkGroups: 'Work Groups',
    userActive: 'Active',

    // Equipment fields
    equipmentId: 'Equipment ID',
    equipmentName: 'Equipment Name',
    equipmentType: 'Equipment Type',
    teuCapacity: 'TEU Capacity',
    teu: 'TEU',
    lengthFt: 'Length (ft)',
    heightFt: 'Height (ft)',
    maxWeight: 'Max Weight',
    maxWeightKg: 'Max Weight (kg)',
    unitType: 'Unit Type',

    // Product fields
    skuId: 'SKU ID',
    alternativeProductCode: 'Alternative Product Code',
    commodityCode: 'Commodity Code',
    hazardous: 'Hazardous',
    hazardousMaterial: 'Hazardous Material',
    unNumber: 'UN Number',
    dangerousGoods: 'Dangerous Goods',
    defaultWeight: 'Default Weight (kg)',

    // Carrier fields
    carrierCode: 'Carrier Code',
    carrierName: 'Carrier Name',
    scac: 'SCAC',
    scacIata: 'SCAC/IATA',
    mode: 'Mode',
    country: 'Country',
    contactPerson: 'Contact Person',
    contactEmail: 'Contact Email',
    notes: 'Notes',

    // Location fields
    locationId: 'Location ID',
    locationCode: 'Location Code',
    locationName: 'Location Name',
    locationType: 'Location Type',
    unLocode: 'UN/LOCODE',
    region: 'Region',
    addressLine1: 'Address Line 1',
    addressLine2: 'Address Line 2',
    city: 'City',
    stateProvince: 'State/Province',
    postalCode: 'Postal Code',

    // Client fields
    customerCode: 'Customer Code',
    customerName: 'Customer Name',
    clientId: 'Client ID',
    clientName: 'Client Name',
    clientCode: 'Client Code',
    clientType: 'Client Type',
    operationalCountry: 'Country (Operational)',
    industrySector: 'Industry / Sector',
    invoiceLegalEntity: 'Invoice Legal Entity',
    invoiceCurrency: 'Invoice Currency',
    paymentTerms: 'Payment Terms',
    taxRegistrationNumber: 'Tax Registration Number',
    billingAddress: 'Billing Address',
    invoiceFormat: 'Invoice Format',
    creditLimit: 'Credit Limit',
    discountProfile: 'Discount Profile',
    addressCountry: 'Country (Address)',
    contactPhone: 'Contact Phone',
    timezone: 'Timezone',
    client: 'Client',
    businessPartnerNamePlaceholder: 'Full name of business partner',
    supplier: 'Supplier',
    producer: 'Producer',
    trucker: 'Trucker',

    // Common actions
    pleaseInput: 'Please input',
    allRegions: 'All Regions',
    allTypes: 'All Types',
    allProducts: 'All Products',
    hazardousOnly: 'Hazardous Only',
    nonHazardousOnly: 'Non-Hazardous Only',
    allCarriers: 'All Carriers',
    allServiceTypes: 'All Service Types',
    allTransportModes: 'All Transport Modes',
    allUnitTypes: 'All Unit Types',
    applicableRegion: 'Applicable Region',
    actions: 'Actions',
    page: '/page',
    
    // Other
    p1Mvp: 'P1 MVP',
    operationalFoundation: 'Operational foundation',
    systemSetup: 'System setup and master data first, business modules reserved for later phases.',
    readyForP1: 'Ready for P1 maintenance and review.',
    executionReserved: 'Execution, tasks, quality, automation and reports have stable entry points.',
  },
};

// Missing translations cache
let missingTranslations: Array<{ key: string; fallback: string; lang: Language }> = [];

// Load missing translations from localStorage
function loadMissingTranslations() {
  try {
    const saved = localStorage.getItem('moov-os-missing-translations');
    if (saved) {
      missingTranslations = JSON.parse(saved);
    }
  } catch (e) {
    missingTranslations = [];
  }
}

// Save missing translations to localStorage
export function saveMissingTranslation(key: string, fallback: string, lang: Language) {
  const exists = missingTranslations.some(m => m.key === key && m.lang === lang);
  if (!exists) {
    missingTranslations.push({ key, fallback, lang });
    try {
      localStorage.setItem('moov-os-missing-translations', JSON.stringify(missingTranslations));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Simple auto-translate simulation (Chinese to English)
function simulateAutoTranslate(text: string): string {
  // Remove Chinese punctuation and keep alphanumeric + spaces
  return text
    .replace(/[，。！？、；：""''（）【】《》]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Auto-translate missing translations
export function autoTranslateMissing() {
  const targetLang: Language = getCurrentLanguage() === 'zh' ? 'en' : 'zh';
  const sourceLang: Language = getCurrentLanguage();
  
  missingTranslations.forEach(missing => {
    if (missing.lang === targetLang) return; // Already translated
    
    const translated = simulateAutoTranslate(missing.fallback);
    if (!translations[targetLang][missing.key as keyof typeof translations['zh']]) {
      (translations[targetLang] as any)[missing.key] = translated;
    }
  });
}

// Get browser language
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language || 'zh-CN';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';
  return 'zh'; // Default to Chinese
}

// Get translation with fallback support
export function t(lang: Language, key: string, fallback?: string): string {
  const value = translations[lang][key as keyof typeof translations['zh']];
  
  if (value) {
    return value;
  }
  
  // Key not found, use fallback or key itself
  const result = fallback || key;
  
  // Record missing translation
  saveMissingTranslation(key, result, lang);
  
  return result;
}

// Get current language from localStorage or browser
export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('moov-os-language');
  if (saved === 'en' || saved === 'zh') return saved as Language;
  
  // Auto-detect from browser
  return getBrowserLanguage();
}

// Save language setting
export function setCurrentLanguage(lang: Language) {
  localStorage.setItem('moov-os-language', lang);
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'moov-os-language',
    newValue: lang,
  }));
}

// Export missing translations for debugging
export { missingTranslations };

// Initialize on module load
loadMissingTranslations();

// Password Reset Token Management
export interface PasswordResetToken {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const PASSWORD_RESET_KEY = 'moov-os-password-reset-tokens';

export function generateResetToken(email: string): string {
  const token = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const resetTokens = getPasswordResetTokens();

  resetTokens.push({
    token,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    used: false,
  });

  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(resetTokens));
  return token;
}

export function getPasswordResetTokens(): PasswordResetToken[] {
  try {
    const saved = localStorage.getItem(PASSWORD_RESET_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function validateResetToken(token: string): PasswordResetToken | null {
  const tokens = getPasswordResetTokens();
  const found = tokens.find(t => t.token === token);

  if (!found) return null;
  if (found.used) return null;
  if (Date.now() > found.expiresAt) return null;

  return found;
}

export function markTokenAsUsed(token: string): void {
  const tokens = getPasswordResetTokens();
  const updated = tokens.map(t =>
    t.token === token ? { ...t, used: true } : t
  );
  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(updated));
}
