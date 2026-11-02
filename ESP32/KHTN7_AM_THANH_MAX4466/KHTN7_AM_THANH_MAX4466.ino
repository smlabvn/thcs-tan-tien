// ================================================================
// HỘP THÍ NGHIỆM KHTN 7: KHẢO SÁT SÓNG ÂM & BIÊN ĐỘ ÂM THANH
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Cảm biến âm thanh: MAX4466 Electret Mic Amplifier (Nối OUT -> GPIO 35, VCC -> 3V3)
// Màn hình hiển thị: OLED 0.96 inch SSD1306 (I2C: SDA=21, SCL=22)
// 2 Nút nhấn điều khiển: Nút 1 (GPIO 18), Nút 2 (GPIO 19)
// Baudrate Serial: 115200 bps
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
  delay(200);
  Serial.println(F("\n>> HE THONG AM THANH MAX4466 KHOI DONG THANH CONG! <<"));

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

  // Quy đổi độ to của âm ra đơn vị Decibel (dB) ước tính (45 - 105 dB)
  float soundDb = 45.0 + (volts * 28.0);
  if (soundDb > 105.0) soundDb = 105.0;
  if (soundDb < 45.0)  soundDb = 45.0;

  // 3. Gửi dữ liệu lên web PhysiX qua cổng USB Serial nếu đang chạy
  if (isRunning) {
    Serial.print(F("Do to: "));
    Serial.print(soundDb, 1);
    Serial.print(F(" dB  |  Bien do Vpp: "));
    Serial.print(volts, 2);
    Serial.println(F(" V"));
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
}
