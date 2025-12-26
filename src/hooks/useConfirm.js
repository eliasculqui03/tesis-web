import { useState, useCallback } from "react";

export function useConfirm() {
  const [state, setState] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    showCancel: true,
    autoClose: 0,
    onConfirm: null,
  });

  const show = useCallback((options) => {
    setState({
      isOpen: true,
      type: options.type || "info",
      title: options.title || "",
      message: options.message || "",
      confirmText: options.confirmText || "Aceptar",
      cancelText: options.cancelText || "Cancelar",
      showCancel: options.showCancel ?? true,
      autoClose: options.autoClose || 0,
      onConfirm: options.onConfirm || null,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Métodos de acceso rápido
  const success = useCallback(
    (title, message, options = {}) => {
      show({ type: "success", title, message, showCancel: false, ...options });
    },
    [show]
  );

  const error = useCallback(
    (title, message, options = {}) => {
      show({ type: "error", title, message, showCancel: false, ...options });
    },
    [show]
  );

  const warning = useCallback(
    (title, message, options = {}) => {
      show({ type: "warning", title, message, ...options });
    },
    [show]
  );

  const info = useCallback(
    (title, message, options = {}) => {
      show({ type: "info", title, message, showCancel: false, ...options });
    },
    [show]
  );

  const confirm = useCallback(
    (title, message, onConfirm, options = {}) => {
      show({ type: "confirm", title, message, onConfirm, ...options });
    },
    [show]
  );

  return {
    ...state,
    show,
    close,
    success,
    error,
    warning,
    info,
    confirm,
  };
}
