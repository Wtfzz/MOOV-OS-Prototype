import { useState } from "react";
import { Search, Filter, ChevronDown, ChevronRight, Package, Truck, MapPin, Calendar, Eye, Trash2 } from "lucide-react";
import { loadState } from "@/lib/store";
import type { EffectiveDataScope, PageAccess, PORecord } from "@/types";
import PODetailTabContent from "@/modules/purchase-orders/PODetailTabContent";
import { getCurrentLanguage, type Language } from "@/lib/i18n";
import { filterPOsByScope } from "@/lib/accessControl";

const poText = {
  zh: {
    title: "\u0050\u004f\u0020\u7ba1\u7406",
    subtitle: "\u91c7\u8d2d\u8ba2\u5355\u8ddf\u8e2a\u4e0e\u7ba1\u7406",
    orderItems: "\u8ba2\u5355\u660e\u7ec6",
    generalInformation: "\u57fa\u672c\u4fe1\u606f",
    location: "\u4f4d\u7f6e",
    parties: "\u76f8\u5173\u65b9",
    carrierBooking: "\u627f\u8fd0\u4eba\u8ba2\u8231",
    milestones: "\u91cc\u7a0b\u7891",
    documents: "\u6587\u6863",
    transportPlanHistory: "\u8fd0\u8f93\u8ba1\u5212\u5386\u53f2",
    changeLog: "\u53d8\u66f4\u65e5\u5fd7",
    comments: "\u5907\u6ce8",
    cargoReadyDate: "\u5907\u8d27\u5b8c\u6210\u65e5\u671f",
    actualHandoverDate: "\u5b9e\u9645\u4ea4\u63a5\u65e5\u671f",
    itemNumber: "\u5546\u54c1\u884c\u53f7",
    orderedOuter: "\u8ba2\u5355\u5916\u7bb1\u6570",
    orderedInner: "\u8ba2\u5355\u5185\u7bb1\u6570",
    orderedPieces: "\u8ba2\u5355\u4ef6\u6570",
    orderedVolume: "\u8ba2\u5355\u4f53\u79ef (cbm)",
    bookedOuter: "\u5df2\u8ba2\u5916\u7bb1\u6570",
    bookedInner: "\u5df2\u8ba2\u5185\u7bb1\u6570",
    bookedPieces: "\u5df2\u8ba2\u4ef6\u6570",
    outerSize: "\u5916\u7bb1\u5c3a\u5bf8 L*W*H (CM)",
    bookedVolume: "\u5df2\u8ba2\u4f53\u79ef (cbm)",
    grossWeight: "\u6bdb\u91cd (kg)",
    plannedDate: "\u8ba1\u5212\u65e5\u671f",
    actualDate: "\u5b9e\u9645\u65e5\u671f",
    status: "\u72b6\u6001",
    remark: "\u5907\u6ce8",
    documentType: "\u6587\u6863\u7c7b\u578b",
    documentName: "\u6587\u6863\u540d\u79f0",
    uploadDate: "\u4e0a\u4f20\u65e5\u671f",
    uploadedBy: "\u4e0a\u4f20\u4eba",
    version: "\u7248\u672c",
    createdDate: "\u521b\u5efa\u65e5\u671f",
    createdBy: "\u521b\u5efa\u4eba",
    changes: "\u53d8\u66f4\u5185\u5bb9",
    changeDate: "\u53d8\u66f4\u65e5\u671f",
    changedBy: "\u53d8\u66f4\u4eba",
    field: "\u5b57\u6bb5",
    oldValue: "\u65e7\u503c",
    newValue: "\u65b0\u503c",
    reason: "\u539f\u56e0",
    noData: "\u6682\u65e0\u6570\u636e",
    filter: "\u7b5b\u9009",
    clearFilters: "\u6e05\u7a7a\u7b5b\u9009",
    search: "\u641c\u7d22",
    orderNumber: "\u8ba2\u5355\u53f7",
    supplierName: "\u4f9b\u5e94\u5546\u540d\u79f0",
    pendingStatus: "\u5f85\u5904\u7406\u72b6\u6001",
    process: "\u8fdb\u5ea6",
    actions: "\u64cd\u4f5c",
    total: "\u603b\u8ba1",
    goTo: "\u8df3\u8f6c\u5230",
    destinations: "\u76ee\u7684\u5730",
    notBooked: "\u672a\u8ba2\u8231(\u53d1\u8d27\u4eba)",
    booked: "\u5df2\u8ba2\u8231(\u53d1\u8d27\u4eba)",
    createShipperBooking: "\u521b\u5efa\u53d1\u8d27\u4eba\u8ba2\u8231",
    overview: "\u6982\u89c8",
    bookedFilter: "\u5df2\u8ba2/\u672a\u8ba2",
  },
  en: {
    title: "PO Management",
    subtitle: "Purchase Order Tracking & Management",
    orderItems: "Order Items",
    generalInformation: "General Information",
    location: "Location",
    parties: "Parties",
    carrierBooking: "Carrier Booking",
    milestones: "Milestones",
    documents: "Documents",
    transportPlanHistory: "Transport Plan History",
    changeLog: "Change Log",
    comments: "Comments",
    cargoReadyDate: "Cargo Ready Date",
    actualHandoverDate: "Actual Handover Date",
    itemNumber: "Item Number",
    orderedOuter: "Ordered Outer (Cartons)",
    orderedInner: "Ordered Inner (Cartons)",
    orderedPieces: "Ordered Pieces",
    orderedVolume: "Ordered Volume (cbm)",
    bookedOuter: "Booked Outer (Cartons)",
    bookedInner: "Booked Inner (Cartons)",
    bookedPieces: "Booked Pieces",
    outerSize: "Outer Size L*W*H (CM)",
    bookedVolume: "Booked Volume (cbm)",
    grossWeight: "Gross Weight (kg)",
    plannedDate: "Planned Date",
    actualDate: "Actual Date",
    status: "Status",
    remark: "Remark",
    documentType: "Document Type",
    documentName: "Document Name",
    uploadDate: "Upload Date",
    uploadedBy: "Uploaded By",
    version: "Version",
    createdDate: "Created Date",
    createdBy: "Created By",
    changes: "Changes",
    changeDate: "Change Date",
    changedBy: "Changed By",
    field: "Field",
    oldValue: "Old Value",
    newValue: "New Value",
    reason: "Reason",
    noData: "No data",
    filter: "Filter",
    clearFilters: "Clear Filters",
    search: "Search",
    orderNumber: "Order Number",
    supplierName: "Supplier Name",
    pendingStatus: "Pending Status",
    process: "Process",
    actions: "Actions",
    total: "Total",
    goTo: "Go to",
    destinations: "Destinations",
    notBooked: "Not Booked(Shipper)",
    booked: "Booked(Shipper)",
    createShipperBooking: "Create Shipper Booking",
    overview: "Overview",
    bookedFilter: "Booked/Not Booked",
  },
} satisfies Record<Language, Record<string, string>>;

type POManagementPageProps = {
  dataScope?: EffectiveDataScope;
  access?: PageAccess;
};

export default function POManagementPage({ dataScope, access }: POManagementPageProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [state] = useState(() => loadState());
  const [orderNumberSearch, setOrderNumberSearch] = useState("");
  const [containerNoSearch, setContainerNoSearch] = useState("");
  const [merchCodeFilter, setMerchCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookedFilter, setBookedFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const pageAccess = access || { canView: true, canAdd: true, canModify: true, canDelete: true };

  const allData: PORecord[] = state.purchaseOrders || [];
  const data = dataScope ? filterPOsByScope(allData, dataScope) : allData;

  // Calculate statistics
  const notBookedCount = data.filter(po => !po.bookingDate).length;
  const bookedCount = data.filter(po => po.bookingDate).length;

  // Destination city counts
  const destinationCities = ["Rawa Mazowiecka", "Sosnowiec", "Gyal", "Bucharest", "Guadalajara", "Gdansk"];
  const cityCounts: Record<string, number> = {};
  destinationCities.forEach((city, idx) => {
    cityCounts[city] = [36133, 35485, 37268, 36442, 33308, 8302][idx];
  });

  // Filter data
  const filteredData = data.filter((row) => {
    const matchesOrderNumber = !orderNumberSearch || row.orderNumber.toLowerCase().includes(orderNumberSearch.toLowerCase());
    const matchesContainerNo = !containerNoSearch || (row.containerNo && row.containerNo.toLowerCase().includes(containerNoSearch.toLowerCase()));
    const matchesMerchCode = !merchCodeFilter || row.merchCode === merchCodeFilter;
    const matchesStatus = !statusFilter || row.pendingStatus === statusFilter;
    const matchesBooked = !bookedFilter || 
      (bookedFilter === "Booked" ? !!row.bookingDate : !row.bookingDate);
    
    return matchesOrderNumber && matchesContainerNo && matchesMerchCode && matchesStatus && matchesBooked;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueMerchCodes = [...new Set(data.map(r => r.merchCode).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(data.map(r => r.pendingStatus))].sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Destination In Process':
        return 'bg-blue-soft text-blue';
      case 'Cancel':
        return 'bg-red-soft text-red';
      case 'Hold':
        return 'bg-yellow-soft text-yellow';
      case 'Completed':
        return 'bg-green-soft text-green';
      default:
        return 'bg-gray-soft text-gray';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setOrderNumberSearch("");
    setContainerNoSearch("");
    setMerchCodeFilter("");
    setStatusFilter("");
    setBookedFilter("");
    setCurrentPage(1);
  };

  const tx = poText[lang];
  const tabs = [
    { id: 'orderItems', label: tx.orderItems },
    { id: 'generalInformation', label: tx.generalInformation },
    { id: 'location', label: tx.location },
    { id: 'parties', label: tx.parties },
    { id: 'carrierBooking', label: tx.carrierBooking },
    { id: 'milestones', label: tx.milestones },
    { id: 'documents', label: tx.documents },
    { id: 'transportPlanHistory', label: tx.transportPlanHistory },
    { id: 'changeLog', label: tx.changeLog },
    { id: 'comments', label: tx.comments },
    { id: 'cargoReadyDate', label: tx.cargoReadyDate },
    { id: 'actualHandoverDate', label: tx.actualHandoverDate },
  ];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-9 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-center">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Package size={24} className="text-brand" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 flex items-center justify-center">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Truck size={24} className="text-brand" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-soft rounded">
              <Calendar size={16} className="text-orange" />
            </div>
            <div>
              <p className="text-lg font-bold">{notBookedCount}</p>
              <p className="text-[10px] text-muted-foreground">{tx.notBooked}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-soft rounded">
              <Calendar size={16} className="text-blue" />
            </div>
            <div>
              <p className="text-lg font-bold">{bookedCount}</p>
              <p className="text-[10px] text-muted-foreground">{tx.booked}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-soft rounded">
              <MapPin size={16} className="text-purple" />
            </div>
            <div>
              <p className="text-lg font-bold">{Object.keys(cityCounts).length}</p>
              <p className="text-[10px] text-muted-foreground">{tx.destinations}</p>
            </div>
          </div>
        </div>
        {Object.entries(cityCounts).slice(0, 4).map(([city, count]) => (
          <div key={city} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{count.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground truncate">{city}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder={tx.orderNumber}
            value={orderNumberSearch}
            onChange={(e) => setOrderNumberSearch(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            type="text"
            placeholder="Container no.(CLR)"
            value={containerNoSearch}
            onChange={(e) => setContainerNoSearch(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <select
            value={merchCodeFilter}
            onChange={(e) => setMerchCodeFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Merch Code</option>
            {uniqueMerchCodes.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Pending Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={bookedFilter}
            onChange={(e) => setBookedFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">{tx.bookedFilter}</option>
            <option value="Booked">Booked</option>
            <option value="Not Booked">Not Booked</option>
          </select>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleFilter} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Filter size={14} />
            {tx.filter}
          </button>
          <button onClick={handleClearFilters} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            {tx.clearFilters}
          </button>
          <button onClick={handleFilter} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
            <Search size={14} />
            {tx.search}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-1.5">
        {pageAccess.canAdd && (
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
            {tx.createShipperBooking}
          </button>
        )}
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
          {tx.overview}
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1400px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-3 w-8"></th>
              <th className="px-3 py-3 w-8"></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{tx.orderNumber}</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{tx.supplierName}</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{tx.pendingStatus}</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{tx.process}</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">HOD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Planned CRD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier CRD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">AHOD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">In-DC Date</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Booking Date</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Booked ETD</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">{tx.actions}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-4 py-12 text-center text-muted-foreground">
                  {tx.noData}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <>
                  <tr key={row.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-3 py-3">
                      <input type="checkbox" className="rounded border-border" />
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => toggleExpand(row.id)} className="text-muted-foreground hover:text-foreground">
                        {expandedRow === row.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{row.orderNumber}</td>
                    <td className="px-3 py-3 text-sm truncate max-w-[200px]" title={row.supplierName}>{row.supplierName}</td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full ${getStatusColor(row.pendingStatus)}`}>
                          {row.pendingStatus}
                        </span>
                        {pageAccess.canModify && row.pendingStatus !== 'Cancel' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-gray-soft text-gray cursor-pointer hover:bg-gray-200">Cancel</span>
                        )}
                        {pageAccess.canModify && row.pendingStatus !== 'Hold' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-gray-soft text-gray cursor-pointer hover:bg-gray-200">Hold</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand rounded-full" 
                            style={{ width: `${row.processProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{row.processTotal}/{row.processTotal} 100%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm">{row.hod}</td>
                    <td className="px-3 py-3 text-sm">{row.plannedCrd}</td>
                    <td className="px-3 py-3 text-sm">{row.supplierCrd}</td>
                    <td className="px-3 py-3 text-sm">{row.ahod}</td>
                    <td className="px-3 py-3 text-sm">{row.inDcDate}</td>
                    <td className="px-3 py-3 text-sm">{row.bookingDate || '-'}</td>
                    <td className="px-3 py-3 text-sm">{row.bookedEtd || '-'}</td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex gap-2">
                        <button className="text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                        {pageAccess.canDelete && (
                          <button className="text-muted-foreground hover:text-red-600"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr className="bg-muted/20">
                      <td colSpan={14} className="px-4 py-0">
                        <div className="py-4">
                          {/* Tabs */}
                          <div className="flex gap-0 border-b border-border mb-4 overflow-x-auto">
                            {tabs.map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setActiveTab(prev => ({ ...prev, [row.id]: tab.id }))}
                                className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                                  (activeTab[row.id] || 'orderItems') === tab.id
                                    ? 'border-brand text-brand font-medium'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Tab Content */}
                          <PODetailTabContent record={row} tabId={activeTab[row.id] || 'orderItems'} tx={tx} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{tx.total} {filteredData.length}/{data.length}</span>
          <select 
            value={pageSize}
            onChange={(e) => { setCurrentPage(1); }}
            className="px-2 py-1 border border-border rounded text-sm"
          >
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 text-sm"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-brand text-white border-brand"
                    : "border-border hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 6 && <span className="px-2 py-1">...</span>}
            {totalPages > 6 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 border border-border rounded text-sm hover:bg-muted"
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border border-border rounded hover:bg-muted disabled:opacity-50 text-sm"
            >
              &gt;
            </button>
          </div>
          <span className="text-sm">{tx.goTo}</span>
          <input
            type="number"
            defaultValue={currentPage}
            min={1}
            max={totalPages}
            className="w-14 px-2 py-1 border border-border rounded text-center text-sm"
          />
        </div>
      </div>
    </div>
  );
}
