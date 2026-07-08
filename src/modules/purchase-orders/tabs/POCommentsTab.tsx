import type { PORecord } from "@/types";

type POCommentsTabProps = {
  record: PORecord;
};

export default function POCommentsTab({ record }: POCommentsTabProps) {
  return (
    <div className="space-y-3">
      {(record.comments || []).map((comment, idx) => (
        <div key={idx} className="border border-border/50 rounded-lg p-3 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">{comment.commentedBy}</span>
            <span className="text-xs text-muted-foreground">{comment.commentDate}</span>
          </div>
          <p className="text-xs text-foreground">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
