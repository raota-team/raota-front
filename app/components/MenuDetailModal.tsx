"use client";

import { useEffect } from "react";
import { X, Utensils } from "lucide-react";
import { MenuItem } from "../types";

interface MenuDetailModalProps {
  menu: MenuItem | null;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  useEffect(() => {
    if (menu) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [menu]);

  if (!menu) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
        >
          <X className="w-4 h-4 text-stone-700" />
        </button>

        {/* Image */}
        <div className="relative w-full h-72 bg-stone-100 overflow-hidden">
          {menu.image_url ? (
            <img
              src={menu.image_url}
              alt={menu.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <Utensils className="w-16 h-16" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Signature badge */}
          {menu.is_signature && (
            <div className="absolute top-4 left-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-md">
                SIGNATURE
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-stone-900 leading-tight">
                {menu.name}
              </h2>
              {menu.is_signature && (
                <p className="text-xs text-red-500 font-semibold mt-1">
                  시그니처 메뉴
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-black text-stone-900">
                {menu.price.toLocaleString()}
                <span className="text-base font-bold text-stone-500 ml-1">원</span>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-wider rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
