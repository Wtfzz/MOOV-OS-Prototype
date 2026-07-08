import type { PORecord } from "@/types";

interface POLocationTabProps {
  record: PORecord;
}

export default function POLocationTab({ record }: POLocationTabProps) {
  const loc = record.locationInfo;

  if (!loc) {
    return <div className="p-4 text-sm text-muted-foreground">No location information available.</div>;
  }

  const fields1 = [
    { label: "Origin Country (PO)", value: loc.originCountry },
    { label: "Origin Port (PO)", value: loc.originPort },
    { label: "Destination Port (PO)", value: loc.destinationPort },
    { label: "Requested Booking Date", value: loc.requestedBookingDate },
    { label: "Handover Date", value: loc.handoverDate },
    { label: "AHOD", value: loc.ahod },
    { label: "Incoterm", value: loc.incoterm },
    { label: "Named Place", value: loc.namedPlace },
  ];

  const fields2 = [
    { label: "Transport Mode", value: loc.transportMode },
    { label: "Origin Location (Booked)", value: loc.originLocationBooked },
    { label: "Origin Port (Booked)", value: loc.originPortBooked },
    { label: "Destination Port (Booked)", value: loc.destinationPortBooked },
    { label: "Destination Location (Booked)", value: loc.destinationLocationBooked },
    { label: "Destination DC", value: loc.destinationDc },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <tbody>
          {/* Row 1 */}
          <tr className="border-b border-border/50">
            {fields1.map((f, i) => (
              <td key={i} className={`px-3 py-2 text-xs ${i % 2 === 0 ? "bg-muted/30 font-medium text-muted-foreground w-[18%]" : "text-foreground"}`}>
                {f.value || "-"}
              </td>
            ))}
          </tr>
          {/* Labels row for row 1 */}
          <tr className="border-b border-border/50 bg-muted/20">
            {fields1.map((f, i) => (
              <td key={i} className={`px-3 py-2 text-xs ${i % 2 === 0 ? "font-semibold text-muted-foreground" : ""}`}>
                {f.label}
              </td>
            ))}
          </tr>
          {/* Row 2 */}
          <tr className="border-b border-border/50">
            {fields2.map((f, i) => (
              <td key={i} className={`px-3 py-2 text-xs ${i % 2 === 0 ? "bg-muted/30 font-medium text-muted-foreground w-[18%]" : "text-foreground"}`}>
                {f.value || "-"}
              </td>
            ))}
            {/* Pad remaining cells */}
            {[...Array(fields1.length - fields2.length)].map((_, i) => (
              <td key={`pad-${i}`} className="px-3 py-2" />
            ))}
          </tr>
          {/* Labels row for row 2 */}
          <tr className="bg-muted/20">
            {fields2.map((f, i) => (
              <td key={i} className={`px-3 py-2 text-xs ${i % 2 === 0 ? "font-semibold text-muted-foreground" : ""}`}>
                {f.label}
              </td>
            ))}
            {[...Array(fields1.length - fields2.length)].map((_, i) => (
              <td key={`pad-label-${i}`} className="px-3 py-2" />
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
