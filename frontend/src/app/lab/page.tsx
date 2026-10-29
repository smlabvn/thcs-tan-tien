"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Info,
  Waves,
  Lightbulb,
  Search,
  Scale,
  ArrowRight,
  Sparkles,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Star,
  Sun,
  EyeOff,
  Check,
  Compass,
  Zap,
  Droplets,
  Gauge,
  Activity,
  Flame,
  RotateCw,
  FileSpreadsheet,
} from "lucide-react";
import MathView from "@/components/MathView";
import GeoGebraSpreadsheet from "@/components/GeoGebraSpreadsheet";

export type THCSExperimentType =
  | "spring"
  | "forces_motion"
  | "sound_light"
  | "bending_light"
  | "magnet"
  | "archimedes"
  | "pressure"
  | "lever"
  | "electrostatics"
  | "lens"
  | "ohm"
  | "energy_skate"
  | "faraday";

/** Gia tốc trọng trường tiêu chuẩn (CGPM 1901 / ISO 80000-3): g_n = 9.80665 m/s² */
const STANDARD_GRAVITY = 9.80665;
/** Khoảng cách giữa hai vạch trên thước đòn bẩy, quy đổi sang mét (SI). */
const LEVER_TICK_M = 0.05;

/** Danh mục các khối lớp THCS theo chuẩn CT GDPT 2018 */
const GRADE_NAV_TABS = [
  { id: "all", label: "Tất cả các lớp THCS (13 bài thí nghiệm)" },
  { id: "6", label: "Lớp 6 — Lực, lò xo và năng lượng" },
  { id: "7", label: "Lớp 7 — Âm thanh và ánh sáng" },
  { id: "8", label: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt" },
  { id: "9", label: "Lớp 9 — Cơ năng, quang học và điện" },
] as const;

/** Dữ liệu mô phỏng tương tác trực quan chuẩn SGK (Việt hóa 100%) */
const SIM_DATA: Record<
  THCSExperimentType,
  {
    grade: 6 | 7 | 8 | 9;
    url: string;
    title: string;
    subtitle: string;
    categoryBadge: string;
    gradeBadge: string;
  }
> = {
  // LỚP 6
  spring: {
    grade: 6,
    url: "/sims/masses-and-springs-basics.html?locale=vi",
    title: "Thí Nghiệm Biến Dạng Lò Xo, Lực Đàn Hồi & Năng Lượng (Lớp 6)",
    subtitle:
      "Treo quả cân 50g, 100g, 250g lên lò xo, đo độ dãn Δl, kiểm chứng định luật đàn hồi Hooke và thế năng đàn hồi",
    categoryBadge: "Lực & Lò Xo",
    gradeBadge: "Lớp 6 — Lực, lò xo và năng lượng",
  },
  forces_motion: {
    grade: 6,
    url: "/sims/forces-and-motion-basics.html?locale=vi",
    title: "Thí Nghiệm Lực, Lực Ma Sát & Hợp Lực Chuyển Động (Lớp 6)",
    subtitle:
      "Tác dụng lực kéo, điều chỉnh lực cản ma sát mặt sàn, kiểm tra hợp lực kéo vật chuyển động và gia tốc",
    categoryBadge: "Lực & Ma Sát",
    gradeBadge: "Lớp 6 — Lực, lò xo và năng lượng",
  },

  // LỚP 7
  sound_light: {
    grade: 7,
    url: "/sims/waves-intro.html?locale=vi",
    title: "Thí Nghiệm Sóng Âm Thanh & Biên Độ, Tần Số Âm (Lớp 7)",
    subtitle:
      "Quan sát sự lan truyền sóng âm trong không khí, điều chỉnh tần số f (Hz), biên độ âm A (dB), kiểm tra mối quan hệ giữa độ to và biên độ",
    categoryBadge: "Sóng Âm Thanh",
    gradeBadge: "Lớp 7 — Âm thanh và ánh sáng",
  },
  bending_light: {
    grade: 7,
    url: "/sims/bending-light.html?locale=vi",
    title: "Thí Nghiệm Khúc Xạ & Phản Xạ Ánh Sáng (Lớp 7 & 9)",
    subtitle:
      "Bắn tia laser qua lăng kính, mặt nước, thủy tinh; đo góc tới i, góc phản xạ i' và góc khúc xạ r theo định luật Snell",
    categoryBadge: "Khúc Xạ & Phản Xạ",
    gradeBadge: "Lớp 7 — Âm thanh và ánh sáng",
  },
  magnet: {
    grade: 7,
    url: "/sims/magnet-and-compass.html?locale=vi",
    title: "Thí Nghiệm Từ Trường, Từ Phổ & Kim La Bàn (Lớp 7)",
    subtitle:
      "Di chuyển thanh nam châm cực Bắc - Nam, quan sát hướng lệch của kim la bàn và các đường sức từ khép kín trong không gian",
    categoryBadge: "Từ Trường & La Bàn",
    gradeBadge: "Lớp 7 — Âm thanh và ánh sáng",
  },

  // LỚP 8
  archimedes: {
    grade: 8,
    url: "/sims/density.html?locale=vi",
    title: "Thí Nghiệm Khối Lượng Riêng & Lực Đẩy Ác-si-mét (Lớp 8)",
    subtitle:
      "Thả vật chìm, nổi và lơ lửng trong chất lỏng, kiểm tra khối lượng riêng ρ = m/V, thể tích chiếm chỗ và lực đẩy Archimedes",
    categoryBadge: "Khối Lượng Riêng & Lực Đẩy",
    gradeBadge: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt",
  },
  pressure: {
    grade: 8,
    url: "/sims/under-pressure.html?locale=vi",
    title: "Thí Nghiệm Áp Suất Chất Lỏng & Khí Quyển (Lớp 8)",
    subtitle:
      "Đặt đồng hồ đo áp suất tại các độ sâu h trong nước, xăng, mật ong; kiểm chứng công thức p = d·h và nguyên lý bình thông nhau",
    categoryBadge: "Áp Suất Chất Lỏng",
    gradeBadge: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt",
  },
  lever: {
    grade: 8,
    url: "/sims/balancing-act.html?locale=vi",
    title: "Thí Nghiệm Cân Bằng Đòn Bẩy & Mômen Lực (Lớp 8)",
    subtitle:
      "Đặt quả cân và người lên các vị trí cánh tay đòn, kiểm tra quy tắc cân bằng mômen lực F₁·d₁ = F₂·d₂ và ứng dụng đòn bẩy",
    categoryBadge: "Cân Bằng Đòn Bẩy",
    gradeBadge: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt",
  },
  electrostatics: {
    grade: 8,
    url: "/sims/balloons-and-static-electricity.html?locale=vi",
    title: "Thí Nghiệm Hiện Tượng Nhiễm Điện & Lực Tĩnh Điện (Lớp 8)",
    subtitle:
      "Cọ xát quả bóng bay vào áo len để dịch chuyển electron, quan sát lực hút và đẩy tĩnh điện giữa các điện tích cùng dấu / trái dấu",
    categoryBadge: "Tĩnh Điện & Điện Tích",
    gradeBadge: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện và nhiệt",
  },

  // LỚP 9
  lens: {
    grade: 9,
    url: "/sims/geometric-optics-basics.html?locale=vi",
    title: "Mô Phỏng Thấu Kính Hội Tụ & Phân Kì, Sự Tạo Ảnh (Lớp 9)",
    subtitle:
      "Khảo sát quang tâm O, tiêu điểm F, đường truyền của 3 tia sáng đặc biệt và tính chất ảnh thật/ảo qua thấu kính mỏng",
    categoryBadge: "Thấu Kính Quang Học",
    gradeBadge: "Lớp 9 — Cơ năng, quang học và điện",
  },
  ohm: {
    grade: 9,
    url: "/sims/circuit-construction-kit-dc-virtual-lab.html?locale=vi",
    title: "Phòng Thí Nghiệm Mạch Điện DC & Định Luật Ôm (Lớp 9)",
    subtitle:
      "Lắp ráp nguồn pin, bóng đèn, điện trở, ampe kế, vôn kế thực hành đo đạc trực quan theo định luật Ôm I = U/R",
    categoryBadge: "Lắp Ráp Mạch Điện DC",
    gradeBadge: "Lớp 9 — Cơ năng, quang học và điện",
  },
  energy_skate: {
    grade: 9,
    url: "/sims/energy-skate-park-basics.html?locale=vi",
    title: "Thí Nghiệm Động Năng, Thế Năng & Bảo Toàn Cơ Năng (Lớp 9)",
    subtitle:
      "Trượt ván trên các cung đường cong, đồ thị tròn và cột biểu diễn sự chuyển hóa liên tục giữa động năng W_đ và thế năng W_t",
    categoryBadge: "Bảo Toàn Cơ Năng",
    gradeBadge: "Lớp 9 — Cơ năng, quang học và điện",
  },
  faraday: {
    grade: 9,
    url: "/sims/faradays-law.html?locale=vi",
    title: "Thí Nghiệm Cảm Ứng Điện Từ & Cuộn Dây Faraday (Lớp 9)",
    subtitle:
      "Đưa nam châm di chuyển xuyên qua cuộn dây có bóng đèn và vôn kế, quan sát chiều dòng điện cảm ứng sinh ra theo định luật Faraday",
    categoryBadge: "Hiện Tượng Cảm Ứng Điện Từ",
    gradeBadge: "Lớp 9 — Cơ năng, quang học và điện",
  },
};

const EXPERIMENTS_CONFIG = [
  // LỚP 6
  {
    id: "spring" as THCSExperimentType,
    grade: "6" as const,
    name: "1. Lò xo & Lực đàn hồi (Lớp 6)",
    icon: Scale,
  },
  {
    id: "forces_motion" as THCSExperimentType,
    grade: "6" as const,
    name: "2. Lực, Ma sát & Chuyển động (Lớp 6)",
    icon: Activity,
  },
  // LỚP 7
  {
    id: "sound_light" as THCSExperimentType,
    grade: "7" as const,
    name: "3. Sóng âm & Tần số âm thanh (Lớp 7)",
    icon: Waves,
  },
  {
    id: "bending_light" as THCSExperimentType,
    grade: "7" as const,
    name: "4. Khúc xạ & Phản xạ Ánh sáng (Lớp 7)",
    icon: Sun,
  },
  {
    id: "magnet" as THCSExperimentType,
    grade: "7" as const,
    name: "5. Từ trường & Kim la bàn (Lớp 7)",
    icon: Compass,
  },
  // LỚP 8
  {
    id: "archimedes" as THCSExperimentType,
    grade: "8" as const,
    name: "6. Lực đẩy Ác-si-mét & KLR (Lớp 8)",
    icon: Droplets,
  },
  {
    id: "pressure" as THCSExperimentType,
    grade: "8" as const,
    name: "7. Áp suất chất lỏng & Khí quyển (Lớp 8)",
    icon: Gauge,
  },
  {
    id: "lever" as THCSExperimentType,
    grade: "8" as const,
    name: "8. Quy tắc đòn bẩy & Mômen (Lớp 8)",
    icon: Scale,
  },
  {
    id: "electrostatics" as THCSExperimentType,
    grade: "8" as const,
    name: "9. Hiện tượng nhiễm điện (Lớp 8)",
    icon: Zap,
  },
  // LỚP 9
  {
    id: "lens" as THCSExperimentType,
    grade: "9" as const,
    name: "10. Thấu kính hội tụ & Phân kì (Lớp 9)",
    icon: Search,
  },
  {
    id: "ohm" as THCSExperimentType,
    grade: "9" as const,
    name: "11. Định luật Ôm & Mạch DC (Lớp 9)",
    icon: Lightbulb,
  },
  {
    id: "energy_skate" as THCSExperimentType,
    grade: "9" as const,
    name: "12. Động năng & Bảo toàn Cơ năng (Lớp 9)",
    icon: Flame,
  },
  {
    id: "faraday" as THCSExperimentType,
    grade: "9" as const,
    name: "13. Cảm ứng điện từ Faraday (Lớp 9)",
    icon: RotateCw,
  },
];

export default function VirtualLabPage() {
  const [gradeFilter, setGradeFilter] = useState<"all" | "6" | "7" | "8" | "9">("all");
  const [activeExp, setActiveExp] = useState<THCSExperimentType>("spring");
  const [archimedesMode, setArchimedesMode] = useState<"buoyancy" | "density">("buoyancy");
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // Simulation Engine Toggle: "phet" (live interactive 3D) vs "physix" (native vector SVG)
  const [simEngine, setSimEngine] = useState<"phet" | "physix">("phet");
  const simContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleFullscreen = () => {
    if (!simContainerRef.current) return;
    if (!document.fullscreenElement) {
      simContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Enhanced PhET-style Optics controls for native view
  const [lensObjectType, setLensObjectType] = useState<"pencil" | "star" | "penguin" | "light">("pencil");
  const [rayMode, setRayMode] = useState<"marginal" | "principal" | "many" | "none">("marginal");
  const [showFocalF, setShowFocalF] = useState<boolean>(true);
  const [show2F, setShow2F] = useState<boolean>(true);
  const [showVirtualImage, setShowVirtualImage] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [lensDiameter, setLensDiameter] = useState<number>(100); // 60 - 120 cm

  // ================= EXP 0 (KHTN 6): LỰC, LÒ XO & NĂNG LƯỢNG =================
  const [springMassG, setSpringMassG] = useState<number>(100); // g
  const [springK, setSpringK] = useState<number>(25); // N/m
  const springStretchM = (springMassG * 0.001 * STANDARD_GRAVITY) / springK;
  const springStretchCm = springStretchM * 100;
  const springElasticEnergyJ = 0.5 * springK * springStretchM * springStretchM;

  // ================= EXP 00 (KHTN 7): ÂM THANH & ÁNH SÁNG =================
  const [soundFreqHz, setSoundFreqHz] = useState<number>(440); // Hz
  const [soundSpeedMs, setSoundSpeedMs] = useState<number>(340); // m/s
  const soundWavelengthM = soundSpeedMs / soundFreqHz;
  const [lightIncidentDeg, setLightIncidentDeg] = useState<number>(45); // deg

  // ================= EXP 1 (KHTN 8): LỰC ĐẨY ARCHIMEDES =================
  const [liquidType, setLiquidType] = useState<"water" | "salt" | "oil">("water");
  const [objectMaterial, setObjectMaterial] = useState<"iron" | "aluminum" | "wood">("aluminum");
  const [submergePct, setSubmergePct] = useState<number>(100); // 0% - 100%
  const [objVolumeCm3, setObjVolumeCm3] = useState<number>(120); // cm3

  // ================= EXP 2 (KHTN 9): ĐỊNH LUẬT ÔM & MẠCH ĐIỆN =================
  const [ohmVoltage, setOhmVoltage] = useState<number>(6.0); // V
  const [ohmResistance, setOhmResistance] = useState<number>(20); // Ohm
  const [isCircuitClosed, setIsCircuitClosed] = useState<boolean>(true);

  // ================= EXP 3 (KHTN 9): THẤU KÍNH HỘI TỤ =================
  const [lensFocalF, setLensFocalF] = useState<number>(15); // cm
  const [objectDistanceDo, setObjectDistanceDo] = useState<number>(30); // cm
  const [objectHeightHo, setObjectHeightHo] = useState<number>(2.5); // cm

  // ================= EXP 4 (KHTN 8): QUY TẮC ĐÒN BẨY =================
  const [leverWeightLeft, setLeverWeightLeft] = useState<number>(2); // N (quả cân bên trái)
  const [leverArmLeft, setLeverArmLeft] = useState<number>(3); // vị trí vạch (cm/đơn vị)
  const [leverWeightRight, setLeverWeightRight] = useState<number>(3); // N (quả cân bên phải)
  const [leverArmRight, setLeverArmRight] = useState<number>(2); // vị trí vạch

  // Right column tabs
  const [activeTab, setActiveTab] = useState<"formula" | "drill" | "report" | "geogebra">("formula");
  const [drillAnswer, setDrillAnswer] = useState<string | null>(null);
  const [drillChecked, setDrillChecked] = useState<boolean>(false);

  // ================= DERIVED CALCULATIONS =================
  // 1. Archimedes Lab
  const liquidDensities = { water: 1000, salt: 1030, oil: 800 };
  const objectDensities = { iron: 7800, aluminum: 2700, wood: 600 };
  const currentLiqDensity = liquidDensities[liquidType];
  const currentObjDensity = objectDensities[objectMaterial];
  const objVolM3 = objVolumeCm3 * 1e-6;
  const gravity_g = STANDARD_GRAVITY;
  const weightW_N = currentObjDensity * gravity_g * objVolM3;
  const submergedVolM3 = objVolM3 * (submergePct / 100);
  const buoyantForceFb = currentLiqDensity * gravity_g * submergedVolM3;
  const apparentWeightWapp = Math.max(0, weightW_N - buoyantForceFb);
  const overflowWaterGram = currentLiqDensity * submergedVolM3 * 1000;

  // 2. Ohm Law Lab
  const ohmCurrentI = isCircuitClosed ? ohmVoltage / Math.max(1, ohmResistance) : 0;
  const ohmPowerP = ohmCurrentI * ohmCurrentI * ohmResistance;
  const bulbBrightnessPct = Math.min(100, (ohmPowerP / 3.6) * 100);

  // 3. Convex Lens Lab
  const isAtFocal = Math.abs(objectDistanceDo - lensFocalF) < 0.2;
  const lensImageDi = isAtFocal ? 9999 : (objectDistanceDo * lensFocalF) / (objectDistanceDo - lensFocalF);
  const lensMagnificationM = isAtFocal ? 999 : -lensImageDi / objectDistanceDo;
  const lensImageHi = Math.min(12, Math.abs(lensMagnificationM) * objectHeightHo);
  const isRealImage = objectDistanceDo > lensFocalF;

  // 4. Lever Lab
  const momentLeft = leverWeightLeft * leverArmLeft;
  const momentRight = leverWeightRight * leverArmRight;
  const isLeverBalanced = Math.abs(momentLeft - momentRight) < 0.05;
  const leverTiltDeg = isLeverBalanced
    ? 0
    : momentLeft > momentRight
    ? Math.min(15, (momentLeft - momentRight) * 3)
    : -Math.min(15, (momentRight - momentLeft) * 3);

  const handlePrintReport = () => {
    window.print();
  };

  const filteredExperiments =
    gradeFilter === "all"
      ? EXPERIMENTS_CONFIG
      : EXPERIMENTS_CONFIG.filter((e) => e.grade === gradeFilter);

  return (
    <div className="w-full bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Experiment Selector Suite organized by THCS Grades */}
        <div className="flex flex-col gap-3">
          {/* Grade Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {GRADE_NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setGradeFilter(tab.id);
                  if (tab.id !== "all") {
                    const firstExpInGrade = EXPERIMENTS_CONFIG.find((e) => e.grade === tab.id);
                    if (firstExpInGrade && activeExp !== firstExpInGrade.id) {
                      setActiveExp(firstExpInGrade.id);
                      setSimLoading(true);
                    }
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 border ${
                  gradeFilter === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Experiment Buttons for active grade */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 p-1">
              {filteredExperiments.map((exp) => {
                const Icon = exp.icon;
                const isActive = activeExp === exp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => {
                      if (activeExp !== exp.id) {
                        setActiveExp(exp.id);
                        setSimLoading(true);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{exp.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Báo Cáo Thực Hành</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN 2-COLUMN SPLIT ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: APPARATUS STAGE ================= */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            {/* Simulation Engine Selector Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  onClick={() => setSimEngine("phet")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    simEngine === "phet"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mô Phỏng 3D Chân Thật</span>
                </button>
                <button
                  onClick={() => setSimEngine("physix")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    simEngine === "physix"
                      ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bàn Vector Tinh Gọn PhysiX</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Xem toàn màn hình"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Toàn màn hình</span>
                </button>
              </div>
            </div>

            {/* Interactive Simulation Frame */}
            {simEngine === "phet" && (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-3 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{SIM_DATA[activeExp].title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeExp === "archimedes" && (
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                        <button
                          onClick={() => {
                            if (archimedesMode !== "buoyancy") {
                              setArchimedesMode("buoyancy");
                              setSimLoading(true);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            archimedesMode === "buoyancy"
                              ? "bg-white text-emerald-800 shadow-2xs border border-slate-200"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Lực Đẩy Ác-si-mét
                        </button>
                        <button
                          onClick={() => {
                            if (archimedesMode !== "density") {
                              setArchimedesMode("density");
                              setSimLoading(true);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            archimedesMode === "density"
                              ? "bg-white text-emerald-800 shadow-2xs border border-slate-200"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Khối Lượng Riêng
                        </button>
                      </div>
                    )}
                    {simLoading && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-semibold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Đang nạp mô phỏng...
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                      {SIM_DATA[activeExp].categoryBadge}
                    </span>
                  </div>
                </div>

                {/* HTML5 Iframe Container - Single active instance for max CPU/GPU performance */}
                <div
                  ref={simContainerRef}
                  className="relative w-full h-[620px] sm:h-[660px] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-inner"
                >
                  {simLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse z-20" />
                  )}
                  <iframe
                    key={`${activeExp}-${archimedesMode}`}
                    src={
                      activeExp === "archimedes"
                        ? archimedesMode === "buoyancy"
                          ? "/sims/buoyancy-basics.html?locale=vi"
                          : "/sims/density.html?locale=vi"
                        : SIM_DATA[activeExp].url
                    }
                    className="w-full h-[calc(100%+45px)] border-0"
                    allow="fullscreen; autoplay; clipboard-write"
                    allowFullScreen
                    title={SIM_DATA[activeExp].title}
                    onLoad={() => setSimLoading(false)}
                  />
                </div>

                {/* Description & feature guide */}
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-700 leading-relaxed font-medium">
                    💡 <strong>Thực hành trực tiếp trên mô phỏng:</strong> {SIM_DATA[activeExp].subtitle}.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 font-mono text-[10px] font-bold text-emerald-800">
                      Chuẩn KHTN THCS
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 0: LỰC & LÒ XO (KHTN 6 PhysiX Native) */}
            {simEngine === "physix" && activeExp === "spring" && (
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>THÍ NGHIỆM BIẾN DẠNG LÒ XO &amp; ĐỊNH LUẬT HOOKE (KHTN 6)</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-600">
                    Δl = {springStretchCm.toFixed(1)} cm | F<sub>dh</sub> = {((springMassG * 0.001) * STANDARD_GRAVITY).toFixed(2)} N
                  </div>
                </div>

                <div className="relative w-full h-80 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid background */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Stand & Ruler & Hanging Spring */}
                  <div className="relative w-72 h-full flex items-start justify-center pt-2">
                    {/* Stand Beam */}
                    <div className="absolute top-2 left-4 right-4 h-2.5 bg-slate-700 rounded-full" />
                    
                    {/* Ruler on left */}
                    <div className="absolute left-6 top-5 bottom-4 w-8 bg-amber-50 border border-amber-300 rounded flex flex-col justify-between py-1 px-0.5 text-[8px] font-mono text-slate-600 select-none">
                      <span>0 cm</span>
                      <span>5 cm</span>
                      <span>10 cm</span>
                      <span>15 cm</span>
                      <span>20 cm</span>
                    </div>

                    {/* Spring Coil SVG */}
                    <div className="flex flex-col items-center mt-3 z-10">
                      <svg width="40" height={Math.min(180, 80 + springStretchCm * 5)} viewBox="0 0 40 180" className="transition-all duration-200">
                        <line x1="20" y1="0" x2="20" y2="15" stroke="#475569" strokeWidth="3" />
                        <path
                          d={`M20,15 Q35,25 20,35 Q5,45 20,55 Q35,65 20,75 Q5,85 20,95 Q35,105 20,115 Q5,125 20,135 Q35,145 20,155 L20,${Math.min(175, 75 + springStretchCm * 5)}`}
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Hanging Mass */}
                      <div className="w-16 h-12 rounded-xl bg-amber-400 border-2 border-amber-600 shadow-md flex flex-col items-center justify-center text-slate-900 font-bold font-mono text-xs -mt-1">
                        <span>{springMassG} g</span>
                        <span className="text-[9px] text-amber-900 font-semibold">{((springMassG * 0.001) * STANDARD_GRAVITY).toFixed(2)}N</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Khối lượng quả cân:</span>
                      <span className="text-emerald-700 font-mono font-bold">{springMassG} g</span>
                    </div>
                    <div className="flex gap-2">
                      {[50, 100, 150, 200, 250].map((m) => (
                        <button
                          key={m}
                          onClick={() => setSpringMassG(m)}
                          className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs border ${
                            springMassG === m
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {m}g
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Độ cứng lò xo k:</span>
                      <span className="text-emerald-700 font-mono font-bold">{springK} N/m</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={50}
                      step={5}
                      value={springK}
                      onChange={(e) => setSpringK(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 00: ÂM THANH & ÁNH SÁNG (KHTN 7 PhysiX Native) */}
            {simEngine === "physix" && activeExp === "sound_light" && (
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-sm text-teal-800">
                    <Waves className="w-4 h-4 text-teal-600" />
                    <span>THÍ NGHIỆM SÓNG ÂM THANH &amp; PHẢN XẠ ÁNH SÁNG (KHTN 7)</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-teal-600">
                    λ = {soundWavelengthM.toFixed(2)} m | i&apos; = i = {lightIncidentDeg}°
                  </div>
                </div>

                <div className="relative w-full h-80 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid background */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, #0d9488 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Sound Wave Ripple SVG & Mirror Reflection */}
                  <svg width="100%" height="100%" viewBox="0 0 500 240" className="relative z-10">
                    {/* Left: Speaker & Sound Waves */}
                    <rect x="20" y="80" width="30" height="80" rx="4" fill="#334155" />
                    <polygon points="50,100 80,75 80,165 50,140" fill="#475569" />
                    {[1, 2, 3, 4, 5].map((arc) => (
                      <circle
                        key={arc}
                        cx="80"
                        cy="120"
                        r={arc * (soundWavelengthM * 25)}
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        opacity={Math.max(0.2, 1 - arc * 0.18)}
                      />
                    ))}
                    <text x="50" y="60" fill="#0f766e" fontSize="11" fontWeight="bold">Nguồn âm f = {soundFreqHz}Hz</text>

                    {/* Right: Flat Mirror & Light Ray Reflection */}
                    <line x1="320" y1="180" x2="480" y2="180" stroke="#0284c7" strokeWidth="4" />
                    <text x="370" y="200" fill="#0369a1" fontSize="10" fontWeight="bold">Gương phẳng</text>
                    <line x1="400" y1="180" x2="400" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="405" y="55" fill="#64748b" fontSize="9">Pháp tuyến N</text>
                    <line
                      x1={400 - Math.tan((lightIncidentDeg * Math.PI) / 180) * 120}
                      y1="60"
                      x2="400"
                      y2="180"
                      stroke="#ea580c"
                      strokeWidth="2.5"
                    />
                    <line
                      x1="400"
                      y1="180"
                      x2={400 + Math.tan((lightIncidentDeg * Math.PI) / 180) * 120}
                      y2="60"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Tần số âm thanh f:</span>
                      <span className="text-teal-700 font-mono font-bold">{soundFreqHz} Hz</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1000}
                      step={20}
                      value={soundFreqHz}
                      onChange={(e) => setSoundFreqHz(Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Góc tới gương i:</span>
                      <span className="text-amber-700 font-mono font-bold">{lightIncidentDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={75}
                      step={5}
                      value={lightIncidentDeg}
                      onChange={(e) => setLightIncidentDeg(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 1: LỰC ĐẨY ARCHIMEDES (PhysiX Native) */}
            {simEngine === "physix" && activeExp === "archimedes" && (
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    <Waves className="w-4 h-4 text-emerald-600" />
                    <span>THÍ NGHIỆM LỰC ĐẨY ÁC-SI-MÉT &amp; SỰ NỔI CỦA VẬT (KHTN 8)</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-600">
                    F<sub>b</sub> = ρ·g·V<sub>disp</sub> = <strong>{buoyantForceFb.toFixed(2)} N</strong>
                  </div>
                </div>

                {/* Archimedes Visual Canvas */}
                <div className="relative w-full h-80 bg-white rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  {/* Grid background */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, #059669 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Top Stand & Spring Scale (Lực kế) */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                    <div className="w-24 h-2 bg-slate-500 rounded-full" />
                    {/* Dynamometer Cylinder */}
                    <div className="w-10 h-24 bg-amber-100 dark:bg-amber-950 border-2 border-amber-600 rounded-lg flex flex-col items-center justify-between py-1 shadow-md">
                      <span className="text-[9px] font-mono font-bold text-amber-800 dark:text-amber-300">N</span>
                      {/* Scale Pointer */}
                      <div className="w-7 h-0.5 bg-red-600 my-auto" />
                      <span className="text-[10px] font-mono font-black text-red-600">
                        {apparentWeightWapp.toFixed(2)}N
                      </span>
                    </div>
                    {/* Hanging String */}
                    <div className="w-0.5 h-6 bg-slate-600" />
                  </div>

                  {/* Overflow Tank (Bình tràn) */}
                  <div className="relative w-56 h-48 border-x-4 border-b-4 border-cyan-500/80 rounded-b-2xl bg-cyan-50/20 dark:bg-cyan-950/20 mt-20 flex flex-col justify-end overflow-visible">
                    {/* Water Level */}
                    <div
                      className="w-full bg-cyan-400/40 dark:bg-cyan-600/40 rounded-b-xl transition-all duration-300 relative"
                      style={{ height: `${Math.min(100, 75 + submergePct * 0.15)}%` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300/80 animate-pulse" />
                      <span className="absolute bottom-1 right-2 text-[10px] font-mono text-cyan-800 dark:text-cyan-200 font-bold">
                        {liquidType === "water"
                          ? "Nước cất (1000 kg/m³)"
                          : liquidType === "salt"
                          ? "Nước muối (1030 kg/m³)"
                          : "Dầu ăn (800 kg/m³)"}
                      </span>
                    </div>

                    {/* Overflow Spout (Vòi tràn) */}
                    <div className="absolute -right-7 top-10 w-8 h-3 border-b-2 border-r-2 border-cyan-500 rounded-br-lg rotate-12" />

                    {/* Submerged Object (Vật thể treo vào lực kế) */}
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl border-2 shadow-lg flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 z-10 ${
                        objectMaterial === "iron"
                          ? "bg-slate-700 text-white border-slate-900"
                          : objectMaterial === "aluminum"
                          ? "bg-slate-200 text-slate-800 border-slate-400"
                          : "bg-amber-600 text-white border-amber-800"
                      }`}
                      style={{
                        top: `${-40 + submergePct * 0.95}px`,
                      }}
                    >
                      <span>{objectMaterial === "iron" ? "Sắt" : objectMaterial === "aluminum" ? "Nhôm" : "Gỗ"}</span>
                      <span className="text-[10px] font-mono font-normal">P={weightW_N.toFixed(2)}N</span>
                    </div>
                  </div>

                  {/* Measuring Beaker Catching Overflow Water */}
                  <div className="absolute bottom-4 right-10 w-24 h-28 border-x-2 border-b-2 border-slate-400 rounded-b-xl bg-white/40 dark:bg-slate-900/40 flex flex-col justify-end p-1">
                    <div
                      className="w-full bg-cyan-400/50 rounded-b-lg transition-all duration-300 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-900"
                      style={{ height: `${Math.min(100, (overflowWaterGram / 150) * 100)}%` }}
                    >
                      {overflowWaterGram > 5 && `${overflowWaterGram.toFixed(0)}g`}
                    </div>
                    <span className="text-[9px] font-mono text-center text-slate-500 mt-1">Cốc hứng nước</span>
                  </div>

                  {/* Live Status HUD */}
                  <div className="absolute top-3 left-4 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 font-mono text-xs flex flex-col gap-1 shadow-md">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Trọng lượng thực (W):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{weightW_N.toFixed(2)} N</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Lực đẩy Archimedes (F_b):</span>
                      <strong className="text-emerald-600">+{buoyantForceFb.toFixed(2)} N</strong>
                    </div>
                    <div className="flex justify-between gap-3 border-t pt-1">
                      <span className="text-slate-500">Trọng lượng biểu kiến (W_app):</span>
                      <strong className="text-red-600">{apparentWeightWapp.toFixed(2)} N</strong>
                    </div>
                  </div>
                </div>

                {/* Controls for Archimedes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col gap-1.5">
                    <span className="font-bold">Loại chất lỏng:</span>
                    <select
                      value={liquidType}
                      onChange={(e) => setLiquidType(e.target.value as any)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="water">Nước cất (1000 kg/m³)</option>
                      <option value="salt">Nước muối biển (1030 kg/m³)</option>
                      <option value="oil">Dầu ăn (800 kg/m³)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col gap-1.5">
                    <span className="font-bold">Vật liệu vật nhúng:</span>
                    <select
                      value={objectMaterial}
                      onChange={(e) => setObjectMaterial(e.target.value as any)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="aluminum">Nhôm (2700 kg/m³ - Chìm)</option>
                      <option value="iron">Sắt (7800 kg/m³ - Chìm nhanh)</option>
                      <option value="wood">Gỗ (600 kg/m³ - Nổi)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Độ ngập trong nước:</span>
                      <span className="font-mono text-emerald-600">{submergePct}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={submergePct}
                      onChange={(e) => setSubmergePct(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Thể tích vật (V):</span>
                      <span className="font-mono text-amber-600">{objVolumeCm3} cm³</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={250}
                      step={10}
                      value={objVolumeCm3}
                      onChange={(e) => setObjVolumeCm3(parseInt(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: ĐỊNH LUẬT ÔM & MẠCH ĐIỆN (PhysiX Native) */}
            {simEngine === "physix" && activeExp === "ohm" && (
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    <span>THÍ NGHIỆM ĐỊNH LUẬT ÔM &amp; ĐỘ SÁNG BÓNG ĐÈN (KHTN 9)</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-600">
                    I = U / R = <strong>{ohmCurrentI.toFixed(2)} A</strong>
                  </div>
                </div>

                {/* Circuit Canvas */}
                <div className="relative w-full h-72 bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-6 shadow-inner">
                  <svg className="w-full h-full" viewBox="0 0 500 220">
                    <path
                      d="M 60 110 L 60 40 L 440 40 L 440 110 M 440 110 L 440 180 L 60 180 L 60 110"
                      fill="none"
                      stroke={isCircuitClosed ? "#0284c7" : "#94a3b8"}
                      strokeWidth="3.5"
                    />

                    {/* DC Power Supply */}
                    <g transform="translate(60, 110)">
                      <line x1="-12" y1="-18" x2="12" y2="-18" stroke="#ef4444" strokeWidth="4" />
                      <line x1="-20" y1="-8" x2="20" y2="-8" stroke="#0284c7" strokeWidth="3" />
                      <line x1="-12" y1="2" x2="12" y2="2" stroke="#ef4444" strokeWidth="4" />
                      <line x1="-20" y1="12" x2="20" y2="12" stroke="#0284c7" strokeWidth="3" />
                      <text x="-48" y="5" fill="#0f172a" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        {ohmVoltage.toFixed(1)}V
                      </text>
                    </g>

                    {/* Switch K */}
                    <g transform="translate(180, 40)">
                      <circle cx="0" cy="0" r="4" fill="#0f172a" />
                      <circle cx="40" cy="0" r="4" fill="#0f172a" />
                      <line
                        x1="0"
                        y1="0"
                        x2={isCircuitClosed ? "40" : "30"}
                        y2={isCircuitClosed ? "0" : "-18"}
                        stroke="#d97706"
                        strokeWidth="3.5"
                      />
                      <text x="14" y="-12" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        Khóa K
                      </text>
                    </g>

                    {/* Rheostat */}
                    <g transform="translate(320, 40)">
                      <rect x="0" y="-10" width="60" height="20" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" rx="3" />
                      <line x1="30" y1="-16" x2="30" y2="-10" stroke="#d97706" strokeWidth="3" />
                      <text x="12" y="25" fill="#0f172a" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        {ohmResistance}Ω
                      </text>
                    </g>

                    {/* Ammeter */}
                    <g transform="translate(440, 110)">
                      <circle cx="0" cy="0" r="20" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                      <text x="-5" y="5" fill="#0284c7" fontSize="14" fontWeight="bold">
                        A
                      </text>
                      <text x="26" y="5" fill="#0369a1" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {ohmCurrentI.toFixed(2)}A
                      </text>
                    </g>

                    {/* Filament Bulb */}
                    <g transform="translate(250, 180)">
                      {isCircuitClosed && bulbBrightnessPct > 10 && (
                        <circle
                          cx="0"
                          cy="0"
                          r={20 + bulbBrightnessPct * 0.4}
                          fill="#fef08a"
                          opacity={bulbBrightnessPct / 180}
                        />
                      )}
                      <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                      <line
                        x1="-10"
                        y1="-10"
                        x2="10"
                        y2="10"
                        stroke={isCircuitClosed && bulbBrightnessPct > 5 ? "#d97706" : "#cbd5e1"}
                        strokeWidth="2.5"
                      />
                      <line
                        x1="10"
                        y1="-10"
                        x2="-10"
                        y2="10"
                        stroke={isCircuitClosed && bulbBrightnessPct > 5 ? "#d97706" : "#cbd5e1"}
                        strokeWidth="2.5"
                      />
                      <text x="-16" y="32" fill="#b45309" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        {ohmPowerP.toFixed(2)}W
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Controllers for Ohm */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Hiệu điện thế nguồn (U):</span>
                      <span className="font-mono text-sky-600">{ohmVoltage.toFixed(1)} V</span>
                    </div>
                    <input
                      type="range"
                      min={1.5}
                      max={12.0}
                      step={0.5}
                      value={ohmVoltage}
                      onChange={(e) => setOhmVoltage(parseFloat(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Điện trở biến trở (R):</span>
                      <span className="font-mono text-amber-600">{ohmResistance} Ω</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={ohmResistance}
                      onChange={(e) => setOhmResistance(parseInt(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold">Công tắc K:</div>
                      <div className="text-[11px] text-slate-500">
                        {isCircuitClosed ? "Mạch kín (Dòng chạy)" : "Mạch ngắt (I = 0)"}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsCircuitClosed(!isCircuitClosed)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCircuitClosed ? "bg-emerald-600 text-white shadow-xs" : "bg-red-600 text-white"
                      }`}
                    >
                      {isCircuitClosed ? "ĐANG ĐÓNG" : "ĐANG MỞ"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: THẤU KÍNH HỘI TỤ (PhysiX Native PhET-Styled) */}
            {simEngine === "physix" && activeExp === "lens" && (
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>QUANG HÌNH HỌC: THẤU KÍNH HỘI TỤ &amp; TẠO ẢNH (KHTN 9)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">1/f = 1/d_o + 1/d_i →</span>
                    <strong className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {isAtFocal ? "d_i = ∞" : `d_i = ${lensImageDi.toFixed(1)} cm`}
                    </strong>
                  </div>
                </div>

                {/* Object selector toolbar */}
                <div className="flex flex-wrap items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700">Chọn vật sáng:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { id: "pencil", label: "✏️ Viết chì" },
                        { id: "star", label: "⭐ Ngôi sao" },
                        { id: "light", label: "💡 Đèn bàn" },
                        { id: "penguin", label: "🐧 Cánh cụt" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setLensObjectType(item.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            lensObjectType === item.id
                              ? "bg-white text-emerald-800 shadow-2xs font-bold border border-slate-300"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Kéo thanh trượt bên dưới để chỉnh vị trí
                    </span>
                  </div>
                </div>

                {/* PhET-Style Optical Bench Canvas */}
                <div className="relative w-full h-[340px] bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                  <svg className="w-full h-full" viewBox="0 0 560 300">
                    <defs>
                      <linearGradient id="lensGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.75" />
                        <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    {/* Optical Axis (Quang trục) */}
                    <line x1="10" y1="150" x2="550" y2="150" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
                    {showLabels && (
                      <text x="12" y="142" fill="#0284c7" fontSize="10" fontStyle="italic" fontWeight="bold">
                        Quang trục
                      </text>
                    )}

                    {/* Biconvex Glass Lens with Realistic Curvature */}
                    <g transform="translate(280, 150)">
                      <path
                        d={`M 0,${-lensDiameter / 1.3} Q 22,0 0,${lensDiameter / 1.3} Q -22,0 0,${-lensDiameter / 1.3} Z`}
                        fill="url(#lensGlassGrad)"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        filter="url(#shadowFilter)"
                      />
                      {/* Lens optical center line */}
                      <line x1="0" y1={-lensDiameter / 1.3 - 5} x2="0" y2={lensDiameter / 1.3 + 5} stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                      <circle cx="0" cy="0" r="3" fill="#0284c7" />
                      <text x="5" y="16" fill="#0369a1" fontSize="11" fontWeight="bold">O</text>
                      {showLabels && (
                        <text x="0" y={lensDiameter / 1.3 + 18} fill="#0f172a" fontSize="10" textAnchor="middle" fontWeight="bold">
                          Thấu kính lồi
                        </text>
                      )}

                      {/* Focal Points F */}
                      {showFocalF && (
                        <>
                          <circle cx={-lensFocalF * 5} cy="0" r="4.5" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                          <circle cx={-lensFocalF * 5} cy="0" r="1.5" fill="#0f172a" />
                          <text x={-lensFocalF * 5 - 4} y="18" fill="#854d0e" fontSize="11" fontWeight="bold">F</text>

                          <circle cx={lensFocalF * 5} cy="0" r="4.5" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                          <circle cx={lensFocalF * 5} cy="0" r="1.5" fill="#0f172a" />
                          <text x={lensFocalF * 5 - 4} y="18" fill="#854d0e" fontSize="11" fontWeight="bold">F&apos;</text>
                        </>
                      )}

                      {/* 2F Points */}
                      {show2F && (
                        <>
                          <circle cx={-lensFocalF * 10} cy="0" r="4" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                          <circle cx={-lensFocalF * 10} cy="0" r="1.5" fill="#0f172a" />
                          <text x={-lensFocalF * 10 - 7} y="18" fill="#854d0e" fontSize="10" fontWeight="bold">2F</text>

                          <circle cx={lensFocalF * 10} cy="0" r="4" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
                          <circle cx={lensFocalF * 10} cy="0" r="1.5" fill="#0f172a" />
                          <text x={lensFocalF * 10 - 7} y="18" fill="#854d0e" fontSize="10" fontWeight="bold">2F&apos;</text>
                        </>
                      )}
                    </g>

                    {/* Object (Framed 3D Artwork) */}
                    {(() => {
                      const objX = 280 - objectDistanceDo * 5;
                      const objY = 150;
                      return (
                        <g transform={`translate(${objX}, ${objY})`}>
                          {/* Framed Canvas Box */}
                          <rect x="-14" y="-72" width="28" height="72" rx="3" fill="#f0f9ff" stroke="#64748b" strokeWidth="2" filter="url(#shadowFilter)" />

                          {lensObjectType === "pencil" && (
                            <g>
                              {/* Yellow pencil body */}
                              <rect x="-4.5" y="-50" width="9" height="42" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                              <rect x="-4.5" y="-9" width="9" height="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
                              <rect x="-4.5" y="-4" width="9" height="4" rx="1.5" fill="#f43f5e" />
                              <polygon points="-4.5,-50 4.5,-50 0,-68" fill="#fde68a" stroke="#b45309" strokeWidth="0.8" />
                              <polygon points="-1.8,-62 1.8,-62 0,-68" fill="#1e293b" />
                            </g>
                          )}

                          {lensObjectType === "star" && (
                            <polygon
                              points="0,-64 4,-48 20,-48 7,-38 12,-22 0,-32 -12,-22 -7,-38 -20,-48 -4,-48"
                              fill="#facc15"
                              stroke="#ca8a04"
                              strokeWidth="1.5"
                            />
                          )}

                          {lensObjectType === "penguin" && (
                            <g transform="translate(0, -36) scale(0.7)">
                              <ellipse cx="0" cy="0" rx="12" ry="24" fill="#0f172a" />
                              <ellipse cx="0" cy="4" rx="8" ry="18" fill="#ffffff" />
                              <polygon points="-3,-10 3,-10 0,-4" fill="#f97316" />
                              <circle cx="-3" cy="-14" r="1.5" fill="#ffffff" />
                              <circle cx="3" cy="-14" r="1.5" fill="#ffffff" />
                              <circle cx="-3" cy="-14" r="0.8" fill="#0f172a" />
                              <circle cx="3" cy="-14" r="0.8" fill="#0f172a" />
                            </g>
                          )}

                          {lensObjectType === "light" && (
                            <g transform="translate(0, -35)">
                              <circle cx="0" cy="-15" r="12" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                              <rect x="-6" y="-3" width="12" height="6" rx="2" fill="#94a3b8" />
                              <path d="M 0 3 L -8 25 L 8 25 Z" fill="#64748b" />
                              <rect x="-10" y="25" width="20" height="4" rx="2" fill="#334155" />
                            </g>
                          )}

                          {showLabels && (
                            <text x="0" y="16" fill="#0f172a" fontSize="11" textAnchor="middle" fontWeight="bold">
                              Vật
                            </text>
                          )}
                        </g>
                      );
                    })()}

                    {/* Image (Inverted if real, upright if virtual) */}
                    {!isAtFocal && Math.abs(lensImageDi) < 55 && (
                      (() => {
                        const imgX = 280 + lensImageDi * 5;
                        const scaleVal = Math.min(2.5, Math.abs(lensMagnificationM));
                        const isReal = isRealImage;
                        return (
                          <g
                            transform={`translate(${imgX}, 150) scale(1, ${isReal ? -scaleVal : scaleVal})`}
                            opacity={isReal ? 1 : 0.8}
                          >
                            <rect
                              x="-14"
                              y="-72"
                              width="28"
                              height="72"
                              rx="3"
                              fill="#f0fdf4"
                              stroke={isReal ? "#16a34a" : "#0284c7"}
                              strokeWidth="2"
                              strokeDasharray={isReal ? "none" : "4 3"}
                              filter="url(#shadowFilter)"
                            />

                            {lensObjectType === "pencil" && (
                              <g>
                                <rect x="-4.5" y="-50" width="9" height="42" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                                <rect x="-4.5" y="-9" width="9" height="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
                                <rect x="-4.5" y="-4" width="9" height="4" rx="1.5" fill="#f43f5e" />
                                <polygon points="-4.5,-50 4.5,-50 0,-68" fill="#fde68a" stroke="#b45309" strokeWidth="0.8" />
                                <polygon points="-1.8,-62 1.8,-62 0,-68" fill="#1e293b" />
                              </g>
                            )}

                            {lensObjectType === "star" && (
                              <polygon
                                points="0,-64 4,-48 20,-48 7,-38 12,-22 0,-32 -12,-22 -7,-38 -20,-48 -4,-48"
                                fill="#facc15"
                                stroke="#ca8a04"
                                strokeWidth="1.5"
                              />
                            )}

                            {lensObjectType === "penguin" && (
                              <g transform="translate(0, -36) scale(0.7)">
                                <ellipse cx="0" cy="0" rx="12" ry="24" fill="#0f172a" />
                                <ellipse cx="0" cy="4" rx="8" ry="18" fill="#ffffff" />
                                <polygon points="-3,-10 3,-10 0,-4" fill="#f97316" />
                              </g>
                            )}

                            {lensObjectType === "light" && (
                              <g transform="translate(0, -35)">
                                <circle cx="0" cy="-15" r="12" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                              </g>
                            )}

                            {showLabels && (
                              <text
                                x="0"
                                y={isReal ? -8 : 16}
                                fill={isReal ? "#16a34a" : "#0284c7"}
                                fontSize="11"
                                textAnchor="middle"
                                fontWeight="bold"
                                transform={isReal ? "scale(1, -1)" : undefined}
                              >
                                {isReal ? "Ảnh thực" : "Ảnh ảo"}
                              </text>
                            )}
                          </g>
                        );
                      })()
                    )}

                    {/* Rays Engine */}
                    {rayMode !== "none" && !isAtFocal && Math.abs(lensImageDi) < 55 && (
                      (() => {
                        const xObj = 280 - objectDistanceDo * 5;
                        const yTipObj = 150 - 68; // top of pencil tip
                        const xImg = 280 + lensImageDi * 5;
                        const imgScale = Math.min(2.5, Math.abs(lensMagnificationM));
                        const yTipImg = 150 + (isRealImage ? 68 * imgScale : -68 * imgScale);
                        const topLensY = 150 - lensDiameter / 1.3;
                        const botLensY = 150 + lensDiameter / 1.3;

                        return (
                          <g stroke="#0f172a" strokeWidth="1.6" fill="none">
                            {/* MARGINAL RAYS (Biên) */}
                            {rayMode === "marginal" && (
                              <>
                                {/* Ray to top of lens */}
                                <line x1={xObj} y1={yTipObj} x2={280} y2={topLensY} />
                                <line x1={280} y1={topLensY} x2={xImg} y2={yTipImg} />
                                <line x1={xImg} y1={yTipImg} x2={xImg + 70} y2={yTipImg + ((yTipImg - topLensY) / (xImg - 280)) * 70} />

                                {/* Ray through optical center O */}
                                <line x1={xObj} y1={yTipObj} x2={280} y2={150} />
                                <line x1={280} y1={150} x2={xImg} y2={yTipImg} />
                                <line x1={xImg} y1={yTipImg} x2={xImg + 70} y2={yTipImg + ((yTipImg - 150) / (xImg - 280)) * 70} />

                                {/* Ray to bottom of lens */}
                                <line x1={xObj} y1={yTipObj} x2={280} y2={botLensY} />
                                <line x1={280} y1={botLensY} x2={xImg} y2={yTipImg} />
                                <line x1={xImg} y1={yTipImg} x2={xImg + 70} y2={yTipImg + ((yTipImg - botLensY) / (xImg - 280)) * 70} />

                                {!isRealImage && showVirtualImage && (
                                  <>
                                    <line x1={280} y1={topLensY} x2={xImg} y2={yTipImg} stroke="#0284c7" strokeDasharray="3 3" />
                                    <line x1={280} y1={botLensY} x2={xImg} y2={yTipImg} stroke="#0284c7" strokeDasharray="3 3" />
                                    <line x1={280} y1={150} x2={xImg} y2={yTipImg} stroke="#0284c7" strokeDasharray="3 3" />
                                  </>
                                )}
                              </>
                            )}

                            {/* PRINCIPAL RAYS (Chính) */}
                            {rayMode === "principal" && (
                              <>
                                {/* Ray 1: Parallel to axis -> passes through F' */}
                                <line x1={xObj} y1={yTipObj} x2={280} y2={yTipObj} stroke="#dc2626" />
                                <line x1={280} y1={yTipObj} x2={xImg} y2={yTipImg} stroke="#dc2626" />

                                {/* Ray 2: Through center O */}
                                <line x1={xObj} y1={yTipObj} x2={xImg} y2={yTipImg} stroke="#0284c7" />

                                {/* Ray 3: Through focal point F -> parallel to axis */}
                                <line x1={xObj} y1={yTipObj} x2={280} y2={yTipImg} stroke="#d97706" />
                                <line x1={280} y1={yTipImg} x2={xImg + 60} y2={yTipImg} stroke="#d97706" />
                              </>
                            )}

                            {/* MANY RAYS (Nhiều) */}
                            {rayMode === "many" && (
                              <>
                                {[-0.8, -0.5, -0.2, 0, 0.2, 0.5, 0.8].map((factor, idx) => {
                                  const targetLensY = 150 + (lensDiameter / 1.3) * factor;
                                  return (
                                    <g key={idx}>
                                      <line x1={xObj} y1={yTipObj} x2={280} y2={targetLensY} stroke="#0f172a" strokeWidth="1.2" opacity="0.85" />
                                      <line x1={280} y1={targetLensY} x2={xImg} y2={yTipImg} stroke="#0f172a" strokeWidth="1.2" opacity="0.85" />
                                      <line
                                        x1={xImg}
                                        y1={yTipImg}
                                        x2={xImg + 60}
                                        y2={yTipImg + ((yTipImg - targetLensY) / (xImg - 280)) * 60}
                                        stroke="#0f172a"
                                        strokeWidth="1.2"
                                        opacity="0.85"
                                      />
                                    </g>
                                  );
                                })}
                              </>
                            )}
                          </g>
                        );
                      })()
                    )}
                  </svg>

                  {/* Optical Result Badge */}
                  <div className="absolute top-3 right-3 p-3 rounded-2xl bg-white/95 border border-slate-200 font-mono text-[11px] text-slate-700 flex flex-col gap-1 shadow-md">
                    <div>
                      Vật: d_o = <strong className="text-amber-700">{objectDistanceDo} cm</strong>
                    </div>
                    <div>
                      Ảnh: d_i ={" "}
                      <strong className="text-emerald-700">
                        {isAtFocal ? "∞ (Vô cực)" : `${lensImageDi.toFixed(1)} cm`}
                      </strong>
                    </div>
                    <div>
                      Độ phóng đại:{" "}
                      <strong className="text-sky-700">
                        {isAtFocal ? "—" : (-lensImageDi / objectDistanceDo).toFixed(2)}×
                      </strong>
                    </div>
                    <div>
                      Loại ảnh:{" "}
                      <strong className={isRealImage ? "text-emerald-700" : "text-sky-700"}>
                        {isAtFocal
                          ? "Ở vô cực"
                          : isRealImage
                          ? "THẬT, ngược chiều"
                          : "ẢO, cùng chiều lớn hơn vật"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* PhET-Styled Control Console */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Rays selection */}
                  <div className="flex flex-col gap-2 border-b md:border-b-0 md:border-r border-sky-200 pb-3 md:pb-0 md:pr-3">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Tia sáng (Rays):</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 font-medium">
                      {[
                        { id: "marginal", label: "Biên (Marginal)" },
                        { id: "principal", label: "Chính (Principal)" },
                        { id: "many", label: "Nhiều (Many)" },
                        { id: "none", label: "Không (None)" },
                      ].map((r) => (
                        <label key={r.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="rayMode"
                            checked={rayMode === r.id}
                            onChange={() => setRayMode(r.id as any)}
                            className="accent-sky-600 cursor-pointer"
                          />
                          <span>{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Focal Length & Diameter Stepper */}
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span>Tiêu cự (f):</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLensFocalF(Math.max(10, lensFocalF - 1))}
                            className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center font-mono font-bold hover:bg-slate-100 shadow-2xs"
                          >
                            ◀
                          </button>
                          <span className="w-14 text-center font-mono text-sky-700 bg-white border border-slate-300 py-0.5 rounded font-bold shadow-2xs">
                            {lensFocalF} cm
                          </span>
                          <button
                            onClick={() => setLensFocalF(Math.min(25, lensFocalF + 1))}
                            className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center font-mono font-bold hover:bg-slate-100 shadow-2xs"
                          >
                            ▶
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={25}
                        step={1}
                        value={lensFocalF}
                        onChange={(e) => setLensFocalF(parseInt(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span>Đường kính (Diameter):</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLensDiameter(Math.max(60, lensDiameter - 5))}
                            className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center font-mono font-bold hover:bg-slate-100 shadow-2xs"
                          >
                            ◀
                          </button>
                          <span className="w-14 text-center font-mono text-sky-700 bg-white border border-slate-300 py-0.5 rounded font-bold shadow-2xs">
                            {lensDiameter} cm
                          </span>
                          <button
                            onClick={() => setLensDiameter(Math.min(120, lensDiameter + 5))}
                            className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center font-mono font-bold hover:bg-slate-100 shadow-2xs"
                          >
                            ▶
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={120}
                        step={5}
                        value={lensDiameter}
                        onChange={(e) => setLensDiameter(parseInt(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Checkbox Options */}
                  <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-sky-200 pt-3 md:pt-0 md:pl-3 font-medium">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showFocalF}
                          onChange={(e) => setShowFocalF(e.target.checked)}
                          className="accent-sky-600 cursor-pointer"
                        />
                        <span>Tiêu điểm (F)</span>
                      </span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={show2F}
                          onChange={(e) => setShow2F(e.target.checked)}
                          className="accent-sky-600 cursor-pointer"
                        />
                        <span>Điểm 2F</span>
                      </span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" />
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showVirtualImage}
                        onChange={(e) => setShowVirtualImage(e.target.checked)}
                        className="accent-sky-600 cursor-pointer"
                      />
                      <span>Ảnh ảo (Virtual image)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="accent-sky-600 cursor-pointer"
                      />
                      <span>Hiện nhãn tên</span>
                    </label>
                  </div>
                </div>

                {/* Distance Controller for Object */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold mb-1">
                    <span>Vị trí đặt vật sáng đến thấu kính (d_o):</span>
                    <span className="font-mono text-amber-600">{objectDistanceDo} cm</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={55}
                    step={1}
                    value={objectDistanceDo}
                    onChange={(e) => setObjectDistanceDo(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>8 cm (Ảnh ảo &gt; f)</span>
                    <span>15 cm (Tại tiêu điểm F)</span>
                    <span>30 cm (Tại 2F: d_i = 2F)</span>
                    <span>55 cm (Ở xa)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: QUY TẮC ĐÒN BẨY (PhysiX Native) */}
            {simEngine === "physix" && activeExp === "lever" && (
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>THÍ NGHIỆM QUY TẮC ĐÒN BẨY &amp; CÂN BẰNG LỰC (KHTN 8)</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-emerald-600">
                    ∑M = 0 ⇔ F₁·d₁ = F₂·d₂ ({(momentLeft * LEVER_TICK_M).toFixed(2)} = {(momentRight * LEVER_TICK_M).toFixed(2)} N·m)
                  </div>
                </div>

                {/* Lever Canvas */}
                <div className="relative w-full h-72 bg-white rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Status Banner */}
                  <div
                    className={`absolute top-3 px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-xs ${
                      isLeverBalanced
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300"
                    }`}
                  >
                    {isLeverBalanced
                      ? "✓ ĐÒN BẨY ĐANG Ở TRẠNG THÁI CÂN BẰNG (F₁·d₁ = F₂·d₂)"
                      : momentLeft > momentRight
                      ? "⚠ BÊN TRÁI NẶNG HƠN (M₁ > M₂)"
                      : "⚠ BÊN PHẢI NẶNG HƠN (M₂ > M₁)"}
                  </div>

                  {/* Lever Beam SVG */}
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                    {/* Fulcrum (Điểm tựa O) */}
                    <polygon points="250,110 235,145 265,145" fill="#475569" stroke="#334155" strokeWidth="2" />
                    <circle cx="250" cy="110" r="4.5" fill="#f8fafc" />
                    <text x="246" y="160" fill="#64748b" fontSize="12" fontWeight="bold">
                      O
                    </text>

                    {/* Tilting Lever Arm */}
                    <g
                      transform={`rotate(${leverTiltDeg}, 250, 110)`}
                      className="transition-transform duration-500 ease-out"
                    >
                      {/* Wooden Beam */}
                      <rect x="70" y="105" width="360" height="10" rx="3" fill="#d97706" stroke="#b45309" strokeWidth="2" />

                      {/* Tick Marks along beam */}
                      {[-4, -3, -2, -1, 1, 2, 3, 4].map((tick) => (
                        <g key={tick} transform={`translate(${250 + tick * 40}, 110)`}>
                          <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" strokeWidth="1.5" />
                          <text x="-4" y="-8" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                            {Math.abs(tick)}
                          </text>
                        </g>
                      ))}

                      {/* Left Weight */}
                      <g transform={`translate(${250 - leverArmLeft * 40}, 115)`}>
                        <line x1="0" y1="0" x2="0" y2="18" stroke="#475569" strokeWidth="2" />
                        <rect x="-14" y="18" width="28" height="24" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
                        <text x="-8" y="34" fill="#ffffff" fontSize="10" fontWeight="bold">
                          {leverWeightLeft}N
                        </text>
                      </g>

                      {/* Right Weight */}
                      <g transform={`translate(${250 + leverArmRight * 40}, 115)`}>
                        <line x1="0" y1="0" x2="0" y2="18" stroke="#475569" strokeWidth="2" />
                        <rect x="-14" y="18" width="28" height="24" rx="4" fill="#10b981" stroke="#047857" strokeWidth="2" />
                        <text x="-8" y="34" fill="#ffffff" fontSize="10" fontWeight="bold">
                          {leverWeightRight}N
                        </text>
                      </g>
                    </g>
                  </svg>
                </div>

                {/* Controllers for Lever */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Trọng lượng trái (F₁):</span>
                      <span className="font-mono text-blue-600">{leverWeightLeft} N</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={leverWeightLeft}
                      onChange={(e) => setLeverWeightLeft(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Cánh tay đòn trái (d₁):</span>
                      <span className="font-mono text-blue-600">{(leverArmLeft * LEVER_TICK_M).toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={leverArmLeft}
                      onChange={(e) => setLeverArmLeft(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Trọng lượng phải (F₂):</span>
                      <span className="font-mono text-emerald-600">{leverWeightRight} N</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={leverWeightRight}
                      onChange={(e) => setLeverWeightRight(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                    <div className="flex justify-between font-bold">
                      <span>Cánh tay đòn phải (d₂):</span>
                      <span className="font-mono text-emerald-600">{(leverArmRight * LEVER_TICK_M).toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={leverArmRight}
                      onChange={(e) => setLeverArmRight(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: STUDY HUD & FORMULAS ================= */}
          <div className="xl:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 pt-2 gap-1 text-xs">
              <button
                onClick={() => setActiveTab("formula")}
                className={`px-3 py-2.5 font-bold transition-all border-b-2 ${
                  activeTab === "formula"
                    ? "text-emerald-600 border-emerald-600 bg-white dark:bg-slate-900 rounded-t-lg"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                <span>Công thức KaTeX</span>
              </button>
              <button
                onClick={() => setActiveTab("drill")}
                className={`px-3 py-2.5 font-bold transition-all border-b-2 ${
                  activeTab === "drill"
                    ? "text-emerald-600 border-emerald-600 bg-white dark:bg-slate-900 rounded-t-lg"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                <span>Luyện tập nhanh</span>
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`px-3 py-2.5 font-bold transition-all border-b-2 ${
                  activeTab === "report"
                    ? "text-emerald-600 border-emerald-600 bg-white dark:bg-slate-900 rounded-t-lg"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                <span>Báo Cáo Lab</span>
              </button>
              <button
                onClick={() => setActiveTab("geogebra")}
                className={`px-3 py-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === "geogebra"
                    ? "text-emerald-600 border-emerald-600 bg-white dark:bg-slate-900 rounded-t-lg"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                <span>Bảng số liệu (GeoGebra)</span>
              </button>
            </div>

            {/* TAB CONTENT: FORMULA WITH KATEX (ISO 80000 / IUPAP / SI STANDARD) */}
            {activeTab === "formula" && (
              <div className="p-5 flex flex-col gap-5 text-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs gap-2">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    💡 Cần tính toán hoặc điều chỉnh biến số công thức trực tiếp?
                  </span>
                  <Link
                    href="/formulas"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Mở Bộ Điều Chỉnh Công Thức</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 1. LỚP 6: LÒ XO & LỰC ĐÀN HỒI */}
                {activeExp === "spring" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-emerald-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                          Biến dạng lò xo &amp; Lực đàn hồi (Định luật Hooke - KHTN 6):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          Lớp 6 — Lực &amp; Lò Xo
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle F = k \cdot \Delta l = k \cdot |l - l_0|" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Trong đó <MathView math="F" /> là lực đàn hồi của lò xo (<MathView math="\text{N}" />),{" "}
                        <MathView math="k" /> là độ cứng của lò xo (<MathView math="\text{N/m}" />),{" "}
                        <MathView math="\Delta l = l - l_0" /> là độ dãn của lò xo (<MathView math="\text{m}" />).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Trọng lượng quả cân &amp; Năng lượng đàn hồi (ISO 80000-3):
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle W = m \cdot g \implies k \cdot \Delta l = m \cdot g" />
                        </div>
                        <div>
                          <MathView math="\displaystyle W_{\text{t}} = \frac{1}{2} k (\Delta l)^2 \quad (\text{J, Thế năng đàn hồi})" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Tại vị trí cân bằng, lực đàn hồi cân bằng với trọng lượng quả nặng: <MathView math="F_{\text{dh}} = W = m \cdot g" />.
                      </p>
                    </div>
                  </>
                )}

                {/* 2. LỚP 6: LỰC, LỰC MA SÁT & CHUYỂN ĐỘNG */}
                {activeExp === "forces_motion" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-emerald-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                          Hợp lực và tác dụng của lực (KHTN 6):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          Lớp 6 — Lực &amp; Chuyển Động
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle F_{\text{hl}} = F_1 + F_2 \quad (\text{Cùng chiều})" />
                        </div>
                        <div>
                          <MathView math="\displaystyle F_{\text{hl}} = |F_1 - F_2| \quad (\text{Ngược chiều})" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Lực là tác dụng đẩy hoặc kéo của vật này lên vật khác, đơn vị là Niutơn (<MathView math="\text{N}" />). Khi hợp lực <MathView math="F_{\text{hl}} = 0" />, vật đứng yên cân bằng.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Lực cản ma sát và lực kéo chuyển động:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle F_{\text{kéo}} - F_{\text{ms}} = m \cdot a \implies F_{\text{kéo}} \ge F_{\text{ms}}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Lực ma sát xuất hiện ở bề mặt tiếp xúc cản trở chuyển động của vật. Muốn kéo vật chuyển động, lực kéo phải thắng lực ma sát nghỉ cực đại.
                      </p>
                    </div>
                  </>
                )}

                {/* 3. LỚP 7: SÓNG ÂM THANH */}
                {activeExp === "sound_light" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-teal-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-teal-800">
                          Sự truyền sóng âm thanh &amp; Tốc độ sóng (KHTN 7):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                          Lớp 7 — Âm Thanh
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle v = \frac{\lambda}{T} = \lambda \cdot f" />
                        </div>
                        <div>
                          <MathView math="\displaystyle v = \frac{s}{t} \implies s = v \cdot t" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Sóng âm lan truyền được trong các môi trường rắn, lỏng, khí và không truyền được trong chân không. Tốc độ truyền âm: <MathView math="v_{\text{rắn}} > v_{\text{lỏng}} > v_{\text{khí}}" />.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Mối liên hệ giữa tần số &amp; Độ cao / Độ to của âm:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle f = \frac{n}{t} \quad (\text{Hz, Tần số dao động})" />
                        </div>
                        <div>
                          <MathView math="\displaystyle f \text{ càng lớn} \implies \text{Âm càng bổng (cao)}" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Biên độ dao động càng lớn thì âm phát ra càng to (đo bằng đề-xi-ben dB). Tần số dao động càng lớn thì âm càng cao (bổng).
                      </p>
                    </div>
                  </>
                )}

                {/* 4. LỚP 7: KHÚC XẠ & PHẢN XẠ ÁNH SÁNG */}
                {activeExp === "bending_light" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-teal-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-teal-800">
                          Định luật phản xạ ánh sáng (KHTN 7):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold">
                          Lớp 7 — Quang Học
                        </span>
                      </div>
                      <div className="py-3 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs font-bold my-1 text-slate-900 overflow-x-auto flex flex-col items-center justify-center gap-1.5">
                        <div className="text-2xl sm:text-3xl text-teal-700">
                          <MathView math="\displaystyle i' = i" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-600">
                          (Góc phản xạ <MathView math="i'" /> bằng góc tới <MathView math="i" />)
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới; góc phản xạ <MathView math="i'" /> luôn bằng góc tới <MathView math="i" />.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Định luật khúc xạ ánh sáng (Snell - KHTN 9):
                      </span>
                      <div className="py-3 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs font-bold my-1 text-slate-900 overflow-x-auto space-y-2">
                        <div className="text-lg sm:text-2xl text-amber-700">
                          <MathView math="\displaystyle n_1 \cdot \sin(i) = n_2 \cdot \sin(r)" />
                        </div>
                        <div className="text-base sm:text-xl text-slate-700">
                          <MathView math="\displaystyle \iff \frac{\sin(i)}{\sin(r)} = \frac{n_2}{n_1} = n_{21}" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Khi ánh sáng truyền từ môi trường có chiết suất <MathView math="n_1" /> sang môi trường chiết suất <MathView math="n_2" />, tia sáng bị đổi phương truyền tại mặt phân cách.
                      </p>
                    </div>
                  </>
                )}

                {/* 5. LỚP 7: TỪ TRƯỜNG & KIM LA BÀN */}
                {activeExp === "magnet" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-indigo-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-indigo-800">
                          Quy ước chiều đường sức từ (KHTN 7):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                          Lớp 7 — Từ Trường
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle \text{Vào cực Nam (S) } \longrightarrow \text{ Ra cực Bắc (N)}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Bên ngoài nam châm, các đường sức từ là những đường cong khép kín đi ra từ cực Bắc (<MathView math="\text{N}" />) và đi vào cực Nam (<MathView math="\text{S}" />).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Tương tác giữa các cực từ của nam châm:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-base sm:text-lg font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle \text{Cùng cực: } \text{N} \leftrightarrow \text{N} \; , \; \text{S} \leftrightarrow \text{S} \implies \text{ĐẨY NHAU}" />
                        </div>
                        <div>
                          <MathView math="\displaystyle \text{Khác cực: } \text{N} \leftrightarrow \text{S} \implies \text{HÚT NHAU}" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Kim la bàn luôn định hướng dọc theo đường sức từ của Trái Đất hoặc từ trường nơi đặt kim.
                      </p>
                    </div>
                  </>
                )}

                {/* 6. LỚP 8: KHỐI LƯỢNG RIÊNG & LỰC ĐẨY ÁC-SI-MÉT */}
                {activeExp === "archimedes" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-cyan-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-cyan-800">
                          Khối lượng riêng &amp; Lực đẩy Ác-si-mét (ISO 80000-4):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-bold">
                          Lớp 8 — Thủy Tĩnh
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle \rho = \frac{m}{V} \quad (\text{kg/m}^3)" />
                        </div>
                        <div>
                          <MathView math="\displaystyle F_{\text{A}} = d \cdot V = \rho_{\text{chất lỏng}} \cdot g \cdot V_{\text{chiếm chỗ}}" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Lực đẩy Ác-si-mét hướng thẳng đứng từ dưới lên, có độ lớn bằng trọng lượng phần chất lỏng bị vật chiếm chỗ.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Điều kiện vật chìm, nổi và lơ lửng:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-base sm:text-lg font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle \rho_{\text{vật}} < \rho_{\text{lỏng}} \implies F_{\text{A}} > W \implies \text{VẬT NỔI}" />
                        </div>
                        <div>
                          <MathView math="\displaystyle \rho_{\text{vật}} = \rho_{\text{lỏng}} \implies F_{\text{A}} = W \implies \text{LƠ LỬNG}" />
                        </div>
                        <div>
                          <MathView math="\displaystyle \rho_{\text{vật}} > \rho_{\text{lỏng}} \implies F_{\text{A}} < W \implies \text{VẬT CHÌM}" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 7. LỚP 8: ÁP SUẤT CHẤT LỎNG & KHÍ QUYỂN */}
                {activeExp === "pressure" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-blue-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-blue-800">
                          Áp suất chất lỏng ở độ sâu h (KHTN 8):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                          Lớp 8 — Áp Suất
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle p = d \cdot h = \rho \cdot g \cdot h" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Trong đó <MathView math="p" /> là áp suất (<MathView math="\text{Pa}" />), <MathView math="d" /> là trọng lượng riêng (<MathView math="\text{N/m}^3" />), <MathView math="h" /> là độ sâu tính từ mặt thoáng (<MathView math="\text{m}" />).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Áp suất tổng hợp &amp; Nguyên lý bình thông nhau:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle p_{\text{tổng}} = p_0 + \rho \cdot g \cdot h \quad (\text{Áp suất đáy})" />
                        </div>
                        <div>
                          <MathView math="\displaystyle \frac{F_1}{S_1} = \frac{F_2}{S_2} \quad (\text{Nguyên lý máy nén thủy lực})" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 8. LỚP 8: QUY TẮC ĐÒN BẨY & MÔMEN LỰC */}
                {activeExp === "lever" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-emerald-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                          Nguyên lý mômen lực (Principle of Moments - ISO 80000-4):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          Lớp 8 — Đòn Bẩy
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle \sum M = 0 \iff F_1 \cdot d_1 = F_2 \cdot d_2" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Trong đó <MathView math="M = F \cdot d" /> là mômen của lực (<MathView math="\text{N}\cdot\text{m}" />), <MathView math="d_1, d_2" /> là cánh tay đòn.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Lợi thế cơ học (Mechanical Advantage - MA):
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle \text{MA} = \frac{F_{\text{load}}}{F_{\text{effort}}} = \frac{d_1}{d_2}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Nếu <MathView math="d_1 > d_2 \implies \text{MA} > 1" />, ta được lợi về lực để nâng vật nặng.
                      </p>
                    </div>
                  </>
                )}

                {/* 9. LỚP 8: HIỆN TƯỢNG NHIỄM ĐIỆN */}
                {activeExp === "electrostatics" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-amber-800">
                          Hai loại điện tích &amp; Lực tĩnh điện (KHTN 8):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                          Lớp 8 — Điện Học
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-base sm:text-lg font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle (+) \leftrightarrow (-) \implies \text{HÚT NHAU (Trái dấu)}" />
                        </div>
                        <div>
                          <MathView math="\displaystyle (+) \leftrightarrow (+) \; ; \; (-) \leftrightarrow (-) \implies \text{ĐẨY NHAU (Cùng dấu)}" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-emerald-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                        Bản chất nhiễm điện do cọ xát (Electron):
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle q = n \cdot e \quad (e \approx 1.6 \times 10^{-19} \text{ C})" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Khi cọ xát, electron dịch chuyển từ vật này sang vật khác: nhận electron nhiễm điện âm, mất electron nhiễm điện dương.
                      </p>
                    </div>
                  </>
                )}

                {/* 10. LỚP 9: THẤU KÍNH HỘI TỤ & PHÂN KÌ */}
                {activeExp === "lens" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-sky-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-sky-800">
                          Công thức Thấu kính mỏng Gauss (KHTN 9 / ISO 80000-7):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">
                          Lớp 9 — Quang Hình
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 text-slate-900 overflow-x-auto">
                        <MathView math="\displaystyle \frac{1}{f} = \frac{1}{d_o} + \frac{1}{d_i} \implies d_i = \frac{d_o \cdot f}{d_o - f}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Trong đó <MathView math="f" /> là tiêu cự (<MathView math="\text{cm}" />), <MathView math="d_o" /> là khoảng cách từ vật đến quang tâm, <MathView math="d_i" /> là khoảng cách từ ảnh đến quang tâm.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Độ phóng đại ảnh &amp; Độ tụ:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle m = -\frac{d_i}{d_o} = \frac{h_i}{h_o} \quad ; \quad D = \frac{1}{f} \quad (\text{dp, Đi-ốp})" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Khi <MathView math="d_o > f" /> ta thu được ảnh THẬT, ngược chiều; khi <MathView math="d_o < f" /> ta thu được ảnh ẢO, cùng chiều lớn hơn vật.
                      </p>
                    </div>
                  </>
                )}

                {/* 11. LỚP 9: ĐỊNH LUẬT ÔM & MẠCH DC */}
                {activeExp === "ohm" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-emerald-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                          Định luật Ôm cho đoạn mạch (IEC 60027 / KHTN 9):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          Lớp 9 — Điện Học
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle I = \frac{U}{R} \iff U = I \cdot R \iff R = \frac{U}{I}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Cường độ dòng điện <MathView math="I" /> (<MathView math="\text{A}" />) tỉ lệ thuận với hiệu điện thế <MathView math="U" /> (<MathView math="\text{V}" />) và tỉ lệ nghịch với điện trở <MathView math="R" /> (<MathView math="\Omega" />).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Công suất điện &amp; Điện năng tiêu thụ (Joule):
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle \mathcal{P} = U \cdot I = I^2 \cdot R = \frac{U^2}{R} \quad (\text{W, Oát})" />
                        </div>
                        <div>
                          <MathView math="\displaystyle A = \mathcal{P} \cdot t = U \cdot I \cdot t \quad (\text{J hoặc kW}\cdot\text{h})" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 12. LỚP 9: ĐỘNG NĂNG & BẢO TOÀN CƠ NĂNG */}
                {activeExp === "energy_skate" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-rose-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-rose-800">
                          Động năng &amp; Thế năng trọng trường (KHTN 9):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                          Lớp 9 — Cơ Năng
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-lg sm:text-2xl font-bold my-1 space-y-2 text-slate-900">
                        <div>
                          <MathView math="\displaystyle W_{\text{đ}} = \frac{1}{2} m v^2 \quad (\text{J, Động năng})" />
                        </div>
                        <div>
                          <MathView math="\displaystyle W_{\text{t}} = m \cdot g \cdot h \quad (\text{J, Thế năng trọng trường})" />
                        </div>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Cơ năng của vật là tổng động năng và thế năng: <MathView math="W = W_{\text{đ}} + W_{\text{t}}" />. Đơn vị cơ năng là Jun (<MathView math="\text{J}" />).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Định luật bảo toàn cơ năng (Bỏ qua ma sát):
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle W = W_{\text{đ}} + W_{\text{t}} = \frac{1}{2} m v^2 + m g h = \text{const}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Khi vật chuyển động chỉ chịu tác dụng của trọng lực, cơ năng được bảo toàn. Động năng tăng thì thế năng giảm và ngược lại.
                      </p>
                    </div>
                  </>
                )}

                {/* 13. LỚP 9: HIỆN TƯỢNG CẢM ỨNG ĐIỆN TỪ */}
                {activeExp === "faraday" && (
                  <>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-purple-600 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-purple-800">
                          Từ thông &amp; Hiện tượng cảm ứng điện từ (KHTN 9):
                        </span>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                          Lớp 9 — Điện Từ Học
                        </span>
                      </div>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle \Phi = B \cdot S \cdot \cos(\alpha) \quad (\text{Wb, Vêbe})" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
                        Số đường sức từ xuyên qua tiết diện cuộn dây kín biến thiên (<MathView math="\Delta \Phi \ne 0" />) thì trong cuộn dây xuất hiện dòng điện cảm ứng.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 border-l-4 border-amber-500 flex flex-col gap-2 shadow-xs">
                      <span className="font-extrabold text-sm sm:text-base text-amber-800">
                        Định luật cảm ứng Faraday &amp; Máy phát điện:
                      </span>
                      <div className="py-4 px-3 bg-white rounded-xl text-center border border-slate-200/90 shadow-2xs text-xl sm:text-2xl font-bold my-1 text-slate-900">
                        <MathView math="\displaystyle e_{\text{c}} = -\frac{\Delta \Phi}{\Delta t} \implies I_{\text{c}} = \frac{e_{\text{c}}}{R}" block />
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                        Độ lớn của suất điện động cảm ứng tỉ lệ với tốc độ biến thiên của từ thông qua mạch. Đây là nguyên lý hoạt động của máy phát điện xoay chiều.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: FAST DRILL */}
            {activeTab === "drill" && (
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 leading-relaxed font-bold">
                  Câu hỏi kiểm tra KHTN THCS: Khi thả một vật làm bằng gỗ vào một bình đựng đầy nước, vật sẽ nổi lên mặt
                  nước vì:
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "A", text: "A. Trọng lượng riêng của gỗ nhỏ hơn trọng lượng riêng của nước", correct: true },
                    { key: "B", text: "B. Khối lượng của gỗ lớn hơn khối lượng của nước" },
                    { key: "C", text: "C. Lực đẩy Ác-si-mét nhỏ hơn trọng lượng của vật" },
                    { key: "D", text: "D. Thể tích của miếng gỗ quá lớn" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setDrillAnswer(opt.key);
                        setDrillChecked(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        drillAnswer === opt.key
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-800 font-bold"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!drillAnswer}
                  onClick={() => setDrillChecked(true)}
                  className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 disabled:opacity-40"
                >
                  Kiểm tra câu trả lời
                </button>
                {drillChecked && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300">
                    <strong>Chính xác!</strong> Theo chuẩn SI / ISO, điều kiện để vật nổi tự do trên mặt thoáng là khối lượng riêng của vật nhỏ hơn khối lượng riêng của chất lỏng (<MathView math="\rho_{\text{obj}} < \rho_{\text{fluid}}" />).
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LAB REPORT EXPORT */}
            {activeTab === "report" && (
              <div className="p-5 flex flex-col gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-sm text-slate-900 dark:text-white border-b pb-2">
                    BÁO CÁO THỰC HÀNH KHTN &amp; VẬT LÝ THCS
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bài thí nghiệm:</span>
                    <span className="font-bold text-right text-slate-800 dark:text-slate-200">
                      {SIM_DATA[activeExp].title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chuyên đề KHTN:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {SIM_DATA[activeExp].gradeBadge}
                    </span>
                  </div>

                  {activeExp === "spring" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Khối lượng quả cân m:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {springMassG} g = {(springMassG * 0.001).toFixed(3)} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trọng lượng quả cân W = m·g:</span>
                        <span className="font-mono text-emerald-600 font-bold">
                          {((springMassG * 0.001) * STANDARD_GRAVITY).toFixed(2)} N
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Độ biến dạng dãn Δl = W/k:</span>
                        <span className="font-mono text-cyan-600 font-bold">
                          {springStretchCm.toFixed(1)} cm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thế năng đàn hồi W_t = ½k(Δl)²:</span>
                        <span className="font-mono text-amber-600 font-bold">
                          {springElasticEnergyJ.toFixed(3)} J
                        </span>
                      </div>
                    </>
                  )}

                  {activeExp === "sound_light" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tần số âm thanh f:</span>
                        <span className="font-mono text-emerald-600 font-bold">{soundFreqHz} Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tốc độ truyền âm v:</span>
                        <span className="font-mono font-bold">{soundSpeedMs} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bước sóng âm λ = v/f:</span>
                        <span className="font-mono text-cyan-600 font-bold">{soundWavelengthM.toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Định luật phản xạ ánh sáng:</span>
                        <span className="font-mono text-amber-600 font-bold">i&apos; = i = {lightIncidentDeg}°</span>
                      </div>
                    </>
                  )}

                  {activeExp === "archimedes" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trọng lượng thực W = m·g:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {weightW_N.toFixed(2)} N
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lực đẩy Archimedes F_b = ρ·g·V:</span>
                        <span className="font-mono text-emerald-600 font-bold">{buoyantForceFb.toFixed(2)} N</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trọng lượng biểu kiến W_app = W − F_b:</span>
                        <span className="font-mono text-red-600 font-bold">{apparentWeightWapp.toFixed(2)} N</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Khối lượng nước tràn:</span>
                        <span className="font-mono text-cyan-600 font-bold">{overflowWaterGram.toFixed(1)} g</span>
                      </div>
                    </>
                  )}

                  {activeExp === "ohm" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hiệu điện thế U:</span>
                        <span className="font-mono text-sky-600 font-bold">{ohmVoltage.toFixed(1)} V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Điện trở biến trở R:</span>
                        <span className="font-mono font-bold">{ohmResistance} Ω</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dòng điện I đo được:</span>
                        <span className="font-mono text-emerald-600 font-bold">{ohmCurrentI.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Công suất tiêu thụ P:</span>
                        <span className="font-mono text-amber-600 font-bold">{ohmPowerP.toFixed(2)} W</span>
                      </div>
                    </>
                  )}

                  {activeExp === "lens" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tiêu cự thấu kính f:</span>
                        <span className="font-mono text-sky-600 font-bold">{lensFocalF} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Khoảng cách vật d_o:</span>
                        <span className="font-mono font-bold">{objectDistanceDo} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Khoảng cách ảnh d_i:</span>
                        <span className="font-mono text-emerald-600 font-bold">
                          {isAtFocal ? "∞ (Vô cực)" : `${lensImageDi.toFixed(1)} cm`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Độ phóng đại m = −d_i/d_o:</span>
                        <span className="font-mono text-sky-600 font-bold">
                          {isAtFocal ? "—" : lensMagnificationM.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Độ tụ D = 1/f:</span>
                        <span className="font-mono font-bold">{(100 / lensFocalF).toFixed(2)} dp</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tính chất ảnh:</span>
                        <span className="font-bold text-amber-600">
                          {isRealImage ? "Ảnh THẬT, ngược chiều" : "Ảnh ẢO, cùng chiều lớn hơn vật"}
                        </span>
                      </div>
                    </>
                  )}

                  {activeExp === "lever" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mômen trái M₁ = F₁·d₁:</span>
                        <span className="font-mono font-bold text-blue-600">{(momentLeft * LEVER_TICK_M).toFixed(2)} N·m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mômen phải M₂ = F₂·d₂:</span>
                        <span className="font-mono font-bold text-emerald-600">{(momentRight * LEVER_TICK_M).toFixed(2)} N·m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lợi thế cơ học MA = d₁/d₂:</span>
                        <span className="font-mono font-bold">{(leverArmLeft / leverArmRight).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trạng thái đòn bẩy:</span>
                        <span className="font-bold text-amber-600">
                          {isLeverBalanced ? "CÂN BẰNG NẰM NGANG" : "NGHIÊNG MẤT CÂN BẰNG"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handlePrintReport}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>In / Tải Báo Cáo PDF</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: GEOGEBRA SPREADSHEET & GRAPH */}
            {activeTab === "geogebra" && (
              <div className="p-4 flex flex-col gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Bảng số liệu tính toán và đồ thị tọa độ thực nghiệm GeoGebra (chuẩn CT GDPT 2018):
                </div>
                <GeoGebraSpreadsheet
                  experimentTitle={SIM_DATA[activeExp].title}
                  labelX="t(s)"
                  labelY="d(m)"
                  curve1Name="v₁"
                  curve2Name="v₂"
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= FULL-WIDTH GEOGEBRA SPREADSHEET WORKSPACE ================= */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-sky-600">calculate</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bảng Số Liệu Spreadsheet &amp; Đồ Thị Tọa Độ Thực Nghiệm (Chuẩn GeoGebra)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Hỗ trợ phân tích sai số, vẽ điểm (t, d) &amp; hồi quy đường thẳng
            </span>
          </div>
          <GeoGebraSpreadsheet
            experimentTitle={SIM_DATA[activeExp].title}
            labelX="t(s)"
            labelY="d(m)"
            curve1Name="v₁"
            curve2Name="v₂"
          />
        </div>
      </div>
    </div>
  );
}
