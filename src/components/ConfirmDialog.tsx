import { AlertTriangle, X } from "lucide-react";
import { getCurrentLanguage, t } from "@/lib/i18n";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const lang = getCurrentLanguage();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t(lang, "cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {t(lang, "delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
