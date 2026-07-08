import { useState } from "react";
import type { TemplateSubjectField } from "@/types";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

const LOCKED_REQUIRED_DIMENSIONS = new Set(["customer", "transportMode"]);

interface TemplateSubjectConfigTabProps {
  state: any;
  setState: (updater: any) => void;
  saveState: (state: any) => void;
}

export default function TemplateSubjectConfigTab({ state, setState, saveState }: TemplateSubjectConfigTabProps) {
  const [lang] = useState<Language>(getCurrentLanguage());
  const fieldLabelKeys: Record<string, string> = {
    customer: "customer",
    originRegion: "originRegion",
    destinationRegion: "destinationRegion",
    transportMode: "transportMode",
    originCountry: "originCountry",
    destinationCountry: "destinationCountry",
    consignee: "consignee",
    incoterm: "incoterm",
    priority: "priority",
  };

  const getFieldLabel = (field: TemplateSubjectField) => {
    const labelKey = fieldLabelKeys[field.key];
    return labelKey ? t(lang, labelKey) : field.label;
  };

  const handleToggleEnabled = (key: string, enabled: boolean) => {
    if (LOCKED_REQUIRED_DIMENSIONS.has(key)) return;
    const updatedFields = (state.templateSubjectFields || []).map((f: TemplateSubjectField) =>
      f.key === key ? { ...f, enabled } : f
    );
    setState((prev: any) => ({ ...prev, templateSubjectFields: updatedFields }));
    saveState({ ...state, templateSubjectFields: updatedFields });
  };

  const fields = state.templateSubjectFields || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t(lang, 'templateSubjectConfig')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t(lang, 'templateSubjectDesc')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'fieldKey')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'displayName')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'type')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'dataSource')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'required')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'enabled')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t(lang, 'sortOrder')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  {t(lang, 'noData')}
                </td>
              </tr>
            ) : (
              fields.sort((a: TemplateSubjectField, b: TemplateSubjectField) => a.sortOrder - b.sortOrder).map((field: TemplateSubjectField) => {
                const locked = LOCKED_REQUIRED_DIMENSIONS.has(field.key);
                return (
                  <tr key={field.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-xs">{field.key}</td>
                    <td className="px-4 py-3 text-sm">{getFieldLabel(field)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-soft text-brand-strong">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{field.source || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      {field.required ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t(lang, 'yes')}
                        </span>
                      ) : (
                        <span className="text-gray-500">{t(lang, 'no')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          disabled={locked}
                          onChange={(e) => handleToggleEnabled(field.key, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className={locked ? "text-gray-400 text-xs" : ""}>
                          {locked
                            ? t(lang, 'required')
                            : field.enabled
                              ? t(lang, 'enabled')
                              : t(lang, 'disabled')}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-sm">{field.sortOrder}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-gray-600">
        <p><strong>{t(lang, 'note')}</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>{t(lang, 'templateSubjectNote1')}</li>
          <li>{t(lang, 'templateSubjectNote2')}</li>
          <li>{t(lang, 'templateSubjectNote3')}</li>
          <li>{t(lang, 'templateSubjectNote4')}</li>
        </ul>
      </div>
    </div>
  );
}
