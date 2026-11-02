// ================================================================
// HỘP THÍ NGHIỆM KHTN 6 & 8: LỰC ĐÀN HỒI (HOOKE) & LỰC KẾ ĐIỆN TỬ
// Cảm biến: Loadcell 5kg + Module khuếch đại 24-bit HX711
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Kết nối HX711: DT (Data) -> GPIO 26, SCK (Clock) -> GPIO 27
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// 2 Nút nhấn: Nút 1 TARE về 0 (GPIO 18), Nút 2 Bắt đầu/Dừng (GPIO 19)
// Baudrate Serial: 115200 bps
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

// Hệ số hiệu chuẩn cho Loadcell 5kg (tinh chỉnh theo quả cân mẫu)
float calibration_factor = 420.0; 

bool isRunning = true;
bool oledOK = false;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=================================================="));
  Serial.println(F(">> HE THONG LUC KE LOADCELL 5KG KHOI DONG THANH CONG! <<"));
  Serial.println(F("DT -> GPIO 26 | SCK -> GPIO 27"));
  Serial.println(F("=================================================="));

  pinMode(BTN_TARE, INPUT_PULLUP);
  pinMode(BTN_PAUSE, INPUT_PULLUP);

  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(5, 18);
    display.println(F("KHTN: LUC KE DIEN TU"));
    display.setCursor(5, 34);
    display.println(F("Loadcell 5kg + HX711"));
    display.display();
  }

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  if (scale.wait_ready_timeout(1500)) {
    scale.set_scale(calibration_factor);
    scale.tare(); // Tự động về 0 khi bật nguồn
    Serial.println(F(">> [HX711]: San sang do luc!"));
  } else {
    Serial.println(F(">> [CANH BAO]: Khong tim thay HX711! Kiem tra day DT=26, SCK=27"));
  }
  delay(800);
}

void loop() {
  // 1. Nút 1 (GPIO 18): Nhấn để TARE (Về 0) khi vừa móc quả nặng / cốc đo
  if (digitalRead(BTN_TARE) == LOW) {
    delay(50);
    if (digitalRead(BTN_TARE) == LOW) {
      scale.tare();
      Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N!"));
      if (oledOK) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(20, 28);
        display.println(F(">> DA TARE VE 0 <<"));
        display.display();
      }
      delay(400);
      while (digitalRead(BTN_TARE) == LOW) delay(10);
    }
  }

  // 2. Nút 2 (GPIO 19): Nhấn để Bật / Tạm dừng ghi đồ thị
  if (digitalRead(BTN_PAUSE) == LOW) {
    delay(50);
    if (digitalRead(BTN_PAUSE) == LOW) {
      isRunning = !isRunning;
      Serial.print(F(">> TRANG THAI: "));
      Serial.println(isRunning ? F("RUN") : F("PAUSE"));
      while (digitalRead(BTN_PAUSE) == LOW) delay(10);
    }
  }

  // 3. Đọc số liệu từ Loadcell 5kg qua HX711
  if (scale.is_ready()) {
    float weight_grams = scale.get_units(2); // Lấy mẫu trung bình 2 lần
    if (weight_grams < 0 && weight_grams > -1.5) weight_grams = 0; // Khử nhiễu nhẹ quanh 0

    // Quy đổi khối lượng (gram) sang Trọng lực / Lực đàn hồi (Newton)
    // F = m (kg) * 9.80665 = (weight_grams / 1000.0) * 9.80665
    float force_N = (weight_grams / 1000.0) * 9.80665;
    if (force_N < 0) force_N = 0;

    // Gửi số liệu lực (Newton) lên web PhysiX qua cáp USB Serial
    if (isRunning) {
      Serial.print(F("Luc: "));
      Serial.print(force_N, 2);
      Serial.print(F(" N  |  Khoi luong m: "));
      Serial.print(weight_grams, 1);
      Serial.println(F(" g"));
    }

    // Hiển thị trực quan trên màn hình OLED SSD1306
    if (oledOK) {
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
      display.printf("m = %.1f g", weight_grams);

      // Thanh đo đồ họa trực quan (dải 0 - 10N)
      display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
      int barWidth = map((int)(force_N * 10), 0, 100, 0, 124);
      if (barWidth > 124) barWidth = 124;
      if (barWidth < 0) barWidth = 0;
      display.fillRect(2, 54, barWidth, 7, SSD1306_WHITE);

      display.display();
    }
  }

  delay(80);
}
