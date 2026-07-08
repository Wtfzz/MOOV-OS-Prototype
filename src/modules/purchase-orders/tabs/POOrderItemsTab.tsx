import type { PORecord } from "@/types";

type POOrderItemsTabProps = {
  record: PORecord;
  tx: Record<string, string>;
};

export default function POOrderItemsTab({ record, tx }: POOrderItemsTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.itemNumber}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">TCId</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.orderedOuter}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.orderedInner}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.orderedPieces}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.orderedVolume}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.bookedOuter}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.bookedInner}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.bookedPieces}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.outerSize}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.bookedVolume}</th>
            <th className="px-3 py-2 text-right font-semibold text-muted-foreground">{tx.grossWeight}</th>
          </tr>
        </thead>
        <tbody>
          {record.items.map((item, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="px-3 py-2">{item.itemNumber}</td>
              <td className="px-3 py-2">{item.tcId}</td>
              <td className="px-3 py-2 text-right">{item.orderedOuterCartons}</td>
              <td className="px-3 py-2 text-right">{item.orderedInnerCartons}</td>
              <td className="px-3 py-2 text-right">{item.orderedPieces}</td>
              <td className="px-3 py-2 text-right">{item.orderedVolumeCbm}</td>
              <td className="px-3 py-2 text-right">{item.bookedOuterCartons}</td>
              <td className="px-3 py-2 text-right">{item.bookedInnerCartons}</td>
              <td className="px-3 py-2 text-right">{item.bookedPieces}</td>
              <td className="px-3 py-2">{item.outerSizeLWH}</td>
              <td className="px-3 py-2 text-right">{item.bookedVolumeCbm}</td>
              <td className="px-3 py-2 text-right">{item.grossWeightKg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
