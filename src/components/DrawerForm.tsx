import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { getCurrentLanguage, t } from "@/lib/i18n";

interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "select" | "multiselect" | "textarea" | "hidden" | "numeric";
  options?: string[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
  disabled?: boolean;
  systemManaged?: boolean;
}

interface DrawerFormProps {
  title: string;
  fields: FieldConfig[];
  values: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
  onClose: () => void;
  error?: string;
  children?: React.ReactNode;
}

export default function DrawerForm({ title, fields, values, onSave, onClose, error, children }: DrawerFormProps) {
  const lang = getCurrentLanguage();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formatFieldError = (field: FieldConfig, message: string) => `${field.label}: ${message}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result: Record<string, any> = {};

    for (const field of fields) {
      if (field.type === "hidden" || field.disabled) continue;
      const requiredValue = formData.get(field.key)?.toString().trim() || "";
      if (field.required && !requiredValue) {
        setFieldErrors({ [field.key]: lang === "zh" ? "此字段为必填。" : "This field is required." });
        onSave({ __validationError__: formatFieldError(field, lang === "zh" ? "此字段为必填。" : "This field is required.") });
        return;
      }
      if (field.type === "numeric") {
        const value = formData.get(field.key)?.toString().trim();
        if (value && value !== "" && isNaN(Number(value))) {
          setFieldErrors({ [field.key]: lang === "zh" ? "必须为数字。" : "This field must be numeric." });
          onSave({ __validationError__: formatFieldError(field, lang === "zh" ? "必须为数字。" : "This field must be numeric.") });
          return;
        }
      }
    }

    fields.forEach((field) => {
      if (field.type === "multiselect") {
        result[field.key] = formData.getAll(field.key).map((v) => v.toString());
      } else if (field.disabled) {
        result[field.key] = values[field.key] || "";
      } else if (field.type !== "hidden") {
        result[field.key] = formData.get(field.key)?.toString().trim() || "";
      } else {
        result[field.key] = values[field.key] || "";
      }
    });

    setFieldErrors({});
    onSave(result);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[620px] bg-white h-full shadow-lg flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => {
              if (field.type === "hidden") return null;

              const commonProps = {
                name: field.key,
                id: field.key,
                required: field.required,
                placeholder: field.placeholder,
                defaultValue: values[field.key] ?? "",
                disabled: field.disabled,
              };

              const disabledClass = field.disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "";
              const fieldError = fieldErrors[field.key];
              const inputClass = `w-full border rounded-md px-3 py-2.5 focus:border-brand focus:ring-2 focus:ring-brand-soft outline-none ${fieldError ? "border-red-400 bg-red-50/30" : "border-gray-300"} ${disabledClass}`;

              return (
                <div key={field.key} className={`field ${field.full ? "col-span-2" : ""}`}>
                  <label htmlFor={field.key} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="ml-0.5 text-red-600">*</span>}
                  </label>

                  {field.type === "multiselect" ? (
                    <div className="grid grid-cols-2 gap-2">
                      {(field.options || []).map((option) => (
                        <label key={option} className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            name={field.key}
                            value={option}
                            defaultChecked={(values[field.key] || []).includes(option)}
                            disabled={field.disabled}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "select" ? (
                    <select {...commonProps} className={inputClass}>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea {...commonProps} rows={3} className={`${inputClass} resize-vertical`} />
                  ) : (
                    <input {...commonProps} type={field.type || "text"} className={inputClass} />
                  )}
                  {fieldError && <p className="mt-1 text-xs font-medium text-red-600">{fieldError}</p>}
                </div>
              );
            })}
          </div>

          {children}
        </form>

        <div className="flex justify-end gap-3 p-5 border-t mt-auto">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            {t(lang, "cancel")}
          </button>
          <button type="submit" onClick={() => document.querySelector("form")?.requestSubmit()} className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-strong transition-colors flex items-center gap-2">
            <Save size={16} />
            {t(lang, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}
