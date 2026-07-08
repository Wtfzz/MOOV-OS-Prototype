import type { PORecord } from "@/types";

interface POPartiesTabProps {
  poRecord: PORecord;
}

export default function POPartiesTab({ poRecord }: POPartiesTabProps) {
  const partyInfo = poRecord.partyInfo;

  if (!partyInfo) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No party information available
      </div>
    );
  }

  const fields = [
    { label: "Shipper Name", value: partyInfo.shipperName },
    { label: "Shipper Address", value: partyInfo.shipperAddress, full: true },
    { label: "Consignee Name", value: partyInfo.consigneeName },
    { label: "Consignee Address", value: partyInfo.consigneeAddress, full: true },
    { label: "Notify Party Name", value: partyInfo.notifyPartyName },
    { label: "Notify Party Address", value: partyInfo.notifyPartyAddress, full: true },
    { label: "Supplier Contact", value: partyInfo.supplierContact },
    { label: "Supplier Email", value: partyInfo.supplierEmail },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {fields.map((field, idx) => (
            <tr key={idx} className="border-b border-border/50">
              <td className="px-3 py-2 text-xs font-semibold text-muted-foreground w-1/4 bg-muted/30 whitespace-nowrap">
                {field.label}
              </td>
              <td className={`px-3 py-2 text-xs ${field.full ? "col-span-3" : ""}`}>
                {field.value || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
