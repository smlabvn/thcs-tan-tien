// ==============================================================================
//           HỘP THÍ NGHIỆM SMLAB PHYSIX IOT & KHTN ALL-IN-ONE MASTER
//             TRƯỜNG THCS TÂY TIẾN - ĐỀ TÀI KHOA HỌC KỸ THUẬT (KHKT)
//
// TÍCH HỢP 4 BÀI THÍ NGHIỆM TRÊN 1 BO MẠCH DUY NHẤT (ESP32 Type-C WROOM-32)
// CHỌN & CHUYỂN ĐỔI BÀI THÍ NGHIỆM TIỆN LỢI QUA 2 NÚT NHẤN VẬT LÝ & OLED
//
// * QUY TẮC ĐIỀU KHIỂN:
//   - KHI Ở MENU CHÍNH:
//       + NÚT 2 (GPIO 19): Nhấn để CHUYỂN BÀI (1 -> 2 -> 3 -> 4 -> 1)
//       + NÚT 1 (GPIO 18): Nhấn để VÀO BÀI ĐÃ CHỌN (OK)
//   - KHI ĐANG TRONG BÀI THÍ NGHIỆM:
//       + NÚT 2 (GPIO 19): NHẤN 1 CÁI ĐỂ QUAY LẠI MENU CHỌN BÀI KHÁC NGAY!
//       + NÚT 1 (GPIO 18): Tạm dừng / Tiếp tục (Loadcell: Tare về 0)
//
// * SƠ ĐỒ CHÂN:
//   1. OLED 0.96" I2C           : SDA -> GPIO 21, SCL -> GPIO 22 (0x3C)
//   2. NÚT 1 (XANH)             : GPIO 18
//   3. NÚT 2 (ĐỎ)               : GPIO 19
//   4. MICRO MAX4466 (KHTN 7)   : OUT -> GPIO 35, VCC -> 3.3V
//   5. 2 CỔNG QUANG (KHTN 7/10) : Cổng A -> GPIO 13, Cổng B -> GPIO 25, VCC -> 5V
//   6. LOADCELL 5KG + HX711     : DT -> GPIO 26, SCK -> GPIO 27, VCC -> 5V
//   7. CẢM BIẾN DÒNG INA219     : SDA -> GPIO 21, SCL -> GPIO 22 (0x40)
//
// Tốc độ Baudrate: 115200 bps
// ==============================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>
#include "HX711.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Chân 2 nút nhấn vật lý
const int BTN_OK   = 18; // Nút 1: Vào bài / Tạm dừng / Tare
const int BTN_MODE = 19; // Nút 2: Chuyển bài ở Menu / Nhấn để THOÁT VỀ MENU

// Chân Micro MAX4466
const int MIC_PIN = 35; // GPIO 35 (ADC1)

// Chân 2 Cổng quang điện hồng ngoại
const int GATE_A_PIN = 13; // Cổng A
const int GATE_B_PIN = 25; // Cổng B
float distance_s_cm = 30.0; // Khoảng cách giữa 2 cổng (cm) - Có thể thay đổi từ Web hoặc Nút 1!

// Chân Loadcell 5kg + HX711
const int LOADCELL_DOUT = 26;
const int LOADCELL_SCK  = 27;
HX711 scale;
float loadcell_calib = 420.0;

// Cảm biến I2C INA219
Adafruit_INA219 ina219(0x40);

// ================= CÁC TRẠNG THÁI HỆ THỐNG =================
enum SystemState {
  STATE_MENU = 0,
  STATE_EXP_SOUND = 1,
  STATE_EXP_PHOTOGATE = 2,
  STATE_EXP_LOADCELL = 3,
  STATE_EXP_OHM = 4
};

SystemState currentState = STATE_MENU;
int menuCursor = 1; // 1: Sound, 2: Photogate, 3: Loadcell, 4: Ohm
bool isRunning = true;
bool oledOK = false;
bool inaOK = false;
bool hx711OK = false;

// Biến ngắt cổng quang điện
volatile unsigned long timeA_us = 0;
volatile unsigned long timeB_us = 0;
volatile bool passA = false;
volatile bool passB = false;
bool photogateReported = false;
float lastRecordedVel = 0.0;
float lastRecordedTime = 0.0;

// Biến hỗ trợ thí nghiệm Lực Loadcell (Bắt đỉnh Peak & Khóa lực Hold)
float peakForce = 0.0;
bool forceHold = false;
float holdForceVal = 0.0;

void IRAM_ATTR isrGateA() {
  if (currentState == STATE_EXP_PHOTOGATE && !passA) {
    timeA_us = micros();
    passA = true;
  }
}

void IRAM_ATTR isrGateB() {
  if (currentState == STATE_EXP_PHOTOGATE && passA && !passB) {
    timeB_us = micros();
    passB = true;
  }
}

// Khai báo trước các hàm
void showMenu();
void handleMenuInput();
void enterExperiment(int expId);
void returnToMenu();
void checkSerialCommands();
void loopSoundExperiment();
void loopPhotogateExperiment();
void loopLoadcellExperiment();
void loopOhmExperiment();

// ================= KHỞI ĐỘNG (SETUP) =================
void setup() {
  Serial.begin(115200);
  delay(300);

  Serial.println(F("\n========================================================"));
  Serial.println(F(">> HOP THI NGHIEM SMLAB PHYSIX ALL-IN-ONE KHOI DONG! <<"));
  Serial.println(F("THCS TAY TIEN - 4 CHE DO - QUAY LAI MENU BANG NUT 2"));
  Serial.println(F("========================================================"));

  pinMode(BTN_OK, INPUT_PULLUP);
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(GATE_A_PIN, INPUT_PULLUP);
  pinMode(GATE_B_PIN, INPUT_PULLUP);
  analogReadResolution(12);

  Wire.begin(21, 22);

  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 15);
    display.println(F("THCS TAY TIEN"));
    display.setCursor(10, 32);
    display.println(F("HOP THI NGHIEM KHTN"));
    display.setCursor(10, 48);
    display.println(F("ALL-IN-ONE (ESP32)"));
    display.display();
    delay(1200);
  }

  if (ina219.begin()) {
    inaOK = true;
    ina219.setCalibration_32V_2A();
  }

  scale.begin(LOADCELL_DOUT, LOADCELL_SCK);
  if (scale.wait_ready_timeout(500)) {
    hx711OK = true;
    scale.set_scale(loadcell_calib);
    scale.tare();
  }

  showMenu();
}

// ================= VÒNG LẶP CHÍNH (LOOP) =================
void loop() {
  checkSerialCommands();

  if (currentState == STATE_MENU) {
    handleMenuInput();
  } else {
    // NÚT 2 (GPIO 19): NHẤN 1 CÁI ĐỂ QUAY LẠI MENU CHỌN BÀI KHÁC NGAY LẬP TỨC!
    if (digitalRead(BTN_MODE) == LOW) {
      delay(40); // Khử rung phím
      if (digitalRead(BTN_MODE) == LOW) {
        returnToMenu();
        while (digitalRead(BTN_MODE) == LOW) delay(10); // Chờ nhả nút
        return;
      }
    }

    // Chạy bài thí nghiệm tương ứng
    switch (currentState) {
      case STATE_EXP_SOUND:
        loopSoundExperiment();
        break;
      case STATE_EXP_PHOTOGATE:
        loopPhotogateExperiment();
        break;
      case STATE_EXP_LOADCELL:
        loopLoadcellExperiment();
        break;
      case STATE_EXP_OHM:
        loopOhmExperiment();
        break;
      default:
        break;
    }
  }
}

// Xử lý lệnh từ Web Serial (RESET, TARE, HOLD)
void checkSerialCommands() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "RESET") {
      if (currentState == STATE_EXP_PHOTOGATE) {
        passA = false;
        passB = false;
        timeA_us = 0;
        timeB_us = 0;
        photogateReported = false;
        lastRecordedVel = 0.0;
        lastRecordedTime = 0.0;
        Serial.println(F(">> [RESET]: San sang cho luot tha xe moi!"));
      } else if (currentState == STATE_EXP_LOADCELL) {
        peakForce = 0.0;
        forceHold = false;
        scale.tare();
        Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N va reset dinh!"));
      }
    } else if (cmd == "TARE") {
      if (currentState == STATE_EXP_LOADCELL) {
        scale.tare();
        peakForce = 0.0;
        forceHold = false;
        Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N!"));
      }
    } else if (cmd == "HOLD") {
      if (currentState == STATE_EXP_LOADCELL) {
        forceHold = !forceHold;
        if (forceHold) holdForceVal = peakForce;
        Serial.println(forceHold ? F(">> [HOLD]: Da khoa gia tri luc!") : F(">> [UNHOLD]: Da mo khoa!"));
      }
    } else if (cmd.startsWith("DIST:") || cmd.startsWith("dist:") || cmd.startsWith("S:") || cmd.startsWith("s:")) {
      int colonIdx = cmd.indexOf(':');
      float newDist = cmd.substring(colonIdx + 1).toFloat();
      if (newDist >= 5.0 && newDist <= 200.0) {
        distance_s_cm = newDist;
        Serial.print(F(">> [DIST]: Da cap nhat khoang cach s = "));
        Serial.print(distance_s_cm, 1);
        Serial.println(F(" cm"));
      }
    }
  }
}

// ================= GIAO DIỆN & XỬ LÝ MENU =================
void showMenu() {
  if (!oledOK) return;
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Tiêu đề Menu
  display.setCursor(0, 0);
  display.println(F("=== CHON THI NGHIEM ==="));
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // Danh sách 4 bài thí nghiệm
  display.setCursor(0, 13);
  display.print(menuCursor == 1 ? F("> 1.Am thanh MAX4466") : F("  1.Am thanh MAX4466"));

  display.setCursor(0, 24);
  display.print(menuCursor == 2 ? F("> 2.Toc do 2 Cong IR") : F("  2.Toc do 2 Cong IR"));

  display.setCursor(0, 35);
  display.print(menuCursor == 3 ? F("> 3.Luc ke Loadcell") : F("  3.Luc ke Loadcell"));

  display.setCursor(0, 46);
  display.print(menuCursor == 4 ? F("> 4.Dinh luat Ohm") : F("  4.Dinh luat Ohm"));

  // Dòng hướng dẫn dưới đáy màn hình
  display.drawLine(0, 56, 128, 56, SSD1306_WHITE);
  display.setCursor(0, 57);
  display.println(F("N2: Chon   N1: Vao"));

  display.display();
}

void handleMenuInput() {
  // Nút 2: Chuyển con trỏ (1 -> 2 -> 3 -> 4 -> 1)
  if (digitalRead(BTN_MODE) == LOW) {
    delay(40);
    if (digitalRead(BTN_MODE) == LOW) {
      menuCursor++;
      if (menuCursor > 4) menuCursor = 1;
      showMenu();
      while (digitalRead(BTN_MODE) == LOW) delay(10);
    }
  }

  // Nút 1: Vào bài đã chọn
  if (digitalRead(BTN_OK) == LOW) {
    delay(40);
    if (digitalRead(BTN_OK) == LOW) {
      enterExperiment(menuCursor);
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }
}

void enterExperiment(int expId) {
  isRunning = true;

  if (expId == 1) {
    currentState = STATE_EXP_SOUND;
    Serial.println(F("\n>> MODE:sound"));
    Serial.println(F(">> HE THONG AM THANH MAX4466 KHOI DONG THANH CONG! <<"));
  } else if (expId == 2) {
    currentState = STATE_EXP_PHOTOGATE;
    passA = false;
    passB = false;
    timeA_us = 0;
    timeB_us = 0;
    photogateReported = false;
    lastRecordedVel = 0.0;
    lastRecordedTime = 0.0;
    attachInterrupt(digitalPinToInterrupt(GATE_A_PIN), isrGateA, FALLING);
    attachInterrupt(digitalPinToInterrupt(GATE_B_PIN), isrGateB, FALLING);
    Serial.println(F("\n>> MODE:ultrasonic"));
    Serial.println(F(">> HE THONG 2 CONG QUANG DIEN KHOI DONG THANH CONG! <<"));
  } else if (expId == 3) {
    currentState = STATE_EXP_LOADCELL;
    peakForce = 0.0;
    forceHold = false;
    holdForceVal = 0.0;
    if (scale.wait_ready_timeout(800)) {
      scale.set_scale(loadcell_calib);
      scale.tare();
    }
    Serial.println(F("\n>> MODE:force"));
    Serial.println(F(">> HE THONG LUC KE LOADCELL 5KG KHOI DONG THANH CONG! <<"));
  } else if (expId == 4) {
    currentState = STATE_EXP_OHM;
    Serial.println(F("\n>> MODE:ohm"));
    Serial.println(F(">> HE THONG DINH LUAT OHM INA219 KHOI DONG THANH CONG! <<"));
  }

  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(10, 24);
    display.println(F("DANG KHOI DONG..."));
    display.display();
    delay(300);
  }
}

// Hàm quay lại Menu chọn bài khác
void returnToMenu() {
  if (currentState == STATE_EXP_PHOTOGATE) {
    detachInterrupt(digitalPinToInterrupt(GATE_A_PIN));
    detachInterrupt(digitalPinToInterrupt(GATE_B_PIN));
  }

  currentState = STATE_MENU;
  Serial.println(F("\n>> MODE:menu"));
  Serial.println(F(">> [MENU]: Da quay ve Menu Chon Bai Thi Nghiem!"));

  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(15, 26);
    display.println(F("VE MENU CHINH..."));
    display.display();
    delay(250);
  }
  showMenu();
}

// ================= [BÀI 1]: SÓNG ÂM THANH =================
void loopSoundExperiment() {
  // Nút 1: Tạm dừng / Tiếp tục
  if (digitalRead(BTN_OK) == LOW) {
    delay(40);
    if (digitalRead(BTN_OK) == LOW) {
      isRunning = !isRunning;
      Serial.println(isRunning ? F(">> RUN") : F(">> PAUSE"));
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  unsigned long startMillis = millis();
  unsigned int signalMax = 0;
  unsigned int signalMin = 4095;

  while (millis() - startMillis < 50) {
    // Kiểm tra Nút 2 thoát sớm
    if (digitalRead(BTN_MODE) == LOW) return;

    unsigned int sample = analogRead(MIC_PIN);
    if (sample > signalMax) signalMax = sample;
    if (sample < signalMin) signalMin = sample;
  }

  unsigned int peakToPeak = signalMax - signalMin;
  float volts = (peakToPeak * 3.3) / 4095.0;
  float soundDb = 45.0 + (volts * 28.0);
  if (soundDb > 105.0) soundDb = 105.0;
  if (soundDb < 45.0)  soundDb = 45.0;

  if (isRunning) {
    Serial.print(F("Do to: "));
    Serial.print(soundDb, 1);
    Serial.print(F(" dB  |  Bien do Vpp: "));
    Serial.print(volts, 2);
    Serial.println(F(" V"));
  }

  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("AM THANH | "));
    display.print(isRunning ? F("RUN") : F("PAUSE"));
    display.setCursor(85, 0);
    display.print(F("[N2:Menu]"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.printf("%.1f dB", soundDb);

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.printf("Vpp: %.2fV", volts);

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)soundDb, 45, 95, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 0) barW = 0;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
    display.display();
  }
}

// ================= [BÀI 2]: 2 CỔNG QUANG ĐIỆN (KHOẢNG CÁCH s THAY ĐỔI ĐƯỢC) =================
void loopPhotogateExperiment() {
  // Nút 1: Đổi khoảng cách s (khi xe chưa chạy) HOẶC Đặt lại lượt mới (sau khi xe đã chạy xong)
  if (digitalRead(BTN_OK) == LOW) {
    delay(40);
    if (digitalRead(BTN_OK) == LOW) {
      if (passA || passB || photogateReported) {
        // Đã chạy xong lượt: Bấm Nút 1 để sẵn sàng cho lượt mới
        passA = false;
        passB = false;
        timeA_us = 0;
        timeB_us = 0;
        photogateReported = false;
        lastRecordedVel = 0.0;
        lastRecordedTime = 0.0;
        Serial.println(F(">> [RESET]: San sang cho luot tha xe moi!"));
        if (oledOK) {
          display.clearDisplay();
          display.setTextSize(1);
          display.setCursor(15, 26);
          display.println(F("SAN SANG DO..."));
          display.display();
        }
      } else {
        // Đang chờ thả xe: Bấm Nút 1 để THAY ĐỔI KHOẢNG CÁCH s (20 -> 30 -> 40 -> 50 -> 60 -> 80 -> 20cm)!
        if (distance_s_cm < 29.0) distance_s_cm = 30.0;
        else if (distance_s_cm < 39.0) distance_s_cm = 40.0;
        else if (distance_s_cm < 49.0) distance_s_cm = 50.0;
        else if (distance_s_cm < 59.0) distance_s_cm = 60.0;
        else if (distance_s_cm < 79.0) distance_s_cm = 80.0;
        else distance_s_cm = 20.0;

        Serial.print(F(">> DIST:"));
        Serial.println(distance_s_cm, 1);
        Serial.print(F(">> [DIST]: Da doi khoang cach s = "));
        Serial.print(distance_s_cm, 1);
        Serial.println(F(" cm"));
      }
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  if (passA && passB) {
    if (!photogateReported) {
      unsigned long delta_us = timeB_us - timeA_us;
      lastRecordedTime = delta_us / 1000000.0;
      lastRecordedVel = (lastRecordedTime > 0.0001) ? (distance_s_cm / lastRecordedTime) : 0;
      photogateReported = true;

      // In kết quả rõ ràng chốt 1 lần để Web Serial bắt trọn vẹn
      Serial.print(F("Van toc: "));
      Serial.print(lastRecordedVel, 2);
      Serial.print(F(" cm/s  |  Thoi gian t: "));
      Serial.print(lastRecordedTime, 4);
      Serial.print(F(" s  |  s = "));
      Serial.print(distance_s_cm, 1);
      Serial.println(F(" cm"));
    }

    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("DA QUA 2 CONG! [N2]"));

      display.setCursor(0, 16);
      display.setTextSize(2);
      display.printf("%.1f cm/s", lastRecordedVel);

      display.setTextSize(1);
      display.setCursor(0, 38);
      display.printf("t=%.3fs | s=%.0fcm", lastRecordedTime, distance_s_cm);
      display.setCursor(0, 52);
      display.printf("N1:Luot moi | N2:Menu");
      display.display();
    }
    delay(100);
  } else if (passA && !passB) {
    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("CONG A: DA QUA! [N2]"));
      display.setCursor(0, 24);
      display.println(F("DANG CHO CONG B..."));
      display.setCursor(0, 52);
      display.println(F("BAM NUT 2 DE VE MENU"));
      display.display();
    }
  } else {
    // Chờ xuất phát
    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("TOC DO IR | [N2:Menu]"));
      display.setCursor(0, 18);
      display.println(F("SAN SANG: THA XE"));
      display.setTextSize(2);
      display.setCursor(0, 32);
      display.printf("s = %.0f cm", distance_s_cm);
      display.setTextSize(1);
      display.setCursor(0, 52);
      display.println(F("N1:Doi s   N2:Ve Menu"));
      display.display();
    }
  }
  delay(40);
}

// ================= [BÀI 3]: LỰC KẾ LOADCELL 5KG (BẮT ĐỈNH & KHÓA SỐ ĐO) =================
void loopLoadcellExperiment() {
  // Nút 1: Khóa giá trị (HOLD) khi có lực, hoặc TARE về 0 khi không có lực
  if (digitalRead(BTN_OK) == LOW) {
    delay(40);
    if (digitalRead(BTN_OK) == LOW) {
      if (forceHold) {
        forceHold = false;
        Serial.println(F(">> [UNHOLD]: Da mo khoa luc ke!"));
      } else {
        if (peakForce > 0.15) {
          forceHold = true;
          holdForceVal = peakForce;
          Serial.print(F(">> [HOLD]: Da khoa gia tri luc dinh: "));
          Serial.print(holdForceVal, 2);
          Serial.println(F(" N"));
        } else {
          scale.tare();
          peakForce = 0.0;
          Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N!"));
        }
      }

      if (oledOK) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(15, 26);
        if (forceHold) display.printf("KHOA: %.2f N", holdForceVal);
        else display.println(F(">> DA TARE VE 0 <<"));
        display.display();
      }
      delay(250);
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  if (scale.is_ready()) {
    float grams = scale.get_units(2);
    if (grams < 0 && grams > -1.5) grams = 0;
    float liveForce_N = (grams / 1000.0) * 9.80665;
    if (liveForce_N < 0) liveForce_N = 0;

    // Tự động ghi nhận đỉnh lực cực đại (Peak Force) khi kéo lò xo
    if (liveForce_N > peakForce) {
      peakForce = liveForce_N;
    }

    float displayForce = forceHold ? holdForceVal : liveForce_N;

    if (isRunning) {
      Serial.print(F("Luc: "));
      Serial.print(displayForce, 2);
      Serial.print(F(" N  |  Dinh: "));
      Serial.print(peakForce, 2);
      Serial.print(F(" N  |  m = "));
      Serial.print(grams, 1);
      Serial.println(F(" g"));
    }

    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(forceHold ? F("LUC [DA KHOA] | [N2]") : F("LUC KE | [N2:Menu]"));

      display.setCursor(0, 16);
      display.setTextSize(2);
      display.printf("%.2f N", displayForce);

      display.setTextSize(1);
      display.setCursor(0, 38);
      display.printf("Dinh(Max): %.2f N", peakForce);

      display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
      int barW = map((int)(displayForce * 10), 0, 100, 0, 124);
      if (barW > 124) barW = 124;
      if (barW < 0) barW = 0;
      display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
      display.display();
    }
  }
  delay(60);
}

// ================= [BÀI 4]: ĐỊNH LUẬT ÔM INA219 =================
void loopOhmExperiment() {
  // Nút 1: Tạm dừng / Tiếp tục
  if (digitalRead(BTN_OK) == LOW) {
    delay(40);
    if (digitalRead(BTN_OK) == LOW) {
      isRunning = !isRunning;
      Serial.println(isRunning ? F(">> RUN") : F(">> PAUSE"));
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  float busVoltage_V = ina219.getBusVoltage_V();
  float current_mA   = ina219.getCurrent_mA();
  if (current_mA < 0.2) current_mA = 0;

  float current_A      = current_mA / 1000.0;
  float resistance_Ohm = (current_mA > 1.0) ? (busVoltage_V / current_A) : 0.0;

  if (isRunning) {
    Serial.print(F("Dong dien I: "));
    Serial.print(current_mA, 2);
    Serial.print(F(" mA  |  U = "));
    Serial.print(busVoltage_V, 2);
    Serial.print(F(" V  |  R = "));
    Serial.print(resistance_Ohm, 1);
    Serial.println(F(" Ohm"));
  }

  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("DINH LUAT OHM | [N2]"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.printf("%.1f mA", current_mA);

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.printf("U = %.2f V | R = 120R", busVoltage_V);

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)current_mA, 0, 50, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 0) barW = 0;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
    display.display();
  }
  delay(80);
}
