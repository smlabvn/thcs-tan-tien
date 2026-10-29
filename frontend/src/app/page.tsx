"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Waves, Lightbulb, Search, BookOpen, Sparkles, Award, Calculator, Sliders, Scale, Volume2 } from "lucide-react";
import MathView from "@/components/MathView";

export default function HomePage() {
  // THCS Simulator preview state (Định luật Ôm tương tác nhanh trên Hero)
  const [heroVoltage, setHeroVoltage] = useState<number>(6.0);
  const [heroResistance, setHeroResistance] = useState<number>(20);
  const heroCurrent = heroVoltage / heroResistance;
  const heroPower = heroCurrent * heroVoltage;

  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  // Daily challenge interactive quiz state for THCS
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleSelectQuiz = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  return (
    <div className="w-full bg-white text-slate-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-5 z-10">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">
                Khoa Học Tự Nhiên &amp; Vật Lý THCS (Lớp 6 - 9)
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-semibold">
                Ôn Thi Vào Lớp 10
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Khám Phá Thế Giới <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
                Khoa Học &amp; Vật Lý THCS
              </span>
              <span className="text-emerald-600">.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 max-w-2xl leading-relaxed font-normal">
              Trực quan hóa sinh động các hiện tượng tự nhiên xung quanh ta: Lực đẩy Ác-si-mét, Áp suất, Âm thanh, Mạch điện Định luật Ôm và Thấu kính quang học. Bồi dưỡng tư duy Khoa Học Tự Nhiên lớp 6, 7, 8, 9 và luyện thi vào 10 cùng Trợ Lý RAG AI!
            </p>

            {/* CTA Action Cluster */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/lab"
                className="px-5 py-3 rounded-xl text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <span>Khám phá Thí nghiệm ảo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/formulas"
                className="px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-sm hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 shadow-xs"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Sổ Tay &amp; Điều Chỉnh Công Thức</span>
              </Link>
              <Link
                href="/quiz"
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 hover:text-emerald-600 transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700 shadow-xs"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Luyện Đề Vào 10</span>
              </Link>
            </div>

            {/* Social Validation Counters */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">85K+</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Học sinh THCS chuyên cần</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">9.5</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Điểm trung bình vào 10</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">100%</div>
                <div className="text-xs text-slate-600 font-medium mt-1">Thí nghiệm chuẩn SGK</div>
              </div>
            </div>
          </div>

          {/* Right Column: THCS Circuit HUD Preview */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative w-full rounded-2xl bg-white shadow-xl border border-slate-200 p-5 flex flex-col gap-4">
              {/* Card Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs text-slate-700 font-bold ml-1">KHTN_SIMULATOR_THCS</span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  ĐỊNH LUẬT ÔM (LỚP 9)
                </span>
              </div>

              {/* Formula Card */}
              <div className="p-3.5 rounded-xl bg-white relative overflow-hidden border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Định luật Ôm cho đoạn mạch
                  </span>
                  <Link
                    href="/formulas"
                    className="text-[10px] font-mono text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>Bộ điều chỉnh công thức</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-lg font-mono font-black text-emerald-700">
                  <MathView math="I = \frac{U}{R}" />
                  <span className="text-slate-300">|</span>
                  <span>I = {heroCurrent.toFixed(2)} A</span>
                  <span className="text-slate-300">|</span>
                  <span>P = {heroPower.toFixed(2)} W</span>
                </div>
                <div className="flex items-center gap-4 mt-2 font-mono text-xs text-slate-600 font-medium">
                  <span>Hiệu điện thế U = {heroVoltage.toFixed(1)} V</span>
                  <span>Điện trở R = {heroResistance} Ω</span>
                </div>
              </div>

              {/* Dynamic Bulb Visualization */}
              <div className="relative w-full h-44 rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col items-center justify-center shadow-xs p-4">
                <div className="relative flex items-center justify-center">
                  {/* Bulb Glow */}
                  <div
                    className="absolute rounded-full bg-amber-300 blur-2xl transition-all duration-300"
                    style={{
                      width: `${60 + heroPower * 25}px`,
                      height: `${60 + heroPower * 25}px`,
                      opacity: Math.min(0.85, heroPower / 2.2),
                    }}
                  />
                  {/* Bulb Icon */}
                  <Lightbulb
                    className="w-16 h-16 relative z-10 transition-colors duration-300"
                    style={{
                      color: heroCurrent > 0.1 ? "#d97706" : "#94a3b8",
                      filter: heroCurrent > 0.1 ? "drop-shadow(0 0 16px #f59e0b)" : "none",
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-700 mt-2 z-10 font-bold bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  Bóng đèn sáng {heroCurrent > 0.35 ? "rất rực rỡ" : heroCurrent > 0.2 ? "bình thường" : "lờ mờ"}
                </span>
              </div>

              {/* Interactive Sliders */}
              <div className="flex flex-col gap-2 pt-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Điều chỉnh Hiệu điện thế nguồn (U):</span>
                  <span className="font-mono text-emerald-600">{heroVoltage.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={12}
                  step={0.5}
                  value={heroVoltage}
                  onChange={(e) => setHeroVoltage(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />

                <div className="flex justify-between font-bold mt-1">
                  <span>Điều chỉnh Biến trở con chạy (R):</span>
                  <span className="font-mono text-amber-600">{heroResistance} Ω</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={heroResistance}
                  onChange={(e) => setHeroResistance(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GRADE SELECTION BENTO SECTION ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-700 font-bold">
                  Chương trình KHTN 2018 (Phân môn Vật lý)
                </span>
                <span className="w-8 h-[1px] bg-slate-300" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Lộ Trình Tối Ưu Cấp THCS (Lớp 7, 8, 9)
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mt-1 font-normal">
                Học sâu hiểu bản chất từ thực nghiệm trực quan, tự tin bứt phá điểm 9, điểm 10 trên lớp và thi đỗ vào lớp 10 THPT!
              </p>
            </div>

            {/* Grade Selector Tabs */}
            <div className="flex p-1 rounded-xl bg-white border border-slate-200 self-start overflow-x-auto shadow-2xs">
              {[
                { id: "all", label: "Tất cả THCS" },
                { id: "7", label: "Lớp 7 — Âm thanh & ánh sáng" },
                { id: "8", label: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện & nhiệt" },
                { id: "9", label: "Lớp 9 — Cơ năng, quang học & điện" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGrade(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedGrade === tab.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Grade Cards Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">

            {/* Lớp 7 */}
            {(selectedGrade === "all" || selectedGrade === "7") && (
              <div className="rounded-3xl bg-white hover:border-teal-400 p-6 flex flex-col justify-between transition-all duration-200 border border-slate-200 shadow-xs hover:shadow-md group">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-white border border-teal-200 text-teal-800 font-bold whitespace-nowrap shadow-2xs">
                      Lớp 7 — KHTN
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold whitespace-nowrap shrink-0">
                      28 Bài học
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-700 shadow-2xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Lớp 7 — Âm thanh và ánh sáng</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Tốc độ truyền âm, độ to (dB), tần số âm (Hz), sự truyền thẳng ánh sáng, tia sáng và định luật phản xạ ánh sáng i = i&apos;.
                  </p>
                  <div className="py-3 px-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center gap-1 min-h-[82px] text-teal-800">
                    <div className="text-base sm:text-lg font-bold">
                      <MathView math="\displaystyle v = \frac{s}{t} \quad\boldsymbol{\mid}\quad i = i'" />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 font-mono flex items-center justify-center gap-1.5">
                      <span>Tốc độ chuyển động &amp; Định luật phản xạ</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                  <Link href="/lab" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5">
                    <span>Vào Lab Lớp 7</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Lớp 8 */}
            {(selectedGrade === "all" || selectedGrade === "8") && (
              <div className="rounded-3xl bg-white hover:border-emerald-400 p-6 flex flex-col justify-between transition-all duration-200 border border-slate-200 shadow-xs hover:shadow-md group relative">
                <div className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-bold uppercase shadow-2xs">
                  Thí Nghiệm Trọng Tâm
                </div>
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-white border border-emerald-200 text-emerald-800 font-bold whitespace-nowrap shadow-2xs">
                      Lớp 8 — KHTN
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold whitespace-nowrap shrink-0">
                      36 Bài học
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                    <Waves className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Khối lượng riêng &rho; = m/V, áp suất chất lỏng p = &rho; &middot; g &middot; h, lực đẩy Ác-si-mét F_b, quy tắc đòn bẩy và nhiệt lượng.
                  </p>
                  <div className="py-3 px-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center gap-1 min-h-[82px] text-emerald-800">
                    <div className="text-base sm:text-lg font-bold">
                      <MathView math="\displaystyle F_{\text{b}} = \rho \cdot g \cdot V" />
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 font-mono">
                      <MathView math="\displaystyle F_1 \cdot d_1 = F_2 \cdot d_2 \quad\big|\quad p = \frac{F}{A}" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                  <Link href="/lab" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
                    <span>Khám phá Lab Lớp 8</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Lớp 9 */}
            {(selectedGrade === "all" || selectedGrade === "9") && (
              <div className="rounded-3xl bg-white hover:border-amber-400 p-6 flex flex-col justify-between transition-all duration-200 border border-slate-200 shadow-xs hover:shadow-md group relative">
                <div className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-mono text-[9px] font-bold uppercase shadow-2xs">
                  Ôn Thi Vào Lớp 10
                </div>
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-white border border-amber-200 text-amber-800 font-bold whitespace-nowrap shadow-2xs">
                      Lớp 9 — KHTN &amp; Vào 10
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold whitespace-nowrap shrink-0">
                      42 Chuyên đề
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-700 shadow-2xs">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">Lớp 9 — Cơ năng, quang học và điện</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Động năng &amp; thế năng cơ năng, khúc xạ ánh sáng và thấu kính, định luật Ôm I = U/R, công suất điện P = U &middot; I.
                  </p>
                  <div className="py-3 px-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center gap-1 min-h-[82px] text-amber-800">
                    <div className="text-base sm:text-lg font-bold">
                      <MathView math="\displaystyle I = \frac{U}{R} \quad\boldsymbol{\mid}\quad P = U \cdot I" />
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 font-mono">
                      <MathView math="\displaystyle \frac{1}{f} = \frac{1}{d_{\text{o}}} + \frac{1}{d_{\text{i}}}" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                  <Link href="/lab" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5">
                    <span>Khám phá Lab Lớp 9</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= DAILY CHALLENGE INTERACTIVE QUIZ ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white border border-amber-300 text-amber-800 shadow-2xs">
                THỬ THÁCH VẬT LÝ THCS HÔM NAY
              </span>
              <span className="text-xs text-slate-500 font-medium">+50 Điểm thưởng</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Câu hỏi KHTN 8: Khi nhúng một quả cầu kim loại chìm hoàn toàn vào trong một bình đầy nước, lực đẩy Ác-si-mét tác dụng lên quả cầu có độ lớn bằng:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                { idx: 0, text: "A. Trọng lượng của quả cầu kim loại" },
                { idx: 1, text: "B. Trọng lượng của phần nước bị quả cầu chiếm chỗ", correct: true },
                { idx: 2, text: "C. Thể tích của quả cầu kim loại" },
                { idx: 3, text: "D. Áp suất tại đáy bình chứa nước" },
              ].map((opt) => (
                <button
                  key={opt.idx}
                  onClick={() => handleSelectQuiz(opt.idx)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedAnswer === opt.idx
                      ? opt.correct
                        ? "bg-white border-2 border-emerald-600 text-emerald-800 shadow-xs"
                        : "bg-white border-2 border-red-600 text-red-800 shadow-xs"
                      : "bg-white border border-slate-200 hover:border-emerald-400 text-slate-800"
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-300 text-xs text-emerald-900 shadow-2xs">
                <strong>Chính xác!</strong> Theo định luật Archimedes, một vật nhúng chìm trong chất lỏng bị chất lỏng tác dụng một lực đẩy hướng từ dưới lên có độ lớn đúng bằng <strong>trọng lượng của phần chất lỏng bị vật chiếm chỗ</strong>: <span className="font-mono font-bold">F_b = ρ · g · V_disp</span>.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
