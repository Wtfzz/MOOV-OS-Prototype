import { useState } from "react";
import { Inbox, Timer, TriangleAlert, BadgeCheck, ArrowRight } from "lucide-react";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

const queueCards = [
  { icon: Inbox, labelKey: "myTodo", value: 12 },
  { icon: Timer, labelKey: "upcomingOverdue", value: 4 },
  { icon: TriangleAlert, labelKey: "pendingExceptions", value: 7 },
  { icon: BadgeCheck, labelKey: "pendingApproval", value: 3 },
];

const workQueues = [
  { title: "LIDL PO Change Approval", moduleKey: "businessExecution", owner: "Grace", count: 3, priority: "High", due: "Today 18:00" },
  { title: "Pepco Transport Plan Confirmation", moduleKey: "businessExecution", owner: "Ops User", count: 5, priority: "Open", due: "Tomorrow 12:00" },
  { title: "LIDL / Pepco Master Data Review", moduleKey: "masterData", owner: "Grace", count: 2, priority: "Pending", due: "Today 17:00" },
  { title: "Pepco Data Validation Exceptions", moduleKey: "exceptionQuality", owner: "MOOV Ops", count: 7, priority: "High", due: "Overdue" },
];

const reminders = [
  { titleKey: "slaRisk", text: "4 tasks will expire within 8 hours. Prioritize PO changes and transport plan confirmation.", status: "High" },
  { titleKey: "ownerMissing", text: "2 business partner records lack default owners. Complete assignment rules.", status: "Pending" },
  { titleKey: "configCheck", text: "LIDL and Pepco P1 processes are enabled. Continue adding task nodes.", status: "Active" },
  { titleKey: "reservedModules", text: "PO management, exception management, and task workbench have reserved entry points.", status: "Reserved" },
];

function getBadgeClass(status: string): string {
  return `badge badge-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function DashboardPage() {
  const [lang] = useState<Language>(getCurrentLanguage());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {queueCards.map((card) => (
          <div key={card.labelKey} className="bg-card border rounded-lg p-4 space-y-2">
            <card.icon className="w-5 h-5" />
            <span className="text-xs text-muted-foreground">{t(lang, card.labelKey)}</span>
            <strong className="text-2xl">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{t(lang, "workQueueBrief")}</h2>
              <p className="text-xs text-muted-foreground">{t(lang, "priorityAggregate")}</p>
            </div>
            <button className="btn text-sm">
              <ArrowRight className="w-4 h-4" />
              {t(lang, "myTasks")}
            </button>
          </div>
          <div className="divide-y">
            {workQueues.map((queue) => (
              <div key={queue.title} className="p-4 flex justify-between items-center gap-4">
                <div>
                  <strong className="block">{queue.title}</strong>
                  <span className="text-xs text-muted-foreground">
                    {t(lang, queue.moduleKey)} · Owner {queue.owner} · Due {queue.due}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-xl">{queue.count}</strong>
                  <span className={getBadgeClass(queue.priority)}>{queue.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{t(lang, "workReminder")}</h2>
            <p className="text-xs text-muted-foreground">{t(lang, "priorityAttention")}</p>
          </div>
          <div className="p-4 space-y-3">
            {reminders.map((item) => (
              <div key={item.titleKey} className="flex justify-between items-start gap-2 pb-3 border-b last:border-0 last:pb-0">
                <div>
                  <strong className="block text-sm">{t(lang, item.titleKey)}</strong>
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </div>
                <span className={getBadgeClass(item.status)}>{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
