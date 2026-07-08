import type { PORecord } from "@/types";

type POTransportPlanHistoryTabProps = {
  record: PORecord;
  tx: Record<string, string>;
};

export default function POTransportPlanHistoryTab({ record, tx }: POTransportPlanHistoryTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.version}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.createdDate}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.createdBy}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.changes}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.status}</th>
          </tr>
        </thead>
        <tbody>
          {(record.transportPlanHistory || []).map((plan, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="px-3 py-2 font-medium">{plan.version}</td>
              <td className="px-3 py-2">{plan.createdDate}</td>
              <td className="px-3 py-2">{plan.createdBy}</td>
              <td className="px-3 py-2">{plan.changes}</td>
              <td className="px-3 py-2">
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${plan.status === 'Active' ? 'bg-green-soft text-green' : 'bg-gray-soft text-gray'}`}>
                  {plan.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
