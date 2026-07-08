import type { PageConfig } from "@/types";
import { getCurrentLanguage, t } from "@/lib/i18n";

interface ReservedPageProps {
  page: PageConfig;
}

export default function ReservedPage({ page }: ReservedPageProps) {
  const lang = getCurrentLanguage();

  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-lg p-8 flex gap-4 items-start">
        <div className="w-14 h-14 rounded-lg bg-blue-soft text-blue flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
            <rect width="18" height="18" x="3" y="3" rx="2" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">{t(lang, 'comingSoon')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(lang, 'reservedDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
