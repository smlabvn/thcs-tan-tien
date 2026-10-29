"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  BookOpen,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Waves,
  Lightbulb,
  Scale,
  Compass,
  ArrowRight,
  Calculator,
  Globe2,
  Pencil,
  PlusCircle,
  Trash2,
  X,
  CheckCircle,
  Play,
  Flame,
  Gauge,
  HelpCircle,
} from "lucide-react";
import MathView from "@/components/MathView";

interface VariableItem {
  symbol: string;
  unit: string;
  name: string;
}

interface FormulaItem {
  id: string;
  grade: 6 | 7 | 8 | 9;
  category: "co" | "dien" | "quang" | "am" | "nhiet";
  name: string;
  intlMath: string;
  vnMath: string;
  intlVariables: VariableItem[];
  vnVariables: VariableItem[];
  explanation: string;
  latexCode: string;
  isCustom?: boolean;
}

const DEFAULT_FORMULAS: FormulaItem[] = [
  // ================= LỚP 6 =================
  {
    id: "density",
    grade: 6,
    category: "co",
    name: "Khối lượng riêng của chất",
    intlMath: "\\rho = \\frac{m}{V}",
    vnMath: "D = \\frac{m}{V}",
    intlVariables: [
      { symbol: "\\rho", unit: "kg/m³", name: "Khối lượng riêng của chất" },
      { symbol: "m", unit: "kg", name: "Khối lượng vật" },
      { symbol: "V", unit: "m³", name: "Thể tích vật" },
    ],
    vnVariables: [
      { symbol: "D", unit: "kg/m³", name: "Khối lượng riêng" },
      { symbol: "m", unit: "kg", name: "Khối lượng vật" },
      { symbol: "V", unit: "m³", name: "Thể tích vật" },
    ],
    explanation: "Khối lượng riêng là khối lượng của một mét khối (1 m³) chất đó. Nước nguyên chất có khối lượng riêng 1000 kg/m³.",
    latexCode: "\\rho = \\frac{m}{V}",
  },
  {
    id: "weight",
    grade: 6,
    category: "co",
    name: "Trọng lượng & Trọng lực",
    intlMath: "W = m \\cdot g",
    vnMath: "P = 10 \\cdot m",
    intlVariables: [
      { symbol: "W", unit: "N", name: "Trọng lượng của vật" },
      { symbol: "m", unit: "kg", name: "Khối lượng của vật" },
      { symbol: "g", unit: "N/kg", name: "Gia tốc trọng trường (9.807 N/kg)" },
    ],
    vnVariables: [
      { symbol: "P", unit: "N", name: "Trọng lượng của vật" },
      { symbol: "m", unit: "kg", name: "Khối lượng của vật" },
    ],
    explanation: "Trọng lượng là độ lớn lực hút Trái Đất tác dụng lên vật. Theo chuẩn ISO 80000, trọng lượng ký hiệu W (Weight) hoặc F_g.",
    latexCode: "W = m \\cdot g",
  },
  {
    id: "hooke",
    grade: 6,
    category: "co",
    name: "Độ biến dạng đàn hồi lò xo (Định luật Hooke)",
    intlMath: "F = k \\cdot \\Delta l",
    vnMath: "F = k \\cdot |l - l_0|",
    intlVariables: [
      { symbol: "F", unit: "N", name: "Lực đàn hồi của lò xo" },
      { symbol: "k", unit: "N/m", name: "Độ cứng của lò xo" },
      { symbol: "\\Delta l", unit: "m", name: "Độ biến dạng dãn/nén" },
    ],
    vnVariables: [
      { symbol: "F", unit: "N", name: "Lực đàn hồi" },
      { symbol: "k", unit: "N/m", name: "Độ cứng lò xo" },
      { symbol: "l", unit: "m", name: "Chiều dài khi dãn" },
      { symbol: "l_0", unit: "m", name: "Chiều dài tự nhiên" },
    ],
    explanation: "Độ dãn của lò xo treo thẳng đứng tỉ lệ thuận với lực kéo (trọng lượng quả nặng) tác dụng vào nó trong giới hạn đàn hồi.",
    latexCode: "F = k \\cdot \\Delta l",
  },

  // ================= LỚP 7 =================
  {
    id: "speed",
    grade: 7,
    category: "co",
    name: "Tốc độ chuyển động",
    intlMath: "v = \\frac{s}{t}",
    vnMath: "v = \\frac{s}{t}",
    intlVariables: [
      { symbol: "v", unit: "m/s hoặc km/h", name: "Tốc độ chuyển động" },
      { symbol: "s", unit: "m", name: "Quãng đường đi được" },
      { symbol: "t", unit: "s", name: "Thời gian chuyển động" },
    ],
    vnVariables: [
      { symbol: "v", unit: "m/s hoặc km/h", name: "Tốc độ chuyển động" },
      { symbol: "s", unit: "m", name: "Quãng đường" },
      { symbol: "t", unit: "s", name: "Thời gian" },
    ],
    explanation: "Tốc độ đặc trưng cho sự nhanh hay chậm của chuyển động. Quy đổi: 1 m/s = 3.6 km/h.",
    latexCode: "v = \\frac{s}{t}",
  },
  {
    id: "sound_wave",
    grade: 7,
    category: "am",
    name: "Tốc độ truyền âm, bước sóng & tần số",
    intlMath: "v = \\lambda \\cdot f = \\frac{\\lambda}{T}",
    vnMath: "v = \\lambda \\cdot f",
    intlVariables: [
      { symbol: "v", unit: "m/s", name: "Tốc độ truyền sóng âm" },
      { symbol: "\\lambda", unit: "m", name: "Bước sóng" },
      { symbol: "f", unit: "Hz", name: "Tần số dao động của âm" },
      { symbol: "T", unit: "s", name: "Chu kỳ dao động" },
    ],
    vnVariables: [
      { symbol: "v", unit: "m/s", name: "Tốc độ âm thanh" },
      { symbol: "\\lambda", unit: "m", name: "Bước sóng" },
      { symbol: "f", unit: "Hz", name: "Tần số âm" },
    ],
    explanation: "Sóng âm lan truyền dao động. Tần số f càng lớn âm càng bổng (cao), biên độ càng lớn âm càng to (đo bằng dB).",
    latexCode: "v = \\lambda \\cdot f",
  },
  {
    id: "reflection",
    grade: 7,
    category: "quang",
    name: "Định luật phản xạ ánh sáng",
    intlMath: "i = i' \\quad (\\theta_{\\text{r}} = \\theta_{\\text{i}})",
    vnMath: "i' = i",
    intlVariables: [
      { symbol: "i", unit: "độ (°)", name: "Góc tới (tạo bởi tia tới và pháp tuyến)" },
      { symbol: "i'", unit: "độ (°)", name: "Góc phản xạ (tạo bởi tia phản xạ và pháp tuyến)" },
    ],
    vnVariables: [
      { symbol: "i", unit: "độ (°)", name: "Góc tới" },
      { symbol: "i'", unit: "độ (°)", name: "Góc phản xạ" },
    ],
    explanation: "Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới; Góc phản xạ luôn bằng góc tới.",
    latexCode: "i' = i",
  },

  // ================= LỚP 8 =================
  {
    id: "pressure",
    grade: 8,
    category: "co",
    name: "Áp suất tác dụng lên mặt bị ép",
    intlMath: "p = \\frac{F}{A}",
    vnMath: "p = \\frac{F}{S}",
    intlVariables: [
      { symbol: "p", unit: "Pa (N/m²)", name: "Áp suất (Pressure)" },
      { symbol: "F", unit: "N", name: "Áp lực tác dụng vuông góc lên mặt ép" },
      { symbol: "A", unit: "m²", name: "Diện tích mặt bị ép (Area, ISO 80000)" },
    ],
    vnVariables: [
      { symbol: "p", unit: "N/m²", name: "Áp suất" },
      { symbol: "F", unit: "N", name: "Áp lực" },
      { symbol: "S", unit: "m²", name: "Diện tích mặt bị ép" },
    ],
    explanation: "Áp suất là độ lớn của áp lực trên một đơn vị diện tích bị ép. 1 Pa = 1 N/m² = 10^-5 bar.",
    latexCode: "p = \\frac{F}{A}",
  },
  {
    id: "liquid_pressure",
    grade: 8,
    category: "co",
    name: "Áp suất thủy tĩnh trong lòng chất lỏng",
    intlMath: "p = p_0 + \\rho \\cdot g \\cdot h",
    vnMath: "p = d \\cdot h",
    intlVariables: [
      { symbol: "p", unit: "Pa", name: "Áp suất chất lỏng ở độ sâu h" },
      { symbol: "\\rho", unit: "kg/m³", name: "Khối lượng riêng chất lỏng" },
      { symbol: "g", unit: "N/kg", name: "Gia tốc trọng trường" },
      { symbol: "h", unit: "m", name: "Độ sâu tính từ mặt thoáng" },
    ],
    vnVariables: [
      { symbol: "p", unit: "Pa", name: "Áp suất chất lỏng" },
      { symbol: "d", unit: "N/m³", name: "Trọng lượng riêng" },
      { symbol: "h", unit: "m", name: "Độ sâu so với mặt thoáng" },
    ],
    explanation: "Chất lỏng gây áp suất theo mọi hướng lên đáy bình, thành bình và các vật nằm trong lòng nó. p càng lớn khi độ sâu h càng sâu.",
    latexCode: "p = \\rho \\cdot g \\cdot h",
  },
  {
    id: "buoyancy",
    grade: 8,
    category: "co",
    name: "Lực đẩy Ác-si-mét (Archimedes' Principle)",
    intlMath: "F_{\\text{b}} = \\rho \\cdot g \\cdot V_{\\text{disp}}",
    vnMath: "F_A = d \\cdot V",
    intlVariables: [
      { symbol: "F_{\\text{b}}", unit: "N", name: "Lực đẩy Ác-si-mét (Buoyant force, ISO 80000)" },
      { symbol: "\\rho", unit: "kg/m³", name: "Khối lượng riêng của chất lỏng" },
      { symbol: "g", unit: "N/kg", name: "Gia tốc trọng trường (9.807 N/kg)" },
      { symbol: "V_{\\text{disp}}", unit: "m³", name: "Thể tích phần chất lỏng bị chiếm chỗ" },
    ],
    vnVariables: [
      { symbol: "F_A", unit: "N", name: "Lực đẩy Ác-si-mét" },
      { symbol: "d", unit: "N/m³", name: "Trọng lượng riêng chất lỏng" },
      { symbol: "V", unit: "m³", name: "Thể tích phần chìm trong chất lỏng" },
    ],
    explanation: "Mọi vật nhúng trong chất lỏng đều chịu lực đẩy hướng thẳng đứng từ dưới lên bằng trọng lượng khối chất lỏng bị vật chiếm chỗ.",
    latexCode: "F_{\\text{b}} = \\rho \\cdot g \\cdot V_{\\text{disp}}",
  },
  {
    id: "lever",
    grade: 8,
    category: "co",
    name: "Quy tắc đòn bẩy & Moment lực",
    intlMath: "F_1 \\cdot d_1 = F_2 \\cdot d_2",
    vnMath: "F_1 \\cdot d_1 = F_2 \\cdot d_2",
    intlVariables: [
      { symbol: "M", unit: "N·m", name: "Moment của lực (M = F · d - Vật lí 10)" },
      { symbol: "F_1, F_2", unit: "N", name: "Các lực tác dụng ở hai đầu đòn bẩy" },
      { symbol: "d_1, d_2", unit: "m", name: "Cánh tay đòn (khoảng cách từ trục quay đến giá lực)" },
    ],
    vnVariables: [
      { symbol: "F_1, F_2", unit: "N", name: "Lực tác dụng ở hai phía điểm tựa" },
      { symbol: "d_1, d_2", unit: "m", name: "Khoảng cách từ điểm tựa đến giá của lực (cánh tay đòn)" },
    ],
    explanation: "Ở Lớp 8, học sinh nhận biết tác dụng làm quay (moment lực) và quy tắc thăng bằng đòn bẩy F₁·d₁ = F₂·d₂ giúp được lợi về lực khi d₁ > d₂. Việc tính toán định lượng moment lực M = F·d sẽ học ở lớp 10.",
    latexCode: "F_1 \\cdot d_1 = F_2 \\cdot d_2",
  },
  {
    id: "energy",
    grade: 8,
    category: "co",
    name: "Cơ năng: Động năng & Thế năng trọng trường",
    intlMath: "\\begin{gathered} E = E_{\\text{k}} + E_{\\text{p}} \\\\[3pt] E = \\frac{1}{2} m v^2 + m g h \\end{gathered}",
    vnMath: "\\begin{gathered} W = W_{\\text{đ}} + W_{\\text{t}} \\\\[3pt] W = \\frac{1}{2} m v^2 + 10 m h \\end{gathered}",
    intlVariables: [
      { symbol: "E", unit: "J", name: "Cơ năng toàn phần" },
      { symbol: "E_{\\text{k}}", unit: "J", name: "Động năng của vật" },
      { symbol: "E_{\\text{p}}", unit: "J", name: "Thế năng trọng trường" },
      { symbol: "m", unit: "kg", name: "Khối lượng" },
      { symbol: "v", unit: "m/s", name: "Vận tốc" },
      { symbol: "h", unit: "m", name: "Độ cao so với mốc" },
    ],
    vnVariables: [
      { symbol: "W", unit: "J", name: "Cơ năng toàn phần" },
      { symbol: "W_{\\text{đ}}", unit: "J", name: "Động năng" },
      { symbol: "W_{\\text{t}}", unit: "J", name: "Thế năng" },
    ],
    explanation: "Cơ năng bảo toàn khi bỏ qua ma sát và lực cản: động năng và thế năng có thể chuyển hóa qua lại lẫn nhau.",
    latexCode: "E = \\frac{1}{2}mv^2 + mgh",
  },

  // ================= LỚP 9 =================
  {
    id: "ohm_law",
    grade: 9,
    category: "dien",
    name: "Định luật Ôm cho đoạn mạch",
    intlMath: "I = \\frac{U}{R} \\iff U = I \\cdot R",
    vnMath: "I = \\frac{U}{R}",
    intlVariables: [
      { symbol: "I", unit: "A", name: "Cường độ dòng điện" },
      { symbol: "U", unit: "V", name: "Hiệu điện thế giữa hai đầu đoạn mạch" },
      { symbol: "R", unit: "Ω", name: "Điện trở của đoạn mạch" },
    ],
    vnVariables: [
      { symbol: "I", unit: "A", name: "Cường độ dòng điện" },
      { symbol: "U", unit: "V", name: "Hiệu điện thế" },
      { symbol: "R", unit: "Ω", name: "Điện trở" },
    ],
    explanation: "Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu dây và tỉ lệ nghịch với điện trở của dây.",
    latexCode: "I = \\frac{U}{R}",
  },
  {
    id: "series_circuit",
    grade: 9,
    category: "dien",
    name: "Điện trở tương đương mạch nối tiếp",
    intlMath: "\\begin{gathered} R_{\\text{eq}} = R_1 + R_2 \\\\[3pt] I = I_1 = I_2, \\quad U = U_1 + U_2 \\end{gathered}",
    vnMath: "\\begin{gathered} R_{tđ} = R_1 + R_2 \\\\[3pt] I = I_1 = I_2, \\quad U = U_1 + U_2 \\end{gathered}",
    intlVariables: [
      { symbol: "R_{\\text{eq}}", unit: "Ω", name: "Điện trở tương đương (Equivalent Resistance)" },
      { symbol: "R_1, R_2", unit: "Ω", name: "Các điện trở thành phần" },
    ],
    vnVariables: [
      { symbol: "R_{tđ}", unit: "Ω", name: "Điện trở tương đương" },
      { symbol: "R_1, R_2", unit: "Ω", name: "Các điện trở" },
    ],
    explanation: "Đoạn mạch mắc nối tiếp có dòng điện bằng nhau tại mọi điểm, hiệu điện thế tổng bằng tổng các hiệu điện thế thành phần.",
    latexCode: "R_{\\text{eq}} = R_1 + R_2",
  },
  {
    id: "parallel_circuit",
    grade: 9,
    category: "dien",
    name: "Điện trở tương đương mạch song song",
    intlMath: "\\begin{gathered} \\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\\\[4pt] R_{\\text{eq}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} \\end{gathered}",
    vnMath: "\\begin{gathered} \\frac{1}{R_{tđ}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\\\[4pt] R_{tđ} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} \\end{gathered}",
    intlVariables: [
      { symbol: "R_{\\text{eq}}", unit: "Ω", name: "Điện trở tương đương" },
      { symbol: "U", unit: "V", name: "Hiệu điện thế mạch: U = U1 = U2" },
      { symbol: "I", unit: "A", name: "Dòng điện mạch chính: I = I1 + I2" },
    ],
    vnVariables: [
      { symbol: "R_{tđ}", unit: "Ω", name: "Điện trở tương đương" },
    ],
    explanation: "Đoạn mạch song song có cùng hiệu điện thế, cường độ dòng điện mạch chính bằng tổng cường độ dòng điện các nhánh rẽ.",
    latexCode: "R_{\\text{eq}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2}",
  },
  {
    id: "electric_power",
    grade: 9,
    category: "dien",
    name: "Công suất điện & Định luật Joule-Lenz",
    intlMath: "\\begin{gathered} P = U \\cdot I = I^2 \\cdot R = \\frac{U^2}{R} \\\\[4pt] Q = I^2 \\cdot R \\cdot t \\end{gathered}",
    vnMath: "\\begin{gathered} P = U \\cdot I = \\frac{U^2}{R} \\\\[4pt] Q = I^2 \\cdot R \\cdot t \\end{gathered}",
    intlVariables: [
      { symbol: "P", unit: "W", name: "Công suất điện tiêu thụ" },
      { symbol: "Q", unit: "J", name: "Nhiệt lượng tỏa ra (Joule's heat)" },
      { symbol: "t", unit: "s", name: "Thời gian dòng điện chạy qua" },
    ],
    vnVariables: [
      { symbol: "P", unit: "W", name: "Công suất điện" },
      { symbol: "Q", unit: "J", name: "Nhiệt lượng tỏa ra trên dây" },
      { symbol: "t", unit: "s", name: "Thời gian" },
    ],
    explanation: "Công suất điện biểu thị tốc độ tiêu thụ điện năng. Định luật Joule-Lenz tính nhiệt lượng tỏa ra trên vật dẫn thuần trở.",
    latexCode: "P = U \\cdot I = I^2 R = \\frac{U^2}{R}",
  },
  {
    id: "wire_resistance",
    grade: 9,
    category: "dien",
    name: "Điện trở của dây dẫn",
    intlMath: "R = \\rho \\cdot \\frac{l}{A}",
    vnMath: "R = \\rho \\cdot \\frac{l}{S}",
    intlVariables: [
      { symbol: "R", unit: "Ω", name: "Điện trở của dây dẫn" },
      { symbol: "\\rho", unit: "Ω·m", name: "Điện trở suất của vật liệu" },
      { symbol: "l", unit: "m", name: "Chiều dài dây dẫn" },
      { symbol: "A", unit: "m²", name: "Tiết diện ngang của dây (Area)" },
    ],
    vnVariables: [
      { symbol: "R", unit: "Ω", name: "Điện trở dây dẫn" },
      { symbol: "\\rho", unit: "Ω·m", name: "Điện trở suất" },
      { symbol: "l", unit: "m", name: "Chiều dài dây" },
      { symbol: "S", unit: "m²", name: "Tiết diện dây" },
    ],
    explanation: "Điện trở tỉ lệ thuận với chiều dài l, tỉ lệ nghịch với tiết diện ngang A (theo chuẩn ISO dùng A thay vì S).",
    latexCode: "R = \\rho \\cdot \\frac{l}{A}",
  },
  {
    id: "thin_lens",
    grade: 9,
    category: "quang",
    name: "Phương trình thấu kính mỏng (Thin Lens Equation)",
    intlMath: "\\begin{gathered} \\frac{1}{f} = \\frac{1}{d_{\\text{o}}} + \\frac{1}{d_{\\text{i}}} \\\\[4pt] d_{\\text{i}} = \\frac{d_{\\text{o}} \\cdot f}{d_{\\text{o}} - f} \\end{gathered}",
    vnMath: "\\begin{gathered} \\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d'} \\\\[4pt] d' = \\frac{d \\cdot f}{d - f} \\end{gathered}",
    intlVariables: [
      { symbol: "f", unit: "cm hoặc m", name: "Tiêu cự thấu kính (hội tụ: f > 0)" },
      { symbol: "d_{\\text{o}}", unit: "cm hoặc m", name: "Khoảng cách từ vật đến quang tâm O" },
      { symbol: "d_{\\text{i}}", unit: "cm hoặc m", name: "Khoảng cách từ ảnh đến quang tâm O" },
    ],
    vnVariables: [
      { symbol: "f", unit: "cm hoặc m", name: "Tiêu cự thấu kính" },
      { symbol: "d", unit: "cm hoặc m", name: "Khoảng cách từ vật đến thấu kính" },
      { symbol: "d'", unit: "cm hoặc m", name: "Khoảng cách từ ảnh đến thấu kính" },
    ],
    explanation: "Quy ước: Thấu kính hội tụ f > 0. Vật thật d_o > 0. Ảnh thật d_i > 0 (ngược chiều, hứng được trên màn); Ảnh ảo d_i < 0 (cùng chiều).",
    latexCode: "\\frac{1}{f} = \\frac{1}{d_{\\text{o}}} + \\frac{1}{d_{\\text{i}}}",
  },
  {
    id: "magnification",
    grade: 9,
    category: "quang",
    name: "Độ phóng đại tuyến tính & Độ tụ",
    intlMath: "\\begin{gathered} m = -\\frac{d_{\\text{i}}}{d_{\\text{o}}} = \\frac{h_{\\text{i}}}{h_{\\text{o}}} \\\\[4pt] D = \\frac{1}{f} \\text{ (dp)} \\end{gathered}",
    vnMath: "\\begin{gathered} k = -\\frac{d'}{d} = \\frac{h'}{h} \\\\[4pt] D = \\frac{1}{f} \\text{ (dp)} \\end{gathered}",
    intlVariables: [
      { symbol: "m", unit: "không thứ nguyên", name: "Độ phóng đại tuyến tính" },
      { symbol: "h_{\\text{i}}, h_{\\text{o}}", unit: "cm", name: "Chiều cao của ảnh và của vật" },
      { symbol: "D", unit: "dp (diopter)", name: "Độ tụ của thấu kính (với f tính bằng mét)" },
    ],
    vnVariables: [
      { symbol: "k", unit: "hệ số", name: "Hệ số phóng đại ảnh" },
      { symbol: "D", unit: "dp", name: "Độ tụ thấu kính" },
    ],
    explanation: "|m| > 1: ảnh lớn hơn vật; |m| < 1: ảnh nhỏ hơn vật; m < 0: ảnh ngược chiều vật (ảnh thật); m > 0: ảnh cùng chiều vật (ảnh ảo).",
    latexCode: "m = -\\frac{d_{\\text{i}}}{d_{\\text{o}}} = \\frac{h_{\\text{i}}}{h_{\\text{o}}}",
  },
];

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<FormulaItem[]>(DEFAULT_FORMULAS);
  const [standardMode, setStandardMode] = useState<"intl" | "vn">("intl");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with Backend API and localStorage
  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/formulas");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFormulas(data);
            return;
          }
        }
      } catch {
        // Fallback to localStorage if offline
        const local = localStorage.getItem("khtn_formulas");
        if (local) {
          try {
            setFormulas(JSON.parse(local));
          } catch {
            // Keep default
          }
        }
      }
    };
    fetchFormulas();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ================= FORMULA EDIT / CREATE MODAL STATE =================
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFormula, setEditingFormula] = useState<FormulaItem | null>(null);
  const [modalForm, setModalForm] = useState<{
    id: string;
    grade: 6 | 7 | 8 | 9;
    category: "co" | "dien" | "quang" | "am" | "nhiet";
    name: string;
    intlMath: string;
    vnMath: string;
    explanation: string;
    variables: VariableItem[];
  }>({
    id: "",
    grade: 8,
    category: "co",
    name: "",
    intlMath: "",
    vnMath: "",
    explanation: "",
    variables: [{ symbol: "x", unit: "m", name: "Đại lượng x" }],
  });

  const handleOpenEditModal = (item: FormulaItem) => {
    setEditingFormula(item);
    setModalForm({
      id: item.id,
      grade: item.grade,
      category: item.category,
      name: item.name,
      intlMath: item.intlMath,
      vnMath: item.vnMath,
      explanation: item.explanation,
      variables: [...(item.intlVariables || [])],
    });
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    const newId = `custom_${Date.now()}`;
    setEditingFormula(null);
    setModalForm({
      id: newId,
      grade: 8,
      category: "co",
      name: "",
      intlMath: "",
      vnMath: "",
      explanation: "",
      variables: [{ symbol: "F", unit: "N", name: "Lực tác dụng" }],
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!modalForm.name.trim() || !modalForm.intlMath.trim()) {
      alert("Vui lòng nhập tên công thức và biểu thức toán học!");
      return;
    }

    const payload: FormulaItem = {
      id: modalForm.id,
      grade: modalForm.grade,
      category: modalForm.category,
      name: modalForm.name.trim(),
      intlMath: modalForm.intlMath.trim(),
      vnMath: modalForm.vnMath.trim() || modalForm.intlMath.trim(),
      intlVariables: modalForm.variables,
      vnVariables: modalForm.variables,
      explanation: modalForm.explanation.trim(),
      latexCode: modalForm.intlMath.trim(),
      isCustom: true,
    };

    // Update state directly
    setFormulas((prev) => {
      const idx = prev.findIndex((f) => f.id === payload.id);
      let updated: FormulaItem[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = payload;
      } else {
        updated = [payload, ...prev];
      }
      localStorage.setItem("khtn_formulas", JSON.stringify(updated));
      return updated;
    });

    // Sync with backend API
    try {
      await fetch("http://localhost:8000/api/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // offline fallback
    }

    setIsModalOpen(false);
    showToast(
      editingFormula
        ? `✓ Đã cập nhật công thức "${payload.name}" trực tiếp trên hệ thống!`
        : `✓ Đã thêm công thức mới "${payload.name}" trực tiếp vào hệ thống!`
    );
  };

  const handleDeleteFormula = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa công thức "${name}" khỏi hệ thống?`)) return;

    setFormulas((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem("khtn_formulas", JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`http://localhost:8000/api/formulas/${id}`, { method: "DELETE" });
    } catch {
      // offline fallback
    }

    showToast(`✓ Đã xóa công thức "${name}" khỏi hệ thống!`);
  };

  const handleResetFormulas = async () => {
    if (!confirm("Khôi phục toàn bộ danh mục công thức chuẩn ISO 80000 ban đầu? Các điều chỉnh tùy biến sẽ được làm mới.")) return;

    setFormulas(DEFAULT_FORMULAS);
    localStorage.removeItem("khtn_formulas");

    try {
      await fetch("http://localhost:8000/api/formulas/reset", { method: "POST" });
    } catch {
      // offline fallback
    }

    showToast("✓ Đã khôi phục toàn bộ danh mục công thức gốc chuẩn quốc tế ISO 80000!");
  };

  // Variable management in Modal
  const handleAddVariable = () => {
    setModalForm((prev) => ({
      ...prev,
      variables: [...prev.variables, { symbol: "v", unit: "m/s", name: "Đại lượng mới" }],
    }));
  };

  const handleRemoveVariable = (index: number) => {
    setModalForm((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateVariable = (index: number, field: keyof VariableItem, val: string) => {
    setModalForm((prev) => {
      const vars = [...prev.variables];
      vars[index] = { ...vars[index], [field]: val };
      return { ...prev, variables: vars };
    });
  };

  // ================= INTERACTIVE FORMULA ADJUSTER STATE =================
  const [activeAdjuster, setActiveAdjuster] = useState<
    "ohm" | "buoyancy" | "lens" | "lever" | "density" | "custom_sandbox"
  >("ohm");

  // 1. Ohm Adjuster
  const [adjVoltage, setAdjVoltage] = useState<number>(12); // V
  const [adjResistance, setAdjResistance] = useState<number>(24); // Ohm
  const adjCurrent = adjVoltage / Math.max(0.1, adjResistance);
  const adjPower = adjVoltage * adjCurrent;

  // 2. Buoyancy Adjuster
  const [adjFluidRho, setAdjFluidRho] = useState<number>(1000); // kg/m3 (nước)
  const [adjObjRho, setAdjObjRho] = useState<number>(2700); // kg/m3 (nhôm)
  const [adjVolCm3, setAdjVolCm3] = useState<number>(150); // cm3
  const [adjSubmergePct, setAdjSubmergePct] = useState<number>(100);
  const adjVolM3 = adjVolCm3 * 1e-6;
  const adjDispM3 = adjVolM3 * (adjSubmergePct / 100);
  const adjGravity = 9.807;
  const adjWeight = adjObjRho * adjGravity * adjVolM3;
  const adjFb = adjFluidRho * adjGravity * adjDispM3;
  const adjWapp = Math.max(0, adjWeight - adjFb);
  const adjFloatState =
    adjObjRho > adjFluidRho ? "Chìm (Sink)" : adjObjRho === adjFluidRho ? "Lơ lửng (Neutral)" : "Nổi (Float)";

  // 3. Lens Adjuster
  const [adjLensF, setAdjLensF] = useState<number>(12); // cm
  const [adjLensDo, setAdjLensDo] = useState<number>(36); // cm
  const [adjLensHo, setAdjLensHo] = useState<number>(2.0); // cm
  const adjLensIsFocal = Math.abs(adjLensDo - adjLensF) < 0.1;
  const adjLensDi = adjLensIsFocal ? 99999 : (adjLensDo * adjLensF) / (adjLensDo - adjLensF);
  const adjLensM = adjLensIsFocal ? 0 : -adjLensDi / adjLensDo;
  const adjLensHi = Math.abs(adjLensM) * adjLensHo;
  const adjLensDiopter = 100 / adjLensF;

  // 4. Lever Adjuster
  const [adjLeverF1, setAdjLeverF1] = useState<number>(4); // N
  const [adjLeverD1, setAdjLeverD1] = useState<number>(0.3); // m
  const [adjLeverD2, setAdjLeverD2] = useState<number>(0.15); // m
  const adjLeverM1 = adjLeverF1 * adjLeverD1;
  const adjLeverF2 = adjLeverM1 / Math.max(0.01, adjLeverD2);
  const adjLeverMA = adjLeverD1 / adjLeverD2;

  // 5. Density Adjuster
  const [adjMassKg, setAdjMassKg] = useState<number>(0.54); // kg
  const [adjVolumeM3, setAdjVolumeM3] = useState<number>(0.0002); // m3 = 200 cm3
  const adjDensityCalc = adjMassKg / Math.max(1e-6, adjVolumeM3);
  const adjWeightCalc = adjMassKg * adjGravity;

  // 6. Custom Sandbox Adjuster (Evaluate any formula)
  const [sandboxTemplate, setSandboxTemplate] = useState<"speed" | "pressure" | "power" | "heat" | "density">("speed");
  const [sandboxInputs, setSandboxInputs] = useState<Record<string, number>>({ s: 120, t: 8 });
  const [sandboxResult, setSandboxResult] = useState<{ result: number; unit: string; latex_steps: string } | null>({
    result: 15,
    unit: "m/s",
    latex_steps: "v = \\frac{s}{t} = \\frac{120}{8} = 15.0\\text{ m/s}",
  });

  const handleSandboxCalculate = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/formulas/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formula_template: sandboxTemplate,
          inputs: sandboxInputs,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxResult(data);
        return;
      }
    } catch {
      // Local fallback calculation
    }

    // Client-side fallback
    if (sandboxTemplate === "speed") {
      const s = sandboxInputs.s ?? 0;
      const t = Math.max(0.001, sandboxInputs.t ?? 1);
      const res = s / t;
      setSandboxResult({
        result: res,
        unit: "m/s",
        latex_steps: `v = \\frac{s}{t} = \\frac{${s}}{${t}} = ${res.toFixed(2)}\\text{ m/s}`,
      });
    } else if (sandboxTemplate === "pressure") {
      const f = sandboxInputs.F ?? 0;
      const a = Math.max(0.0001, sandboxInputs.A ?? 1);
      const res = f / a;
      setSandboxResult({
        result: res,
        unit: "Pa",
        latex_steps: `p = \\frac{F}{A} = \\frac{${f}}{${a}} = ${res.toFixed(1)}\\text{ Pa}`,
      });
    } else if (sandboxTemplate === "power") {
      const u = sandboxInputs.U ?? 0;
      const i = sandboxInputs.I ?? 0;
      const res = u * i;
      setSandboxResult({
        result: res,
        unit: "W",
        latex_steps: `P = U \\cdot I = ${u} \\times ${i} = ${res.toFixed(2)}\\text{ W}`,
      });
    } else if (sandboxTemplate === "heat") {
      const m = sandboxInputs.m ?? 0;
      const c = sandboxInputs.c ?? 4200;
      const dt = sandboxInputs.delta_t ?? 0;
      const res = m * c * dt;
      setSandboxResult({
        result: res,
        unit: "J",
        latex_steps: `Q = m \\cdot c \\cdot \\Delta t = ${m} \\times ${c} \\times ${dt} = ${res.toFixed(1)}\\text{ J}`,
      });
    } else if (sandboxTemplate === "density") {
      const m = sandboxInputs.m ?? 0;
      const v = Math.max(1e-6, sandboxInputs.V ?? 1);
      const res = m / v;
      setSandboxResult({
        result: res,
        unit: "kg/m³",
        latex_steps: `\\rho = \\frac{m}{V} = \\frac{${m}}{${v}} = ${res.toFixed(1)}\\text{ kg/m}^3`,
      });
    }
  };

  const handleTemplateChange = (tpl: "speed" | "pressure" | "power" | "heat" | "density") => {
    setSandboxTemplate(tpl);
    if (tpl === "speed") {
      setSandboxInputs({ s: 120, t: 8 });
      setSandboxResult({
        result: 15,
        unit: "m/s",
        latex_steps: "v = \\frac{s}{t} = \\frac{120}{8} = 15.0\\text{ m/s}",
      });
    } else if (tpl === "pressure") {
      setSandboxInputs({ F: 500, A: 0.05 });
      setSandboxResult({
        result: 10000,
        unit: "Pa",
        latex_steps: "p = \\frac{F}{A} = \\frac{500}{0.05} = 10000.0\\text{ Pa}",
      });
    } else if (tpl === "power") {
      setSandboxInputs({ U: 220, I: 2.5 });
      setSandboxResult({
        result: 550,
        unit: "W",
        latex_steps: "P = U \\cdot I = 220 \\times 2.5 = 550.0\\text{ W}",
      });
    } else if (tpl === "heat") {
      setSandboxInputs({ m: 2.0, c: 4200, delta_t: 30 });
      setSandboxResult({
        result: 252000,
        unit: "J",
        latex_steps: "Q = m \\cdot c \\cdot \\Delta t = 2.0 \\times 4200 \\times 30 = 252000.0\\text{ J}",
      });
    } else if (tpl === "density") {
      setSandboxInputs({ m: 2.7, V: 0.001 });
      setSandboxResult({
        result: 2700,
        unit: "kg/m³",
        latex_steps: "\\rho = \\frac{m}{V} = \\frac{2.7}{0.001} = 2700.0\\text{ kg/m}^3",
      });
    }
  };

  // Copy LaTeX Helper
  const handleCopyLatex = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return formulas.filter((item) => {
      if (gradeFilter !== "all" && item.grade.toString() !== gradeFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchExp = item.explanation.toLowerCase().includes(q);
        const matchLatex = item.latexCode.toLowerCase().includes(q);
        if (!matchName && !matchExp && !matchLatex) return false;
      }
      return true;
    });
  }, [formulas, gradeFilter, categoryFilter, searchQuery]);

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                HỆ THỐNG CÔNG THỨC KHTN THCS (LỚP 6 - 9)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Quy chuẩn ISO 80000 / IUPAP &amp; SGK GDPT 2018
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Điều Chỉnh Công Thức Trực Tiếp Trên Hệ Thống</span>
              <Sparkles className="w-6 h-6 text-amber-500 hidden sm:inline" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Thực hiện chỉnh sửa, thêm mới, điều chỉnh tham số số học và giải toán từng bước trực tiếp trên hệ thống.
            </p>
          </div>

          {/* Mode Switcher & Direct Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Standard Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs">
              <button
                onClick={() => setStandardMode("intl")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  standardMode === "intl"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>Chuẩn Quốc Tế (SI)</span>
              </button>
              <button
                onClick={() => setStandardMode("vn")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  standardMode === "vn"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ký Hiệu SGK VN</span>
              </button>
            </div>

            {/* Direct Create Formula Button */}
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm Công Thức Mới</span>
            </button>

            {/* Reset All Formulas Button */}
            <button
              onClick={handleResetFormulas}
              title="Khôi phục danh mục công thức chuẩn ISO ban đầu"
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 text-xs font-bold transition-all shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= INTERACTIVE FORMULA ADJUSTER COMPONENT ================= */}
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Bộ Điều Chỉnh Biến Số &amp; Tính Toán Trực Tuyến</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                    Interactive Calculator
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Nhập số hoặc kéo thanh trượt để hệ thống thế số và giải ra kết quả tức thì với các bước giải KaTeX.
                </p>
              </div>
            </div>

            {/* Select active adjuster formula */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveAdjuster("ohm")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "ohm"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Định luật Ohm</span>
              </button>
              <button
                onClick={() => setActiveAdjuster("buoyancy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "buoyancy"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Lực Ác-si-mét</span>
              </button>
              <button
                onClick={() => setActiveAdjuster("lens")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "lens"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Thấu kính mỏng</span>
              </button>
              <button
                onClick={() => setActiveAdjuster("lever")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "lever"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Đòn bẩy &amp; Lực</span>
              </button>
              <button
                onClick={() => setActiveAdjuster("density")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "density"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Khối lượng riêng</span>
              </button>
              <button
                onClick={() => setActiveAdjuster("custom_sandbox")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAdjuster === "custom_sandbox"
                    ? "bg-white dark:bg-slate-900 text-amber-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Tự nhập &amp; Giải</span>
              </button>
            </div>
          </div>

          {/* 1. OHM ADJUSTER */}
          {activeAdjuster === "ohm" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">
                      Hiệu điện thế giữa hai đầu mạch (U):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="250"
                        step="0.5"
                        value={adjVoltage}
                        onChange={(e) => setAdjVoltage(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right focus:outline-emerald-500"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">V</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="220"
                    step="1"
                    value={adjVoltage}
                    onChange={(e) => setAdjVoltage(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>1 V (Pin)</span>
                    <span>12 V (Ắc quy)</span>
                    <span>110 V</span>
                    <span>220 V (Lưới điện)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">
                      Điện trở của đoạn mạch (R):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0.5"
                        max="1000"
                        step="1"
                        value={adjResistance}
                        onChange={(e) => setAdjResistance(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right focus:outline-emerald-500"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">Ω</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={adjResistance}
                    onChange={(e) => setAdjResistance(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>1 Ω</span>
                    <span>25 Ω</span>
                    <span>50 Ω</span>
                    <span>100 Ω</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Biểu thức định luật:</span>
                  <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                    <MathView math="I = \frac{U}{R}, \quad P = U \cdot I" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Cường độ dòng điện (I)</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {adjCurrent.toFixed(3)} A
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      = {(adjCurrent * 1000).toFixed(0)} mA
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Công suất tiêu thụ (P)</div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                      {adjPower.toFixed(2)} W
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Nhiệt trong 1p: {(adjPower * 60).toFixed(0)} J
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs text-xs font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-500 font-bold">Thế số chuẩn SI:</div>
                  <div>
                    <MathView math={`I = \\frac{${adjVoltage}\\text{ V}}{${adjResistance}\\text{ }\\Omega} = ${adjCurrent.toFixed(3)}\\text{ A}`} />
                  </div>
                  <div>
                    <MathView math={`P = ${adjVoltage}\\text{ V} \\times ${adjCurrent.toFixed(3)}\\text{ A} = ${adjPower.toFixed(2)}\\text{ W}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BUOYANCY ADJUSTER */}
          {activeAdjuster === "buoyancy" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      Khối lượng riêng chất lỏng (ρ_fluid):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="500"
                        max="2000"
                        step="10"
                        value={adjFluidRho}
                        onChange={(e) => setAdjFluidRho(Math.max(100, parseFloat(e.target.value) || 100))}
                        className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right focus:outline-emerald-500"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">kg/m³</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="1400"
                    step="10"
                    value={adjFluidRho}
                    onChange={(e) => setAdjFluidRho(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>800 (Dầu)</span>
                    <span>1000 (Nước ngọt)</span>
                    <span>1030 (Nước biển)</span>
                    <span>1260 (Glycerin)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      Khối lượng riêng của vật (ρ_obj):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="100"
                        max="12000"
                        step="50"
                        value={adjObjRho}
                        onChange={(e) => setAdjObjRho(Math.max(10, parseFloat(e.target.value) || 10))}
                        className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right focus:outline-emerald-500"
                      />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">kg/m³</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="8000"
                    step="50"
                    value={adjObjRho}
                    onChange={(e) => setAdjObjRho(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>600 (Gỗ)</span>
                    <span>920 (Băng)</span>
                    <span>2700 (Nhôm)</span>
                    <span>7800 (Sắt)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>Thể tích vật:</span>
                      <span className="text-emerald-600 font-mono">{adjVolCm3} cm³</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={adjVolCm3}
                      onChange={(e) => setAdjVolCm3(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>Tỉ lệ ngập:</span>
                      <span className="text-emerald-600 font-mono">{adjSubmergePct}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={adjSubmergePct}
                      onChange={(e) => setAdjSubmergePct(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Trạng thái vật:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      adjObjRho > adjFluidRho
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {adjFloatState}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Trọng lượng (W)</div>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
                      {adjWeight.toFixed(3)} N
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Lực đẩy (F_b)</div>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {adjFb.toFixed(3)} N
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Lực kế (W_app)</div>
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      {adjWapp.toFixed(3)} N
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs text-[11px] font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-500 font-bold">Thế số chuẩn SI:</div>
                  <div>
                    <MathView math={`F_{\\text{b}} = \\rho \\cdot g \\cdot V_{\\text{disp}} = ${adjFluidRho} \\times 9.807 \\times ${adjDispM3.toFixed(6)} = ${adjFb.toFixed(3)}\\text{ N}`} />
                  </div>
                  <div>
                    <MathView math={`W_{\\text{app}} = W - F_{\\text{b}} = ${adjWeight.toFixed(3)} - ${adjFb.toFixed(3)} = ${adjWapp.toFixed(3)}\\text{ N}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. LENS ADJUSTER */}
          {activeAdjuster === "lens" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Tiêu cự thấu kính (f):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="5"
                        max="50"
                        step="1"
                        value={adjLensF}
                        onChange={(e) => setAdjLensF(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right"
                      />
                      <span className="text-emerald-600 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="1"
                    value={adjLensF}
                    onChange={(e) => setAdjLensF(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">Khoảng cách từ vật đến thấu kính (d_o):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="1"
                        value={adjLensDo}
                        onChange={(e) => setAdjLensDo(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right"
                      />
                      <span className="text-emerald-600 font-mono">cm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={adjLensDo}
                    onChange={(e) => setAdjLensDo(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>Trong tiêu cự (d &lt; f)</span>
                    <span>Tiêu điểm (d = f)</span>
                    <span>2f = {adjLensF * 2} cm</span>
                    <span>Xa vô cực</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Chiều cao vật (h_o):</span>
                    <span className="text-emerald-600 font-mono">{adjLensHo.toFixed(1)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={adjLensHo}
                    onChange={(e) => setAdjLensHo(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Tính chất của ảnh:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      adjLensIsFocal
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : adjLensDi > 0
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    }`}
                  >
                    {adjLensIsFocal
                      ? "Ảnh ở vô cực"
                      : adjLensDi > 0
                      ? "Ảnh thật, ngược chiều"
                      : "Ảnh ảo, cùng chiều"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Khoảng cách ảnh (d_i)</div>
                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {adjLensIsFocal ? "∞" : `${adjLensDi.toFixed(1)} cm`}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Độ phóng đại (m)</div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                      {adjLensIsFocal ? "∞" : `${adjLensM.toFixed(2)}×`}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold">Độ tụ (D)</div>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      +{adjLensDiopter.toFixed(1)} dp
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs text-[11px] font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-500 font-bold">Thế số phương trình thấu kính:</div>
                  <div>
                    <MathView
                      math={
                        adjLensIsFocal
                          ? "d_{\\text{i}} \\to \\infty"
                          : `d_{\\text{i}} = \\frac{d_{\\text{o}} \\cdot f}{d_{\\text{o}} - f} = \\frac{${adjLensDo} \\times ${adjLensF}}{${adjLensDo} - ${adjLensF}} = ${adjLensDi.toFixed(1)}\\text{ cm}`
                      }
                    />
                  </div>
                  <div>
                    <MathView
                      math={`h_{\\text{i}} = |m| \\cdot h_{\\text{o}} = ${Math.abs(adjLensM).toFixed(2)} \\times ${adjLensHo.toFixed(1)} = ${adjLensHi.toFixed(2)}\\text{ cm}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. LEVER ADJUSTER */}
          {activeAdjuster === "lever" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Lực tác dụng đầu 1 (F1):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0.5"
                        max="100"
                        step="0.5"
                        value={adjLeverF1}
                        onChange={(e) => setAdjLeverF1(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right"
                      />
                      <span className="text-emerald-600 font-mono">N</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={adjLeverF1}
                    onChange={(e) => setAdjLeverF1(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Cánh tay đòn d1 (từ điểm tựa đến F1):</span>
                    <span className="text-emerald-600 font-mono">{adjLeverD1.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={adjLeverD1}
                    onChange={(e) => setAdjLeverD1(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Cánh tay đòn d2 (từ điểm tựa đến tải F2):</span>
                    <span className="text-emerald-600 font-mono">{adjLeverD2.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={adjLeverD2}
                    onChange={(e) => setAdjLeverD2(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Quy tắc thăng bằng đòn bẩy:</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                    F1 · d1 = F2 · d2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Lực nâng vật F2</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {adjLeverF2.toFixed(2)} N
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Lợi thế cơ học (MA)</div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                      {adjLeverMA.toFixed(2)}×
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs text-xs font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-500 font-bold">Thế số chuẩn SI:</div>
                  <div>
                    <MathView math={`F_2 = \\frac{F_1 \\cdot d_1}{d_2} = \\frac{${adjLeverF1} \\times ${adjLeverD1.toFixed(2)}}{${adjLeverD2.toFixed(2)}} = ${adjLeverF2.toFixed(2)}\\text{ N}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. DENSITY ADJUSTER */}
          {activeAdjuster === "density" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Khối lượng vật (m):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0.01"
                        max="100"
                        step="0.05"
                        value={adjMassKg}
                        onChange={(e) => setAdjMassKg(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                        className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-right"
                      />
                      <span className="text-emerald-600 font-mono">kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="5.0"
                    step="0.05"
                    value={adjMassKg}
                    onChange={(e) => setAdjMassKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Thể tích vật:</span>
                    <span className="text-emerald-600 font-mono">
                      {(adjVolumeM3 * 1e6).toFixed(0)} cm³ = {adjVolumeM3.toFixed(5)} m³
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={adjVolumeM3 * 1e6}
                    onChange={(e) => setAdjVolumeM3(parseFloat(e.target.value) * 1e-6)}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Khối lượng riêng (ρ)</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {adjDensityCalc.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-slate-400">kg/m³</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <div className="text-[11px] font-bold text-slate-500">Trọng lượng (W)</div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      {adjWeightCalc.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">N (với g = 9.807 N/kg)</div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs text-xs font-mono space-y-1 overflow-x-auto">
                  <div className="text-slate-500 font-bold">Thế số chuẩn SI:</div>
                  <div>
                    <MathView math={`\\rho = \\frac{m}{V} = \\frac{${adjMassKg.toFixed(2)}}{${adjVolumeM3}} = ${adjDensityCalc.toFixed(1)}\\text{ kg/m}^3`} />
                  </div>
                  <div>
                    <MathView math={`W = m \\cdot g = ${adjMassKg.toFixed(2)} \\times 9.807 = ${adjWeightCalc.toFixed(2)}\\text{ N}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. CUSTOM SANDBOX ADJUSTER */}
          {activeAdjuster === "custom_sandbox" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Chọn công thức vật lý muốn giải:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: "speed", label: "Tốc độ (v = s/t)" },
                      { id: "pressure", label: "Áp suất (p = F/A)" },
                      { id: "power", label: "Công suất (P = U·I)" },
                      { id: "heat", label: "Nhiệt (Q = mcΔt)" },
                      { id: "density", label: "K.lượng riêng (ρ=m/V)" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id as any)}
                        className={`p-2 rounded-xl text-center text-xs font-bold border transition-all ${
                          sandboxTemplate === t.id
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Inputs according to template */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nhập các giá trị đại lượng:
                  </div>

                  {sandboxTemplate === "speed" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Quãng đường s (m):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.s ?? 120}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, s: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Thời gian t (s):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.t ?? 8}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, t: parseFloat(e.target.value) || 1 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {sandboxTemplate === "pressure" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Áp lực F (N):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.F ?? 500}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, F: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Diện tích mặt ép A (m²):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.A ?? 0.05}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, A: parseFloat(e.target.value) || 0.01 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {sandboxTemplate === "power" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Hiệu điện thế U (V):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.U ?? 220}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, U: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Cường độ dòng điện I (A):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.I ?? 2.5}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, I: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {sandboxTemplate === "heat" && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Khối lượng m (kg):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.m ?? 2.0}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, m: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Nhiệt dung riêng c (J/kg·K):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.c ?? 4200}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, c: parseFloat(e.target.value) || 4200 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Độ tăng nhiệt Δt (°C):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.delta_t ?? 30}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, delta_t: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {sandboxTemplate === "density" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Khối lượng m (kg):
                        </label>
                        <input
                          type="number"
                          value={sandboxInputs.m ?? 2.7}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, m: parseFloat(e.target.value) || 0 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Thể tích V (m³):
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={sandboxInputs.V ?? 0.001}
                          onChange={(e) =>
                            setSandboxInputs((prev) => ({ ...prev, V: parseFloat(e.target.value) || 0.001 }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSandboxCalculate}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all mt-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Giải &amp; Tính Toán Trực Tiếp Trên Hệ Thống</span>
                  </button>
                </div>
              </div>

              {/* Solution Preview */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Kết quả tính toán thời gian thực:</span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
                    System Solver
                  </span>
                </div>

                {sandboxResult && (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                      <div className="text-xs font-bold text-slate-500">Giá trị tính được</div>
                      <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                        {sandboxResult.result.toLocaleString()} {sandboxResult.unit}
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xs space-y-2">
                      <div className="text-xs font-bold text-slate-500 font-mono">
                        Lời giải và các bước thế số chi tiết:
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm text-center">
                        <MathView math={sandboxResult.latex_steps} block />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================= SEARCH & FILTER STRIP ================= */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm công thức (ôm, thấu kính, lực đẩy, đòn bẩy, tốc độ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Grade filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-bold">
              {[
                { id: "all", label: "Tất cả các lớp" },
                { id: "6", label: "Lớp 6 — Lực, lò xo & năng lượng" },
                { id: "7", label: "Lớp 7 — Âm thanh & ánh sáng" },
                { id: "8", label: "Lớp 8 — Khối lượng riêng, áp suất, lực đẩy, điện & nhiệt" },
                { id: "9", label: "Lớp 9 — Cơ năng, quang học & điện" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGradeFilter(g.id)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    gradeFilter === g.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs"
            >
              <option value="all">Tất cả phân môn</option>
              <option value="co">Cơ học &amp; Thủy tĩnh</option>
              <option value="dien">Điện học &amp; Mạch điện</option>
              <option value="quang">Quang hình học</option>
              <option value="am">Sóng âm &amp; Âm thanh</option>
              <option value="nhiet">Nhiệt học</option>
            </select>
          </div>
        </section>

        {/* ================= FORMULA CARDS GRID WITH DIRECT EDIT / DELETE ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFormulas.map((item) => {
            const activeVariables = standardMode === "intl" ? item.intlVariables : item.vnVariables;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        Lớp {item.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 uppercase">
                        {item.category === "co"
                          ? "Cơ học"
                          : item.category === "dien"
                          ? "Điện học"
                          : item.category === "quang"
                          ? "Quang học"
                          : item.category === "am"
                          ? "Âm học"
                          : "Nhiệt học"}
                      </span>
                      {item.isCustom && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                          Tùy biến
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Direct Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        title="Chỉnh sửa công thức trực tiếp"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Copy LaTeX Button */}
                      <button
                        onClick={() => handleCopyLatex(item.id, item.latexCode)}
                        title="Sao chép mã LaTeX"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete Button (if custom) */}
                      {item.isCustom && (
                        <button
                          onClick={() => handleDeleteFormula(item.id, item.name)}
                          title="Xóa công thức tùy biến"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>

                  {/* KaTeX Formula Box */}
                  <div className="py-3 px-2 rounded-xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center shadow-2xs overflow-x-auto max-w-full">
                    <MathView math={standardMode === "intl" ? item.intlMath : item.vnMath} block />
                  </div>

                  {/* Clean Variable explanations without Diacritics inside MathView */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-300">Ký hiệu đại lượng:</div>
                    <ul className="space-y-0.5">
                      {activeVariables && activeVariables.length > 0 ? (
                        activeVariables.map((v, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              <MathView math={v.symbol} />
                            </span>
                            <span className="text-slate-400">({v.unit}):</span>
                            <span>{v.name}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">Chưa có danh sách đại lượng.</li>
                      )}
                    </ul>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {item.explanation}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Điều chỉnh công thức</span>
                  </button>

                  <Link
                    href="/lab"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <span>Vào Lab ảo</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>

        {filteredFormulas.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            Không tìm thấy công thức nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;. Vui lòng thử từ khóa khác hoặc bấm &ldquo;+ Thêm công thức mới&rdquo;.
          </div>
        )}
      </div>

      {/* ================= DIRECT FORMULA EDIT / CREATE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingFormula ? "Điều Chỉnh Công Thức Trực Tiếp" : "Thêm Công Thức Mới Vào Hệ Thống"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cập nhật trực tiếp lên hệ thống và hiển thị thời gian thực với KaTeX.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="flex flex-col gap-4 text-xs font-medium">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Tên công thức / Định luật:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Định luật bảo toàn cơ năng..."
                  value={modalForm.name}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Khối lớp:</label>
                  <select
                    value={modalForm.grade}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, grade: parseInt(e.target.value) as any }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value={6}>Lớp 6</option>
                    <option value={7}>Lớp 7</option>
                    <option value={8}>Lớp 8</option>
                    <option value={9}>Lớp 9</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Phân môn:</label>
                  <select
                    value={modalForm.category}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, category: e.target.value as any }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="co">Cơ học &amp; Thủy tĩnh</option>
                    <option value="dien">Điện học &amp; Mạch điện</option>
                    <option value="quang">Quang hình học</option>
                    <option value="am">Sóng âm &amp; Âm thanh</option>
                    <option value="nhiet">Nhiệt học</option>
                  </select>
                </div>
              </div>

              {/* LaTeX Intl Math */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Biểu thức Chuẩn Quốc Tế ISO / SI (mã LaTeX):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: \rho = \frac{m}{V}"
                  value={modalForm.intlMath}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, intlMath: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono focus:border-emerald-500 focus:outline-none"
                />
                {modalForm.intlMath.trim() && (
                  <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono">
                    <span className="text-[10px] text-slate-400 block mb-1">Xem trước trực tiếp:</span>
                    <MathView math={modalForm.intlMath} block />
                  </div>
                )}
              </div>

              {/* LaTeX VN Math */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Biểu thức SGK GDPT 2018 (Việt Nam) (mã LaTeX):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: D = \frac{m}{V}"
                  value={modalForm.vnMath}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, vnMath: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Variables Management */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 dark:text-slate-300 font-bold">
                    Danh sách đại lượng &amp; đơn vị đo:
                  </label>
                  <button
                    onClick={handleAddVariable}
                    className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 transition-colors"
                  >
                    + Thêm đại lượng
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto p-1">
                  {modalForm.variables.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ký hiệu (\rho, m...)"
                        value={v.symbol}
                        onChange={(e) => handleUpdateVariable(idx, "symbol", e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Đơn vị (kg/m³, N...)"
                        value={v.unit}
                        onChange={(e) => handleUpdateVariable(idx, "unit", e.target.value)}
                        className="w-28 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Tên đại lượng & ý nghĩa"
                        value={v.name}
                        onChange={(e) => handleUpdateVariable(idx, "name", e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium"
                      />
                      <button
                        onClick={() => handleRemoveVariable(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Giải thích định luật &amp; ý nghĩa vật lý:
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập giải thích chi tiết, ý nghĩa, điều kiện áp dụng..."
                  value={modalForm.explanation}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, explanation: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Trực Tiếp Vào Hệ Thống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
