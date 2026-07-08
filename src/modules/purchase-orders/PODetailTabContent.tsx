import type { PORecord } from "@/types";
import POCarrierBookingTab from "@/components/POCarrierBookingTab";
import POLocationTab from "@/components/POLocationTab";
import POGeneralInfoTab from "@/components/POGeneralInfoTab";
import POPartiesTab from "@/components/POPartiesTab";
import POChangeLogTab from "./tabs/POChangeLogTab";
import POCommentsTab from "./tabs/POCommentsTab";
import PODateSummaryTab from "./tabs/PODateSummaryTab";
import PODocumentsTab from "./tabs/PODocumentsTab";
import POMilestonesTab from "./tabs/POMilestonesTab";
import POOrderItemsTab from "./tabs/POOrderItemsTab";
import POTransportPlanHistoryTab from "./tabs/POTransportPlanHistoryTab";

type PODetailTabContentProps = {
  record: PORecord;
  tabId: string;
  tx: Record<string, string>;
};

export default function PODetailTabContent({ record, tabId, tx }: PODetailTabContentProps) {
  switch (tabId) {
    case 'orderItems':
      return <POOrderItemsTab record={record} tx={tx} />;
    case 'generalInformation':
      return <POGeneralInfoTab poRecord={record} />;
    case 'location':
      return <POLocationTab record={record} />;
    case 'parties':
      return <POPartiesTab poRecord={record} />;
    case 'carrierBooking':
      return <POCarrierBookingTab carrierBooking={record.carrierBooking} />;
    case 'milestones':
      return <POMilestonesTab record={record} tx={tx} />;
    case 'documents':
      return <PODocumentsTab record={record} tx={tx} />;
    case 'transportPlanHistory':
      return <POTransportPlanHistoryTab record={record} tx={tx} />;
    case 'changeLog':
      return <POChangeLogTab record={record} tx={tx} />;
    case 'comments':
      return <POCommentsTab record={record} />;
    case 'cargoReadyDate':
      return <PODateSummaryTab label={tx.cargoReadyDate} value={record.cargoReadyDate} />;
    case 'actualHandoverDate':
      return <PODateSummaryTab label={tx.actualHandoverDate} value={record.actualHandoverDate} />;
    default:
      return <div className="p-4 text-sm text-muted-foreground">{tx.noData}</div>;
  }
}
