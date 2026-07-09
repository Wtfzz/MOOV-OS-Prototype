import { AppState, User, PORecord, POItem } from "@/types";

const STORAGE_KEY = "moov-os-p1-state";
const STATE_VERSION_KEY = "moov-os-p1-state-version";
const CURRENT_STATE_VERSION = 15; // Increment when data structure changes significantly

// Generate 40 sample PO records
function generatePurchaseOrders(): PORecord[] {
  const suppliers = [
    "Guangdong Big Tree Education Co.",
    "Shenzhen Tech Manufacturing Ltd.",
    "Ningbo Home Goods Factory",
    "Yiwu Trading Company",
    "Shanghai Export Industries",
    "Dongguan Precision Parts Co.",
    "Hangzhou Textile Group",
    "Foshan Furniture Manufacturing",
    "Qingdao Marine Supplies",
    "Xiamen Electronics Assembly",
    "Suzhou Industrial Components",
    "Wuhan Auto Parts Ltd.",
    "Chengdu Food Processing Co.",
    "Tianjin Chemical Products",
    "Nanjing Steel Works"
  ];

  const statuses: Array<'Destination In Process' | 'Cancel' | 'Hold' | 'Completed'> = [
    'Destination In Process',
    'Destination In Process',
    'Destination In Process',
    'Cancel',
    'Hold',
    'Completed',
    'Completed',
    'Completed'
  ];

  const poTags = [
    ["NOS"],
    ["Children Toy"],
    ["NOS", "Children Toy"],
    ["Fragile"],
    ["Temperature Controlled"],
    [],
    ["Hazardous"],
    ["Oversized"]
  ];

  const merchCodes = ["MERCH-001", "MERCH-002", "MERCH-003", "MERCH-004", "MERCH-005"];

  const orders: PORecord[] = [];

  for (let i = 1; i <= 40; i++) {
    const supplierIndex = (i - 1) % suppliers.length;
    const statusIndex = (i - 1) % statuses.length;
    const tagIndex = (i - 1) % poTags.length;
    const merchIndex = (i - 1) % merchCodes.length;

    const orderNumber = `F-${String(i).padStart(3, '0')}_${String(702000 + i)}`;
    const progress = Math.floor(Math.random() * 100);
    const processTotal = Math.floor(Math.random() * 20) + 5;

    // Generate 1-4 items per order
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items: POItem[] = [];

    for (let j = 1; j <= itemCount; j++) {
      const orderedOuter = Math.floor(Math.random() * 500) + 50;
      const orderedInner = Math.floor(orderedOuter * 0.6);
      const orderedPieces = orderedOuter * 12;
      const orderedVolume = parseFloat((orderedOuter * 0.025).toFixed(2));

      const bookedOuter = Math.floor(orderedOuter * (0.8 + Math.random() * 0.2));
      const bookedInner = Math.floor(bookedOuter * 0.6);
      const bookedPieces = bookedOuter * 12;
      const bookedVolume = parseFloat((bookedOuter * 0.025).toFixed(2));

      const grossWeight = parseFloat((orderedOuter * 2.5).toFixed(1));
      const outerSizeLWH = `${Math.floor(Math.random() * 20) + 30}x${Math.floor(Math.random() * 15) + 20}x${Math.floor(Math.random() * 10) + 15}`;

      items.push({
        itemNumber: `ITEM-${String(j).padStart(3, '0')}`,
        tcId: `TC-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        orderedOuterCartons: orderedOuter,
        orderedInnerCartons: orderedInner,
        orderedPieces: orderedPieces,
        orderedVolumeCbm: orderedVolume,
        bookedOuterCartons: bookedOuter,
        bookedInnerCartons: bookedInner,
        bookedPieces: bookedPieces,
        outerSizeLWH: outerSizeLWH,
        bookedVolumeCbm: bookedVolume,
        grossWeightKg: grossWeight
      });
    }

    const totalBookedOuter = items.reduce((sum, item) => sum + (item.bookedOuterCartons || 0), 0);
    const totalBookedInner = items.reduce((sum, item) => sum + (item.bookedInnerCartons || 0), 0);
    const totalBookedPieces = items.reduce((sum, item) => sum + (item.bookedPieces || 0), 0);
    const totalBookedVolume = parseFloat(items.reduce((sum, item) => sum + (item.bookedVolumeCbm || 0), 0).toFixed(2));
    const totalGrossWeight = parseFloat(items.reduce((sum, item) => sum + (item.grossWeightKg || 0), 0).toFixed(1));

    const baseDate = new Date(2026, 6, 1); // July 1, 2026
    const dayOffset = Math.floor(Math.random() * 30);
    const plannedCrd = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const supplierCrd = new Date(plannedCrd.getTime() + 2 * 24 * 60 * 60 * 1000);
    const ahod = new Date(supplierCrd.getTime() + 3 * 24 * 60 * 60 * 1000);
    const inDcDate = new Date(ahod.getTime() + 5 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const shippedTogetherList = [];
    for (let k = 0; k < Math.floor(Math.random() * 15) + 5; k++) {
      shippedTogetherList.push(`F-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}_${String(702000 + Math.floor(Math.random() * 100))}`);
    }

    const containerCount = Math.floor(Math.random() * 4) + 1;
    const containersStr = `40HC*${containerCount}`;
    const shippedContainersArr = [];
    for (let c = 0; c < containerCount; c++) {
      shippedContainersArr.push(`QAWS${String(702000 + i).slice(-6)}${String(c + 1).padStart(3, '0')}:40HC`);
    }

    const milestoneNames = ['PO Confirmation', 'Carrier Booking', 'Allocation Check', 'Transport Plan Approval', 'Shipment Creation', 'Customs Clearance', 'In-Transit', 'Arrival at POD', 'Delivery to DC'];
    const milestones = milestoneNames.map((name, idx) => {
      const plannedDate = new Date(plannedCrd.getTime() + (idx - 2) * 3 * 24 * 60 * 60 * 1000);
      const actualDate = Math.random() > 0.3 ? new Date(plannedDate.getTime() + Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000) : null;
      const statusIdx = actualDate ? (Math.random() > 0.8 ? 'Delayed' : 'Completed') : (idx <= 3 ? 'Completed' : 'Pending');
      return {
        milestoneName: name,
        plannedDate: formatDate(plannedDate),
        actualDate: actualDate ? formatDate(actualDate) : '-',
        status: statusIdx as any,
        remark: statusIdx === 'Delayed' ? 'Delayed due to port congestion' : undefined
      };
    });

    const documentTypes = ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin', 'Insurance Certificate', 'Inspection Report'];
    const documents = documentTypes.slice(0, Math.floor(Math.random() * 4) + 3).map((type, idx) => ({
      documentType: type,
      documentName: `${type}_${orderNumber.replace(/[-_]/g, '')}.pdf`,
      uploadDate: formatDate(new Date(plannedCrd.getTime() - (10 - idx) * 24 * 60 * 60 * 1000)),
      uploadedBy: ['Grace', 'Ops User', 'Supplier User'][idx % 3],
      status: ['Approved', 'Pending', 'Rejected'][idx % 3] as any
    }));

    const changeLogEntries = [
      { changeDate: formatDate(new Date(plannedCrd.getTime() - 15 * 24 * 60 * 60 * 1000)), changedBy: 'Grace', fieldName: 'Planned CRD', oldValue: formatDate(new Date(plannedCrd.getTime() - 5 * 24 * 60 * 60 * 1000)), newValue: formatDate(plannedCrd), reason: 'Supplier requested delay' },
      { changeDate: formatDate(new Date(plannedCrd.getTime() - 10 * 24 * 60 * 60 * 1000)), changedBy: 'Ops User', fieldName: 'Container Type', oldValue: '20GP', newValue: '40HC', reason: 'Volume increase' },
      { changeDate: formatDate(new Date(plannedCrd.getTime() - 5 * 24 * 60 * 60 * 1000)), changedBy: 'Grace', fieldName: 'Booking Date', oldValue: '-', newValue: formatDate(new Date(plannedCrd.getTime() - 5 * 24 * 60 * 60 * 1000)), reason: 'Booking confirmed' }
    ];

    const comments = [
      { commentDate: formatDate(new Date(plannedCrd.getTime() - 12 * 24 * 60 * 60 * 1000)), commentedBy: 'Grace', content: 'Please ensure all items are packed according to LIDL standards.' },
      { commentDate: formatDate(new Date(plannedCrd.getTime() - 8 * 24 * 60 * 60 * 1000)), commentedBy: 'Ops User', content: 'Carrier booking submitted, awaiting confirmation.' },
      { commentDate: formatDate(new Date(plannedCrd.getTime() - 3 * 24 * 60 * 60 * 1000)), commentedBy: 'Supplier User', content: 'Goods ready for pickup on scheduled date.' }
    ];

    orders.push({
      id: `po${i}`,
      orderNumber: orderNumber,
      supplierName: suppliers[supplierIndex],
      pendingStatus: statuses[statusIndex],
      processProgress: progress,
      processTotal: processTotal,
      hod: formatDate(new Date(plannedCrd.getTime() - 2 * 24 * 60 * 60 * 1000)),
      plannedCrd: formatDate(plannedCrd),
      supplierCrd: formatDate(supplierCrd),
      ahod: formatDate(ahod),
      inDcDate: formatDate(inDcDate),
      bookingDate: Math.random() > 0.3 ? formatDate(new Date(plannedCrd.getTime() - 5 * 24 * 60 * 60 * 1000)) : undefined,
      bookedEtd: Math.random() > 0.4 ? formatDate(new Date(inDcDate.getTime() + 7 * 24 * 60 * 60 * 1000)) : undefined,
      bookedEta: Math.random() > 0.4 ? formatDate(new Date(inDcDate.getTime() + 25 * 24 * 60 * 60 * 1000)) : undefined,
      etd: Math.random() > 0.5 ? formatDate(new Date(inDcDate.getTime() + 8 * 24 * 60 * 60 * 1000)) : undefined,
      eta: Math.random() > 0.5 ? formatDate(new Date(inDcDate.getTime() + 26 * 24 * 60 * 60 * 1000)) : undefined,
      atd: Math.random() > 0.6 ? formatDate(new Date(inDcDate.getTime() + 7 * 24 * 60 * 60 * 1000)) : undefined,
      ata: Math.random() > 0.6 ? formatDate(new Date(inDcDate.getTime() + 25 * 24 * 60 * 60 * 1000)) : undefined,
      poTag: poTags[tagIndex],
      containerNo: Math.random() > 0.3 ? `CNTR${String(Math.floor(Math.random() * 90000) + 10000)}` : undefined,
      merchCode: merchCodes[merchIndex],
      items: items,
      bookedOuterCartons: totalBookedOuter,
      bookedInnerCartons: totalBookedInner,
      bookedPieces: totalBookedPieces,
      outerSizeLWH: items[0]?.outerSizeLWH,
      bookedVolumeCbm: totalBookedVolume,
      grossWeightKg: totalGrossWeight,
      // Sub-tab data
      generalInfo: {
        customerPoNumber: `CPO-${String(2026000 + i)}`,
        poCreationDate: formatDate(new Date(plannedCrd.getTime() - 20 * 24 * 60 * 60 * 1000)),
        poType: ['Standard', 'Urgent', 'Consolidated'][i % 3],
        currency: ['USD', 'EUR', 'CNY'][i % 3],
        totalValue: parseFloat((totalBookedOuter * 15.5).toFixed(2)),
        paymentTerms: ['Net 30', 'Net 45', 'Net 60'][i % 3],
        deliveryTerms: ['FOB', 'CIF', 'DDP'][i % 3],
        remarks: i % 5 === 0 ? 'Priority shipment - handle with care' : ''
      },
      locationInfo: {
        originCountry: 'CN',
        originPort: ['Shanghai', 'Ningbo', 'Shenzhen', 'Qingdao'][i % 4],
        destinationPort: ['Port in Poland', 'Hamburg', 'Rotterdam', 'Antwerp'][i % 4],
        requestedBookingDate: formatDate(new Date(plannedCrd.getTime() - 7 * 24 * 60 * 60 * 1000)),
        handoverDate: formatDate(new Date(plannedCrd.getTime() - 2 * 24 * 60 * 60 * 1000)),
        ahod: formatDate(ahod),
        incoterm: ['FOB', 'CIF', 'DDP', 'EXW'][i % 4],
        namedPlace: ['DC Bucharest', 'DC Warsaw', 'DC Berlin', 'DC Paris'][i % 4],
        transportMode: ['SEA', 'AIR', 'RAIL', 'MULTI'][i % 4],
        originLocationBooked: ['CNNGB', 'CNSHA', 'CNSZX', 'CNQIN'][i % 4],
        originPortBooked: ['CNNGB', 'CNSHA', 'CNSZX', 'CNQIN'][i % 4],
        destinationPortBooked: ['INTUT', 'DEHAM', 'NLRTM', 'BEANR'][i % 4],
        destinationLocationBooked: ['INTUT', 'DEHAM', 'NLRTM', 'BEANR'][i % 4],
        destinationDc: ['0030', '0010', '0020', '0040'][i % 4]
      },
      partyInfo: {
        shipperName: suppliers[supplierIndex],
        shipperAddress: `${Math.floor(Math.random() * 900) + 100} Industrial Zone, ${['Guangdong', 'Zhejiang', 'Jiangsu', 'Fujian'][i % 4]}, China`,
        consigneeName: ['LIDL Poland Sp. z o.o.', 'Pepco Group BV', 'IKEA Distribution Services', 'Amazon EU SARL'][i % 4],
        consigneeAddress: ['ul. Magazynowa 1, 00-001 Warsaw, Poland', 'Joop Geesinkweg 9, 1114 Amsterdam, NL', 'Inter IKEA Systems BV, Delft, NL', '38 avenue John F. Kennedy, Luxembourg'][i % 4],
        notifyPartyName: ['LIDL Logistics GmbH', 'Pepco Logistics', 'IKEA Transport', 'Amazon Logistics'][i % 4],
        notifyPartyAddress: ['Stiftsbergstrasse 1, 74172 Neckarsulm, DE', 'Same as Consignee', 'Same as Consignee', 'Same as Consignee'][i % 4],
        supplierContact: `+86 ${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
        supplierEmail: `contact${i}@${suppliers[supplierIndex].split(' ')[0].toLowerCase()}.com`
      },
      carrierBooking: {
        shipmentRef: `PEPCO${String(260700 + i)}00001`,
        bookingNumber: String(260700 + i),
        blNumber: `MBL${String(260700 + i)}001`,
        shippedTogetherWith: shippedTogetherList,
        carrier: ['MSCU', 'MAEU', 'CMDU', 'EGLV', 'COSU'][i % 5],
        vesselVoyage: `${['PANDA', 'ESSEX', 'ANTOINE', 'GIVEN', 'HARMONY'][i % 5]} ${String(i % 10).padStart(3, '0')}/${String((i + 1) % 10).padStart(3, '0')}`,
        contractNumber: `R562260${String(40000000 + i)}`,
        shippedTeu: containerCount * 2,
        week: `W${String(Math.floor(i / 4) + 26).padStart(2, '0')}`,
        bookedEtd: formatDate(new Date(inDcDate.getTime() + 7 * 24 * 60 * 60 * 1000)),
        bookedEta: formatDate(new Date(inDcDate.getTime() + 25 * 24 * 60 * 60 * 1000)),
        atd: formatDate(new Date(inDcDate.getTime() + 7 * 24 * 60 * 60 * 1000)),
        ata: formatDate(new Date(inDcDate.getTime() + 25 * 24 * 60 * 60 * 1000)),
        containers: containersStr,
        shippedContainers: shippedContainersArr.join(', '),
        transportStatus: ['Shipping Instructions', 'Loaded on Vessel', 'In Transit', 'Arrived at POD'][i % 4]
      },
      milestones: milestones,
      documents: documents,
      transportPlanHistory: [
        { version: 'v1.0', createdDate: formatDate(new Date(plannedCrd.getTime() - 20 * 24 * 60 * 60 * 1000)), createdBy: 'Grace', changes: 'Initial transport plan created', status: 'Superseded' as const },
        { version: 'v1.1', createdDate: formatDate(new Date(plannedCrd.getTime() - 15 * 24 * 60 * 60 * 1000)), createdBy: 'Ops User', changes: 'Updated carrier from OSL to MSCU', status: 'Superseded' as const },
        { version: 'v2.0', createdDate: formatDate(new Date(plannedCrd.getTime() - 10 * 24 * 60 * 60 * 1000)), createdBy: 'Grace', changes: 'Changed container type to 40HC, updated ETD', status: 'Active' as const }
      ],
      changeLog: changeLogEntries,
      comments: comments,
      cargoReadyDate: formatDate(new Date(plannedCrd.getTime() - 3 * 24 * 60 * 60 * 1000)),
      actualHandoverDate: formatDate(new Date(plannedCrd.getTime() - 1 * 24 * 60 * 60 * 1000))
    });
  }

  return orders;
}

export const defaultRoles = [
  "Admin",
  "Allocation Manager",
  "Team Manager",
  "Ops",
  "CS",
  "OHA",
  "Finance",
  "Vendor Manager",
  "WMS User",
];

export const roleProfiles: Record<string, { label: string; menus: string[]; dataScope: string }> = {
  Admin: {
    label: "System Admin",
    menus: ["*"],
    dataScope: "All customers / all regions",
  },
  "Allocation Manager": {
    label: "Allocation Manager",
    menus: ["home", "profile", "master-customers", "master-organizations", "master-locations", "master-products", "master-equipment", "master-vessels", "master-services", "execution-po", "execution-plan", "execution-booking", "execution-allocation", "execution-shipment", "tasks-my", "tasks-team", "tasks-sla", "tasks-assignment", "quality-exceptions", "quality-sla", "quality-validation", "reports-task", "reports-exception", "reports-workload"],
    dataScope: "LIDL, Pepco / Asia, Europe, Americas",
  },
  "Team Manager": {
    label: "Team Manager",
    menus: ["home", "profile", "master-customers", "master-organizations", "master-locations", "master-products", "master-equipment", "master-vessels", "master-services", "execution-po", "execution-plan", "execution-booking", "execution-allocation", "execution-shipment", "tasks-my", "tasks-team", "tasks-sla", "tasks-assignment", "quality-exceptions", "reports-task", "reports-workload"],
    dataScope: "Assigned team clients / regions",
  },
  Ops: {
    label: "Ops",
    menus: ["home", "profile", "master-customers", "master-organizations", "master-locations", "master-products", "master-equipment", "master-vessels", "master-services", "execution-po", "execution-plan", "execution-booking", "execution-allocation", "execution-shipment", "tasks-my", "tasks-team", "quality-exceptions", "reports-task"],
    dataScope: "Assigned clients / Asia region",
  },
  CS: {
    label: "Customer Service",
    menus: ["home", "profile", "master-customers", "master-organizations", "execution-shipment", "tasks-my", "quality-exceptions", "reports-task"],
    dataScope: "Assigned clients / regions",
  },
  OHA: {
    label: "OHA",
    menus: ["home", "profile", "execution-shipment", "tasks-my"],
    dataScope: "Assigned handling scope only",
  },
  Finance: {
    label: "Finance",
    menus: ["home", "profile", "execution-allocation", "reports-task", "reports-export"],
    dataScope: "All clients / cost view only",
  },
  "Vendor Manager": {
    label: "Vendor Manager",
    menus: ["home", "profile", "master-organizations", "execution-allocation", "reports-workload", "reports-export"],
    dataScope: "LIDL, Pepco / vendor scope",
  },
  "WMS User": {
    label: "WMS User",
    menus: ["home", "profile", "execution-shipment", "tasks-my"],
    dataScope: "Assigned warehouse scope",
  },
};

export const demoAccounts = [
  { email: "admin@moov.local", password: "Admin123!", firstName: "Grace", lastName: "Chen", name: "Grace", roles: ["Admin"], role: "Admin", team: "IT BP", department: "IT BP", phone: "+86 138 0000 0000" },
  { email: "ops@moov.local", password: "Ops123!!", firstName: "Ops", lastName: "User", name: "Ops User", roles: ["Ops"], role: "Ops", team: "MOOV Ops", department: "Operations", phone: "+86 139 0000 0000" },
  { email: "supplier@moov.local", password: "Supplier123!", firstName: "Supplier", lastName: "User", name: "Supplier User", roles: ["OHA"], role: "OHA", team: "OHA Partner", department: "OHA", phone: "+86 137 0000 0000" },
];

const defaultState: AppState = {
  users: [
    { id: "u1", userNumber: "U001", name: "Grace Chen", email: "admin@moov.local", phone: "+86 138 0000 0000", roleIds: ["ADMIN"], workGroupIds: ["WG001", "WG002"], active: true, createdBy: "System", createdAt: "2026-06-01" },
    { id: "u2", userNumber: "U002", name: "Ops User", email: "ops@moov.local", phone: "+86 139 0000 0000", roleIds: ["OPS"], workGroupIds: ["WG001"], active: true, createdBy: "admin@moov.local", createdAt: "2026-06-15" },
    { id: "u3", userNumber: "U003", name: "OHA User", email: "supplier@moov.local", phone: "+86 137 0000 0000", roleIds: ["OHA"], workGroupIds: ["WG003"], active: true, createdBy: "admin@moov.local", createdAt: "2026-06-20" },
    { id: "u4", userNumber: "U004", name: "Alice Wang", email: "alice.wang@moov.com", phone: "+86 136 1000 2101", roleIds: ["CS"], workGroupIds: ["WG002"], active: true, createdBy: "admin@moov.local", createdAt: "2026-07-01" },
    { id: "u5", userNumber: "U005", name: "Bob Li", email: "bob.li@moov.com", phone: "+86 136 1000 2102", roleIds: ["OPS"], workGroupIds: ["WG002"], active: true, createdBy: "admin@moov.local", createdAt: "2026-07-01" },
    { id: "u6", userNumber: "U006", name: "Charlie Zhang", email: "charlie.zhang@moov.com", phone: "+86 136 1000 2103", roleIds: ["OPS"], workGroupIds: ["WG001"], active: true, createdBy: "admin@moov.local", createdAt: "2026-07-02" },
    { id: "u7", userNumber: "U007", name: "Mia Chen", email: "mia.chen@moov.com", phone: "+86 136 1000 2104", roleIds: ["CS"], workGroupIds: ["WG001", "WG002"], active: true, createdBy: "admin@moov.local", createdAt: "2026-07-02" },
    { id: "u8", userNumber: "U008", name: "Kenji Sato", email: "kenji.sato@moov.com", phone: "+81 90 1000 2105", roleIds: ["OHA"], workGroupIds: ["WG003"], active: true, createdBy: "admin@moov.local", createdAt: "2026-07-03" },
  ],
  roles: [
    { id: "ADMIN", roleNumber: "R001", roleName: "System Admin", roleType: "System", description: "Full system access with all permissions", active: true, createdAt: "2026-06-01" },
    { id: "OPS", roleNumber: "R002", roleName: "Operations", roleType: "Operations", description: "Operational tasks including PO management and shipment creation", active: true, createdAt: "2026-06-01" },
    { id: "OHA", roleNumber: "R003", roleName: "OHA Partner", roleType: "Customer Service", description: "Origin handling agent with limited access", active: true, createdAt: "2026-06-01" },
    { id: "ALLOC_MGR", roleNumber: "R004", roleName: "Allocation Manager", roleType: "Management", description: "Manages carrier allocation and booking matrix", active: true, createdAt: "2026-06-01" },
    { id: "TEAM_MGR", roleNumber: "R005", roleName: "Team Manager", roleType: "Management", description: "Oversees team operations and task assignment", active: true, createdAt: "2026-06-01" },
    { id: "CS", roleNumber: "R006", roleName: "Customer Service", roleType: "Customer Service", description: "Customer-facing support and inquiry handling", active: true, createdAt: "2026-06-01" },
    { id: "FINANCE", roleNumber: "R007", roleName: "Finance", roleType: "Finance", description: "Financial reporting and cost analysis", active: true, createdAt: "2026-06-01" },
    { id: "VENDOR_MGR", roleNumber: "R008", roleName: "Vendor Manager", roleType: "Operations", description: "Manages vendor relationships and performance", active: true, createdAt: "2026-06-01" },
    { id: "WMS_USER", roleNumber: "R009", roleName: "WMS User", roleType: "Warehouse", description: "Warehouse management system operations", active: true, createdAt: "2026-06-01" },
  ],
  orgs: [
    { id: "ORG001", orgNumber: "ORG001", orgName: "MOOV Ops China", orgType: "Internal", parentId: "", region: "Asia", country: "CN", functionTeam: "Operations", owner: "Ops User", sourceSystem: "Manual", externalOrgId: "", syncStatus: "Manual", status: "Active", remark: "Admin maintained group; can be mapped to external org system later." },
    { id: "ORG002", orgNumber: "ORG002", orgName: "MOOV Europe Ops", orgType: "Internal", parentId: "", region: "Europe", country: "NL", functionTeam: "Operations", owner: "Grace", sourceSystem: "Manual", externalOrgId: "", syncStatus: "Manual", status: "Active", remark: "Admin maintained group; can be mapped to external org system later." },
    { id: "ORG003", orgNumber: "ORG003", orgName: "OHA North Asia", orgType: "Partner", parentId: "ORG001", region: "Asia", country: "CN", functionTeam: "Origin Handling", owner: "Grace", sourceSystem: "Manual", externalOrgId: "", syncStatus: "Manual", status: "Active", remark: "Reserved partner organization. External login is not enabled in P1." },
  ],
  organizationDataScopes: [
    { id: "scope-ORG001", organizationId: "ORG001", clientIds: ["LIDL-GLOBAL", "LIDL-US"], countries: ["CN"], regions: ["Asia"], active: true },
    { id: "scope-ORG002", organizationId: "ORG002", clientIds: ["PEPCO"], countries: ["NL", "PL", "DE"], regions: ["Europe"], active: true },
    { id: "scope-ORG003", organizationId: "ORG003", clientIds: ["LIDL-GLOBAL"], countries: ["CN"], regions: ["Asia"], active: true },
  ],
  workGroups: [
    {
      id: "WG001",
      workGroupNumber: "WG001",
      workGroupName: "China Origin Ops",
      workGroupType: "Operations",
      owner: "Ops User",
      description: "Origin operations team for China lanes.",
      status: "Active",
      filters: [
        { id: "wgf-WG001-client", field: "Client", operator: "IN", values: ["LIDL-GLOBAL", "LIDL-US"] },
        { id: "wgf-WG001-country", field: "Country", operator: "IN", values: ["CN"] },
        { id: "wgf-WG001-region", field: "Region", operator: "IN", values: ["Asia"] },
        { id: "wgf-WG001-pol", field: "POL", operator: "IN", values: ["CNSHA", "CNNGB", "CNSZX"] },
      ],
      taskQueueEnabled: true,
      assignmentEnabled: true,
      createdAt: "2026-07-07 10:00:00",
      createdBy: "admin@moov.local",
      updatedAt: "2026-07-07 10:00:00",
      updatedBy: "admin@moov.local",
    },
    {
      id: "WG002",
      workGroupNumber: "WG002",
      workGroupName: "Europe Destination Ops",
      workGroupType: "Operations",
      owner: "Grace Chen",
      description: "Destination operations team for Europe deliveries.",
      status: "Active",
      filters: [
        { id: "wgf-WG002-client", field: "Client", operator: "IN", values: ["PEPCO"] },
        { id: "wgf-WG002-country", field: "Country", operator: "IN", values: ["NL", "PL", "DE"] },
        { id: "wgf-WG002-region", field: "Region", operator: "IN", values: ["Europe"] },
        { id: "wgf-WG002-pod", field: "POD", operator: "IN", values: ["NLRTM", "DEHAM", "PLPOZ"] },
      ],
      taskQueueEnabled: true,
      assignmentEnabled: true,
      createdAt: "2026-07-07 10:00:00",
      createdBy: "admin@moov.local",
      updatedAt: "2026-07-07 10:00:00",
      updatedBy: "admin@moov.local",
    },
    {
      id: "WG003",
      workGroupNumber: "WG003",
      workGroupName: "OHA North Asia",
      workGroupType: "OHA",
      owner: "Grace Chen",
      description: "External handling work group prepared for task queues and scoped visibility.",
      status: "Active",
      filters: [
        { id: "wgf-WG003-client", field: "Client", operator: "=", values: ["LIDL-GLOBAL"] },
        { id: "wgf-WG003-country", field: "Country", operator: "=", values: ["CN"] },
        { id: "wgf-WG003-region", field: "Region", operator: "=", values: ["Asia"] },
      ],
      taskQueueEnabled: true,
      assignmentEnabled: false,
      createdAt: "2026-07-07 10:00:00",
      createdBy: "admin@moov.local",
      updatedAt: "2026-07-07 10:00:00",
      updatedBy: "admin@moov.local",
    },
  ],
  workflows: [
    { id: "w1", customer: "LIDL", processName: "LIDL P1 Ocean Export", taskName: "PO Confirmation", predecessor: "Start", sla: "24h", skipRule: "None", status: "Active", remark: "" },
    { id: "w2", customer: "Pepco", processName: "Pepco P1 Air/Ocean Basic", taskName: "Transport Plan Approval", predecessor: "PO Confirmation", sla: "48h", skipRule: "Skip if no change", status: "Active", remark: "" },
  ],
  assignmentRules: [
    { id: "a1", customer: "LIDL", taskType: "PO Confirmation", geography: "Asia", role: "Ops", owner: "Ops User", manualAdjust: "Allowed", status: "Active", remark: "" },
    { id: "a2", customer: "Pepco", taskType: "Transport Plan", geography: "Europe", role: "Team Manager", owner: "Grace", manualAdjust: "Allowed", status: "Active", remark: "" },
  ],
  configs: [
    { id: "c1", configType: "Transport Mode", code: "OCEAN", name: "Ocean", value: "Sea freight", owner: "Grace", status: "Active", remark: "" },
    { id: "c2", configType: "Exception Type", code: "DATA_MISMATCH", name: "Data mismatch", value: "Auto exception", owner: "Grace", status: "Active", remark: "" },
    { id: "c3", configType: "SLA Type", code: "TASK_24H", name: "Task 24h", value: "24", owner: "Grace", status: "Active", remark: "" },
  ],
  processTemplates: [
    {
      id: "pt1",
      templateName: "LIDL Asia-Europe Ocean Export",
      customer: "LIDL",
      pol: "CNSHA",
      pod: "DEHAM",
      lane: "Asia-Europe",
      transportMode: "Ocean",
      region: "Asia",
      subjectValues: {
        customer: "LIDL",
        originRegion: "Asia",
        destinationRegion: "Europe",
        transportMode: "Ocean",
        pol: "CNSHA",
        pod: "DEHAM"
      },
      effectiveDate: "2026-07-01",
      version: "v1.0",
      tags: "Customer:LIDL, POL:CNSHA, POD:DEHAM, Lane:Asia-Europe, Mode:Ocean",
      status: "Active",
      remark: "P1 workflow template with configurable nodes"
    },
    {
      id: "pt2",
      templateName: "Pepco Europe Multi-modal Basic",
      customer: "Pepco",
      pol: "CNSZX",
      pod: "PLPOZ",
      lane: "Asia-Europe",
      transportMode: "Multi-modal",
      region: "Europe",
      subjectValues: {
        customer: "Pepco",
        originRegion: "Asia",
        destinationRegion: "Europe",
        transportMode: "Multi-modal",
        pol: "CNSZX",
        pod: "PLPOZ"
      },
      effectiveDate: "2026-07-01",
      version: "v1.0",
      tags: "Customer:Pepco, POL:CNSZX, POD:PLPOZ, Lane:Asia-Europe, Mode:Multi-modal",
      status: "Active",
      remark: "Basic booking and shipment workflow"
    },
  ],
  milestones: [
    { id: "tn1", templateId: "pt1", milestoneSeq: 1, milestoneName: "PO Confirmation", predecessor: "Start", sla: "24h", slaTypeId: "stc1", skippable: "No", skipCondition: "", requiredFiles: "PO file", automation: "Manual", status: "Active" },
    { id: "tn2", templateId: "pt1", milestoneSeq: 2, milestoneName: "Carrier Booking", predecessor: "PO Confirmation", sla: "24h", slaTypeId: "stc1", skippable: "No", skipCondition: "", requiredFiles: "Booking request", automation: "Semi-auto", status: "Active" },
    { id: "tn3", templateId: "pt1", milestoneSeq: 3, milestoneName: "Allocation Check", predecessor: "Carrier Booking", sla: "12h", slaTypeId: "stc2", skippable: "Yes", skipCondition: "Skip if committed allocation is sufficient", requiredFiles: "Allocation matrix", automation: "Semi-auto", status: "Active" },
    // Pepco pt2 - 21 Milestones from Excel template
    { id: "tn4", templateId: "pt2", milestoneSeq: 1, milestoneName: "Upload PO", predecessor: "Start", sla: "", slaTypeId: "stc4", skippable: "No", skipCondition: "", requiredFiles: "PO details", automation: "Manual", status: "Active" },
    { id: "tn5", templateId: "pt2", milestoneSeq: 2, milestoneName: "CRD update", predecessor: "Upload PO", sla: "", slaTypeId: "stc5", skippable: "No", skipCondition: "", requiredFiles: "Cargo ready date", automation: "Manual", status: "Active" },
    { id: "tn6", templateId: "pt2", milestoneSeq: 3, milestoneName: "Cargo dimensions", predecessor: "CRD update", sla: "", slaTypeId: "stc5", skippable: "No", skipCondition: "", requiredFiles: "Cargo dimension data", automation: "Manual", status: "Active" },
    { id: "tn7", templateId: "pt2", milestoneSeq: 4, milestoneName: "Shipper booking", predecessor: "Cargo dimensions", sla: "", slaTypeId: "stc5", skippable: "No", skipCondition: "", requiredFiles: "Booking details", automation: "Manual", status: "Active" },
    { id: "tn8", templateId: "pt2", milestoneSeq: 5, milestoneName: "Shipper booking validation", predecessor: "Shipper booking", sla: "", slaTypeId: "stc6", skippable: "No", skipCondition: "", requiredFiles: "Booking validation", automation: "Manual", status: "Active" },
    { id: "tn9", templateId: "pt2", milestoneSeq: 6, milestoneName: "Assign Transport plan", predecessor: "Shipper booking validation", sla: "", slaTypeId: "stc6", skippable: "No", skipCondition: "", requiredFiles: "Transport plan", automation: "Manual", status: "Active" },
    { id: "tn10", templateId: "pt2", milestoneSeq: 7, milestoneName: "Pepco booking approval", predecessor: "Assign Transport plan", sla: "", slaTypeId: "stc6", skippable: "No", skipCondition: "", requiredFiles: "Booking approval", automation: "Manual", status: "Active" },
    { id: "tn11", templateId: "pt2", milestoneSeq: 8, milestoneName: "Pepco booking score", predecessor: "Pepco booking approval", sla: "", slaTypeId: "stc7", skippable: "No", skipCondition: "", requiredFiles: "Scoring result", automation: "Manual", status: "Active" },
    { id: "tn12", templateId: "pt2", milestoneSeq: 9, milestoneName: "Carrier booking", predecessor: "Pepco booking score", sla: "", slaTypeId: "stc10", skippable: "No", skipCondition: "", requiredFiles: "Carrier booking confirmation", automation: "Manual", status: "Active" },
    { id: "tn13", templateId: "pt2", milestoneSeq: 10, milestoneName: "Booking confirmation", predecessor: "Carrier booking", sla: "", slaTypeId: "stc8", skippable: "No", skipCondition: "", requiredFiles: "SO document", automation: "Manual", status: "Active" },
    { id: "tn14", templateId: "pt2", milestoneSeq: 11, milestoneName: "SO Release", predecessor: "Booking confirmation", sla: "", slaTypeId: "stc11", skippable: "No", skipCondition: "", requiredFiles: "SO release", automation: "Manual", status: "Active" },
    { id: "tn15", templateId: "pt2", milestoneSeq: 12, milestoneName: "Cargo inbound", predecessor: "SO Release", sla: "", slaTypeId: "stc12", skippable: "No", skipCondition: "", requiredFiles: "LCL receiving status", automation: "Manual", status: "Active" },
    { id: "tn16", templateId: "pt2", milestoneSeq: 13, milestoneName: "SI/VGM Submit", predecessor: "Cargo inbound", sla: "", slaTypeId: "stc9", skippable: "No", skipCondition: "", requiredFiles: "SI/VGM details", automation: "Manual", status: "Active" },
    { id: "tn17", templateId: "pt2", milestoneSeq: 14, milestoneName: "SI/VGM Submit to carrier", predecessor: "SI/VGM Submit", sla: "", slaTypeId: "stc14", skippable: "No", skipCondition: "", requiredFiles: "Bill of lading data", automation: "Manual", status: "Active" },
    { id: "tn18", templateId: "pt2", milestoneSeq: 15, milestoneName: "Container gate in", predecessor: "SI/VGM Submit to carrier", sla: "", slaTypeId: "stc13", skippable: "No", skipCondition: "", requiredFiles: "Gate in record", automation: "Manual", status: "Active" },
    { id: "tn19", templateId: "pt2", milestoneSeq: 16, milestoneName: "CLR/Container loading record", predecessor: "Container gate in", sla: "", slaTypeId: "stc13", skippable: "No", skipCondition: "", requiredFiles: "Loading data", automation: "Manual", status: "Active" },
    { id: "tn20", templateId: "pt2", milestoneSeq: 17, milestoneName: "Upload Shipping documents", predecessor: "CLR/Container loading record", sla: "", slaTypeId: "stc13", skippable: "No", skipCondition: "", requiredFiles: "Shipping documents", automation: "Manual", status: "Active" },
    { id: "tn21", templateId: "pt2", milestoneSeq: 18, milestoneName: "Verify Shipping documents", predecessor: "Upload Shipping documents", sla: "", slaTypeId: "stc15", skippable: "No", skipCondition: "", requiredFiles: "Verified documents", automation: "Manual", status: "Active" },
    { id: "tn22", templateId: "pt2", milestoneSeq: 19, milestoneName: "Vessel departure", predecessor: "Verify Shipping documents", sla: "", slaTypeId: "stc15", skippable: "No", skipCondition: "", requiredFiles: "Container status", automation: "Manual", status: "Active" },
    { id: "tn23", templateId: "pt2", milestoneSeq: 20, milestoneName: "Release HBL and invoice to supplier", predecessor: "Vessel departure", sla: "", slaTypeId: "stc15", skippable: "No", skipCondition: "", requiredFiles: "HBL and invoice", automation: "Manual", status: "Active" },
    { id: "tn24", templateId: "pt2", milestoneSeq: 21, milestoneName: "Pre-alert", predecessor: "Release HBL and invoice to supplier", sla: "", slaTypeId: "stc15", skippable: "No", skipCondition: "", requiredFiles: "Pre-alert notice", automation: "Manual", status: "Active" },
  ],
  milestoneTasks: [
    // LIDL pt1 - PO Confirmation milestone tasks
    { id: "nt1", templateId: "pt1", milestoneId: "tn1", customer: "LIDL", taskName: "核对 PO", taskType: "PO Verification", sla: "8h", slaTypeId: "stc1", requiredFiles: "PO file, SR document", automation: "Manual", status: "Active", remark: "Verify PO details against Shipper Release" },
    { id: "nt2", templateId: "pt1", milestoneId: "tn1", customer: "LIDL", taskName: "确认 CRD", taskType: "CRD Confirmation", sla: "8h", slaTypeId: "stc1", requiredFiles: "Supplier confirmation", automation: "Manual", status: "Active", remark: "Confirm Cargo Ready Date with supplier" },
    { id: "nt3", templateId: "pt1", milestoneId: "tn1", customer: "LIDL", taskName: "上传确认文件", taskType: "Document Upload", sla: "8h", slaTypeId: "stc1", requiredFiles: "Confirmation PDF", automation: "Manual", status: "Active", remark: "Upload signed confirmation documents" },
    // LIDL pt1 - Carrier Booking milestone tasks
    { id: "nt4", templateId: "pt1", milestoneId: "tn2", customer: "LIDL", taskName: "提交订舱申请", taskType: "Booking Submission", sla: "12h", slaTypeId: "stc2", requiredFiles: "Booking request form", automation: "Semi-auto", status: "Active", remark: "Submit booking to carrier" },
    { id: "nt5", templateId: "pt1", milestoneId: "tn2", customer: "LIDL", taskName: "确认订舱号", taskType: "Booking Confirmation", sla: "12h", slaTypeId: "stc2", requiredFiles: "Booking confirmation", automation: "Semi-auto", status: "Active", remark: "Receive and record booking number" },
    // Pepco pt2 - Tasks for 21 Milestones from Excel template
    { id: "nt6", templateId: "pt2", milestoneId: "tn4", customer: "PEPCO", taskName: "Upload PO details: QTY/HOD/IN DC/DC etc", taskType: "PO Upload", sla: "", slaTypeId: "stc4", requiredFiles: "PO details", automation: "Manual", status: "Active", remark: "Upload PO details including quantity, HOD, IN DC, DC etc" },
    { id: "nt7", templateId: "pt2", milestoneId: "tn5", customer: "PEPCO", taskName: "Update cargo ready date", taskType: "CRD Update", sla: "", slaTypeId: "stc5", requiredFiles: "Cargo ready date", automation: "Manual", status: "Active", remark: "Supplier updates the cargo ready date" },
    { id: "nt8", templateId: "pt2", milestoneId: "tn6", customer: "PEPCO", taskName: "Update CARGO DIMENSION", taskType: "Dimension Update", sla: "", slaTypeId: "stc5", requiredFiles: "Cargo dimensions", automation: "Manual", status: "Active", remark: "Supplier updates cargo dimension information" },
    { id: "nt9", templateId: "pt2", milestoneId: "tn7", customer: "PEPCO", taskName: "Fulfill cargo details", taskType: "Booking Fulfillment", sla: "", slaTypeId: "stc5", requiredFiles: "Booking details", automation: "Manual", status: "Active", remark: "Supplier fulfills shipper booking with cargo details" },
    { id: "nt10", templateId: "pt2", milestoneId: "tn8", customer: "PEPCO", taskName: "Accept the booking", taskType: "Booking Validation", sla: "", slaTypeId: "stc6", requiredFiles: "Booking validation", automation: "Manual", status: "Active", remark: "Customer service validates and accepts the booking" },
    { id: "nt11", templateId: "pt2", milestoneId: "tn9", customer: "PEPCO", taskName: "Assign Transport plan", taskType: "Transport Plan Assignment", sla: "", slaTypeId: "stc6", requiredFiles: "Transport plan", automation: "Manual", status: "Active", remark: "Customer service assigns transport plan" },
    { id: "nt12", templateId: "pt2", milestoneId: "tn10", customer: "PEPCO", taskName: "Pepco booking approval", taskType: "Booking Approval", sla: "", slaTypeId: "stc6", requiredFiles: "Booking approval", automation: "Manual", status: "Active", remark: "PEPCO approves the booking" },
    { id: "nt13", templateId: "pt2", milestoneId: "tn11", customer: "PEPCO", taskName: "Pepco booking score", taskType: "Booking Scoring", sla: "", slaTypeId: "stc7", requiredFiles: "Scoring result", automation: "Manual", status: "Active", remark: "PEPCO performs booking scoring after approval" },
    { id: "nt14", templateId: "pt2", milestoneId: "tn12", customer: "PEPCO", taskName: "Booking space with carrier to secure the space", taskType: "Carrier Booking", sla: "", slaTypeId: "stc10", requiredFiles: "Carrier booking confirmation", automation: "Manual", status: "Active", remark: "Customer service books space with carrier after Pepco scoring" },
    { id: "nt15", templateId: "pt2", milestoneId: "tn13", customer: "PEPCO", taskName: "Confirm SO received", taskType: "SO Confirmation", sla: "", slaTypeId: "stc8", requiredFiles: "SO document", automation: "Manual", status: "Active", remark: "Customer service confirms SO received before ETD" },
    { id: "nt16", templateId: "pt2", milestoneId: "tn14", customer: "PEPCO", taskName: "Send the SO document to Producer", taskType: "SO Release", sla: "", slaTypeId: "stc11", requiredFiles: "SO release", automation: "Manual", status: "Active", remark: "Customer service sends SO document to producer after release" },
    { id: "nt17", templateId: "pt2", milestoneId: "tn15", customer: "PEPCO", taskName: "Check LCL receiving status", taskType: "Cargo Inbound Check", sla: "", slaTypeId: "stc12", requiredFiles: "LCL receiving status", automation: "Manual", status: "Active", remark: "Customer service checks LCL receiving status daily" },
    { id: "nt18", templateId: "pt2", milestoneId: "tn16", customer: "PEPCO", taskName: "Submit and confirm SI/VGM details", taskType: "SI/VGM Submission", sla: "", slaTypeId: "stc9", requiredFiles: "SI/VGM details", automation: "Manual", status: "Active", remark: "Supplier submits and confirms SI/VGM before ETD" },
    { id: "nt19", templateId: "pt2", milestoneId: "tn17", customer: "PEPCO", taskName: "Submit complete bill of lading data", taskType: "BL Data Submission", sla: "", slaTypeId: "stc14", requiredFiles: "Bill of lading data", automation: "Manual", status: "Active", remark: "Operation submits complete BL data after container loading, before SI cut-off" },
    { id: "nt20", templateId: "pt2", milestoneId: "tn18", customer: "PEPCO", taskName: "Container gate in", taskType: "Gate In", sla: "", slaTypeId: "stc13", requiredFiles: "Gate in record", automation: "Manual", status: "Active", remark: "Container gates in after loading" },
    { id: "nt21", templateId: "pt2", milestoneId: "tn19", customer: "PEPCO", taskName: "Supplier update actual loading data", taskType: "Loading Record", sla: "", slaTypeId: "stc13", requiredFiles: "Loading data", automation: "Manual", status: "Active", remark: "Supplier updates actual container loading record" },
    { id: "nt22", templateId: "pt2", milestoneId: "tn20", customer: "PEPCO", taskName: "Upload Shipping documents", taskType: "Document Upload", sla: "", slaTypeId: "stc13", requiredFiles: "Shipping documents", automation: "Manual", status: "Active", remark: "Supplier uploads shipping documents after loading" },
    { id: "nt23", templateId: "pt2", milestoneId: "tn21", customer: "PEPCO", taskName: "Verify Shipping documents", taskType: "Document Verification", sla: "", slaTypeId: "stc15", requiredFiles: "Verified documents", automation: "Manual", status: "Active", remark: "Operation verifies shipping documents after departure" },
    { id: "nt24", templateId: "pt2", milestoneId: "tn22", customer: "PEPCO", taskName: "Check container status", taskType: "Vessel Departure Check", sla: "", slaTypeId: "stc15", requiredFiles: "Container status", automation: "Manual", status: "Active", remark: "Check container status after vessel departure" },
    { id: "nt25", templateId: "pt2", milestoneId: "tn23", customer: "PEPCO", taskName: "Release HBL and invoice to supplier", taskType: "HBL Release", sla: "", slaTypeId: "stc15", requiredFiles: "HBL and invoice", automation: "Manual", status: "Active", remark: "Operation releases HBL and invoice to supplier after departure" },
    { id: "nt26", templateId: "pt2", milestoneId: "tn24", customer: "PEPCO", taskName: "Send pre-alert", taskType: "Pre-alert", sla: "", slaTypeId: "stc15", requiredFiles: "Pre-alert notice", automation: "Manual", status: "Active", remark: "Operation sends pre-alert notification after departure" },
  ],
  workAssignmentRules: [
    { id: "wr1", objectType: "Task", customer: "LIDL", taskType: "核对 PO", region: "Asia", country: "CN", pol: "CNSHA", pod: "DEHAM", lane: "Asia-Europe", transportMode: "Ocean", assignmentLevel: "User", target: "Ops User", manualAdjust: "Allowed", priority: "High", status: "Active", templateId: "pt1", milestoneId: "tn1", milestoneTaskId: "nt1", remark: "PO verification assigned to ops user" },
    { id: "wr2", objectType: "Task", customer: "LIDL", taskType: "确认 CRD", region: "Asia", country: "CN", pol: "CNSHA", pod: "DEHAM", lane: "Asia-Europe", transportMode: "Ocean", assignmentLevel: "User", target: "Ops User", manualAdjust: "Allowed", priority: "High", status: "Active", templateId: "pt1", milestoneId: "tn1", milestoneTaskId: "nt2", remark: "CRD confirmation assigned to ops user" },
    // Pepco pt2 - Work assignment rules for key tasks
    { id: "wr3", objectType: "Task", customer: "PEPCO", taskType: "Upload PO details", region: "Europe", country: "PL", pol: "CNSZX", pod: "PLPOZ", lane: "Asia-Europe", transportMode: "Multi-modal", assignmentLevel: "User", target: "PEPCO User", manualAdjust: "Allowed", priority: "High", status: "Active", templateId: "pt2", milestoneId: "tn4", milestoneTaskId: "nt6", remark: "PO upload assigned to PEPCO user" },
    { id: "wr4", objectType: "Task", customer: "PEPCO", taskType: "Booking Validation", region: "Europe", country: "PL", pol: "CNSZX", pod: "PLPOZ", lane: "Asia-Europe", transportMode: "Multi-modal", assignmentLevel: "User", target: "Customer Service", manualAdjust: "Allowed", priority: "High", status: "Active", templateId: "pt2", milestoneId: "tn8", milestoneTaskId: "nt10", remark: "Booking validation assigned to customer service" },
    { id: "wr5", objectType: "Task", customer: "PEPCO", taskType: "Carrier Booking", region: "Europe", country: "PL", pol: "CNSZX", pod: "PLPOZ", lane: "Asia-Europe", transportMode: "Multi-modal", assignmentLevel: "User", target: "Customer Service", manualAdjust: "Reason Code Required", priority: "High", status: "Active", templateId: "pt2", milestoneId: "tn12", milestoneTaskId: "nt14", remark: "Carrier booking assigned to customer service after Pepco scoring" },
  ],
  // Two-tier Assignment Rules - PRD v2.0
  teamAssignmentRules: [
    { id: "tar1", customer: "Pepco", originRegion: "Asia", destinationRegion: "Europe", transportMode: "Multi-modal", priority: "High", targetTeam: "Europe Ops Team", assignerRole: "Department Head", scopeOwnerRole: "Department Head", status: "Active", remark: "Pepco Asia-Europe multi-modal routes assigned to Europe Ops Team" },
    { id: "tar2", customer: "LIDL", originRegion: "Asia", destinationRegion: "Europe", transportMode: "Ocean", priority: "High", targetTeam: "Ocean Freight Team", assignerRole: "Operation Manager", scopeOwnerRole: "Admin", status: "Active", remark: "LIDL ocean freight assigned to Ocean Freight Team" },
  ],
  userAssignmentRules: [
    { id: "uar1", workGroupId: "WG002", teamId: "WG002", customers: ["PEPCO"], regions: ["Europe"], countries: ["PL", "NL"], pols: [], templateId: "pt2", milestoneId: "tn13", taskId: "nt15", taskType: "SO Confirmation", roleRequired: "Customer Service", targetUser: "u4", backupUser: "u5", status: "Active", remark: "SO confirmation tasks assigned to Alice with Bob as backup." },
    { id: "uar2", workGroupId: "WG001", teamId: "WG001", customers: ["LIDL-GLOBAL"], regions: ["Asia"], countries: ["CN"], pols: ["CNSHA"], templateId: "pt1", milestoneId: "tn1", taskId: "nt2", taskType: "Confirm CRD", roleRequired: "Operations", targetUser: "u6", backupUser: "u7", status: "Active", remark: "China origin CRD confirmation assigned within China Origin Ops." },
  ],
  fallbackAssignmentRules: [
    { id: "far1", condition: "No matching team rule", fallbackQueue: "General Queue", escalationRole: "Department Head", escalationSla: "24h", status: "Active", remark: "Tasks without team assignment go to general queue" },
  ],
  allocationRules: [
    { id: "ar1", customer: "LIDL", lane: "Asia-Europe / CNSHA-DEHAM", carrier: "Ocean Star Line", transportMode: "Ocean", effectiveFrom: "2026-07-01", effectiveTo: "2026-12-31", allocationShare: "60%", capacityThreshold: "85%", priority: "High", overrideRule: "Reason Code Required", reasonCode: "R006", status: "Active", remark: "Manual override requires Reason Code and audit log" },
    { id: "ar2", customer: "Pepco", lane: "Asia-Europe / CNSZX-PLPOZ", carrier: "Ocean Star Line", transportMode: "Multi-modal", effectiveFrom: "2026-07-01", effectiveTo: "2026-12-31", allocationShare: "40%", capacityThreshold: "80%", priority: "Medium", overrideRule: "Approval Required", reasonCode: "R003", status: "Active", remark: "Carrier change requires approval and reason" },
  ],
  // Basic Config - Independent tabs per PRD
  transportModes: [
    { id: "tm1", code: "OCEAN", name: "Ocean", applicableRegion: "Global", status: "Active", remark: "Sea freight transportation" },
    { id: "tm2", code: "AIR", name: "Air Freight", applicableRegion: "Global", status: "Active", remark: "Air cargo transportation" },
    { id: "tm3", code: "RAIL", name: "Rail", applicableRegion: "Europe/Asia", status: "Active", remark: "Rail transport for land routes" },
    { id: "tm4", code: "ROAD", name: "Road", applicableRegion: "Regional", status: "Active", remark: "Trucking and road transport" },
    { id: "tm5", code: "MULTI", name: "Multi-modal", applicableRegion: "Europe", status: "Active", remark: "Combined transport modes" },
  ],
  exceptionTypes: [
    { id: "et1", code: "DATA_MISMATCH", name: "Data mismatch", severity: "Medium", defaultSla: "24h", escalation: true, status: "Active", remark: "Data inconsistency between systems" },
    { id: "et2", code: "SPACE_SHORTAGE", name: "Space shortage", severity: "High", defaultSla: "12h", escalation: true, status: "Active", remark: "Insufficient carrier capacity" },
    { id: "et3", code: "DOCUMENT_MISSING", name: "Document missing", severity: "Critical", defaultSla: "8h", escalation: true, status: "Active", remark: "Required documents not uploaded" },
    { id: "et4", code: "DELAY_WARNING", name: "Delay warning", severity: "Low", defaultSla: "48h", escalation: false, status: "Active", remark: "Potential delay detected" },
  ],
  workCalendars: [
    {
      id: "wc-standard-5d",
      calendarCode: "STANDARD_5D",
      calendarName: "Standard 5-Day Workweek",
      calendarType: "Standard",
      timezone: "UTC (UTC+00:00)",
      workingWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      extraHolidays: [],
      extraWorkingDays: [],
      applicableWorkGroups: ["ALL"],
      applicableUsers: ["ALL"],
      status: "Active",
      remark: "Base Mon-Fri work calendar without local holiday adjustments"
    },
    {
      id: "wc-cn-2026",
      calendarCode: "CN_WORKDAY_2026",
      calendarName: "China Workday 2026",
      calendarType: "Local Adjustment",
      timezone: "Shanghai (UTC+08:00)",
      workingWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      extraHolidays: ["2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20", "2026-04-06", "2026-05-01", "2026-06-19", "2026-09-25", "2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06"],
      extraWorkingDays: ["2026-02-14", "2026-02-28", "2026-09-27", "2026-10-10"],
      applicableWorkGroups: ["WG001"],
      applicableUsers: [],
      status: "Active",
      remark: "China calendar sample with public holidays and adjusted working days"
    },
    {
      id: "wc-my-2026",
      calendarCode: "MY_WORKDAY_2026",
      calendarName: "Malaysia Workday 2026",
      calendarType: "Local Adjustment",
      timezone: "Kuala Lumpur (UTC+08:00)",
      workingWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      extraHolidays: ["2026-01-01", "2026-02-17", "2026-02-18", "2026-03-20", "2026-03-21", "2026-05-01", "2026-05-27", "2026-06-01", "2026-08-31", "2026-09-16", "2026-11-08", "2026-12-25"],
      extraWorkingDays: [],
      applicableWorkGroups: [],
      applicableUsers: [],
      status: "Active",
      remark: "Malaysia local holiday sample"
    },
    {
      id: "wc-us-2026",
      calendarCode: "US_WORKDAY_2026",
      calendarName: "US Workday 2026",
      calendarType: "Local Adjustment",
      timezone: "New York (UTC-05:00 / UTC-04:00 DST)",
      workingWeek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      extraHolidays: ["2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-10-12", "2026-11-11", "2026-11-26", "2026-12-25"],
      extraWorkingDays: [],
      applicableWorkGroups: ["WG002"],
      applicableUsers: ["u4"],
      status: "Active",
      remark: "US federal holiday sample"
    },
  ],
  slaTypeConfigs: [
    {
      id: "stc1",
      slaRule: { baseDateCode: "TASK_CREATED", direction: "After", offsetValue: 24, offsetUnit: "Hours" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Task",
      reminderThreshold: 4,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Standard task SLA - 24 hours after creation"
    },
    {
      id: "stc2",
      slaRule: { baseDateCode: "ETD", direction: "Before", offsetValue: 2, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Booking",
      reminderThreshold: 1,
      reminderUnit: "Days",
      status: "Active",
      remark: "Booking must be confirmed 2 days before ETD"
    },
    {
      id: "stc3",
      slaRule: { baseDateCode: "CRD", direction: "After", offsetValue: 1, offsetUnit: "Workday" },
      applicableBusinesses: ["LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 2,
      reminderUnit: "Hours",
      status: "Active",
      remark: "LIDL customer calendar - 1 business day after CRD"
    },
    // New SLA types per user request
    {
      id: "stc4",
      slaRule: { baseDateCode: "HOD", direction: "Before", offsetValue: 6, offsetUnit: "Months" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Months",
      status: "Active",
      remark: "HOD 前 6 Months"
    },
    {
      id: "stc5",
      slaRule: { baseDateCode: "HOD", direction: "Before", offsetValue: 28, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 3,
      reminderUnit: "Days",
      status: "Active",
      remark: "HOD 前 28 Days"
    },
    {
      id: "stc6",
      slaRule: { baseDateCode: "BOOKING_RECEIVED", direction: "After", offsetValue: 1, offsetUnit: "Workday" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Task",
      reminderThreshold: 2,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Booking Received 后 1 Business Day"
    },
    {
      id: "stc7",
      slaRule: { baseDateCode: "BOOKING_APPROVAL", direction: "After", offsetValue: 1, offsetUnit: "Workday" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Task",
      reminderThreshold: 2,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Booking Approval 后 1 Business Day"
    },
    {
      id: "stc8",
      slaRule: { baseDateCode: "ETD", direction: "Before", offsetValue: 14, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 2,
      reminderUnit: "Days",
      status: "Active",
      remark: "ETD 前 14 Days"
    },
    {
      id: "stc9",
      slaRule: { baseDateCode: "ETD", direction: "Before", offsetValue: 7, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Days",
      status: "Active",
      remark: "ETD 前 7 Days"
    },
    {
      id: "stc10",
      slaRule: { baseDateCode: "PEPCO_SCORING", direction: "After", offsetValue: 0, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Pepco Scoring Finished 后触发"
    },
    {
      id: "stc11",
      slaRule: { baseDateCode: "SO_RELEASE", direction: "After", offsetValue: 0, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Hours",
      status: "Active",
      remark: "SO Release 后触发"
    },
    {
      id: "stc12",
      slaRule: { baseDateCode: "TASK_CREATED", direction: "After", offsetValue: 1, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Task",
      reminderThreshold: 2,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Everyday - Daily task SLA"
    },
    {
      id: "stc13",
      slaRule: { baseDateCode: "CONTAINER_LOADING", direction: "After", offsetValue: 0, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Container Loading 后触发"
    },
    {
      id: "stc14",
      slaRule: { baseDateCode: "CONTAINER_LOADING", direction: "After", offsetValue: 0, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Container Loading 后，SI Cut-off 前"
    },
    {
      id: "stc15",
      slaRule: { baseDateCode: "DEPARTURE", direction: "After", offsetValue: 0, offsetUnit: "Days" },
      applicableBusinesses: ["Pepco", "LIDL US", "LIDL FOOD", "LIDL Non-FOOD"],
      calendarCode: "STANDARD_5D",
      objectScope: "Milestone",
      reminderThreshold: 1,
      reminderUnit: "Hours",
      status: "Active",
      remark: "Departure 后触发"
    },
  ],
  reasonCodes: [
    { id: "rc1", code: "R001", name: "Supplier CRD Change", scenario: "Manual Override", remarkRequired: true, status: "Active", remark: "Supplier changed CRD after original booking confirmation" },
    { id: "rc2", code: "R002", name: "Supplier SR Mismatch", scenario: "Exception", remarkRequired: true, status: "Active", remark: "Shipment Release information does not match Shipper Booking" },
    { id: "rc3", code: "R003", name: "Carrier Capacity Issue", scenario: "Allocation Override", remarkRequired: true, status: "Active", remark: "Original carrier cannot fulfill capacity requirements" },
    { id: "rc4", code: "R004", name: "Customer Request", scenario: "Manual Override", remarkRequired: true, status: "Active", remark: "Customer explicitly requested change" },
    { id: "rc5", code: "R005", name: "Port Congestion", scenario: "Exception", remarkRequired: false, status: "Active", remark: "Port congestion causing delays" },
  ],
  notificationTemplates: [
    {
      id: "nt1",
      templateName: "Task Completion In-app Notice",
      notificationType: "Task Completion",
      scenario: "Task completed by assignee",
      channel: "In-app",
      subject: "Task completed: {{taskName}}",
      body: "{{assignee}} completed task {{taskName}} for {{objectRef}}.",
      status: "Active",
      remark: "System-level in-app message for completed work items"
    },
    {
      id: "nt2",
      templateName: "Task SLA Reminder",
      notificationType: "SLA Reminder",
      scenario: "Task approaching SLA deadline",
      channel: "Both",
      subject: "[MOOV OS] Task SLA reminder - {{taskName}}",
      body: "Hi {{assignee}},\n\nThis is a reminder that task '{{taskName}}' is approaching its SLA deadline.\n- Due Date: {{dueDate}}\n- Time Remaining: {{timeRemaining}}\n\nPlease complete the task on time to avoid SLA breach.\n\nBest regards,\nMOOV OS System",
      status: "Active",
      remark: "Sent when task is approaching SLA threshold"
    },
    {
      id: "nt3",
      templateName: "System Exception Alert",
      notificationType: "Exception Alert",
      scenario: "High severity exception raised",
      channel: "Both",
      subject: "[MOOV OS] Exception alert - {{exceptionType}}",
      body: "Attention Required,\n\nA new exception has been raised:\n- Type: {{exceptionType}}\n- Severity: {{severity}}\n- Related PO: {{poNumber}}\n- Description: {{description}}\n\nPlease investigate and resolve promptly.\n\nBest regards,\nMOOV OS System",
      status: "Active",
      remark: "Sent when high/critical severity exception is raised"
    },
  ],
  emailNotificationTemplates: [
    {
      id: "ent1",
      templateName: "LIDL Task Created Email",
      clientCode: "LIDL-GLOBAL",
      processTemplateId: "pt1",
      milestoneId: "tn1",
      taskId: "nt1",
      triggerEvent: "Task Created",
      subject: "[MOOV OS] New task created - {{taskName}}",
      body: "Dear {{recipientName}},\n\nA new workflow task has been created for client {{client}}.\n- Process: {{processTemplate}}\n- Milestone: {{milestone}}\n- Task: {{taskName}}\n\nPlease review it in MOOV OS.\n\nBest regards,\nMOOV OS",
      status: "Active",
      remark: "Business email for workflow task creation"
    },
    {
      id: "ent2",
      templateName: "PEPCO Milestone Delay Email",
      clientCode: "PEPCO",
      processTemplateId: "pt2",
      milestoneId: "tn8",
      taskId: "",
      triggerEvent: "Milestone Delayed",
      subject: "[MOOV OS] Milestone delayed - {{milestone}}",
      body: "Dear {{recipientName}},\n\nThe milestone {{milestone}} has been delayed for {{objectRef}}.\n- Client: {{client}}\n- Planned Date: {{plannedDate}}\n- Current Status: {{status}}\n\nPlease check the workflow details in MOOV OS.\n\nBest regards,\nMOOV OS",
      status: "Active",
      remark: "Business email for delayed milestone notifications"
    },
  ],
  customConfigCategories: [
    { id: "cfgcat1", code: "DOC_TYPE", name: "Document Type", description: "Reusable document type dictionary", status: "Active", sortOrder: 1, remark: "Example custom configuration tab" },
    { id: "cfgcat2", code: "PRIORITY_LEVEL", name: "Priority Level", description: "Operational priority labels", status: "Active", sortOrder: 2, remark: "" },
  ],
  customConfigItems: [
    { id: "cfgitem1", categoryId: "cfgcat1", code: "COMMERCIAL_INVOICE", name: "Commercial Invoice", description: "Invoice document submitted by supplier", status: "Active", sortOrder: 1, remark: "" },
    { id: "cfgitem2", categoryId: "cfgcat1", code: "PACKING_LIST", name: "Packing List", description: "Packing detail document", status: "Active", sortOrder: 2, remark: "" },
    { id: "cfgitem3", categoryId: "cfgcat2", code: "HIGH", name: "High", description: "High priority", status: "Active", sortOrder: 1, remark: "" },
    { id: "cfgitem4", categoryId: "cfgcat2", code: "MEDIUM", name: "Medium", description: "Medium priority", status: "Active", sortOrder: 2, remark: "" },
  ],
  // Template Subject Field Configuration - Dynamic template dimensions
  templateSubjectFields: [
    // Fixed required fields: customer and transportMode. Other dimensions are configurable.
    { key: "customer", label: "客户", type: "select", source: "customers", required: true, enabled: true, sortOrder: 1 },
    { key: "originRegion", label: "起运港区域", type: "select", source: "regions", required: false, enabled: true, sortOrder: 2 },
    { key: "destinationRegion", label: "目的港区域", type: "select", source: "regions", required: false, enabled: true, sortOrder: 3 },
    { key: "transportMode", label: "运输模式", type: "select", source: "transportModes", required: true, enabled: true, sortOrder: 4 },
    { key: "pol", label: "起运港(POL)", type: "select", source: "locations", required: false, enabled: true, sortOrder: 5 },
    { key: "pod", label: "目的港(POD)", type: "select", source: "locations", required: false, enabled: true, sortOrder: 6 },
    { key: "originCountry", label: "起运国家", type: "select", source: "countries", required: false, enabled: false, sortOrder: 7 },
    { key: "destinationCountry", label: "目的国家", type: "select", source: "countries", required: false, enabled: false, sortOrder: 8 },
    { key: "supplier", label: "供应商", type: "select", source: "organizations", required: false, enabled: false, sortOrder: 9 },
    { key: "consignee", label: "收货人", type: "select", source: "organizations", required: false, enabled: false, sortOrder: 10 },
    { key: "serviceType", label: "服务类型", type: "text", required: false, enabled: false, sortOrder: 11 },
    { key: "incoterm", label: "贸易条款", type: "select", options: ["FOB", "CIF", "DDP", "EXW", "DAP"], required: false, enabled: false, sortOrder: 12 },
  ],
  files: [
    { id: "f1", fileName: "allocation-template.xlsx", objectType: "Allocation", objectRef: "ALLOC-P1", version: "v1", uploadedBy: "Grace", uploadedAt: "2026-06-26", status: "Active", remark: "Template registration only" },
  ],
  // Master Data domains per PRD
  clients: [
    { id: "client1", clientID: 10001, clientId: 10001, clientName: "LIDL Global", clientCode: "LIDL-GLOBAL", clientType: "Global", countryOperational: "", operationalCountry: "", industrySector: "Retail", status: "Active", invoiceLegalEntity: "NL", invoiceCurrency: "EUR", paymentTerms: "45 days", taxRegistrationNumber: "NL123456789B01", billingAddress: "LIDL Global HQ, Stationsplein, Amsterdam, NL", invoiceFormat: "Summary", creditLimit: 500000, discountProfile: "LIDL_GLOBAL_DISCOUNT", address: { addressLine1: "Stationsplein 1", addressLine2: "", city: "Amsterdam", stateProvince: "North Holland", postalCode: "1012 AB", country: "NL" }, contactPerson: "John Smith", contactEmail: "john.smith@lidl.com", contactPhone: "+31 20 123 4567", timezone: "Europe/Amsterdam", createdAt: "2026-07-01T10:00:00.000Z", createdBy: "admin", updatedAt: "2026-07-01T10:00:00.000Z", updatedBy: "admin", active: true, notes: "Global parent client for all LIDL country subsidiaries", customerCode: "LIDL-GLOBAL", customerName: "LIDL Global" },
    { id: "client2", clientID: 10002, clientId: 10002, clientName: "Lidl US", clientCode: "LIDL-US", clientType: "Country", countryOperational: "US", operationalCountry: "US", industrySector: "Retail", status: "Active", invoiceLegalEntity: "US", invoiceCurrency: "USD", paymentTerms: "Net 30", taxRegistrationNumber: "US-987654321", billingAddress: "8500 Lidl Drive, Arlington, VA, US", invoiceFormat: "Detail", creditLimit: 300000, discountProfile: "STANDARD", address: { addressLine1: "8500 Lidl Drive", addressLine2: "", city: "Arlington", stateProvince: "Virginia", postalCode: "22203", country: "US" }, contactPerson: "US Operations", contactEmail: "ops.us@lidl.com", contactPhone: "+1 703-555-0100", timezone: "America/New_York", createdAt: "2026-07-01T10:00:00.000Z", createdBy: "admin", updatedAt: "2026-07-01T10:00:00.000Z", updatedBy: "admin", active: true, notes: "Country client under LIDL Global", customerCode: "LIDL-US", customerName: "Lidl US" },
    { id: "client3", clientID: 10003, clientId: 10003, clientName: "PEPCO Group N.V.", clientCode: "PEPCO", clientType: "Global", countryOperational: "", operationalCountry: "", industrySector: "Retail", status: "Active", invoiceLegalEntity: "NL", invoiceCurrency: "EUR", paymentTerms: "45 days", taxRegistrationNumber: "NL556677889B01", billingAddress: "Joop Geesinkweg 9, Amsterdam, NL", invoiceFormat: "Summary", creditLimit: 450000, discountProfile: "STANDARD", address: { addressLine1: "Joop Geesinkweg 9", addressLine2: "", city: "Amsterdam", stateProvince: "", postalCode: "1114", country: "NL" }, contactPerson: "Logistics Manager", contactEmail: "logistics@pepco.eu", contactPhone: "+31 20 555 0200", timezone: "Europe/Amsterdam", createdAt: "2026-07-01T10:00:00.000Z", createdBy: "admin", updatedAt: "2026-07-01T10:00:00.000Z", updatedBy: "admin", active: true, notes: "Global retail client for Europe lanes", customerCode: "PEPCO", customerName: "PEPCO Group N.V." },
  ],
  organizations: [
    { id: "org1", bpID: 10001, organizationCode: "GSG", companyName: "Gold Star Group (Bangladesh)", organizationName: "Gold Star Group (Bangladesh)", addressLine1: "House 12, Road 5", addressLine2: "Dhanmondi", city: "Dhaka", stateProvince: "Dhaka Division", postalCodeZipCode: "1205", country: "BD", address: { addressLine1: "House 12, Road 5", addressLine2: "Dhanmondi", city: "Dhaka", stateProvince: "Dhaka Division", postalCode: "1205", country: "BD" }, organizationType: "Supplier", roleID: 30001, customerID: 10001, partyTypeRoleType: "Supplier", client: "LIDL", contactPerson: "Mohammed Rahman", contactEmail: "ops@goldstar-bd.com", contactPhone: "+880 2 5555 0101", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Supplier master record for LIDL operations" },
    { id: "org2", bpID: 10002, organizationCode: "NFW", companyName: "Nelima Fashion Wear Ltd. (Bangladesh)", organizationName: "Nelima Fashion Wear Ltd. (Bangladesh)", addressLine1: "Plot 45, Sector 7", addressLine2: "", city: "Gazipur", stateProvince: "Dhaka Division", postalCodeZipCode: "1700", country: "BD", address: { addressLine1: "Plot 45, Sector 7", addressLine2: "", city: "Gazipur", stateProvince: "Dhaka Division", postalCode: "1700", country: "BD" }, organizationType: "Supplier", roleID: 30002, customerID: 10001, partyTypeRoleType: "Supplier", client: "LIDL", contactPerson: "Fatima Ahmed", contactEmail: "export@nelima.com.bd", contactPhone: "+880 2 5555 0102", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Supplier master record for LIDL operations" },
    { id: "org3", bpID: 10003, organizationCode: "CNI", companyName: "China Ningbo International Cooperation Co., Ltd (China)", organizationName: "China Ningbo International Cooperation Co., Ltd (China)", addressLine1: "No. 88 Zhongshan Road", addressLine2: "", city: "Ningbo", stateProvince: "Zhejiang", postalCodeZipCode: "315000", country: "CN", address: { addressLine1: "No. 88 Zhongshan Road", addressLine2: "", city: "Ningbo", stateProvince: "Zhejiang", postalCode: "315000", country: "CN" }, organizationType: "Supplier", roleID: 30003, customerID: 10003, partyTypeRoleType: "Supplier", client: "PEPCO", contactPerson: "Zhang Wei", contactEmail: "trade@ningbo-intl.cn", contactPhone: "+86 574 5555 0103", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Supplier master record for PEPCO operations" },
    { id: "org4", bpID: 10004, organizationCode: "YUI", companyName: "Yiwu Union Imp & Exp Co., Ltd (China)", organizationName: "Yiwu Union Imp & Exp Co., Ltd (China)", addressLine1: "Building 3, Yiwu Market", addressLine2: "", city: "Yiwu", stateProvince: "Zhejiang", postalCodeZipCode: "322000", country: "CN", address: { addressLine1: "Building 3, Yiwu Market", addressLine2: "", city: "Yiwu", stateProvince: "Zhejiang", postalCode: "322000", country: "CN" }, organizationType: "Supplier", roleID: 30004, customerID: 10003, partyTypeRoleType: "Supplier", client: "PEPCO", contactPerson: "Li Mei", contactEmail: "sales@yiwu-union.com", contactPhone: "+86 579 5555 0104", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Supplier master record for PEPCO operations" },
    { id: "org5", bpID: 10005, organizationCode: "SEG", companyName: "Sellersunion Group (China)", organizationName: "Sellersunion Group (China)", addressLine1: "Floor 15, Tower A", addressLine2: "International Trade Center", city: "Yiwu", stateProvince: "Zhejiang", postalCodeZipCode: "322000", country: "CN", address: { addressLine1: "Floor 15, Tower A", addressLine2: "International Trade Center", city: "Yiwu", stateProvince: "Zhejiang", postalCode: "322000", country: "CN" }, organizationType: "Supplier", roleID: 30005, customerID: 10001, partyTypeRoleType: "Supplier", client: "LIDL", contactPerson: "Wang Jun", contactEmail: "info@sellersunion.com", contactPhone: "+86 579 5555 0105", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Supplier master record for LIDL operations" },
    { id: "org6", bpID: 10006, organizationCode: "ASD", companyName: "Aishida Co., Ltd.", organizationName: "Aishida Co., Ltd.", addressLine1: "Industrial Park Zone B", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCodeZipCode: "313300", country: "CN", address: { addressLine1: "Industrial Park Zone B", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCode: "313300", country: "CN" }, organizationType: "Producer", roleID: 30006, customerID: 10001, partyTypeRoleType: "Producer", client: "LIDL", contactPerson: "Chen Hua", contactEmail: "production@aishida.cn", contactPhone: "+86 572 5555 0106", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for LIDL operations" },
    { id: "org7", bpID: 10007, organizationCode: "ACH", companyName: "Anji Cozy Home Co., Ltd.", organizationName: "Anji Cozy Home Co., Ltd.", addressLine1: "No. 168 Furniture Road", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCodeZipCode: "313300", country: "CN", address: { addressLine1: "No. 168 Furniture Road", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCode: "313300", country: "CN" }, organizationType: "Producer", roleID: 30007, customerID: 10001, partyTypeRoleType: "Producer", client: "LIDL", contactPerson: "Liu Fang", contactEmail: "export@cozyhome-anji.com", contactPhone: "+86 572 5555 0107", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for LIDL operations" },
    { id: "org8", bpID: 10008, organizationCode: "AOF", companyName: "Anji Oumaisi Furniture Co., Ltd.", organizationName: "Anji Oumaisi Furniture Co., Ltd.", addressLine1: "Manufacturing Base 2", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCodeZipCode: "313300", country: "CN", address: { addressLine1: "Manufacturing Base 2", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCode: "313300", country: "CN" }, organizationType: "Producer", roleID: 30008, customerID: 10003, partyTypeRoleType: "Producer", client: "PEPCO", contactPerson: "Zhao Ming", contactEmail: "sales@oumaisi-furniture.cn", contactPhone: "+86 572 5555 0108", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for PEPCO operations" },
    { id: "org9", bpID: 10009, organizationCode: "ASF", companyName: "Anji Shengxing Office Furniture Co., Ltd.", organizationName: "Anji Shengxing Office Furniture Co., Ltd.", addressLine1: "Office Furniture Industrial Zone", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCodeZipCode: "313300", country: "CN", address: { addressLine1: "Office Furniture Industrial Zone", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCode: "313300", country: "CN" }, organizationType: "Producer", roleID: 30009, customerID: 10003, partyTypeRoleType: "Producer", client: "PEPCO", contactPerson: "Sun Li", contactEmail: "office@shengxing-anji.com", contactPhone: "+86 572 5555 0109", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for PEPCO operations" },
    { id: "org10", bpID: 10010, organizationCode: "AYM", companyName: "Anji Yixin Metal Tools Co., Ltd.", organizationName: "Anji Yixin Metal Tools Co., Ltd.", addressLine1: "Metal Processing Park", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCodeZipCode: "313300", country: "CN", address: { addressLine1: "Metal Processing Park", addressLine2: "", city: "Anji", stateProvince: "Zhejiang", postalCode: "313300", country: "CN" }, organizationType: "Producer", roleID: 30010, customerID: 10001, partyTypeRoleType: "Producer", client: "LIDL", contactPerson: "Huang Tao", contactEmail: "metal@yixin-tools.cn", contactPhone: "+86 572 5555 0110", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for LIDL operations" },
    { id: "org11", bpID: 10011, organizationCode: "BME", companyName: "Bada Mechanical & Electrical Co., Ltd.", organizationName: "Bada Mechanical & Electrical Co., Ltd.", addressLine1: "High-Tech Industrial Zone", addressLine2: "", city: "Ningbo", stateProvince: "Zhejiang", postalCodeZipCode: "315000", country: "CN", address: { addressLine1: "High-Tech Industrial Zone", addressLine2: "", city: "Ningbo", stateProvince: "Zhejiang", postalCode: "315000", country: "CN" }, organizationType: "Producer", roleID: 30011, customerID: 10001, partyTypeRoleType: "Producer", client: "LIDL", contactPerson: "Xu Jian", contactEmail: "mech@bada-electrical.com", contactPhone: "+86 574 5555 0111", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for LIDL operations" },
    { id: "org12", bpID: 10012, organizationCode: "BFG", companyName: "Beifa Group Co., Ltd.", organizationName: "Beifa Group Co., Ltd.", addressLine1: "Beifa Industrial Park", addressLine2: "", city: "Ninghai", stateProvince: "Zhejiang", postalCodeZipCode: "315600", country: "CN", address: { addressLine1: "Beifa Industrial Park", addressLine2: "", city: "Ninghai", stateProvince: "Zhejiang", postalCode: "315600", country: "CN" }, organizationType: "Producer", roleID: 30012, customerID: 10003, partyTypeRoleType: "Producer", client: "PEPCO", contactPerson: "Ma Qiang", contactEmail: "group@beifa-group.cn", contactPhone: "+86 574 5555 0112", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for PEPCO operations" },
    { id: "org13", bpID: 10013, organizationCode: "ACT", companyName: "Aftercloud Technology Co., Ltd.", organizationName: "Aftercloud Technology Co., Ltd.", addressLine1: "Tech Innovation Center", addressLine2: "Floor 8", city: "Hangzhou", stateProvince: "Zhejiang", postalCodeZipCode: "310000", country: "CN", address: { addressLine1: "Tech Innovation Center", addressLine2: "Floor 8", city: "Hangzhou", stateProvince: "Zhejiang", postalCode: "310000", country: "CN" }, organizationType: "Producer", roleID: 30013, customerID: 10001, partyTypeRoleType: "Producer", client: "LIDL", contactPerson: "Gao Yan", contactEmail: "tech@aftercloud.com", contactPhone: "+86 571 5555 0113", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin", active: true, notes: "Producer master record for LIDL operations" },
  ],
  carriers: [
    { id: "cr1", carrierID: 20001, carrierName: "Mediterranean Shipping Company", carrierCode: "MSC-GLOBAL", carrierType: "Ocean", mode: "OCEAN", scac: "MSCU", status: "Active", country: "CH", active: true, contactPerson: "Marco Rossi", contactEmail: "m.rossi@msc.com", contactPhone: "+41 22 555 0101", notes: "Ocean carrier sample record" },
    { id: "cr2", carrierID: 20002, carrierName: "Maersk Line", carrierCode: "MAERSK", carrierType: "Ocean", mode: "OCEAN", scac: "MAEU", status: "Active", country: "DK", active: true, contactPerson: "Henrik Andersen", contactEmail: "h.andersen@maersk.com", contactPhone: "+45 33 555 0102", notes: "Ocean carrier sample record" },
    { id: "cr3", carrierID: 20003, carrierName: "CMA CGM Group", carrierCode: "CMA-CGM", carrierType: "Ocean", mode: "OCEAN", scac: "CMAU", status: "Active", country: "FR", active: true, contactPerson: "Rodolphe Saade", contactEmail: "r.saade@cma-cgm.com", contactPhone: "+33 4 5555 0103", notes: "Ocean carrier sample record" },
    { id: "cr4", carrierID: 20004, carrierName: "COSCO Group", carrierCode: "COSCO", carrierType: "Ocean", mode: "OCEAN", scac: "COSU", status: "Active", country: "CN", active: true, contactPerson: "Xu Lirong", contactEmail: "l.xu@cosco.com", contactPhone: "+86 21 5555 0104", notes: "Ocean carrier sample record" },
    { id: "cr5", carrierID: 20005, carrierName: "Hapag-Lloyd", carrierCode: "HAPAG-LLOYD", carrierType: "Ocean", mode: "OCEAN", scac: "HAPU", status: "Active", country: "DE", active: true, contactPerson: "Rolf Habben Jansen", contactEmail: "r.jansen@hapag-lloyd.com", contactPhone: "+49 40 5555 0105", notes: "Ocean carrier sample record" },
    { id: "cr6", carrierID: 20006, carrierName: "Ocean Network Express", carrierCode: "ONE", carrierType: "Ocean", mode: "OCEAN", scac: "ONEU", status: "Active", country: "SG", active: true, contactPerson: "Jeremy Nixon", contactEmail: "j.nixon@one.com", contactPhone: "+65 6555 0106", notes: "Ocean carrier sample record" },
    { id: "cr7", carrierID: 20007, carrierName: "Evergreen Line", carrierCode: "EVERGREEN", carrierType: "Ocean", mode: "OCEAN", scac: "EGLU", status: "Active", country: "TW", active: true, contactPerson: "Hsieh Hui-chuan", contactEmail: "h.hsieh@evergreen.com", contactPhone: "+886 2 5555 0107", notes: "Ocean carrier sample record" },
    { id: "cr8", carrierID: 20008, carrierName: "HMM Co Ltd", carrierCode: "HMM", carrierType: "Ocean", mode: "OCEAN", scac: "HMMU", status: "Active", country: "KR", active: true, contactPerson: "Kim Kyung-bae", contactEmail: "k.kim@hmm.com", contactPhone: "+82 2 5555 0108", notes: "Ocean carrier sample record" },
    { id: "cr9", carrierID: 20009, carrierName: "ZIM", carrierCode: "ZIM", carrierType: "Ocean", mode: "OCEAN", scac: "ZIMU", status: "Active", country: "IL", active: true, contactPerson: "Eli Glickman", contactEmail: "e.glickman@zim.com", contactPhone: "+972 3 555 0109", notes: "Ocean carrier sample record" },
    { id: "cr10", carrierID: 20010, carrierName: "Tailwind Shipping Lines", carrierCode: "TAILWIND", carrierType: "Ocean", mode: "OCEAN", scac: "TSLU", status: "Active", country: "SG", active: true, contactPerson: "James Tan", contactEmail: "j.tan@tailwind.sg", contactPhone: "+65 6555 0110", notes: "Ocean carrier sample record" },
    { id: "cr11", carrierID: 20011, carrierName: "Cargolux Airlines", carrierCode: "CARGOLUX", carrierType: "Air", mode: "AIR", scac: "CVLU", status: "Active", country: "LU", active: true, contactPerson: "Marc Hoffmann", contactEmail: "m.hoffmann@cargolux.com", contactPhone: "+352 5555 0111", notes: "Air carrier sample record" },
    { id: "cr12", carrierID: 20012, carrierName: "DSV Road", carrierCode: "DSV-ROAD", carrierType: "Trucking", mode: "Truck", scac: "DSVR", status: "Active", country: "DK", active: true, contactPerson: "Jens Bjorn Andersen", contactEmail: "j.andersen@dsv.com", contactPhone: "+45 33 555 0112", notes: "Trucking carrier sample record" },
  ],
  locations: [
    { id: "l1", locationID: 30001, locationId: "CNSHA", locationName: "SHANGHAI, CHINA", locationCode: "CNSHA", locationType: "Port", unLOCODE: "CNSHA", unLocode: "CNSHA", functionCode: "1", status: "Active", country: "CN", countryName: "CHINA", city: "Shanghai", region: "Asia", timeZone: "Asia/Shanghai", isActive: true, active: true },
    { id: "l2", locationID: 30002, locationId: "SGSIN", locationName: "SINGAPORE", locationCode: "SGSIN", locationType: "Port", unLOCODE: "SGSIN", unLocode: "SGSIN", functionCode: "1", status: "Active", country: "SG", countryName: "SG", city: "Singapore", region: "Asia", timeZone: "Asia/Singapore", isActive: true, active: true },
    { id: "l3", locationID: 30003, locationId: "NLRTM", locationName: "ROTTERDAM, NETHERLANDS", locationCode: "NLRTM", locationType: "Port", unLOCODE: "NLRTM", unLocode: "NLRTM", functionCode: "1", status: "Active", country: "NL", countryName: "NETHERLANDS", city: "Rotterdam", region: "Europe", timeZone: "Europe/Amsterdam", isActive: true, active: true },
    { id: "l4", locationID: 30004, locationId: "DEHAM", locationName: "HAMBURG, GERMANY", locationCode: "DEHAM", locationType: "Port", unLOCODE: "DEHAM", unLocode: "DEHAM", functionCode: "1", status: "Active", country: "DE", countryName: "GERMANY", city: "Hamburg", region: "Europe", timeZone: "Europe/Berlin", isActive: true, active: true },
    { id: "l5", locationID: 30005, locationId: "USLAX", locationName: "LOS ANGELES, USA", locationCode: "USLAX", locationType: "Port", unLOCODE: "USLAX", unLocode: "USLAX", functionCode: "1", status: "Active", country: "US", countryName: "USA", city: "Los Angeles", region: "Americas", timeZone: "America/Los_Angeles", isActive: true, active: true },
    { id: "l6", locationID: 30006, locationId: "USNYC", locationName: "NEW YORK, USA", locationCode: "USNYC", locationType: "Port", unLOCODE: "USNYC", unLocode: "USNYC", functionCode: "1", status: "Active", country: "US", countryName: "USA", city: "New York", region: "Americas", timeZone: "America/New_York", isActive: true, active: true },
    { id: "l7", locationID: 30007, locationId: "AEJEA", locationName: "JEBEL ALI, UAE", locationCode: "AEJEA", locationType: "Port", unLOCODE: "AEJEA", unLocode: "AEJEA", functionCode: "1", status: "Active", country: "AE", countryName: "UAE", city: "Jebel Ali", region: "Middle East", timeZone: "Asia/Dubai", isActive: true, active: true },
    { id: "l8", locationID: 30008, locationId: "KEMOM", locationName: "MOMBASA, KENYA", locationCode: "KEMOM", locationType: "Port", unLOCODE: "KEMOM", unLocode: "KEMOM", functionCode: "1", status: "Active", country: "KE", countryName: "KENYA", city: "Mombasa", region: "Africa", timeZone: "Africa/Nairobi", isActive: true, active: true },
    { id: "l9", locationID: 30009, locationId: "AUMEL", locationName: "MELBOURNE, AUSTRALIA", locationCode: "AUMEL", locationType: "Port", unLOCODE: "AUMEL", unLocode: "AUMEL", functionCode: "1", status: "Active", country: "AU", countryName: "AUSTRALIA", city: "Melbourne", region: "Oceania", timeZone: "Australia/Melbourne", isActive: true, active: true },
    { id: "l10", locationID: 30010, locationId: "BRSSZ", locationName: "SANTOS, BRAZIL", locationCode: "BRSSZ", locationType: "Port", unLOCODE: "BRSSZ", unLocode: "BRSSZ", functionCode: "1", status: "Active", country: "BR", countryName: "BRAZIL", city: "Santos", region: "Americas", timeZone: "America/Sao_Paulo", isActive: true, active: true },
    { id: "l11", locationID: 30011, locationId: "JPYOK", locationName: "YOKOHAMA, JAPAN", locationCode: "JPYOK", locationType: "Port", unLOCODE: "JPYOK", unLocode: "JPYOK", functionCode: "1", status: "Active", country: "JP", countryName: "JAPAN", city: "Yokohama", region: "Asia", timeZone: "Asia/Tokyo", isActive: true, active: true },
    { id: "l12", locationID: 30012, locationId: "GBFXT", locationName: "FELIXSTOWE, UK", locationCode: "GBFXT", locationType: "Port", unLOCODE: "GBFXT", unLocode: "GBFXT", functionCode: "1", status: "Active", country: "GB", countryName: "UK", city: "Felixstowe", region: "Europe", timeZone: "Europe/London", isActive: true, active: true },
    { id: "l13", locationID: 30013, locationId: "USJFK", locationName: "JOHN F KENNEDY INTL, USA", locationCode: "USJFK", locationType: "Airport", unLOCODE: "USJFK", unLocode: "USJFK", functionCode: "4", status: "Active", country: "US", countryName: "USA", city: "New York", region: "Americas", timeZone: "America/New_York", isActive: true, active: true },
    { id: "l14", locationID: 30014, locationId: "DEHAM", locationName: "HAMBURG AIRPORT, GERMANY", locationCode: "DEHAM-AIR", locationType: "Airport", unLOCODE: "DEHAM", unLocode: "DEHAM", functionCode: "4", status: "Active", country: "DE", countryName: "GERMANY", city: "Hamburg", region: "Europe", timeZone: "Europe/Berlin", isActive: true, active: true },
    { id: "l15", locationID: 30015, locationId: "CNPKX", locationName: "BEIJING CAPITAL INTL, CHINA", locationCode: "CNPKX", locationType: "Airport", unLOCODE: "CNPKX", unLocode: "CNPKX", functionCode: "4", status: "Active", country: "CN", countryName: "CHINA", city: "Beijing", region: "Asia", timeZone: "Asia/Shanghai", isActive: true, active: true },
    { id: "l16", locationID: 30016, locationId: "GBLHR", locationName: "LONDON HEATHROW, UK", locationCode: "GBLHR", locationType: "Airport", unLOCODE: "GBLHR", unLocode: "GBLHR", functionCode: "4", status: "Active", country: "GB", countryName: "UK", city: "London", region: "Europe", timeZone: "Europe/London", isActive: true, active: true },
    { id: "l17", locationID: 30017, locationId: "HUBUD", locationName: "BUDAPEST, HUNGARY", locationCode: "HUBUD", locationType: "City", unLOCODE: "", unLocode: "", functionCode: "7", status: "Active", country: "HU", countryName: "HUNGARY", city: "Budapest", region: "Europe", timeZone: "Europe/Budapest", isActive: true, active: true },
    { id: "l18", locationID: 30018, locationId: "PLPOZ", locationName: "POZNAN, POLAND", locationCode: "PLPOZ", locationType: "City", unLOCODE: "", unLocode: "", functionCode: "7", status: "Active", country: "PL", countryName: "POLAND", city: "Poznan", region: "Europe", timeZone: "Europe/Warsaw", isActive: true, active: true },
    { id: "l19", locationID: 30019, locationId: "WH001", locationName: "SHANGHAI WAREHOUSE A", locationCode: "WH001", locationType: "Warehouse", unLOCODE: "", unLocode: "", functionCode: "8", status: "Active", country: "CN", countryName: "CN", city: "Shanghai", region: "Asia", timeZone: "Asia/Shanghai", isActive: true, active: true },
    { id: "l20", locationID: 30020, locationId: "WH002", locationName: "ROTTERDAM DISTRIBUTION CENTER", locationCode: "WH002", locationType: "Warehouse", unLOCODE: "", unLocode: "", functionCode: "8", status: "Active", country: "NL", countryName: "NL", city: "Rotterdam", region: "Europe", timeZone: "Europe/Amsterdam", isActive: true, active: true },
  ],
  products: [
    { id: "prod1", skuID: 40001, productId: "PROD001", skuCode: "LIDL-PLATE-SET", productCode: "CERAMIC-PLATE", skuDescription: "Ceramic Dinner Plate Set 4pcs", productDescription: "Ceramic Dinner Plate Set 4pcs", productGroup: "Homeware", productCategory: "Dinnerware", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 2.800, defaultWeight: 2.8, volumeCBM: 0.0020, commodityCodeHSCode: "6911.10", commodityCode: "6911.10", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 21, height: 4, length: 26, active: true },
    { id: "prod2", skuID: 40002, productId: "PROD002", skuCode: "LIDL-WOOD-MAT", productCode: "WOOD-MAT", skuDescription: "Wooden Dining Table Mat", productDescription: "Wooden Dining Table Mat", productGroup: "Homeware", productCategory: "Tableware", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.500, defaultWeight: 0.5, volumeCBM: 0.0014, commodityCodeHSCode: "4419.90", commodityCode: "4419.90", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 22, height: 5, length: 27, active: true },
    { id: "prod3", skuID: 40003, productId: "PROD003", skuCode: "LIDL-CANDLE-XMAS", productCode: "CANDLE-XMAS", skuDescription: "Scented Candle in Glass XMAS Gift Traditional", productDescription: "Scented Candle in Glass XMAS Gift Traditional", productGroup: "Seasonal", productCategory: "Candles", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.350, defaultWeight: 0.35, volumeCBM: 0.0006, commodityCodeHSCode: "3406.00", commodityCode: "3406.00", countryOfOrigin: "CN", hazardousMaterialFlag: true, unNumber: "UN1266", dangerousGoods: "Y", width: 23, height: 6, length: 28, active: true },
    { id: "prod4", skuID: 40004, productId: "PROD004", skuCode: "LIDL-GLASS-BOWL", productCode: "GLASS-BOWL", skuDescription: "Borosilicate Glass Bowl Set 4pcs", productDescription: "Borosilicate Glass Bowl Set 4pcs", productGroup: "Homeware", productCategory: "Glassware", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 1.800, defaultWeight: 1.8, volumeCBM: 0.0048, commodityCodeHSCode: "7013.99", commodityCode: "7013.99", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 24, height: 7, length: 29, active: true },
    { id: "prod5", skuID: 40005, productId: "PROD005", skuCode: "LIDL-POWER-EXT", productCode: "POWER-EXT", skuDescription: "Power Extension Lead 5-Socket 3m", productDescription: "Power Extension Lead 5-Socket 3m", productGroup: "Electronics", productCategory: "Accessories", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.600, defaultWeight: 0.6, volumeCBM: 0.0010, commodityCodeHSCode: "8544.42", commodityCode: "8544.42", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 25, height: 3, length: 30, active: true },
    { id: "prod6", skuID: 40006, productId: "PROD006", skuCode: "PEPCO-DRAWER-CAB", productCode: "DRAWER-CAB", skuDescription: "Plastic Drawer Cabinet 2-Tier Organizer", productDescription: "Plastic Drawer Cabinet 2-Tier Organizer", productGroup: "Storage", productCategory: "Plastic Storage", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 1.200, defaultWeight: 1.2, volumeCBM: 0.0150, commodityCodeHSCode: "3924.90", commodityCode: "3924.90", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 26, height: 4, length: 31, active: true },
    { id: "prod7", skuID: 40007, productId: "PROD007", skuCode: "PEPCO-NECK-WARMER", productCode: "NECK-WARMER", skuDescription: "Knitted Neck Warmer Ribbed Texture", productDescription: "Knitted Neck Warmer Ribbed Texture", productGroup: "Apparel", productCategory: "Accessories", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.150, defaultWeight: 0.15, volumeCBM: 0.0002, commodityCodeHSCode: "6117.10", commodityCode: "6117.10", countryOfOrigin: "BD", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 27, height: 5, length: 32, active: true },
    { id: "prod8", skuID: 40008, productId: "PROD008", skuCode: "PEPCO-SILICONE-UTENSIL", productCode: "SILICONE-UTENSIL", skuDescription: "Silicone Kitchen Utensil Set 6pcs", productDescription: "Silicone Kitchen Utensil Set 6pcs", productGroup: "Kitchen", productCategory: "Utensils", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.800, defaultWeight: 0.8, volumeCBM: 0.0028, commodityCodeHSCode: "3924.10", commodityCode: "3924.10", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 28, height: 6, length: 33, active: true },
    { id: "prod9", skuID: 40009, productId: "PROD009", skuCode: "LIDL-BOTTLE-500ML", productCode: "INSULATED-BOTTLE", skuDescription: "Stainless Steel Insulated Bottle 500ml", productDescription: "Stainless Steel Insulated Bottle 500ml", productGroup: "Homeware", productCategory: "Drinkware", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 0.300, defaultWeight: 0.3, volumeCBM: 0.0011, commodityCodeHSCode: "7323.94", commodityCode: "7323.94", countryOfOrigin: "CN", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 29, height: 7, length: 34, active: true },
    { id: "prod10", skuID: 40010, productId: "PROD010", skuCode: "PEPCO-BATH-TOWEL", productCode: "BATH-TOWEL", skuDescription: "Cotton Bath Towel Set 3pcs", productDescription: "Cotton Bath Towel Set 3pcs", productGroup: "Textile", productCategory: "Towels", productStatus: "Active", status: "Active", baseUnitOfMeasure: "EA", grossWeightKg: 1.500, defaultWeight: 1.5, volumeCBM: 0.0180, commodityCodeHSCode: "6302.60", commodityCode: "6302.60", countryOfOrigin: "BD", hazardousMaterialFlag: false, unNumber: undefined, dangerousGoods: "N", width: 30, height: 3, length: 35, active: true },
  ],
  equipment: [
    { id: "eq1", equipmentID: 50001, equipmentId: "50001", equipmentCode: "40GP", equipmentType: "Container", equipmentCategory: "Dry", equipmentStatus: "Available", ownerType: "Owned", ownerCarrierProfile: 20001, active: true, lengthFt: 40.00, widthFt: 8.00, heightFt: 8.50, weightTare: 3750.00, maxPayloadGrossWeight: 28750.00, teuCapacity: 2.00, volumeCapacityCBM: 67.70, containerTypeUnitType: "FCL", isHazardousApproved: true, notes: "MSC 40ft dry container reference sample", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq2", equipmentID: 50002, equipmentId: "50002", equipmentCode: "20GP", equipmentType: "Container", equipmentCategory: "Dry", equipmentStatus: "Available", ownerType: "Leased", ownerCarrierProfile: 20002, active: true, lengthFt: 20.00, widthFt: 8.00, heightFt: 8.50, weightTare: 2300.00, maxPayloadGrossWeight: 28180.00, teuCapacity: 1.00, volumeCapacityCBM: 33.20, containerTypeUnitType: "FCL", isHazardousApproved: false, notes: "Standard 20ft dry container", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq3", equipmentID: 50003, equipmentId: "50003", equipmentCode: "40HC", equipmentType: "Container", equipmentCategory: "Dry", equipmentStatus: "In Use", ownerType: "Leased", ownerCarrierProfile: 20003, active: true, lengthFt: 40.00, widthFt: 8.00, heightFt: 9.50, weightTare: 3900.00, maxPayloadGrossWeight: 28580.00, teuCapacity: 2.00, volumeCapacityCBM: 76.30, containerTypeUnitType: "FCL", isHazardousApproved: false, notes: "High cube dry container for volume-heavy cargo", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq4", equipmentID: 50004, equipmentId: "50004", equipmentCode: "20RF", equipmentType: "Container", equipmentCategory: "Reefer", equipmentStatus: "Available", ownerType: "Rented", ownerCarrierProfile: 20004, active: true, lengthFt: 20.00, widthFt: 8.00, heightFt: 8.50, weightTare: 3050.00, maxPayloadGrossWeight: 27430.00, teuCapacity: 1.00, volumeCapacityCBM: 28.30, containerTypeUnitType: "Reefer", isHazardousApproved: false, notes: "Reefer container for temperature controlled cargo", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq5", equipmentID: 50005, equipmentId: "50005", equipmentCode: "40RF", equipmentType: "Container", equipmentCategory: "Reefer", equipmentStatus: "Under Maintenance", ownerType: "Leased", ownerCarrierProfile: 20005, active: true, lengthFt: 40.00, widthFt: 8.00, heightFt: 9.50, weightTare: 4550.00, maxPayloadGrossWeight: 29450.00, teuCapacity: 2.00, volumeCapacityCBM: 67.00, containerTypeUnitType: "Reefer", isHazardousApproved: false, notes: "Maintenance hold pending reefer unit inspection", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq6", equipmentID: 50006, equipmentId: "50006", equipmentCode: "20TK", equipmentType: "Tank", equipmentCategory: "Tank", equipmentStatus: "Available", ownerType: "Owned", ownerCarrierProfile: 20006, active: true, lengthFt: 20.00, widthFt: 8.00, heightFt: 8.50, weightTare: 3650.00, maxPayloadGrossWeight: 26000.00, teuCapacity: 1.00, volumeCapacityCBM: 26.00, containerTypeUnitType: "Hazmat", isHazardousApproved: true, notes: "Tank equipment approved for regulated cargo", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq7", equipmentID: 50007, equipmentId: "50007", equipmentCode: "TRAILER01", equipmentType: "Trailer", equipmentCategory: "Flatbed", equipmentStatus: "Available", ownerType: "Customer Owned", ownerCarrierProfile: 20007, active: true, lengthFt: 53.00, widthFt: 8.50, heightFt: 4.80, weightTare: 6500.00, maxPayloadGrossWeight: 36000.00, teuCapacity: undefined, volumeCapacityCBM: undefined, containerTypeUnitType: "", isHazardousApproved: false, notes: "Customer owned flatbed trailer", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
    { id: "eq8", equipmentID: 50008, equipmentId: "50008", equipmentCode: "AIRULD01", equipmentType: "Aircraft Container", equipmentCategory: "ULD", equipmentStatus: "In Use", ownerType: "Rented", ownerCarrierProfile: 20008, active: true, lengthFt: 5.00, widthFt: 4.00, heightFt: 5.30, weightTare: 82.00, maxPayloadGrossWeight: 1588.00, teuCapacity: undefined, volumeCapacityCBM: 4.80, containerTypeUnitType: "", isHazardousApproved: false, notes: "Air ULD sample for air freight operations", createdAt: "2026-07-01 10:00:00", createdBy: "admin", updatedAt: "2026-07-01 10:00:00", updatedBy: "admin" },
  ],
  vessels: [
    { id: "vsl1", vesselID: 60001, vesselId: "60001", vesselName: "MSC GULSUN", vesselCode: "MSC-GULSUN", vesselType: "Container Ship", imoNumber: "9778824", vesselStatus: "Active", flagState: "PA", ownerOperator: "ORG008", teuCapacity: 23756, active: true },
    { id: "vsl2", vesselID: 60002, vesselId: "60002", vesselName: "MAERSK ESSEX", vesselCode: "MAERSK-ESSEX", vesselType: "Container Ship", imoNumber: "9632511", vesselStatus: "Active", flagState: "DK", ownerOperator: "ORG002", teuCapacity: 13000, active: true },
    { id: "vsl3", vesselID: 60003, vesselId: "60003", vesselName: "EVER GIVEN", vesselCode: "EVER-GIVEN", vesselType: "Container Ship", imoNumber: "9811000", vesselStatus: "Under Maintenance", flagState: "PA", ownerOperator: "ORG010", teuCapacity: 20124, active: true },
    { id: "vsl4", vesselID: 60004, vesselId: "60004", vesselName: "CMA CGM ANTOINE DE SAINT EXUPERY", vesselCode: "CMA-ANTOINE", vesselType: "Container Ship", imoNumber: "9454436", vesselStatus: "Active", flagState: "FR", ownerOperator: "ORG009", teuCapacity: 20954, active: true },
  ],
  voyages: [
    { id: "voy1", voyageID: 70001, voyageId: "70001", voyageNumber: "246W", vesselID: 60001, vesselId: "60001", carrierID: 20001, carrierId: "ORG008", serviceId: "AE7", voyageType: "Westbound", voyageStatus: "Confirmed", isActive: true, isCurrent: true, effectiveFrom: "2026-07-10", effectiveTo: "2026-08-05", publishedDate: "2026-07-01" },
    { id: "voy2", voyageID: 70002, voyageId: "70002", voyageNumber: "428E", vesselID: 60002, vesselId: "60002", carrierID: 20002, carrierId: "ORG002", serviceId: "AE10", voyageType: "Eastbound", voyageStatus: "Open", isActive: true, isCurrent: true, effectiveFrom: "2026-07-15", effectiveTo: "2026-08-20", publishedDate: "2026-07-03" },
    { id: "voy3", voyageID: 70003, voyageId: "70003", voyageNumber: "052W", vesselID: 60003, vesselId: "60003", carrierID: 20007, carrierId: "ORG010", serviceId: "TP2", voyageType: "Westbound", voyageStatus: "Delayed", isActive: true, isCurrent: true, effectiveFrom: "2026-07-12", effectiveTo: "2026-08-01", publishedDate: "2026-07-02" },
    { id: "voy4", voyageID: 70004, voyageId: "70004", voyageNumber: "0FLME1MA", vesselID: 60004, vesselId: "60004", carrierID: 20003, carrierId: "ORG009", serviceId: "FAL1", voyageType: "Round Trip", voyageStatus: "Planned", isActive: true, isCurrent: false, effectiveFrom: "2026-07-18", effectiveTo: "2026-08-25", publishedDate: "2026-07-05" },
  ],
  services: [
    { id: "svc1", serviceId: "SVC001", serviceName: "Direct Service CNSHA-NLRTM", serviceCode: "DS-CNSHA-NLRTM", serviceType: "FCL", transportMode: "Ocean", transitTimeMin: 28, transitTimeMax: 35, pol: "CNSHA", pod: "NLRTM", defaultOrganization: "ORG001", active: true },
    { id: "svc2", serviceId: "SVC002", serviceName: "Direct Service DEHAM-CNSHA", serviceCode: "DS-DEHAM-CNSHA", serviceType: "FCL", transportMode: "Ocean", transitTimeMin: 30, transitTimeMax: 38, pol: "DEHAM", pod: "CNSHA", defaultOrganization: "ORG002", active: true },
    { id: "svc3", serviceId: "SVC003", serviceName: "Transshipment via Singapore", serviceCode: "TS-SIN", serviceType: "FCL", transportMode: "Ocean", transitTimeMin: 35, transitTimeMax: 45, pol: "CNSHA", pod: "USLAX", tsPorts: "SGSIN", defaultOrganization: "ORG001", active: true },
    { id: "svc4", serviceId: "SVC004", serviceName: "Air Freight CNSHA-FRA", serviceCode: "AF-CNSHA-FRA", serviceType: "Air", transportMode: "Air", transitTimeMin: 3, transitTimeMax: 5, pol: "CNSHA", pod: "FRFOS", defaultOrganization: "ORG003", active: true },
    { id: "svc5", serviceId: "SVC005", serviceName: "Door-to-Door Europe", serviceCode: "DTD-EU", serviceType: "Door-to-Door", transportMode: "Multimodal", transitTimeMin: 40, transitTimeMax: 50, pol: "CNSHA", pod: "PLPOZ", defaultOrganization: "ORG006", active: true },
    { id: "svc6", serviceId: "SVC006", serviceName: "LCL Consolidation Asia-Europe", serviceCode: "LCL-ASIA-EU", serviceType: "LCL", transportMode: "Ocean", transitTimeMin: 32, transitTimeMax: 40, pol: "CNSHA", pod: "NLRTM", defaultOrganization: "ORG003", active: true },
    { id: "svc7", serviceId: "SVC007", serviceName: "Rail Service China-Europe", serviceCode: "RAIL-CN-EU", serviceType: "Rail", transportMode: "Rail", transitTimeMin: 15, transitTimeMax: 20, pol: "CNSHA", pod: "HUBUD", defaultOrganization: "ORG003", active: true },
    { id: "svc8", serviceId: "SVC008", serviceName: "Road Transport Europe", serviceCode: "ROAD-EU", serviceType: "Road", transportMode: "Road", transitTimeMin: 2, transitTimeMax: 5, pol: "NLRTM", pod: "PLPOZ", defaultOrganization: "ORG006", active: true },
  ],
  purchaseOrders: generatePurchaseOrders(),
  audit: [
    { id: "log1", time: "2026-06-26 15:20", user: "Grace", action: "Scope confirmed", module: "MVP", objectType: "MVP", objectName: "System Foundation + Master Data", detail: "P1 scope baseline loaded", status: "Success", ip: "127.0.0.1", sessionId: "-", userId: "admin@moov.local" },
  ],
  sessions: [],
  loginHistory: [],
  // Permission Management - PRD v2.0
  rolePermissions: [
    {
      roleId: "ADMIN",
      permissions: [
        { menuId: "dashboard", menuName: "Dashboard", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        { menuId: "master-data", menuName: "Master Data", permissions: { View: true, Add: true, Modify: true, Delete: true }, subMenus: [
          { subMenuId: "customers", subMenuName: "Customers", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "organizations", subMenuName: "Organizations", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "locations", subMenuName: "Locations", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "products", subMenuName: "Products", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "equipment", subMenuName: "Equipment", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "vessels", subMenuName: "Vessels", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "services", subMenuName: "Services", permissions: { View: true, Add: true, Modify: true, Delete: true } },
        ]},
        { menuId: "po-management", menuName: "PO Management", permissions: { View: true, Add: true, Modify: true, Delete: true } },
        { menuId: "process-rules", menuName: "Process & Rules", permissions: { View: true, Add: true, Modify: true, Delete: true }, subMenus: [
          { subMenuId: "templates", subMenuName: "Templates", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "assignment-rules", subMenuName: "Assignment Rules", permissions: { View: true, Add: true, Modify: true, Delete: true } },
        ]},
        { menuId: "user-permission", menuName: "User & Permission", permissions: { View: true, Add: true, Modify: true, Delete: true }, subMenus: [
          { subMenuId: "users", subMenuName: "Users", permissions: { View: true, Add: true, Modify: true, Delete: true } },
          { subMenuId: "roles", subMenuName: "Roles", permissions: { View: true, Add: true, Modify: true, Delete: true } },
        ]},
      ],
    },
    {
      roleId: "OPS",
      permissions: [
        { menuId: "dashboard", menuName: "Dashboard", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        { menuId: "master-data", menuName: "Master Data", permissions: { View: true, Add: false, Modify: false, Delete: false }, subMenus: [
          { subMenuId: "customers", subMenuName: "Customers", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "organizations", subMenuName: "Organizations", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "locations", subMenuName: "Locations", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "products", subMenuName: "Products", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "equipment", subMenuName: "Equipment", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "vessels", subMenuName: "Vessels", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "services", subMenuName: "Services", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        ]},
        { menuId: "po-management", menuName: "PO Management", permissions: { View: true, Add: true, Modify: true, Delete: false } },
        { menuId: "process-rules", menuName: "Process & Rules", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        { menuId: "user-permission", menuName: "User & Permission", permissions: { View: false, Add: false, Modify: false, Delete: false } },
      ],
    },
    {
      roleId: "OHA",
      permissions: [
        { menuId: "dashboard", menuName: "Dashboard", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        { menuId: "master-data", menuName: "Master Data", permissions: { View: true, Add: false, Modify: false, Delete: false }, subMenus: [
          { subMenuId: "customers", subMenuName: "Customers", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "organizations", subMenuName: "Organizations", permissions: { View: true, Add: false, Modify: false, Delete: false } },
          { subMenuId: "locations", subMenuName: "Locations", permissions: { View: true, Add: false, Modify: false, Delete: false } },
        ]},
        { menuId: "po-management", menuName: "PO Management", permissions: { View: true, Add: false, Modify: true, Delete: false } },
        { menuId: "process-rules", menuName: "Process & Rules", permissions: { View: false, Add: false, Modify: false, Delete: false } },
        { menuId: "user-permission", menuName: "User & Permission", permissions: { View: false, Add: false, Modify: false, Delete: false } },
      ],
    },
  ],
};

export function loadState(): AppState {
  const saved = localStorage.getItem(STORAGE_KEY);
  const savedVersion = localStorage.getItem(STATE_VERSION_KEY);

  // If version mismatch or no saved state, use default state and clear old data
  if (!saved || savedVersion !== String(CURRENT_STATE_VERSION)) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STATE_VERSION_KEY, String(CURRENT_STATE_VERSION));
    return structuredClone(defaultState);
  }

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STATE_VERSION_KEY, String(CURRENT_STATE_VERSION));
    return structuredClone(defaultState);
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(STATE_VERSION_KEY, String(CURRENT_STATE_VERSION));
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export function escapeHtml(value: any): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
