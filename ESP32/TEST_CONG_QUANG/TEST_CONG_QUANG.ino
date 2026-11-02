// ================================================================
// HỘP THÍ NGHIỆM KHTN 7 & VẬT LÝ 10: ĐO THỜI GIAN & TỐC ĐỘ (s - t - v)
// Cảm biến: 2 Cổng quang điện hồng ngoại (Photogates)
// Cổng quang A (Bắt đầu): Chân DO -> GPIO 13
// Cổng quang B (Kết thúc): Chân DO -> GPIO 25
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

const int GATE_A_PIN = 13; // Cổng quang A (Xuất phát) nối GPIO 13
const int GATE_B_PIN = 25; // Cổng quang B (Về đích) nối GPIO 25

const int BTN_START  = 18; // Nút 1: Bắt đầu / Tạm dừng
const int BTN_RESET  = 19; // Nút 2: Reset lượt đo mới

// Khoảng cách thực tế giữa 2 cổng quang trên máng nghiêng (cm)
// Bạn đo thước rồi chỉnh con số này (ví dụ: 30 cm)
const float DISTANCE_S_CM = 30.0; 

volatile unsigned long timeA_us = 0;
volatile unsigned long timeB_us = 0;
volatile bool passA = false;
volatile bool passB = false;

// Ngắt Cổng A: Khi cờ vừa chạm tia Cổng A
void IRAM_ATTR isrGateA() {
  if (!passA) {
    timeA_us = micros();
    passA = true;
  }
}

// Ngắt Cổng B: Khi cờ chạm tia Cổng B
void IRAM_ATTR isrGateB() {
  if (passA && !passB) {
    timeB_us = micros();
    passB = true;
  }
}

bool isRunning = true;
bool oledFound = false;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=================================================="));
  Serial.println(F(">> HE THONG 2 CONG QUANG DIEN (ESP32) SAN SANG! <<"));
  Serial.println(F("Cong A: GPIO 13 | Cong B: GPIO 25"));
  Serial.print(F("Quang duong s = "));
  Serial.print(DISTANCE_S_CM);
  Serial.println(F(" cm"));
  Serial.println(F("=================================================="));

  // Cấu hình chân với trở kéo lên nội
  pinMode(GATE_A_PIN, INPUT_PULLUP);
  pinMode(GATE_B_PIN, INPUT_PULLUP);
  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);

  // Kích hoạt ngắt phần cứng FALLING (khi bị che tia: 1 -> 0)
  attachInterrupt(digitalPinToInterrupt(GATE_A_PIN), isrGateA, FALLING);
  attachInterrupt(digitalPinToInterrupt(GATE_B_PIN), isrGateB, FALLING);

  // Khởi tạo OLED an toàn
  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledFound = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(5, 18);
    display.println(F("KHTN: DONG HO HIEN SO"));
    display.setCursor(5, 34);
    display.println(F("2 Cong Quang (IR)"));
    display.display();
    delay(800);
  } else {
    Serial.println(F("Luu y: Chua tim thay OLED (kiem tra day SDA=21, SCL=22)"));
  }

  Serial.println(F(">> SAN SANG! Hay cho xe chay qua Cong A roi sang Cong B..."));
}

void loop() {
  // 1. Nút 2 (GPIO 19): Nhấn để XÓA số đo cũ, chuẩn bị cho lượt thả xe mới
  if (digitalRead(BTN_RESET) == LOW) {
    delay(50);
    if (digitalRead(BTN_RESET) == LOW) {
      passA = false;
      passB = false;
      timeA_us = 0;
      timeB_us = 0;
      Serial.println(F("\n>> DA RESET! San sang cho luot do moi..."));
      if (oledFound) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(15, 25);
        display.println(F("SAN SANG DO MOI!"));
        display.display();
      }
      delay(300);
      while (digitalRead(BTN_RESET) == LOW) delay(10);
    }
  }

  // 2. Nút 1 (GPIO 18): Tạm dừng / Tiếp tục
  if (digitalRead(BTN_START) == LOW) {
    delay(50);
    if (digitalRead(BTN_START) == LOW) {
      isRunning = !isRunning;
      Serial.println(isRunning ? F(">> TIEP TUC") : F(">> TAM DUNG"));
      while (digitalRead(BTN_START) == LOW) delay(10);
    }
  }

  // 3. Xử lý khi xe lăn đã chạy qua cả 2 cổng A và B
  if (passA && passB) {
    // Thời gian delta_t tính bằng giây
    float delta_t_sec = (timeB_us - timeA_us) / 1000000.0;
    
    // Tốc độ v = s / t (cm/s)
    float velocity_cms = (delta_t_sec > 0.0001) ? (DISTANCE_S_CM / delta_t_sec) : 0;
    float velocity_ms  = velocity_cms / 100.0;

    // Gửi giá trị tốc độ lên đồ thị web PhysiX qua cáp Type-C Serial
    if (isRunning) {
      Serial.println(velocity_cms, 2); // Web đọc dòng này để vẽ đồ thị
      Serial.print(F(">>> KET QUA: t = "));
      Serial.print(delta_t_sec, 4);
      Serial.print(F(" s | Van toc v = "));
      Serial.print(velocity_cms, 2);
      Serial.print(F(" cm/s ("));
      Serial.print(velocity_ms, 3);
      Serial.println(F(" m/s)\n"));
    }

    // Hiển thị kết quả lên màn hình OLED
    if (oledFound) {
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
      display.printf("v = %.3f m/s", velocity_ms);
      display.display();
    }

    delay(300); // Chống dội
  } 
  else if (passA && !passB) {
    // Xe vừa cắt Cổng A, đang trên đường đến Cổng B
    if (oledFound) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 8);
      display.println(F("XE DANG CHAY..."));
      display.setCursor(0, 26);
      display.setTextSize(2);
      display.println(F("GATE A -> B"));
      display.display();
    }
  } 
  else {
    // Trạng thái chờ xuất phát
    if (oledFound) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("CHO XE QUA CONG A..."));

      display.setCursor(0, 18);
      display.printf("Quang duong s: %.0f cm", DISTANCE_S_CM);

      display.setCursor(0, 34);
      display.print(F("A: GPIO 13 | B: GPIO 25"));

      display.setCursor(0, 50);
      display.print(F("Bam Nut 2 de Reset"));
      display.display();
    }
  }

  delay(50);
}