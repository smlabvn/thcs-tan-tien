// ================================================================
// CHƯƠNG TRÌNH TEST LOADCELL 5KG + MODULE ADC 24-BIT HX711
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Kết nối HX711: DT -> GPIO 26, SCK -> GPIO 27, VCC -> 5V, GND -> GND
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// Nút 1 (GPIO 18): TARE (Khấu trừ bì / Về 0)
// Nút 2 (GPIO 19): Tinh chỉnh hệ số hiệu chuẩn
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

const int BTN_TARE  = 18; // Nút 1: TARE (Về 0)
const int BTN_CALIB = 19; // Nút 2: Chuyển đổi

// Hệ số hiệu chuẩn mặc định cho Loadcell 5kg (thường trong dải 400.0 - 430.0)
float calibration_factor = 420.0;

bool oledOK = false;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=================================================="));
  Serial.println(F("     CHUONG TRINH TEST LOADCELL 5KG + HX711       "));
  Serial.println(F("=================================================="));
  Serial.println(F("Ket noi HX711: DT -> GPIO 26 | SCK -> GPIO 27"));

  pinMode(BTN_TARE, INPUT_PULLUP);
  pinMode(BTN_CALIB, INPUT_PULLUP);

  // 1. Khởi động màn hình OLED
  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 15);
    display.println(F("TEST LOADCELL 5KG"));
    display.setCursor(10, 32);
    display.println(F("Khoi dong HX711..."));
    display.display();
  }

  // 2. Khởi động module HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  // Kiểm tra xem module HX711 có phản hồi không (chờ tối đa 1.5 giây để tránh treo máy)
  if (scale.wait_ready_timeout(1500)) {
    Serial.println(F(">> [HX711]: KET NOI THANH CONG!"));
    scale.set_scale(calibration_factor);
    scale.tare(); // Tự động về 0 khi vừa bật nguồn
    Serial.println(F(">> [TARE]: Da ve 0.00! Hay thu an nhe vao thanh Loadcell."));
  } else {
    Serial.println(F(">> [HX711 LOI]: Khong tim thay module HX711!"));
    Serial.println(F("Kiem tra: DT -> 26, SCK -> 27, VCC -> 5V (hoac 3V3), GND -> GND"));
    if (oledOK) {
      display.clearDisplay();
      display.setCursor(5, 20);
      display.println(F("LOI KET NOI HX711!"));
      display.setCursor(5, 35);
      display.println(F("Kiem tra DT=26,SCK=27"));
      display.display();
    }
  }

  delay(800);
}

void loop() {
  // 1. Xử lý Nút 1 (GPIO 18): TARE VỀ 0
  if (digitalRead(BTN_TARE) == LOW) {
    delay(50);
    if (digitalRead(BTN_TARE) == LOW) {
      scale.tare();
      Serial.println(F("\n>> [TARE]: DA VE 0.00 (KHẤU TRỪ BÌ THÀNH CÔNG)!"));
      if (oledOK) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(20, 25);
        display.println(F(">> DA TARE VE 0 <<"));
        display.display();
      }
      delay(400);
      while (digitalRead(BTN_TARE) == LOW) delay(10);
    }
  }

  // 2. Đọc dữ liệu từ Loadcell
  if (scale.is_ready()) {
    // Đọc khối lượng (gram) trung bình 2 lần lấy mẫu
    float weight_grams = scale.get_units(2);
    long raw_adc = scale.read_average(2);

    // Lọc nhiễu nhẹ dao động quanh điểm 0
    if (weight_grams > -1.5 && weight_grams < 1.5) weight_grams = 0.0;

    // Quy đổi từ gram sang Lực (Newton): F = m * 9.80665 / 1000
    float force_N = (weight_grams / 1000.0) * 9.80665;
    if (force_N < 0 && force_N > -0.05) force_N = 0.0;

    // In lên Serial Monitor
    Serial.print(F("Khoi luong: "));
    Serial.print(weight_grams, 1);
    Serial.print(F(" g  |  Luc: "));
    Serial.print(force_N, 2);
    Serial.print(F(" N  |  Raw ADC: "));
    Serial.println(raw_adc);

    // Cập nhật giao diện OLED
    if (oledOK) {
      display.clearDisplay();
      display.setTextColor(SSD1306_WHITE);

      // Tiêu đề
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("TEST LOADCELL 5KG"));
      display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

      // Hiển thị Lực (Newton) kích thước lớn
      display.setCursor(0, 16);
      display.setTextSize(2);
      display.printf("%.2f N", force_N);

      // Hiển thị Khối lượng (gram)
      display.setTextSize(1);
      display.setCursor(0, 36);
      display.printf("m = %.1f g", weight_grams);

      // Hướng dẫn nút Tare
      display.setCursor(80, 36);
      display.print(F("[N1:0]"));

      // Thanh lực kế đồ họa (Dải 0 - 10N cho học sinh thực hành)
      display.drawRect(0, 48, 128, 14, SSD1306_WHITE);
      int barW = map((int)(force_N * 10), 0, 100, 0, 124);
      if (barW > 124) barW = 124;
      if (barW < 0) barW = 0;
      display.fillRect(2, 50, barW, 10, SSD1306_WHITE);

      display.display();
    }
  } else {
    // Nếu bị ngắt kết nối giữa chừng
    Serial.println(F("Dang cho module HX711 san sang..."));
  }

  delay(80); // Tốc độ quét ~12 lần/giây
}