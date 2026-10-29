"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Bell,
  Sparkles,
  BookOpen,
  Activity,
  Cpu,
  Award,
  Sun,
  Moon,
  School,
  Calculator,
  Menu,
  X,
  Key,
  Check,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gemini API Key state
  const [apiKey, setApiKey] = useState("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState("");
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Load API key from localStorage and listen to updates across tabs/components
  useEffect(() => {
    try {
      const saved = localStorage.getItem("physix_gemini_api_key") || "";
      setApiKey(saved);
      setTempKeyInput(saved);
    } catch {}

    const handleKeyChange = () => {
      try {
        const saved = localStorage.getItem("physix_gemini_api_key") || "";
        setApiKey(saved);
        setTempKeyInput(saved);
      } catch {}
    };

    window.addEventListener("physix_key_updated", handleKeyChange);
    window.addEventListener("storage", handleKeyChange);
    return () => {
      window.removeEventListener("physix_key_updated", handleKeyChange);
      window.removeEventListener("storage", handleKeyChange);
    };
  }, []);

  const handleSaveApiKey = () => {
    const k = tempKeyInput.trim();
    setApiKey(k);
    try {
      if (k) {
        localStorage.setItem("physix_gemini_api_key", k);
      } else {
        localStorage.removeItem("physix_gemini_api_key");
      }
      window.dispatchEvent(new Event("physix_key_updated"));
    } catch {}
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setIsKeyModalOpen(false);
    }, 1100);
  };

  const handleClearKey = () => {
    setApiKey("");
    setTempKeyInput("");
    try {
      localStorage.removeItem("physix_gemini_api_key");
      window.dispatchEvent(new Event("physix_key_updated"));
    } catch {}
    setIsKeyModalOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Trang chủ", href: "/", icon: BookOpen },
    { label: "Công thức KHTN", href: "/formulas", icon: Calculator },
    { label: "Thí nghiệm ảo", href: "/lab", icon: Activity },
    { label: "Cảm biến IoT", href: "/iot", icon: Cpu },
    { label: "Ôn thi vào 10", href: "/quiz", icon: Award },
    { label: "Gia sư AI", href: "/ai-tutor", icon: Sparkles },
    { label: "Tiến độ", href: "/progress", icon: Activity },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white text-lg shadow-sm">
              Ψ
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                PhysiX
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase -mt-1">
                KHTN &amp; Vật Lý THCS (6-9)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Gemini API Key Button on Top of Website */}
          <button
            type="button"
            onClick={() => {
              setTempKeyInput(apiKey);
              setIsKeyModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
              apiKey
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                : "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse hover:animate-none"
            }`}
            title={apiKey ? "Gemini API đã kết nối (Bấm để xem/đổi key)" : "Nhập Gemini API Key để kích hoạt AI"}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {apiKey ? "Gemini API: Đã bật" : "Nhập API Key"}
            </span>
            <span className="sm:hidden">
              {apiKey ? "API ✓" : "Key"}
            </span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng tối"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === "light" ? "Chuyển sang Giao diện Tối" : "Chuyển sang Giao diện Sáng"}
          >
            {theme === "light" ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Streak indicator (hidden on very small screens, visible in mobile dropdown) */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">7 ngày</span>
          </div>

          {/* User profile */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Minh Anh</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Học sinh Lớp 9 KHTN
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              MA
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 shadow-xl transition-all max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Gemini API Key button */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setTempKeyInput(apiKey);
                setIsKeyModalOpen(true);
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                apiKey
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                  : "bg-amber-500 text-white border-amber-600"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{apiKey ? "Gemini API: Đã bật (Bấm để đổi key)" : "🔑 Nhập Gemini API Key"}</span>
            </button>
          </div>

          {/* Mobile Profile & Streak Info Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                MA
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Minh Anh</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Học sinh Lớp 9 KHTN
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">7 ngày</span>
            </div>
          </div>
        </div>
      )}

      {/* GEMINI API KEY MODAL ACCESSIBLE EVERYWHERE */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Cài Đặt Gemini API Key
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kích hoạt Gia sư AI THCS Tây Tiến
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide & Link */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <p>
                Trang web sử dụng mô hình <strong>Google Gemini</strong> để giải đáp bài tập và câu hỏi Vật lý KHTN (Lớp 6, 7, 8, 9).
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Lấy key miễn phí (chỉ mất 30 giây):</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mã API Key (bắt đầu bằng AIzaSy...):
              </label>
              <input
                type="password"
                placeholder="Dán mã AIzaSy... vào đây"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                🔒 Khóa được lưu an toàn trong trình duyệt của bạn (localStorage) và chỉ gửi trực tiếp khi bạn hỏi bài.
              </p>
            </div>

            {/* Success toast */}
            {keySavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu thành công Gemini API Key! AI đã sẵn sàng.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {apiKey ? (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Key</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu &amp; Kích Hoạt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
