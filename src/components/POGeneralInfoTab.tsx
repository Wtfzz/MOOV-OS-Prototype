import type { PORecord } from "@/types";

interface POGeneralInfoTabProps {
  poRecord: PORecord;
}

export default function POGeneralInfoTab({ poRecord }: POGeneralInfoTabProps) {
  const info = poRecord.generalInfo;

  if (!info) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No general information available
      </div>
    );
  }

  const fields = [
    { label: "Customer PO Number", value: info.customerPoNumber },
    { label: "PO Creation Date", value: info.poCreationDate },
    { label: "PO Type", value: info.poType },
    { label: "Currency", value: info.currency },
    { label: "Total Value", value: `$${info.totalValue?.toLocaleString()}` },
    { label: "Payment Terms", value: info.paymentTerms },
    { label: "Delivery Terms", value: info.deliveryTerms },
    { label: "Remarks", value: info.remarks, full: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {fields.map((field, idx) => (
            <tr key={idx} className="border-b border-border/50">
              <td className="px-3 py-2 text-xs font-semibold text-muted-foreground w-1/4 bg-muted/30">
                {field.label}
              </td>
              <td className={`px-3 py-2 text-xs ${field.full ? "col-span-3" : ""}`}>
                {field.value || "-"}
              </td>
              {!field.full && (
                <>
                  <td className="px-3 py-2 text-xs font-semibold text-muted-foreground w-1/4 bg-muted/30">
                    {fields[idx + 4]?.label || ""}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {fields[idx + 4]?.value || "-"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
