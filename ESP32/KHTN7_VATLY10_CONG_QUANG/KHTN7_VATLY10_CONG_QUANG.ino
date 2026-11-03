// ================================================================
// HỘP THÍ NGHIỆM KHTN 7 & VẬT LÝ 10: ĐO THỜI GIAN & TỐC ĐỘ (s - t - v)
// Cảm biến: 2 Cổng quang điện hồng ngoại (Photogates / Cảm biến chữ U)
// Cổng quang A (Bắt đầu): Chân DO -> GPIO 13
// Cổng quang B (Kết thúc): Chân DO -> GPIO 25 (Lưu ý: Không dùng GPIO 12 để tránh kẹt bootloader)
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// 2 Nút nhấn: Nút 1 Start/Stop (GPIO 18), Nút 2 Reset lượt mới (GPIO 19)
// Baudrate Serial: 115200 bps
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int GATE_A_PIN = 13; // Cổng quang A (Vị trí 1) nối GPIO 13
const int GATE_B_PIN = 25; // Cổng quang B (Vị trí 2) nối GPIO 25

const int BTN_START  = 18; // Nút 1: Bắt đầu / Tạm dừng
const int BTN_RESET  = 19; // Nút 2: Đặt lại đo lượt mới

// Khoảng cách thực tế giữa 2 cổng quang trên máng nghiêng (cm)
const float DISTANCE_S_CM = 30.0; // 30 cm = 0.3 m

volatile unsigned long timeA_us = 0;
volatile unsigned long timeB_us = 0;
volatile bool passA = false;
volatile bool passB = false;

// Ngắt phần cứng cổng quang A
void IRAM_ATTR isrGateA() {
  if (!passA) {
    timeA_us = micros();
    passA = true;
  }
}

// Ngắt phần cứng cổng quang B
void IRAM_ATTR isrGateB() {
  if (passA && !passB) {
    timeB_us = micros();
    passB = true;
  }
}

bool isRunning = true;
bool oledFound = false;
bool photogateReported = false;
float lastSpeed = 0.0;
float lastTime = 0.0;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=================================================="));
  Serial.println(F(">> HE THONG 2 CONG QUANG DIEN KHOI DONG THANH CONG! <<"));
  Serial.println(F("Cong A: GPIO 13 | Cong B: GPIO 25"));
  Serial.print(F("Khoang cach s = "));
  Serial.print(DISTANCE_S_CM);
  Serial.println(F(" cm"));
  Serial.println(F("=================================================="));

  pinMode(GATE_A_PIN, INPUT_PULLUP);
  pinMode(GATE_B_PIN, INPUT_PULLUP);
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);

  // Kích hoạt ngắt khi cờ chắn sáng cắt qua tia (FALLING: 1 -> 0)
  attachInterrupt(digitalPinToInterrupt(GATE_A_PIN), isrGateA, FALLING);
  attachInterrupt(digitalPinToInterrupt(GATE_B_PIN), isrGateB, FALLING);

  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledFound = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(5, 18);
    display.println(F("KHTN: DONG HO TOC DO"));
    display.setCursor(5, 34);
    display.println(F("2 Cong Quang (IR)"));
    display.display();
    delay(800);
  }

  Serial.println(F(">> SAN SANG! Hay tha xe chuyen dong qua Cong A sang Cong B..."));
}

void loop() {
  // 1. Nút 2 (GPIO 19): Đặt lại trạng thái để đo lượt mới
  if (digitalRead(BTN_RESET) == LOW) {
    delay(50);
    if (digitalRead(BTN_RESET) == LOW) {
      passA = false;
      passB = false;
      timeA_us = 0;
      timeB_us = 0;
      photogateReported = false;
      lastSpeed = 0.0;
      lastTime = 0.0;
      Serial.println(F(">> [RESET]: Da dat lai san sang cho luot tha xe moi!"));
      if (oledFound) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(20, 26);
        display.println(F("SAN SANG DO..."));
        display.display();
      }
      while (digitalRead(BTN_RESET) == LOW) delay(10);
    }
  }

  // Lệnh Reset từ Web Serial
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "RESET") {
      passA = false;
      passB = false;
      timeA_us = 0;
      timeB_us = 0;
      photogateReported = false;
      lastSpeed = 0.0;
      lastTime = 0.0;
      Serial.println(F(">> [RESET]: Da dat lai san sang cho luot tha xe moi!"));
    }
  }

  // 2. Nút 1 (GPIO 18): Bật / Tạm dừng gửi dữ liệu lên Web
  if (digitalRead(BTN_START) == LOW) {
    delay(50);
    if (digitalRead(BTN_START) == LOW) {
      isRunning = !isRunning;
      Serial.print(F(">> TRANG THAI: "));
      Serial.println(isRunning ? F("RUN") : F("PAUSE"));
      while (digitalRead(BTN_START) == LOW) delay(10);
    }
  }

  // 3. Xử lý khi xe đã đi qua cả 2 cổng quang A và B
  if (passA && passB) {
    if (!photogateReported) {
      unsigned long delta_us = timeB_us - timeA_us;
      lastTime = delta_us / 1000000.0; // Thời gian chuyển động (giây)
      lastSpeed = (lastTime > 0.0001) ? (DISTANCE_S_CM / lastTime) : 0;
      photogateReported = true;

      // In kết quả đúng 1 lần duy nhất để Web bắt trọn vẹn, không lặp lại khi xe đã đỗ ở đích
      if (isRunning) {
        Serial.print(F("Van toc: "));
        Serial.print(lastSpeed, 2);
        Serial.print(F(" cm/s  |  Thoi gian t: "));
        Serial.print(lastTime, 4);
        Serial.println(F(" s"));
      }
    }

    // Hiển thị trực quan trên OLED SSD1306
    if (oledFound) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("DA QUA 2 CONG!"));

      display.setCursor(0, 16);
      display.setTextSize(2);
      display.printf("%.1f cm/s", lastSpeed);

      display.setTextSize(1);
      display.setCursor(0, 38);
      display.printf("t = %.4f s", lastTime);

      display.setCursor(0, 50);
      display.print(F("N2: Luot moi"));

      display.display();
    }

    delay(100);
  } else if (passA && !passB) {
    // Đã qua cổng A, đang chờ tới cổng B
    if (oledFound) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 10);
      display.println(F("CONG A: DA QUA!"));
      display.setCursor(0, 30);
      display.println(F("DANG CHO CONG B..."));
      display.display();
    }
  }

  delay(50);
}
