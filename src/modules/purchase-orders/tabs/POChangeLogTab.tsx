import type { PORecord } from "@/types";

type POChangeLogTabProps = {
  record: PORecord;
  tx: Record<string, string>;
};

export default function POChangeLogTab({ record, tx }: POChangeLogTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.changeDate}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.changedBy}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.field}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.oldValue}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.newValue}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.reason}</th>
          </tr>
        </thead>
        <tbody>
          {(record.changeLog || []).map((change, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="px-3 py-2">{change.changeDate}</td>
              <td className="px-3 py-2">{change.changedBy}</td>
              <td className="px-3 py-2 font-medium">{change.fieldName}</td>
              <td className="px-3 py-2 text-red-600">{change.oldValue}</td>
              <td className="px-3 py-2 text-green-600">{change.newValue}</td>
              <td className="px-3 py-2 text-muted-foreground">{change.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
