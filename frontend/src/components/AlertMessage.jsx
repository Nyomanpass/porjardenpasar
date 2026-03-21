import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export default function AlertMessage({ type = "success", message, onClose, children }) {
  
  const duration = 3000; // Kita set seragam 3 detik agar cepat hilang

  useEffect(() => {
    // Hanya auto-close jika tipe success/error dan TANPA tombol konfirmasi
    if (!children && (type === "success" || type === "error")) {
      const timer = setTimeout(() => {
        onClose();
      }, duration); 

      return () => clearTimeout(timer); 
    }
  }, [message, type, children, onClose]); 

  if (!message) return null;

  const config = {
    success: {
      title: "Berhasil",
      icon: <CheckCircle size={32} className="text-green-500" />,
      color: "border-green-200 bg-white",
      bar: "bg-green-500",
      textTitle: "text-green-700"
    },
    error: {
      title: "Gagal",
      icon: <XCircle size={32} className="text-red-500" />,
      color: "border-red-200 bg-white",
      bar: "bg-red-500",
      textTitle: "text-red-700"
    },
    warning: {
      title: "Konfirmasi",
      icon: <AlertTriangle size={64} className="text-yellow-500" />,
      ring: "ring-yellow-300",
      gradient: "from-yellow-50 to-white",
    },
  };

  // --- MODE DIALOG (WARNING / DELETE / INPUT) ---
  if (type === "warning" || children) {
    const { title, icon, ring, gradient } = config.warning;
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className={`bg-gradient-to-b ${gradient} w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border border-white/20`}>
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-white ring-8 ${ring} shadow-inner`}>
            {icon}
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
            <p className="text-base text-gray-600 mt-3 font-semibold leading-relaxed">{message}</p>
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // --- MODE TOAST (SUCCESS / ERROR) ---
  const { icon, color, bar, title, textTitle } = config[type];
  return (
    <div className="fixed top-8 right-8 z-[10002] w-full max-w-[320px] sm:max-w-sm animate-in slide-in-from-right duration-500 px-4 sm:px-0">
      <div className={`relative overflow-hidden border-2 ${color} shadow-2xl rounded-2xl p-6 flex items-center gap-4`}>
        <div className="flex-shrink-0 p-2 bg-gray-50 rounded-xl">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-widest ${textTitle}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-700 font-bold leading-snug mt-1 ">
            {message}
          </p>
        </div>

        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <X size={20} />
        </button>

        {/* PROGRESS BAR - Disesuaikan dengan variabel duration */}
        <div 
          className={`absolute bottom-0 left-0 h-1.5 ${bar}`} 
          style={{ 
            animation: `shrink ${duration}ms linear forwards` 
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}} />
    </div>
  );
}