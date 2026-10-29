import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            Ψ
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">PhysiX Platform</span> - Cổng học &amp; Thực nghiệm Vật Lý THCS (KHTN Lớp 6 - 9)
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Link href="/formulas" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Sổ tay công thức</Link>
          <Link href="/lab" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Thí nghiệm ảo THCS</Link>
          <Link href="/iot" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Cảm biến IoT</Link>
          <Link href="/ai-tutor" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Gia sư AI THCS</Link>
          <Link href="/quiz" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Đề khảo sát Vào 10</Link>
          <span>© 2026 THCS Tây Tiến</span>
        </div>
      </div>
    </footer>
  );
}
