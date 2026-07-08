import type { PORecord } from "@/types";

type PODocumentsTabProps = {
  record: PORecord;
  tx: Record<string, string>;
};

export default function PODocumentsTab({ record, tx }: PODocumentsTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.documentType}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.documentName}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.uploadDate}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.uploadedBy}</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">{tx.status}</th>
          </tr>
        </thead>
        <tbody>
          {(record.documents || []).map((document, idx) => (
            <tr key={idx} className="border-t border-border/50">
              <td className="px-3 py-2">{document.documentType}</td>
              <td className="px-3 py-2 text-brand hover:underline cursor-pointer">{document.documentName}</td>
              <td className="px-3 py-2">{document.uploadDate}</td>
              <td className="px-3 py-2">{document.uploadedBy}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    document.status === 'Approved'
                      ? 'bg-green-soft text-green'
                      : document.status === 'Rejected'
                        ? 'bg-red-soft text-red'
                        : 'bg-yellow-soft text-yellow'
                  }`}
                >
                  {document.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
