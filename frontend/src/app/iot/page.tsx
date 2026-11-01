"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  Volume2,
  BarChart2,
  LineChart,
  ZoomIn,
  ZoomOut,
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
    title: "Khảo Sát Độ To, Biên Độ & Sóng Âm Thanh",
    sensorName: "Cảm biến Âm thanh MAX4466 (Microphone Amplifier)",
    defaultUnit: "dB",
    sampleRate: "50.0 kHz",
    baudRate: 115200,
    theoryFormula: "L = 20 \\lg\\left(\\frac{V_{pp}}{V_0}\\right); \\quad V_{pp} = V_{max} - V_{min}",
    calcTheory: (pos) => {
      // Standing wave in pipe: frequency = 1000Hz, v = 344 m/s -> lambda = 34.4 cm
      const k = (2 * Math.PI) / 34.4;
      const amp = Math.abs(Math.sin(k * pos));
      return 50 + amp * 40;
    },
    paramName: "Vị trí nguồn âm / đầu dò (x)",
    paramUnit: "cm",
    paramMin: 0,
    paramMax: 68,
    paramDefault: 34,
    arduinoCode: `// ================================================================
// HỘP THÍ NGHIỆM KHTN 7: KHẢO SÁT SÓNG ÂM & BIÊN ĐỘ ÂM THANH
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Cảm biến âm thanh: MAX4466 Electret Mic Amplifier (Nối OUT -> GPIO 35, VCC -> 3V3)
// Màn hình hiển thị: OLED 0.96 inch SSD1306 (I2C: SDA=21, SCL=22)
// 2 Nút nhấn điều khiển: Nút 1 (GPIO 18), Nút 2 (GPIO 19)
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int MIC_PIN   = 35; // Chân đọc OUT của cảm biến MAX4466 (GPIO 35)
const int BTN_START = 18; // Nút 1: Bắt đầu / Tạm dừng
const int BTN_RESET = 19; // Nút 2: Đặt lại

const int SAMPLE_WINDOW = 50; // Cửa sổ quét 50ms để bắt đỉnh sóng âm
bool isRunning = true;

void setup() {
  Serial.begin(115200);

  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);
  analogReadResolution(12); // ESP32 12-bit ADC (0 - 4095)

  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("Khong tim thay OLED!"));
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(10, 20);
  display.println(F("KHTN 7: AM THANH"));
  display.setCursor(10, 35);
  display.println(F("Sensor: MAX4466"));
  display.display();
  delay(1000);
}

void loop() {
  // 1. Đọc 2 nút nhấn vật lý
  if (digitalRead(BTN_START) == LOW) {
    delay(50);
    if (digitalRead(BTN_START) == LOW) {
      isRunning = !isRunning;
      while (digitalRead(BTN_START) == LOW) delay(10);
    }
  }
  if (digitalRead(BTN_RESET) == LOW) {
    delay(50);
    if (digitalRead(BTN_RESET) == LOW) {
      isRunning = true;
      while (digitalRead(BTN_RESET) == LOW) delay(10);
    }
  }

  // 2. Lấy mẫu tìm biên độ đỉnh - đỉnh (Peak-to-Peak) của cảm biến MAX4466
  unsigned long startMillis = millis();
  unsigned int signalMax = 0;
  unsigned int signalMin = 4095;

  while (millis() - startMillis < SAMPLE_WINDOW) {
    unsigned int sample = analogRead(MIC_PIN);
    if (sample > signalMax) signalMax = sample;
    if (sample < signalMin) signalMin = sample;
  }

  // Tính biên độ sóng âm Vpp (Volt)
  // Lưu ý: MAX4466 nuôi ở 3.3V có điểm tĩnh ~1.65V, Vpp dao động từ 0 đến 3.3V
  unsigned int peakToPeak = signalMax - signalMin;
  float volts = (peakToPeak * 3.3) / 4095.0;

  // Quy đổi độ to của âm ra đơn vị Decibel (dB) ước tính (45 - 100 dB)
  float soundDb = 45.0 + (volts * 28.0);
  if (soundDb > 105.0) soundDb = 105.0;
  if (soundDb < 45.0)  soundDb = 45.0;

  // 3. Gửi dữ liệu lên web PhysiX qua cổng USB Serial nếu đang chạy
  if (isRunning) {
    Serial.println(soundDb, 2);
  }

  // 4. Hiển thị thông số trên OLED SSD1306
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("MAX4466 MIC | "));
  display.print(isRunning ? F("RUN") : F("PAUSE"));

  display.setCursor(0, 16);
  display.setTextSize(2);
  display.printf("%.1f dB", soundDb);

  display.setTextSize(1);
  display.setCursor(0, 38);
  display.printf("Vpp: %.2fV (Peak)", volts);

  // Thanh VU-meter trực quan theo độ to của âm
  display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
  int barWidth = map((int)soundDb, 45, 95, 0, 124);
  if (barWidth > 124) barWidth = 124;
  if (barWidth < 0) barWidth = 0;
  display.fillRect(2, 54, barWidth, 7, SSD1306_WHITE);

  display.display();
}`
  },
  ultrasonic: {
    id: "ultrasonic",
    grade: "KHTN 7 & Vật lý 10",
    title: "Đo Thời Gian & Tốc Độ Chuyển Động (2 Cổng Quang Điện Hồng Ngoại)",
    sensorName: "2 Cổng quang điện hồng ngoại (Gate A: GPIO 14, Gate B: GPIO 25)",
    defaultUnit: "cm/s",
    sampleRate: "50.0 Hz",
    baudRate: 115200,
    theoryFormula: "v = \\frac{s}{\\Delta t}; \\quad \\Delta t = t_B - t_A; \\quad a = \\frac{2(s - v_0 t)}{t^2}",
    calcTheory: (s) => {
      // Xe chuyển động từ Cổng A sang B cách nhau s (cm) với tốc độ trung bình v = 35 cm/s
      return 35.0;
    },
    paramName: "Khoảng cách giữa 2 cổng quang (s)",
    paramUnit: "cm",
    paramMin: 10,
    paramMax: 80,
    paramDefault: 30,
    arduinoCode: `// ================================================================
// HỘP THÍ NGHIỆM KHTN 7 & VẬT LÝ 10: ĐO THỜI GIAN & TỐC ĐỘ (s - t - v)
// Cảm biến: 2 Cổng quang điện hồng ngoại (Photogates / Cảm biến chữ U)
// Cổng quang A (Bắt đầu): Chân DO -> GPIO 14
// Cổng quang B (Kết thúc): Chân DO -> GPIO 25 (Lưu ý: Không dùng GPIO 12 vì là strapping pin)
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// 2 Nút nhấn: Nút 1 Start/Stop (GPIO 18), Nút 2 Reset (GPIO 19)
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int GATE_A_PIN = 14; // Cổng quang A (Vị trí 1) nối GPIO 14
const int GATE_B_PIN = 25; // Cổng quang B (Vị trí 2) nối GPIO 25 (Tránh dùng GPIO 12 để không kẹt bootloader)

const int BTN_START  = 18; // Nút 1: Bắt đầu / Tạm dừng
const int BTN_RESET  = 19; // Nút 2: Đặt lại đo lượt mới

// Khoảng cách thực tế giữa 2 cổng quang trên máng nghiêng (cm)
// Học sinh có thể đo bằng thước kẹp/thước dây rồi chỉnh số này
const float DISTANCE_S_CM = 30.0; // 30 cm = 0.3 m

volatile unsigned long timeA_us = 0;
volatile unsigned long timeB_us = 0;
volatile bool passA = false;
volatile bool passB = false;

// Ngắt phần cứng cổng quang A: khi cờ chắn sáng cắt qua cổng A
void IRAM_ATTR isrGateA() {
  if (!passA) {
    timeA_us = micros();
    passA = true;
  }
}

// Ngắt phần cứng cổng quang B: khi cờ chắn sáng cắt qua cổng B
void IRAM_ATTR isrGateB() {
  if (passA && !passB) {
    timeB_us = micros();
    passB = true;
  }
}

bool isRunning = true;

void setup() {
  Serial.begin(115200);

  // Kích hoạt trở kéo lên nội cho cổng quang & nút nhấn
  pinMode(GATE_A_PIN, INPUT_PULLUP);
  pinMode(GATE_B_PIN, INPUT_PULLUP);
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);

  // Đăng ký ngắt phần cứng độ chính xác micro-giây
  // FALLING: Kích hoạt khi cờ chắn tia hồng ngoại (tín hiệu tụt xuống mức LOW)
  attachInterrupt(digitalPinToInterrupt(GATE_A_PIN), isrGateA, FALLING);
  attachInterrupt(digitalPinToInterrupt(GATE_B_PIN), isrGateB, FALLING);

  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(5, 18);
  display.println(F("KHTN: DONG HO HIEN SO"));
  display.setCursor(5, 34);
  display.println(F("2 Cong Quang Dien (IR)"));
  display.display();
  delay(1000);
}

void loop() {
  // 1. Nút 2 (GPIO 19): Đặt lại để đo lượt chạy mới
  if (digitalRead(BTN_RESET) == LOW) {
    delay(50);
    if (digitalRead(BTN_RESET) == LOW) {
      passA = false;
      passB = false;
      timeA_us = 0;
      timeB_us = 0;
      display.clearDisplay();
      display.setCursor(15, 25);
      display.println(F("SAN SANG DO MOI!"));
      display.display();
      delay(400);
      while (digitalRead(BTN_RESET) == LOW) delay(10);
    }
  }

  // 2. Nút 1 (GPIO 18): Tạm dừng / Tiếp tục
  if (digitalRead(BTN_START) == LOW) {
    delay(50);
    if (digitalRead(BTN_START) == LOW) {
      isRunning = !isRunning;
      while (digitalRead(BTN_START) == LOW) delay(10);
    }
  }

  // 3. Xử lý khi xe lăn đã chạy qua cả 2 cổng quang
  if (passA && passB) {
    // Tính khoảng thời gian di chuyển (đổi sang giây)
    float delta_t_sec = (timeB_us - timeA_us) / 1000000.0;
    
    // Tính tốc độ v = s / t (cm/s)
    float velocity_cms = (delta_t_sec > 0.0001) ? (DISTANCE_S_CM / delta_t_sec) : 0;

    // Gửi tốc độ (cm/s) lên web PhysiX qua cáp Type-C Serial
    if (isRunning) {
      Serial.println(velocity_cms, 2);
    }

    // Hiển thị kết quả chi tiết trên OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("KET QUA: 2 CONG QUANG"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.printf("%.1f cm/s", velocity_cms);

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.printf("t: %.3f s | s: %.0fcm", delta_t_sec, DISTANCE_S_CM);

    display.setCursor(0, 50);
    display.printf("v = %.3f m/s", velocity_cms / 100.0);
    display.display();
  } else if (passA && !passB) {
    // Xe vừa đi qua cổng A, đang trên đường đến cổng B
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 5);
    display.println(F("DANG CHAY..."));
    display.setCursor(0, 25);
    display.setTextSize(2);
    display.println(F("GATE A -> B"));
    display.setTextSize(1);
    display.setCursor(0, 50);
    display.println(F("Cho cat tia cong B..."));
    display.display();
  } else {
    // Trạng thái chờ xuất phát
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("CHO XE QUA CONG A..."));

    display.setCursor(0, 18);
    display.setTextSize(1);
    display.printf("Quang duong s: %.0f cm", DISTANCE_S_CM);

    display.setCursor(0, 34);
    display.print(F("A: GPIO 14 | B: GPIO 25"));

    display.setCursor(0, 50);
    display.print(F("Bam Nut 2 de Reset"));
    display.display();
  }

  delay(60);
}`
  },
  force: {
    id: "force",
    grade: "KHTN 6 & 8",
    title: "Định Luật Hooke (Lực Đàn Hồi) & Lực Đẩy Ác-si-mét",
    sensorName: "Cảm biến Lực Loadcell 5kg + Module HX711 (Lực kế điện tử)",
    defaultUnit: "N",
    sampleRate: "10.0 Hz",
    baudRate: 115200,
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
    arduinoCode: `// ================================================================
// HỘP THÍ NGHIỆM KHTN 6 & 8: LỰC ĐÀN HỒI (HOOKE) & LỰC ĐẨY ÁC-SI-MÉT
// Cảm biến: Loadcell 5kg + Module khuếch đại 24-bit HX711
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Kết nối HX711: DT (Data) -> GPIO 26, SCK (Clock) -> GPIO 27
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// 2 Nút nhấn: Nút 1 TARE về 0 (GPIO 18), Nút 2 Bắt đầu/Dừng (GPIO 19)
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "HX711.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

HX711 scale;
const int LOADCELL_DOUT_PIN = 26; // Chân DT của HX711 nối GPIO 26
const int LOADCELL_SCK_PIN  = 27; // Chân SCK của HX711 nối GPIO 27

const int BTN_TARE  = 18; // Nút 1: TARE (Khấu trừ bì / Về 0)
const int BTN_PAUSE = 19; // Nút 2: Bắt đầu / Tạm dừng ghi đồ thị

// Hệ số hiệu chuẩn cho Loadcell 5kg (Tinh chỉnh theo quả cân mẫu)
// Ví dụ: Đặt quả cân 100g (0.98 N), nếu số đo lệch thì tăng/giảm số này
float calibration_factor = 420.0; 

bool isRunning = true;

void setup() {
  Serial.begin(115200);

  pinMode(BTN_TARE, INPUT_PULLUP);
  pinMode(BTN_PAUSE, INPUT_PULLUP);

  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(5, 20);
  display.println(F("KHTN: LUC KE DIEN TU"));
  display.setCursor(5, 35);
  display.println(F("Loadcell 5kg + HX711"));
  display.display();

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // Tự động về 0 khi bật nguồn
  delay(800);
}

void loop() {
  // 1. Nút 1 (GPIO 18): Nhấn để TARE (Về 0) khi treo móc / cốc nước
  if (digitalRead(BTN_TARE) == LOW) {
    delay(50);
    if (digitalRead(BTN_TARE) == LOW) {
      scale.tare();
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(20, 28);
      display.println(F(">> DA TARE VE 0 <<"));
      display.display();
      delay(400);
      while (digitalRead(BTN_TARE) == LOW) delay(10);
    }
  }

  // 2. Nút 2 (GPIO 19): Nhấn để Bật / Tạm dừng ghi đồ thị
  if (digitalRead(BTN_PAUSE) == LOW) {
    delay(50);
    if (digitalRead(BTN_PAUSE) == LOW) {
      isRunning = !isRunning;
      while (digitalRead(BTN_PAUSE) == LOW) delay(10);
    }
  }

  // 3. Đọc số liệu từ Loadcell 5kg qua HX711
  if (scale.is_ready()) {
    float weight_grams = scale.get_units(2); // Lấy mẫu trung bình 2 lần
    if (weight_grams < 0 && weight_grams > -1.5) weight_grams = 0; // Lọc khử nhiễu nhẹ quanh 0

    // Quy đổi khối lượng (gram) sang Trọng lực / Lực đàn hồi (Newton)
    // F = m (kg) * 9.8 = (weight_grams / 1000.0) * 9.80665
    float force_N = (weight_grams / 1000.0) * 9.80665;
    if (force_N < 0) force_N = 0;

    // Gửi số liệu lực (Newton) lên web PhysiX qua cáp Type-C USB Serial
    if (isRunning) {
      Serial.println(force_N, 2);
    }

    // Hiển thị trực quan trên màn hình OLED SSD1306
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("LOADCELL 5KG | "));
    display.print(isRunning ? F("RUN") : F("PAUSE"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.printf("%.2f N", force_N);

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.printf("m: %.1f g", weight_grams);

    // Thanh đo lực kế đồ họa trực quan (dải 0 - 10N thường dùng trong thực hành)
    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barWidth = map((int)(force_N * 10), 0, 100, 0, 124);
    if (barWidth > 124) barWidth = 124;
    if (barWidth < 0) barWidth = 0;
    display.fillRect(2, 54, barWidth, 7, SSD1306_WHITE);

    display.display();
  }

  delay(80);
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
      // Điện trở mẫu R = 120 Ohm -> I(mA) = (U / 120) * 1000
      return Number(((voltage / 120.0) * 1000.0).toFixed(1));
    },
    paramName: "Hiệu điện thế (U)",
    paramUnit: "V",
    paramMin: 0,
    paramMax: 12,
    paramDefault: 6,
    arduinoCode: `// ==============================================================
// ESP32 / ARDUINO + INA219 + OLED SSD1306 (I2C)
// THCS TAY TIEN - MO HINH THI NGHIEM DINH LUAT OHM (KHTN 9)
// Bien tro dieu khien: 10k Ohm (B10K) | Dien tro mau: 120 Ohm
// ==============================================================
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_INA219 ina219(0x40);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // ESP32: SDA=21, SCL=22

  ina219.begin();
  ina219.setCalibration_32V_2A();

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(15, 20);
  display.println(F("THCS TAY TIEN"));
  display.setCursor(10, 36);
  display.println(F("DINH LUAT OHM (120R)"));
  display.display();
  delay(1200);
}

void loop() {
  float busVoltage_V = ina219.getBusVoltage_V();
  float current_mA   = ina219.getCurrent_mA();
  if (current_mA < 0.2) current_mA = 0;

  float current_A      = current_mA / 1000.0;
  float resistance_Ohm = (current_mA > 1.0) ? (busVoltage_V / current_A) : 0.0;

  // 1. Truyen du lieu thoi gian thuc len Website PhysiX (Web Serial)
  Serial.println(current_mA, 2);

  // 2. Hien thi truc quan len man hinh OLED
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("THCS TAY TIEN - OHM"));
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  display.setCursor(0, 14);
  display.printf("U: %.2f V", busVoltage_V);

  display.setCursor(0, 26);
  display.printf("I: %.1f mA", current_mA);

  display.setCursor(0, 38);
  if (resistance_Ohm > 5.0 && resistance_Ohm < 500.0) {
    display.printf("R: %.1f Ohm", resistance_Ohm);
  } else {
    display.println(F("R: --- Ohm"));
  }

  // Thanh do mini co gian theo dong dien 0 - 45mA
  display.drawRect(0, 50, 128, 12, SSD1306_WHITE);
  int fillWidth = map((int)current_mA, 0, 45, 0, 124);
  if (fillWidth > 124) fillWidth = 124;
  if (fillWidth > 0) display.fillRect(2, 52, fillWidth, 8, SSD1306_WHITE);

  display.display();
  delay(100);
}`
  }
};

export default function VernierIoTPage() {
  const [activeExp, setActiveExp] = useState<ExperimentType>("sound");
  const exp = EXPERIMENTS[activeExp];

  const [expMode, setExpMode] = useState<"hardware" | "simulator">("hardware");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [paramValue, setParamValue] = useState<number>(exp.paramDefault);
  const [telemetryList, setTelemetryList] = useState<TelemetryPoint[]>([]);
  const [chartMode, setChartMode] = useState<"line" | "bar">("line");
  const [zoomFocus, setZoomFocus] = useState<boolean>(true);

  // Hardware connection states
  const [connectionType, setConnectionType] = useState<"none" | "serial" | "bluetooth" | "simulator">("none");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [statusMsg, setStatusMsg] = useState<string>("Chế độ 1: Cảm biến phần cứng thật. Hãy cắm cáp USB và bấm 'Cắm USB Serial' để đọc dữ liệu ESP32.");
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
    setIsRecording(false);
  }, [activeExp]);

  // Simulation Loop when in "simulator" mode
  useEffect(() => {
    if (expMode !== "simulator" || connectionType !== "simulator" || !isRecording) return;

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
  }, [expMode, connectionType, isRecording, theoryValue]);

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
      setExpMode("hardware");
      setConnectionType("serial");
      setConnectionStatus("connected");
      setIsRecording(true);
      setStatusMsg(`Đã kết nối trực tiếp cổng USB Serial (${exp.baudRate} bps)! Đang nhận dữ liệu...`);

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

      setExpMode("hardware");
      setConnectionType("bluetooth");
      setConnectionStatus("connected");
      setIsRecording(true);
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
    setIsRecording(false);
    if (expMode === "hardware") {
      setConnectionType("none");
      setConnectionStatus("disconnected");
      setStatusMsg("Đã ngắt kết nối USB. Hãy bấm 'Cắm USB Serial' khi muốn kết nối lại.");
    } else {
      setConnectionType("simulator");
      setConnectionStatus("connected");
      setStatusMsg("Đã chuyển về Bộ giả lập phần cứng ảo.");
    }
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

            {/* Action Buttons in Header */}
            <div className="flex items-center gap-2 flex-wrap">
              {expMode === "hardware" && (
                connectionType === "serial" || connectionType === "bluetooth" ? (
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
                      title="Cắm cáp USB Arduino / ESP32 vào máy tính"
                    >
                      <Usb className="w-4 h-4" />
                      <span>Cắm USB Serial (ESP32)</span>
                    </button>

                    <button
                      onClick={handleConnectBluetooth}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Bluetooth className="w-4 h-4" />
                      <span>Bluetooth (BLE)</span>
                    </button>
                  </>
                )
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

          {/* 2 Nút Chọn Chế Độ Thí Nghiệm (Hardware vs Simulator) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setExpMode("hardware");
                if (connectionType === "simulator") {
                  setConnectionType("none");
                  setIsRecording(false);
                  setTelemetryList([]);
                }
                setStatusMsg("Chế độ 1: Cảm biến Phần cứng thật. Vui lòng cắm cáp USB Serial kết nối ESP32.");
              }}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold text-left transition-all ${
                expMode === "hardware"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-md ring-2 ring-sky-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${expMode === "hardware" ? "bg-sky-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                <Usb className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold flex items-center gap-2">
                  <span>Chế Độ 1: Cảm Biến Phần Cứng Thật</span>
                  {connectionType === "serial" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                      ● Đang kết nối USB
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                  Đo trực tiếp từ cảm biến INA219, HC-SR04, Mic qua ESP32 USB Serial
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setExpMode("simulator");
                if (connectionType === "serial" || connectionType === "bluetooth") {
                  handleDisconnect();
                }
                setConnectionType("simulator");
                setStatusMsg("Chế độ 2: Mô phỏng Thực nghiệm ảo. Bấm '▶ Bắt đầu mô phỏng' để tiến hành.");
              }}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold text-left transition-all ${
                expMode === "simulator"
                  ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md ring-2 ring-purple-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${expMode === "simulator" ? "bg-purple-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-extrabold flex items-center gap-2">
                  <span>Chế Độ 2: Mô Phỏng Thực Nghiệm Ảo</span>
                  {expMode === "simulator" && isRecording && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
                      ● Đang chạy mô phỏng
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                  Digital Twin cho học sinh thực hành lý thuyết &amp; kéo thanh trượt trực tuyến
                </div>
              </div>
            </button>
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
                    : expMode === "simulator"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}>
                  {connectionType === "serial"
                    ? "USB SERIAL 115200"
                    : connectionType === "bluetooth"
                    ? "BLE 5.2"
                    : expMode === "simulator"
                    ? "MÔ PHỎNG SỐ (DIGITAL TWIN)"
                    : "CHỜ KẾT NỐI PHẦN CỨNG"}
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
                  <span>
                    {expMode === "hardware"
                      ? "GIÁM SÁT THỰC NGHIỆM PHẦN CỨNG THẬT (ESP32)"
                      : "MÔ PHỎNG HỆ THỐNG THÍ NGHIỆM ĐỒNG BỘ CẢM BIẾN"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {expMode === "hardware" ? (
                    connectionType === "serial" || connectionType === "bluetooth" ? (
                      <>
                        <button
                          onClick={() => {
                            const next = !isRecording;
                            setIsRecording(next);
                            setStatusMsg(next ? "Đang tiếp tục thu thập từ cảm biến thật..." : "Đã tạm dừng vẽ đồ thị.");
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isRecording
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                        >
                          {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          <span>{isRecording ? "Tạm dừng" : "Tiếp tục"}</span>
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ngắt kết nối</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectSerial}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Usb className="w-3.5 h-3.5" />
                        <span>🔌 Cắm USB Serial</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        const next = !isRecording;
                        setIsRecording(next);
                        if (next) {
                          setConnectionType("simulator");
                          setStatusMsg("Đang chạy mô phỏng thực nghiệm ảo...");
                        } else {
                          setStatusMsg("Đã tạm dừng mô phỏng. Bấm 'Tiếp tục' để mô phỏng tiếp.");
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isRecording
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      }`}
                    >
                      {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isRecording ? "Tạm dừng mô phỏng" : "▶ Bắt đầu mô phỏng"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setTelemetryList([]);
                      setIsRecording(false);
                      setStatusMsg("Đã đặt lại đồ thị về trạng thái ban đầu.");
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                    title="Đặt lại đồ thị"
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
                  <div className="w-full flex items-center justify-between relative px-2">
                    {/* Cổng quang A */}
                    <div className="w-16 h-28 rounded-xl bg-sky-50 dark:bg-sky-950/80 border-2 border-sky-400 flex flex-col items-center justify-center text-sky-700 z-10 shadow-sm">
                      <span className="text-[10px] font-black text-sky-600">CỔNG A</span>
                      <span className="text-[8px] font-mono text-slate-500">GPIO 14</span>
                      <div className="w-3 h-12 bg-slate-800 rounded-sm mt-1 relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <span className="text-[8px] font-bold text-sky-700 dark:text-sky-300 mt-1">Xuất phát</span>
                    </div>

                    {/* Máng nghiêng & Quãng đường s */}
                    <div className="flex-1 h-14 relative mx-3 flex flex-col justify-center">
                      <div className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full relative">
                        {/* Vạch khoảng cách s */}
                        <div className="absolute -top-5 left-0 right-0 flex items-center justify-center">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sky-700 dark:text-sky-300 shadow-xs">
                            Quãng đường s = {paramValue} cm
                          </span>
                        </div>
                        {/* Xe lăn có cờ chắn sáng */}
                        <div
                          className="absolute -top-7 -translate-x-1/2 flex flex-col items-center transition-all duration-100"
                          style={{ left: `${Math.min(90, Math.max(10, ((latestVal || 35) / 70) * 100))}%` }}
                        >
                          {/* Cờ chắn sáng */}
                          <div className="w-1 h-4 bg-slate-900 dark:bg-white" />
                          <div className="w-12 h-6 bg-amber-500 rounded-md shadow-md border border-amber-600 flex items-center justify-center text-white text-[9px] font-bold">
                            Xe lăn
                          </div>
                          <span className="font-mono text-[9px] font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                            v = {latestVal} cm/s
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cổng quang B */}
                    <div className="w-16 h-28 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-700 z-10 shadow-sm">
                      <span className="text-[10px] font-black text-emerald-600">CỔNG B</span>
                      <span className="text-[8px] font-mono text-slate-500">GPIO 25</span>
                      <div className="w-3 h-12 bg-slate-800 rounded-sm mt-1 relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <span className="text-[8px] font-bold text-emerald-600 mt-1">Về đích</span>
                    </div>
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
                      <div className="text-lg font-black font-mono text-slate-800 dark:text-slate-100">120 Ω</div>
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
                  step={activeExp === "ohm" ? 0.1 : 1}
                  value={paramValue}
                  onChange={(e) => setParamValue(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* DUAL TRACE STREAM: THEORY VS REAL-TIME SENSOR CURVE */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  {chartMode === "line" ? (
                    <LineChart className="w-4 h-4 text-amber-500" />
                  ) : (
                    <BarChart2 className="w-4 h-4 text-sky-600" />
                  )}
                  <span>ĐỐI SÁNH THỜI GIAN THỰC: LÝ THUYẾT VS CẢM BIẾN THỰC NGHIỆM</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Zoom focus button */}
                  <button
                    type="button"
                    onClick={() => setZoomFocus(!zoomFocus)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 border transition-all ${
                      zoomFocus
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                    title="Phóng to dải biến thiên để nhìn rõ từng gợn sóng nhỏ nhất của cảm biến"
                  >
                    {zoomFocus ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    <span>{zoomFocus ? "Thu nhỏ (Toàn dải 0→Max)" : "🔍 Phóng to biến thiên"}</span>
                  </button>

                  {/* Mode switcher pills */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setChartMode("line")}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                        chartMode === "line"
                          ? "bg-white dark:bg-slate-700 text-amber-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>Đồ thị đường</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode("bar")}
                      className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                        chartMode === "bar"
                          ? "bg-white dark:bg-slate-700 text-sky-600 shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Dạng cột</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Value Tracker Badges */}
              {(() => {
                const vals = telemetryList.map((p) => p.measured);
                const cur = vals.length > 0 ? vals[vals.length - 1] : 0;
                const prev = vals.length > 1 ? vals[vals.length - 2] : cur;
                const delta = cur - prev;
                const minV = vals.length > 0 ? Math.min(...vals) : 0;
                const maxV = vals.length > 0 ? Math.max(...vals) : 0;
                const span = maxV - minV;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Giá trị tức thời</div>
                      <div className="text-xl font-black font-mono text-amber-500 mt-0.5 flex items-baseline gap-1">
                        <span>{cur.toFixed(2)}</span>
                        <span className="text-xs font-semibold">{exp.defaultUnit}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Độ biến thiên (Δ)</div>
                      <div className={`text-xl font-black font-mono mt-0.5 flex items-baseline gap-1 ${
                        delta > 0.05 ? "text-emerald-500" : delta < -0.05 ? "text-rose-500" : "text-slate-400"
                      }`}>
                        <span>{delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}</span>
                        <span className="text-xs font-semibold">{exp.defaultUnit}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300/40">
                      <div className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Lý thuyết chuẩn</div>
                      <div className="text-xl font-black font-mono text-sky-600 dark:text-sky-400 mt-0.5 flex items-baseline gap-1">
                        <span>{theoryValue.toFixed(1)}</span>
                        <span className="text-xs font-semibold">{exp.defaultUnit}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Dải Min → Max</div>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1 flex flex-col justify-center">
                        <div>Min: <span className="text-sky-500">{minV.toFixed(1)}</span> | Max: <span className="text-amber-500">{maxV.toFixed(1)}</span></div>
                        <div className="text-[10px] text-slate-400 font-normal">Biên độ: ±{(span / 2).toFixed(2)} {exp.defaultUnit}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chart container */}
              {chartMode === "line" ? (
                <div className="h-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 overflow-hidden shadow-xs flex flex-col justify-between">
                  {telemetryList.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 font-mono gap-2 p-4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expMode === "hardware" ? "bg-sky-100 text-sky-600" : "bg-purple-100 text-purple-600"
                      }`}>
                        {expMode === "hardware" ? <Usb className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </div>
                      <div className="max-w-md">
                        {expMode === "hardware" ? (
                          <>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              Chế độ 1: Cảm biến Phần cứng thật (ESP32/Arduino)
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              Đồ thị đang ở trạng thái chờ. Bấm nút bên dưới để chọn cổng COM USB Serial và bắt đầu truyền dữ liệu thực tế.
                            </div>
                            <button
                              onClick={handleConnectSerial}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Usb className="w-4 h-4" />
                              <span>🔌 Cắm USB Serial kết nối ngay</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              Chế độ 2: Mô phỏng Thực nghiệm ảo (Digital Twin)
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              Đồ thị chưa chạy. Bấm nút bên dưới để bắt đầu luồng số liệu mô phỏng theo lý thuyết SGK.
                            </div>
                            <button
                              onClick={() => {
                                setIsRecording(true);
                                setConnectionType("simulator");
                                setStatusMsg("Đang chạy mô phỏng thực nghiệm ảo...");
                              }}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>▶ Bắt đầu mô phỏng ngay</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (() => {
                    const N = telemetryList.length;
                    const vals = telemetryList.map((p) => p.measured);
                    const minMeas = Math.min(...vals, theoryValue);
                    const maxMeas = Math.max(...vals, theoryValue);
                    const spread = Math.max(0.6, maxMeas - minMeas);

                    let yMin = 0;
                    let yMax = 10;

                    if (zoomFocus) {
                      // Tự động phóng đại ôm sát dải biến thiên để nhìn rõ từng gợn sóng nhỏ
                      const pad = Math.max(0.6, spread * 0.45);
                      yMin = Math.max(0, parseFloat((minMeas - pad).toFixed(1)));
                      yMax = parseFloat((maxMeas + pad).toFixed(1));
                      if (yMax - yMin < 2.0) {
                        const mid = (yMax + yMin) / 2;
                        yMin = Math.max(0, parseFloat((mid - 1.2).toFixed(1)));
                        yMax = parseFloat((mid + 1.2).toFixed(1));
                      }
                    } else {
                      // Toàn dải 0 đến cực đại
                      yMin = 0;
                      yMax = Math.ceil(Math.max(1, theoryValue * 1.25, maxMeas) * 1.15) || 10;
                    }

                    const yRange = Math.max(0.1, yMax - yMin);
                    const width = 800;
                    const height = 245;
                    const padLeft = 56;
                    const padRight = 25;
                    const padTop = 24;
                    const padBottom = 26;
                    const plotW = width - padLeft - padRight;
                    const plotH = height - padTop - padBottom;

                    const getX = (idx: number) => padLeft + (N > 1 ? (idx / (N - 1)) * plotW : plotW / 2);
                    const getY = (val: number) => padTop + plotH - Math.min(plotH, Math.max(0, ((val - yMin) / yRange) * plotH));

                    const measuredPoints = telemetryList.map((pt, i) => ({
                      x: getX(i),
                      y: getY(pt.measured),
                      val: pt.measured,
                    }));
                    const theoryPoints = telemetryList.map((pt, i) => ({
                      x: getX(i),
                      y: getY(pt.theory),
                      val: pt.theory,
                    }));

                    const measuredLine = measuredPoints
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                      .join(" ");
                    const theoryLine = theoryPoints
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                      .join(" ");

                    const lastPt = measuredPoints[measuredPoints.length - 1];
                    const firstX = measuredPoints[0].x.toFixed(1);
                    const lastX = lastPt.x.toFixed(1);
                    const baseY = (padTop + plotH).toFixed(1);
                    const areaFill = `${measuredLine} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

                    const gridSteps = [0, 0.25, 0.5, 0.75, 1];
                    const timeMarkers = ["-5s", "-4s", "-3s", "-2s", "-1s", "0s (Hiện tại)"];

                    return (
                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
                        <defs>
                          <linearGradient id="sensorGradLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Nền đồ thị chuẩn phòng thí nghiệm */}
                        <rect
                          x={padLeft}
                          y={padTop}
                          width={plotW}
                          height={plotH}
                          fill="#f8fafc"
                          className="dark:fill-slate-950/40"
                          rx="6"
                        />

                        {/* Grid lines and Y labels */}
                        {gridSteps.map((step, idx) => {
                          const val = yMin + yRange * step;
                          const y = padTop + plotH - step * plotH;
                          return (
                            <g key={idx}>
                              <line
                                x1={padLeft}
                                y1={y}
                                x2={width - padRight}
                                y2={y}
                                stroke="#e2e8f0"
                                className="dark:stroke-slate-800"
                                strokeDasharray="3 3"
                                strokeWidth="1"
                              />
                              <text
                                x={padLeft - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="#475569"
                                className="dark:fill-slate-400"
                                fontSize="11"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {val.toFixed(1)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Unit label at top left */}
                        <text
                          x={padLeft + 4}
                          y={14}
                          fill="#0284c7"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          Trục tung: ({exp.defaultUnit}) {zoomFocus ? "• Phóng đại biến thiên" : "• Toàn dải"}
                        </text>

                        {/* X-axis time marks */}
                        {timeMarkers.map((tm, idx) => {
                          const x = padLeft + (idx / (timeMarkers.length - 1)) * plotW;
                          return (
                            <text
                              key={idx}
                              x={x}
                              y={height - 8}
                              textAnchor={idx === 0 ? "start" : idx === timeMarkers.length - 1 ? "end" : "middle"}
                              fill="#64748b"
                              fontSize="10"
                              fontFamily="monospace"
                              fontWeight="600"
                            >
                              {tm}
                            </text>
                          );
                        })}

                        {/* Area gradient under measured line */}
                        <path d={areaFill} fill="url(#sensorGradLight)" />

                        {/* Theory dashed curve (Sky blue) */}
                        <path
                          d={theoryLine}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          opacity="0.9"
                        />

                        {/* Measured solid curve (Cam đậm sắc nét trên nền sáng) */}
                        <path
                          d={measuredLine}
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Measured data dots with white outline */}
                        {measuredPoints.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={i === measuredPoints.length - 1 ? 5.5 : 3}
                            fill="#ea580c"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        ))}

                        {/* Horizontal guide cursor to current live point */}
                        {lastPt && (
                          <g>
                            <line
                              x1={padLeft}
                              y1={lastPt.y}
                              x2={lastPt.x}
                              y2={lastPt.y}
                              stroke="#ea580c"
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                              opacity="0.75"
                            />

                            {/* Live Floating Badge right above the latest point */}
                            <g transform={`translate(${Math.max(padLeft, Math.min(width - padRight - 90, lastPt.x - 45))}, ${Math.max(12, lastPt.y - 28)})`}>
                              <rect
                                width="90"
                                height="23"
                                rx="6"
                                fill="#ea580c"
                                className="shadow-md"
                              />
                              <text
                                x="45"
                                y="15.5"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="11"
                                fontWeight="900"
                                fontFamily="monospace"
                              >
                                {lastPt.val.toFixed(2)} {exp.defaultUnit}
                              </text>
                            </g>

                            {/* Active pulse animation at live tip */}
                            <circle
                              cx={lastPt.x}
                              cy={lastPt.y}
                              r="9"
                              fill="none"
                              stroke="#ea580c"
                              strokeWidth="2"
                              className="animate-ping"
                              opacity="0.8"
                            />
                          </g>
                        )}
                      </svg>
                    );
                  })()}
                </div>
              ) : (
                /* Bar trace stream (Dạng cột cũ trên nền sáng) */
                <div className="h-72 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-end gap-1.5 overflow-hidden shadow-inner">
                  {telemetryList.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 font-mono gap-2 p-4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expMode === "hardware" ? "bg-sky-100 text-sky-600" : "bg-purple-100 text-purple-600"
                      }`}>
                        {expMode === "hardware" ? <Usb className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </div>
                      <div className="max-w-md">
                        {expMode === "hardware" ? (
                          <>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              Chế độ 1: Cảm biến Phần cứng thật (ESP32/Arduino)
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              Đồ thị đang ở trạng thái chờ. Bấm nút bên dưới để chọn cổng COM USB Serial.
                            </div>
                            <button
                              onClick={handleConnectSerial}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Usb className="w-4 h-4" />
                              <span>🔌 Cắm USB Serial kết nối ngay</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              Chế độ 2: Mô phỏng Thực nghiệm ảo (Digital Twin)
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              Đồ thị chưa chạy. Bấm nút bên dưới để bắt đầu mô phỏng.
                            </div>
                            <button
                              onClick={() => {
                                setIsRecording(true);
                                setConnectionType("simulator");
                                setStatusMsg("Đang chạy mô phỏng thực nghiệm ảo...");
                              }}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>▶ Bắt đầu mô phỏng ngay</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    telemetryList.map((pt, i) => {
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
              )}

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
