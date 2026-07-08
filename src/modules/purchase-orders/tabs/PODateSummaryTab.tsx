type PODateSummaryTabProps = {
  label: string;
  value?: string;
};

export default function PODateSummaryTab({ label, value }: PODateSummaryTabProps) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-semibold">{value || '-'}</p>
        </div>
      </div>
    </div>
  );
}
