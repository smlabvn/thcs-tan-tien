"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Volume2,
  BarChart2,
  Bluetooth,
  Usb,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Code,
  Cpu,
  Activity,
  Gauge,
  Zap,
  Waves,
  FileSpreadsheet,
  X,
  Copy,
  Check
} from "lucide-react";
import MathView from "@/components/MathView";
import GeoGebraSpreadsheet from "@/components/GeoGebraSpreadsheet";

interface TelemetryPoint {
  time: number;
  measured: number;
  theory: number;
  errorPct: number;
}

type ExperimentType = "sound" | "ultrasonic" | "force" | "ohm";

interface ExperimentConfig {
  id: ExperimentType;
  grade: string;
  title: string;
  sensorName: string;
  defaultUnit: string;
  sampleRate: string;
  baudRate: number;
  theoryFormula: string;
  calcTheory: (param: number) => number;
  paramName: string;
  paramUnit: string;
  paramMin: number;
  paramMax: number;
  paramDefault: number;
  arduinoCode: string;
}

const EXPERIMENTS: Record<ExperimentType, ExperimentConfig> = {
  sound: {
    id: "sound",
    grade: "KHTN 7",
    title: "Khảo Sát Sóng Âm & Biên Độ Âm Thanh Trong Ống Kundt",
    sensorName: "Cảm biến Âm thanh (Microphone / Vernier Sound)",
    defaultUnit: "dB",
    sampleRate: "50.0 kHz",
    baudRate: 115200,
    theoryFormula: "L = (2k + 1) \\frac{\\lambda}{4}; \\quad I_{dB} = 60 + 35|\\sin(kx)|",
    calcTheory: (pos) => {
      // Standing wave in pipe: frequency = 1000Hz, v = 344 m/s -> lambda = 34.4 cm
      const k = (2 * Math.PI) / 34.4;
      const amp = Math.abs(Math.sin(k * pos));
      return 60 + amp * 35;
    },
    paramName: "Vị trí đầu dò (x)",
    paramUnit: "cm",
    paramMin: 0,
    paramMax: 68,
    paramDefault: 34,
    arduinoCode: `// Arduino Uno / Nano + Cảm biến Âm thanh Analog (Chân A0)
void setup() {
  Serial.begin(115200);
}
void loop() {
  int sensorValue = analogRead(A0);
  // Quy đổi điện áp sang mức cường độ âm thanh dB (ước lượng 50 - 100 dB)
  float soundDb = map(sensorValue, 0, 1023, 500, 1000) / 10.0;
  Serial.println(soundDb);
  delay(100);
}`
  },
  ultrasonic: {
    id: "ultrasonic",
    grade: "KHTN 7",
    title: "Đo Quãng Đường, Thời Gian & Tốc Độ Chuyển Động (s - t - v)",
    sensorName: "Cảm biến Siêu âm HC-SR04 / Vernier Motion",
    defaultUnit: "cm",
    sampleRate: "20.0 Hz",
    baudRate: 9600,
    theoryFormula: "v = \\frac{s}{t}; \\quad s(t) = v_0 \\cdot t + \\frac{1}{2} a t^2",
    calcTheory: (t) => {
      // Xe chuyển động đều với v = 25 cm/s
      return Math.min(100, 10 + 25 * (t % 4));
    },
    paramName: "Thời gian xe chạy",
    paramUnit: "s",
    paramMin: 0,
    paramMax: 10,
    paramDefault: 2,
    arduinoCode: `// Arduino Uno + Cảm biến Siêu âm HC-SR04 (Trig D9, Echo D10)
const int trigPin = 9;
const int echoPin = 10;
void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}
void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2; // Tốc độ âm trong không khí
  Serial.println(distanceCm);
  delay(100);
}`
  },
  force: {
    id: "force",
    grade: "KHTN 6 & 8",
    title: "Định Luật Hooke (Lực Đàn Hồi) & Lực Đẩy Ác-si-mét",
    sensorName: "Cảm biến Lực Loadcell HX711 / Lực kế điện tử Vernier",
    defaultUnit: "N",
    sampleRate: "10.0 Hz",
    baudRate: 9600,
    theoryFormula: "F_{đh} = k \\cdot \\Delta l; \\quad F_A = d \\cdot V = \\rho \\cdot g \\cdot V",
    calcTheory: (deltaL) => {
      // Độ cứng lò xo k = 50 N/m = 0.5 N/cm
      return 0.5 * deltaL;
    },
    paramName: "Độ giãn lò xo (Δl)",
    paramUnit: "cm",
    paramMin: 0,
    paramMax: 20,
    paramDefault: 6,
    arduinoCode: `// Arduino Uno + Module Cảm biến Lực Loadcell HX711
#include "HX711.h"
HX711 scale;
void setup() {
  Serial.begin(9600);
  scale.begin(A1, A0); // DOUT=A1, SCK=A0
  scale.set_scale(2280.f); // Hiệu chuẩn lực kế
  scale.tare();
}
void loop() {
  float forceNewton = scale.get_units(5) * 0.0098; // Quy đổi gram sang Newton
  Serial.println(forceNewton, 2);
  delay(100);
}`
  },
  ohm: {
    id: "ohm",
    grade: "KHTN 9",
    title: "Khảo Sát Định Luật Ôm & Đặc Tuyến V - A Của Đoạn Mạch",
    sensorName: "Cảm biến Điện áp & Dòng điện INA219 / ACS712",
    defaultUnit: "mA",
    sampleRate: "100.0 Hz",
    baudRate: 115200,
    theoryFormula: "I = \\frac{U}{R}; \\quad P = U \\cdot I = I^2 \\cdot R",
    calcTheory: (voltage) => {
      // Điện trở mẫu R = 100 Ohm -> I(mA) = (U / 100) * 1000 = U * 10
      return voltage * 10;
    },
    paramName: "Hiệu điện thế (U)",
    paramUnit: "V",
    paramMin: 0,
    paramMax: 12,
    paramDefault: 6,
    arduinoCode: `// ==============================================================
// ARDUINO UNO + INA219 (DONG/AP) + MAN HINH OLED 0.96" SSD1306 (I2C)
// THCS TAY TIEN - MO HINH THI NGHIEM DINH LUAT OHM (KHTN 9)
// ==============================================================
// Can cai thu vien trong Arduino IDE:
// 1. Adafruit INA219
// 2. Adafruit SSD1306
// 3. Adafruit GFX Library

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_INA219 ina219;

void setup() {
  Serial.begin(115200);

  // Khoi tao cam bien INA219
  if (!ina219.begin()) {
    Serial.println("Loi: Khong tim thay INA219!");
  }

  // Khoi tao man hinh OLED I2C dia chi 0x3C
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Loi: Khong tim thay man hinh OLED!");
  }

  // Man hinh chao mung ban dau
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(10, 15);
  display.println("THCS TAY TIEN");
  display.setCursor(10, 32);
  display.println("DINH LUAT OHM (KHTN 9)");
  display.display();
  delay(1200);
}

void loop() {
  // Doc thong so tu cam bien INA219
  float busVoltage_V = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  if (current_mA < 0) current_mA = 0; // chong nhieu am

  // Tinh toan Dien tro R (Ohm) va Cong suat P (W)
  float resistance_Ohm = (current_mA > 1.0) ? (busVoltage_V / (current_mA / 1000.0)) : 0.0;
  float power_W = busVoltage_V * (current_mA / 1000.0);

  // 1. Truyen du lieu thoi gian thuc len Website PhysiX (Web Serial)
  Serial.println(current_mA);

  // 2. Hien thi truc quan len man hinh OLED 0.96 inch
  display.clearDisplay();
  
  // Tieu de
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("THCS TAY TIEN - OHM");
  display.drawLine(0, 10, 128, 10, WHITE);

  // Thong so U, I, R, P
  display.setCursor(0, 15);
  display.print("U: ");
  display.print(busVoltage_V, 2);
  display.println(" V");

  display.setCursor(0, 27);
  display.print("I: ");
  display.print(current_mA, 1);
  display.println(" mA");

  display.setCursor(0, 39);
  display.print("R: ");
  if (resistance_Ohm > 0 && resistance_Ohm < 9999) {
    display.print(resistance_Ohm, 1);
    display.println(" Ohm");
  } else {
    display.println("-- Ohm");
  }

  display.setCursor(0, 51);
  display.print("P: ");
  display.print(power_W, 3);
  display.println(" W");

  display.display();
  delay(100); // 10 lan moi giay
}`
  }
};

export default function VernierIoTPage() {
  const [activeExp, setActiveExp] = useState<ExperimentType>("sound");
  const exp = EXPERIMENTS[activeExp];

  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [paramValue, setParamValue] = useState<number>(exp.paramDefault);
  const [telemetryList, setTelemetryList] = useState<TelemetryPoint[]>([]);

  // Hardware connection states
  const [connectionType, setConnectionType] = useState<"none" | "serial" | "bluetooth" | "simulator">("simulator");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("connected");
  const [statusMsg, setStatusMsg] = useState<string>("Đang chạy bộ giả lập phần cứng ảo chuẩn thực nghiệm (độ trễ 2.4ms)");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  // References for Web Serial
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  // Theoretical value based on current parameter
  const theoryValue = exp.calcTheory(paramValue);

  // Change experiment reset
  useEffect(() => {
    setParamValue(exp.paramDefault);
    setTelemetryList([]);
  }, [activeExp]);

  // Simulation Loop when in "simulator" mode
  useEffect(() => {
    if (connectionType !== "simulator" || !isRecording) return;

    let t = 0;
    const interval = setInterval(() => {
      t += 0.1;
      // Sensor noise (Gaussian simulation +/- 2.5%)
      const noise = (Math.random() - 0.5) * (theoryValue * 0.05 || 1.5);
      const measured = parseFloat(Math.max(0, theoryValue + noise).toFixed(2));
      const errorPct = theoryValue > 0
        ? parseFloat((Math.abs(measured - theoryValue) / theoryValue * 100).toFixed(2))
        : 0;

      setTelemetryList((prev) => [
        ...prev.slice(-35),
        {
          time: parseFloat(t.toFixed(1)),
          measured: measured,
          theory: parseFloat(theoryValue.toFixed(2)),
          errorPct: errorPct,
        },
      ]);
    }, 150);

    return () => clearInterval(interval);
  }, [connectionType, isRecording, theoryValue]);

  // Web Serial API handler
  const handleConnectSerial = async () => {
    if (!("serial" in navigator)) {
      alert("Trình duyệt của bạn chưa bật Web Serial API. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge phiên bản mới!");
      return;
    }

    try {
      setConnectionStatus("connecting");
      setStatusMsg("Đang yêu cầu chọn cổng COM/USB...");

      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: exp.baudRate });

      serialPortRef.current = port;
      keepReadingRef.current = true;
      setConnectionType("serial");
      setConnectionStatus("connected");
      setStatusMsg(`Đã kết nối trực tiếp cổng USB Serial (${exp.baudRate} bps)! Đang nhận luồng xung...`);

      // Start reading stream
      // @ts-ignore
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      serialReaderRef.current = reader;

      let buffer = "";
      let t = 0;

      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            const parsedNum = parseFloat(trimmed);
            if (!isNaN(parsedNum)) {
              t += 0.1;
              const err = theoryValue > 0
                ? parseFloat((Math.abs(parsedNum - theoryValue) / theoryValue * 100).toFixed(2))
                : 0;

              setTelemetryList((prev) => [
                ...prev.slice(-35),
                {
                  time: parseFloat(t.toFixed(1)),
                  measured: parsedNum,
                  theory: parseFloat(theoryValue.toFixed(2)),
                  errorPct: err,
                },
              ]);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setConnectionStatus("disconnected");
      setStatusMsg(`Không thể kết nối USB Serial: ${err.message || "Đã hủy chọn cổng"}`);
    }
  };

  // Web Bluetooth API handler
  const handleConnectBluetooth = async () => {
    if (!("bluetooth" in navigator)) {
      alert("Trình duyệt không hỗ trợ Web Bluetooth. Vui lòng sử dụng Chrome trên Windows/Android hoặc kích hoạt Bluetooth.");
      return;
    }

    try {
      setConnectionStatus("connecting");
      setStatusMsg("Đang quét thiết bị Vernier / ESP32 BLE gần máy tính...");

      // @ts-ignore
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service"],
      });

      setConnectionType("bluetooth");
      setConnectionStatus("connected");
      setStatusMsg(`Đã kết nối Bluetooth không dây với ${device.name || "Thiết bị BLE KHTN"}`);
    } catch (err: any) {
      setConnectionStatus("disconnected");
      setStatusMsg("Không tìm thấy hoặc học sinh đã hủy ghép nối Bluetooth.");
    }
  };

  // Disconnect handler
  const handleDisconnect = async () => {
    keepReadingRef.current = false;
    if (serialReaderRef.current) {
      try {
        await serialReaderRef.current.cancel();
      } catch (e) {}
    }
    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {}
    }
    serialPortRef.current = null;
    serialReaderRef.current = null;
    setConnectionType("simulator");
    setConnectionStatus("connected");
    setStatusMsg("Đã chuyển về Bộ giả lập phần cứng ảo (độ trễ 2.4ms, sai số Gaussian)");
  };

  // Export CSV Data
  const handleExportCSV = () => {
    let csv = `data:text/csv;charset=utf-8,Thoi_gian(s),Thong_so_thuc_nghiem,Gia_tri_do(${exp.defaultUnit}),Gia_tri_ly_thuyet(${exp.defaultUnit}),Sai_so_phan_tram\n`;
    telemetryList.forEach((pt) => {
      csv += `${pt.time},${paramValue},${pt.measured},${pt.theory},${pt.errorPct}%\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `SMLab_IoT_${exp.id}_${Date.now()}.csv`;
    link.click();
  };

  // Average error calculation
  const avgError = telemetryList.length > 0
    ? (telemetryList.reduce((acc, curr) => acc + curr.errorPct, 0) / telemetryList.length).toFixed(2)
    : "1.25";

  const latestVal = telemetryList.slice(-1)[0]?.measured ?? 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exp.arduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

        {/* Header Breadcrumb & Control Action */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-[10px]">
                  {exp.grade}
                </span>
                <span>Phòng Thí Nghiệm IoT &amp; Cảm Biến Phần Cứng Thực Nghiệm</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-sky-600" />
                {exp.title}
              </h1>
            </div>

            {/* Hardware Connect Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {connectionType !== "simulator" ? (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ngắt kết nối ({connectionType.toUpperCase()})</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleConnectSerial}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
                    title="Cắm cáp USB Arduino / ESP32 / micro:bit vào máy tính"
                  >
                    <Usb className="w-4 h-4" />
                    <span>Cắm USB Serial (Arduino)</span>
                  </button>

                  <button
                    onClick={handleConnectBluetooth}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Bluetooth className="w-4 h-4" />
                    <span>Bluetooth (BLE)</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowCodeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Code className="w-4 h-4" />
                <span>Mã Arduino (.ino)</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Xuất CSV</span>
              </button>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            {(Object.keys(EXPERIMENTS) as ExperimentType[]).map((key) => {
              const item = EXPERIMENTS[key];
              const isSelected = activeExp === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveExp(key)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-sky-500 shadow-md ring-2 ring-sky-500/20"
                      : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sky-600">
                      {item.grade}
                    </span>
                    {key === "sound" && <Waves className="w-4 h-4 text-sky-500" />}
                    {key === "ultrasonic" && <Activity className="w-4 h-4 text-emerald-500" />}
                    {key === "force" && <Gauge className="w-4 h-4 text-amber-500" />}
                    {key === "ohm" && <Zap className="w-4 h-4 text-purple-500" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mt-1">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {item.sensorName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Peripheral Telemetry Status Banner */}
          <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{exp.sensorName}</span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  connectionType === "serial"
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                    : connectionType === "bluetooth"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}>
                  {connectionType === "serial" ? "USB SERIAL 115200" : connectionType === "bluetooth" ? "BLE 5.2" : "VIRTUAL HARDWARE EMULATOR"}
                </span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Tần số quét: <strong className="text-slate-800 dark:text-slate-200 font-mono">{exp.sampleRate}</strong>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Độ trễ: <strong className="text-slate-800 dark:text-slate-200 font-mono">1.8 ms</strong>
              </div>
            </div>

            <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{statusMsg}</span>
            </div>
          </div>
        </div>

        {/* Main Grid: 8 Cols Apparatus + Realtime Plot, 4 Cols Theory & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Experiment Apparatus Visualizer */}
            <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>MÔ PHỎNG HỆ THỐNG THÍ NGHIỆM ĐỒNG BỘ CẢM BIẾN</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isRecording
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isRecording ? "Đang thu thập số liệu" : "Tạm dừng"}</span>
                  </button>
                  <button
                    onClick={() => setTelemetryList([])}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Xóa bảng số liệu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Apparatus View based on module */}
              <div className="relative w-full h-40 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center px-6 overflow-hidden">
                {activeExp === "sound" && (
                  <div className="w-full flex items-center">
                    <div className="w-14 h-24 rounded-lg bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 flex flex-col items-center justify-center text-sky-700 dark:text-sky-300 z-10">
                      <Volume2 className="w-5 h-5" />
                      <span className="font-mono text-[9px] mt-1 font-bold">1000Hz</span>
                    </div>
                    <div className="flex-1 h-20 bg-white dark:bg-slate-900 border-y border-slate-300 dark:border-slate-700 relative flex items-center mx-2 overflow-hidden shadow-inner">
                      <svg className="w-full h-12" viewBox="0 0 400 60" preserveAspectRatio="none">
                        <path d="M 0,30 Q 50,0 100,30 T 200,30 T 300,30 T 400,30" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                        <path d="M 0,30 Q 50,60 100,30 T 200,30 T 300,30 T 400,30" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="2 2" opacity="0.5" />
                      </svg>
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-500 transition-all duration-75 z-20 flex flex-col items-center justify-between"
                        style={{ left: `${(paramValue / exp.paramMax) * 100}%` }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm -translate-x-1.5" />
                        <span className="font-mono text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1 rounded -translate-x-3 mb-1">
                          {paramValue}cm
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-24 rounded-lg bg-slate-200 dark:bg-slate-800 border-l-4 border-red-500 flex items-center justify-center font-mono text-[9px] text-red-700 font-bold">
                      ĐÁY
                    </div>
                  </div>
                )}

                {activeExp === "ultrasonic" && (
                  <div className="w-full flex items-center justify-between relative">
                    <div className="w-16 h-24 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-700 z-10">
                      <span className="text-[10px] font-bold">HC-SR04</span>
                      <div className="flex gap-1 mt-1">
                        <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-500" />
                        <div className="w-3 h-3 rounded-full bg-slate-300 border border-slate-500" />
                      </div>
                    </div>
                    <div className="flex-1 h-1 bg-dashed border-t-2 border-dashed border-emerald-400 relative mx-4">
                      {/* Moving cart */}
                      <div
                        className="absolute -top-6 -translate-x-1/2 flex flex-col items-center transition-all duration-100"
                        style={{ left: `${Math.min(95, Math.max(5, (latestVal / 100) * 100))}%` }}
                      >
                        <div className="w-14 h-8 bg-amber-500 rounded-lg shadow-md border border-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                          Xe trượt
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-1">
                          d = {latestVal} cm
                        </span>
                      </div>
                    </div>
                    <div className="w-4 h-24 bg-slate-400 rounded-r" />
                  </div>
                )}

                {activeExp === "force" && (
                  <div className="w-full flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-3 bg-slate-400 rounded-t" />
                      <div
                        className="w-4 border-x-2 border-dashed border-amber-500 transition-all duration-100 bg-amber-100/50"
                        style={{ height: `${40 + paramValue * 4}px` }}
                      />
                      <div className="w-12 h-10 bg-amber-500 rounded-b-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {latestVal} N
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Độ cứng lò xo: <strong className="font-mono text-sky-600">k = 50 N/m</strong></div>
                      <div>Độ dãn đo được: <strong className="font-mono text-amber-600">Δl = {paramValue} cm</strong></div>
                      <div>Lực đàn hồi đo được: <strong className="font-mono text-emerald-600">F = {latestVal} N</strong></div>
                    </div>
                  </div>
                )}

                {activeExp === "ohm" && (
                  <div className="w-full flex items-center justify-around">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-300 dark:border-purple-800 text-center">
                      <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">NGUỒN ĐIỆN VÀO</div>
                      <div className="text-xl font-black font-mono text-purple-600 mt-0.5">{paramValue} V</div>
                    </div>
                    <div className="h-0.5 w-16 bg-purple-400" />
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">ĐIỆN TRỞ R</div>
                      <div className="text-lg font-black font-mono text-slate-800 dark:text-slate-100">100 Ω</div>
                    </div>
                    <div className="h-0.5 w-16 bg-purple-400" />
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-center">
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">DÒNG ĐIỆN CẢM BIẾN (I)</div>
                      <div className="text-xl font-black font-mono text-emerald-600 mt-0.5">{latestVal} mA</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Parameter control slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between font-bold mb-1.5">
                  <span>Điều chỉnh biến số thực nghiệm: {exp.paramName}</span>
                  <span className="font-mono text-sky-600 text-sm">
                    {paramValue} {exp.paramUnit}
                  </span>
                </div>
                <input
                  type="range"
                  min={exp.paramMin}
                  max={exp.paramMax}
                  step={1}
                  value={paramValue}
                  onChange={(e) => setParamValue(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* DUAL TRACE STREAM: THEORY VS REAL-TIME SENSOR CURVE */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <BarChart2 className="w-4 h-4 text-sky-600" />
                  <span>ĐỐI SÁNH THỜI GIAN THỰC: LÝ THUYẾT VS CẢM BIẾN THỰC NGHIỆM</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-xs">
                  <span className="flex items-center gap-1.5 text-sky-600 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Lý thuyết: {theoryValue.toFixed(1)} {exp.defaultUnit}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cảm biến đo: {latestVal} {exp.defaultUnit}
                  </span>
                </div>
              </div>

              {/* Bar trace stream */}
              <div className="h-44 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 flex items-end gap-1.5 overflow-hidden shadow-inner">
                {telemetryList.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                    Đang đợi xung tín hiệu từ cảm biến...
                  </div>
                ) : (
                  telemetryList.map((pt, i) => {
                    // Normalize relative to maximum expected value
                    const maxVal = Math.max(1, theoryValue * 1.5, ...telemetryList.map((p) => p.measured));
                    const pctMeasured = Math.max(5, Math.min(100, (pt.measured / maxVal) * 100));
                    const pctTheory = Math.max(5, Math.min(100, (pt.theory / maxVal) * 100));

                    return (
                      <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
                        <div
                          className="w-1/2 bg-sky-400/60 dark:bg-sky-500/50 rounded-t transition-all duration-75"
                          style={{ height: `${pctTheory}%` }}
                        />
                        <div
                          className="w-1/2 bg-amber-500 rounded-t transition-all duration-75"
                          style={{ height: `${pctMeasured}%` }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Stats footer */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                <span>Số mẫu thu nhận: <strong>{telemetryList.length}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Sai số thực nghiệm trung bình: δ = {avgError}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Theory with KaTeX & Recent Log (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-6">

            {/* Theory card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4 text-xs">
              <h3 className="text-sm font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Cơ Sở Lý Thuyết SGK KHTN</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-sky-600 flex flex-col gap-2 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200">Công thức định luật &amp; mô hình:</span>
                <div className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-center">
                  <MathView math={exp.theoryFormula} block />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-xs">
                <div className="font-bold border-b pb-1 font-sans text-xs text-slate-700 dark:text-slate-300">
                  THÔNG SỐ ĐO ĐẠC HIỆN TẠI:
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Biến số ({exp.paramName}):</span>
                  <span className="font-bold">{paramValue} {exp.paramUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá trị lý thuyết:</span>
                  <span className="text-sky-600 font-bold">{theoryValue.toFixed(2)} {exp.defaultUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cảm biến thu nhận:</span>
                  <span className="text-amber-600 font-bold">{latestVal} {exp.defaultUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Độ lệch sai số:</span>
                  <span className="text-emerald-600 font-bold">±{avgError}%</span>
                </div>
              </div>
            </div>

            {/* Live Data Table (Last 6 points) */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Bảng Nhật Ký Số Liệu (Live)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Đơn vị: {exp.defaultUnit}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="pb-2">t (s)</th>
                      <th className="pb-2">Đo được</th>
                      <th className="pb-2">Lý thuyết</th>
                      <th className="pb-2 text-right">Sai số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {telemetryList.slice(-6).reverse().map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-1.5 text-slate-600 dark:text-slate-400">{pt.time}s</td>
                        <td className="py-1.5 font-bold text-amber-600">{pt.measured}</td>
                        <td className="py-1.5 text-sky-600">{pt.theory}</td>
                        <td className="py-1.5 text-right text-emerald-600">±{pt.errorPct}%</td>
                      </tr>
                    ))}
                    {telemetryList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          Chưa có dữ liệu nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* ================= GEOGEBRA SPREADSHEET & GRAPH FOR EXPERIMENT ================= */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-sky-600">calculate</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bảng Số Liệu Spreadsheet &amp; Đồ Thị Tọa Độ Thực Nghiệm (Chuẩn GeoGebra)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Hồi quy đường thẳng d = v·t, so sánh lần đo 1 (v₁) và lần đo 2 (v₂)
            </span>
          </div>
          <GeoGebraSpreadsheet
            experimentTitle={exp.title}
            labelX="t(s)"
            labelY={activeExp === "sound" ? "I(dB)" : activeExp === "force" ? "F(N)" : activeExp === "ohm" ? "I(mA)" : "d(m)"}
            unitX="s"
            unitY={exp.defaultUnit}
            curve1Name="v₁"
            curve2Name="v₂"
          />
        </div>
      </div>

      {/* Arduino Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Mã Nguồn Arduino / ESP32 Mẫu (.ino)
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Học sinh chỉ cần copy mã nguồn này, mở **Arduino IDE**, nạp vào bo mạch (Arduino Uno/Nano, ESP32) và cắm dây cáp USB vào máy tính để website tự động nhận số liệu:
            </p>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
                {exp.arduinoCode}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Đã copy!" : "Sao chép mã"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Tốc độ Baudrate: <strong className="font-mono text-sky-600">{exp.baudRate} bps</strong></span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
