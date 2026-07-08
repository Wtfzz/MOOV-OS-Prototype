import type { PORecord } from "@/types";

type POMilestonesTabProps = {
  record: PORecord;
  tx: Record<string, string>;
};

export default function POMilestonesTab({ record, tx }: POMilestonesTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.milestones}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.plannedDate}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.actualDate}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.status}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.remark}</th>
          </tr>
        </thead>
        <tbody>
          {(record.milestones || []).map((milestone, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="px-3 py-2">{milestone.milestoneName}</td>
              <td className="px-3 py-2">{milestone.plannedDate}</td>
              <td className="px-3 py-2">{milestone.actualDate}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    milestone.status === 'Completed'
                      ? 'bg-green-soft text-green'
                      : milestone.status === 'Delayed'
                        ? 'bg-red-soft text-red'
                        : milestone.status === 'In Progress'
                          ? 'bg-blue-soft text-blue'
                          : 'bg-gray-soft text-gray'
                  }`}
                >
                  {milestone.status}
                </span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{milestone.remark || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
