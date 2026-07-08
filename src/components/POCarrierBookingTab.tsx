import type { CarrierBookingInfo } from "@/types";

interface POCarrierBookingTabProps {
  carrierBooking?: CarrierBookingInfo;
}

export default function POCarrierBookingTab({ carrierBooking }: POCarrierBookingTabProps) {
  const data = carrierBooking || {
    shipmentRef: "PEPCO26070200001",
    bookingNumber: "260702001",
    blNumber: "MBL260702001",
    shippedTogetherWith: ["F-014_0702001", "F-007_0702001", "F-008_0702001"],
    carrier: "MSCU",
    vesselVoyage: "PANDA 008/008",
    contractNumber: "R56226040000007",
    shippedTeu: 4,
    week: "",
    bookedEtd: "2026-07-02",
    bookedEta: "2026-07-20",
    atd: "2026-07-01",
    ata: "",
    containers: "40HC*2",
    shippedContainers: "QAWS0702001:40HC, QAWS0702002:40HC",
    transportStatus: "Shipping Instructions",
  };

  const fieldRow1 = [
    { label: "Shipment Ref", value: data.shipmentRef },
    { label: "Booking Number", value: data.bookingNumber },
    { label: "BL Number", value: data.blNumber },
    { label: "Shipped together with", value: data.shippedTogetherWith?.join(", ") || "-" },
    { label: "Carrier", value: data.carrier },
    { label: "Vessel/Voyage", value: data.vesselVoyage },
    { label: "Contract Number", value: data.contractNumber },
    { label: "Shipped TEU", value: String(data.shippedTeu) },
  ];

  const fieldRow2 = [
    { label: "Week", value: data.week || "-" },
    { label: "Booked ETD", value: data.bookedEtd },
    { label: "Booked ETA", value: data.bookedEta },
    { label: "ATD", value: data.atd || "-" },
    { label: "ATA", value: data.ata || "-" },
    { label: "Containers", value: data.containers || "-" },
    { label: "Shipped Containers", value: data.shippedContainers || "-" },
    { label: "Transport Status", value: data.transportStatus, isLink: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {/* Row 1 */}
          <tr className="border-b border-border">
            {fieldRow1.map((field, idx) => (
              <td key={idx} className={`px-3 py-2 ${idx % 2 === 0 ? "bg-muted/30 font-medium text-muted-foreground w-[18%]" : "text-foreground"}`}>
                {field.value}
              </td>
            ))}
          </tr>
          {/* Row 2 */}
          <tr>
            {fieldRow2.map((field, idx) => (
              <td key={idx} className={`px-3 py-2 ${idx % 2 === 0 ? "bg-muted/30 font-medium text-muted-foreground w-[18%]" : "text-foreground"}`}>
                {field.isLink ? (
                  <span className="text-brand hover:underline cursor-pointer">{field.value}</span>
                ) : (
                  field.value
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
