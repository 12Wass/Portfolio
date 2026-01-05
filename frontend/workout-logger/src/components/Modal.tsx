import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-zinc-900 rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
        {title && (
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
