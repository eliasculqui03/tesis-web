import { useEffect } from "react";
import { createPortal } from "react-dom";

const types = {
  success: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  error: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: "bg-red-500",
    lightBg: "bg-red-50",
    text: "text-red-600",
  },
  warning: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    text: "text-amber-600",
  },
  confirm: {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),
    color: "bg-navy",
    lightBg: "bg-navy/5",
    text: "text-navy",
  }
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type = "confirm",
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = true,
  autoClose = 0,
}) {
  const config = types[type] || types.confirm;

  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => onClose(), autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/60 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-xl ${config.lightBg} ${config.text} flex items-center justify-center shadow-inner`}>
            {config.icon}
          </div>

          {/* Title */}
          {title && (
            <h3 className="font-jakarta text-lg font-bold text-navy mb-2 leading-tight">{title}</h3>
          )}

          {/* Message */}
          {message && (
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-navy font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-widest outline-none"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl ${config.color} text-white font-bold text-xs hover:opacity-90 transition-all shadow-lg uppercase tracking-widest outline-none`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
