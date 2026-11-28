// ==============================================================================
//             HỘP THÍ NGHIỆM PHYSIX IOT & KHTN ALL-IN-ONE MASTER
//             TRƯỜNG THCS TÂY TIẾN - ĐỀ TÀI KHOA HỌC KỸ THUẬT (KHKT)
//
// TÍCH HỢP 4 BÀI THÍ NGHIỆM TRÊN 1 BO MẠCH DUY NHẤT (ESP32 Type-C WROOM-32)
// CHỌN & CHUYỂN ĐỔI BÀI THÍ NGHIỆM TIỆN LỢI QUA 2 NÚT NHẤN VẬT LÝ, OLED & WEB SERIAL
//
// * QUY TẮC ĐIỀU KHIỂN:
//   - KHI Ở MENU CHÍNH:
//       + NÚT 2 (GPIO 19): Nhấn để CHUYỂN BÀI (1 -> 2 -> 3 -> 4 -> 1)
//       + NÚT 1 (GPIO 18): Nhấn để VÀO BÀI ĐÃ CHỌN (OK)
//   - KHI ĐANG TRONG BÀI THÍ NGHIỆM:
//       + NÚT 2 (GPIO 19): NHẤN 1 CÁI ĐỂ QUAY LẠI MENU CHỌN BÀI KHÁC NGAY!
//       + NÚT 1 (GPIO 18): Tạm dừng / Tiếp tục / Đặt lại lượt mới / Tare về 0
//
// * SƠ ĐỒ CHÂN:
//   1. OLED 0.96" I2C           : SDA -> GPIO 21, SCL -> GPIO 22 (0x3C)
//   2. NÚT 1 (XANH TRÁI)        : GPIO 18
//   3. NÚT 2 (XANH PHẢI)        : GPIO 19
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
const int BTN_OK   = 18; // Nút 1: Vào bài / Tạm dừng / Reset / Tare
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
unsigned long lastPhotogateBroadcastMs = 0;

// Biến hỗ trợ thí nghiệm Lực Loadcell (Bắt đỉnh Peak & Khóa lực Hold)
float liveForce_N = 0.0;
float liveGrams = 0.0;
float peakForce = 0.0;
bool forceHold = false;
float holdForceVal = 0.0;

// Biến tối ưu cho Bài 1 (Âm thanh MAX4466 - Lọc nhiễu gai ADC & Bắt đỉnh Peak dB)
float smoothSoundDb = 44.0;
float peakSoundDb = 44.0;
float soundNoiseFloorV = 0.12;

// Biến tối ưu cho Bài 4 (Định luật Ôm INA219 - Bộ lọc EMA độ phân giải cao)
float smoothOhmU = 0.0;
float smoothOhmI = 0.0;
bool ohmFilterInit = false;

#if defined(ESP32)
#define ISR_ATTR IRAM_ATTR
#else
#define ISR_ATTR
#endif

void ISR_ATTR isrGateA() {
  if (currentState == STATE_EXP_PHOTOGATE && !passA) {
    timeA_us = micros();
    passA = true;
  }
}

void ISR_ATTR isrGateB() {
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
  Serial.println(F(">> HOP THI NGHIEM PHYSIX THCS TAY TIEN ALL-IN-ONE KHOI DONG! <<"));
  Serial.println(F("THCS TAY TIEN - 4 CHE DO - QUAY LAI MENU BANG NUT 2"));
  Serial.println(F("========================================================"));

  pinMode(BTN_OK, INPUT_PULLUP);
  pinMode(BTN_MODE, INPUT_PULLUP);
  pinMode(GATE_A_PIN, INPUT_PULLUP);
  pinMode(GATE_B_PIN, INPUT_PULLUP);

#if defined(ESP32)
  analogReadResolution(12);
  Wire.begin(21, 22);
#else
  Wire.begin();
#endif

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
    // Dùng thang đo độ nhạy cao 16V - 400mA (tăng độ chính xác gấp 5 lần cho mạch Định luật Ôm THCS)
    ina219.setCalibration_16V_400mA();
  }

  // Khởi tạo nhanh HX711 không chặn (Non-blocking boot: 0ms)
  scale.begin(LOADCELL_DOUT, LOADCELL_SCK);
  scale.set_scale(loadcell_calib);
  if (scale.wait_ready_timeout(120)) {
    hx711OK = true;
    scale.tare(2); // Chỉ lấy 2 mẫu (~100ms) thay vì 10 mẫu (1000ms)
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

// Xử lý lệnh điều khiển 2 chiều từ Web Serial (RESET, TARE, HOLD, MODE:..., DIST:...)
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
        liveForce_N = 0.0;
        liveGrams = 0.0;
        forceHold = false;
        if (scale.wait_ready_timeout(120)) scale.tare(2);
        Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N va reset dinh!"));
      } else if (currentState == STATE_EXP_SOUND) {
        peakSoundDb = smoothSoundDb;
        Serial.println(F(">> [RESET]: Da xoa dinh am thanh Peak dB!"));
      }
    } else if (cmd == "TARE") {
      if (currentState == STATE_EXP_LOADCELL) {
        if (scale.wait_ready_timeout(120)) scale.tare(2);
        peakForce = 0.0;
        liveForce_N = 0.0;
        liveGrams = 0.0;
        forceHold = false;
        Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N!"));
      }
    } else if (cmd == "HOLD") {
      if (currentState == STATE_EXP_LOADCELL) {
        forceHold = !forceHold;
        if (forceHold) holdForceVal = peakForce;
        Serial.println(forceHold ? F(">> [HOLD]: Da khoa gia tri luc!") : F(">> [UNHOLD]: Da mo khoa!"));
      }
    } else if (cmd == "MODE:sound" || cmd == "MODE:1") {
      menuCursor = 1;
      enterExperiment(1);
    } else if (cmd == "MODE:ultrasonic" || cmd == "MODE:2") {
      menuCursor = 2;
      enterExperiment(2);
    } else if (cmd == "MODE:force" || cmd == "MODE:3") {
      menuCursor = 3;
      enterExperiment(3);
    } else if (cmd == "MODE:ohm" || cmd == "MODE:4") {
      menuCursor = 4;
      enterExperiment(4);
    } else if (cmd == "MODE:menu" || cmd == "MENU") {
      returnToMenu();
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
    smoothSoundDb = 44.0;
    peakSoundDb = 44.0;
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
    liveForce_N = 0.0;
    liveGrams = 0.0;
    peakForce = 0.0;
    forceHold = false;
    holdForceVal = 0.0;
    scale.set_scale(loadcell_calib);
    if (scale.wait_ready_timeout(120)) {
      hx711OK = true;
      scale.tare(2); // Tare siêu nhanh 2 mẫu (~100ms), không làm đơ màn hình
    }
    Serial.println(F("\n>> MODE:force"));
    Serial.println(F(">> HE THONG LUC KE LOADCELL 5KG KHOI DONG THANH CONG! <<"));
  } else if (expId == 4) {
    currentState = STATE_EXP_OHM;
    ohmFilterInit = false;
    if (inaOK) {
      ina219.setCalibration_16V_400mA();
    }
    Serial.println(F("\n>> MODE:ohm"));
    Serial.println(F(">> HE THONG DINH LUAT OHM INA219 KHOI DONG THANH CONG! <<"));
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

// ================= [BÀI 1]: SÓNG ÂM THANH (ĐÃ LỌC GAI NHIỄU ADC & BẮT ĐỈNH PEAK dB) =================
void loopSoundExperiment() {
  // Nút 1: Bấm nhanh để Tạm dừng/Chốt số (PAUSE/RUN) | Bấm giữ 0.6s để Reset Đỉnh âm (Peak dB) & Cân chỉnh nền yên tĩnh
  if (digitalRead(BTN_OK) == LOW) {
    unsigned long pressStart = millis();
    delay(30);
    if (digitalRead(BTN_OK) == LOW) {
      bool longPressed = false;
      while (digitalRead(BTN_OK) == LOW) {
        if (millis() - pressStart > 600) {
          longPressed = true;
          break;
        }
        delay(10);
      }
      if (longPressed) {
        peakSoundDb = 44.0;
        smoothSoundDb = 44.0;
        Serial.println(F(">> [RESET]: Da dat lai dinh am thanh Peak dB ve muc nen!"));
        if (oledOK) {
          display.clearDisplay();
          display.setTextSize(1);
          display.setCursor(12, 26);
          display.println(F(">> RESET DINH AM <<"));
          display.display();
        }
        while (digitalRead(BTN_OK) == LOW) delay(10);
      } else {
        isRunning = !isRunning;
        Serial.println(isRunning ? F(">> RUN") : F(">> PAUSE"));
      }
    }
  }

  // Quét mẫu nhanh trong 25ms với bộ lọc trung bình 4 mẫu liên tiếp để triệt tiêu hoàn toàn gai nhiễu ADC của ESP32
  unsigned long startMillis = millis();
  unsigned int signalMax = 0;
  unsigned int signalMin = 4095;

  while (millis() - startMillis < 25) {
    if (digitalRead(BTN_MODE) == LOW) return;

    // Đọc trung bình 4 lần liên tiếp (~40us) để loại bỏ nhiễu xung nhọn (spike) từ nguồn/I2C
    unsigned int s1 = analogRead(MIC_PIN);
    unsigned int s2 = analogRead(MIC_PIN);
    unsigned int s3 = analogRead(MIC_PIN);
    unsigned int s4 = analogRead(MIC_PIN);
    unsigned int sample = (s1 + s2 + s3 + s4) >> 2;

    if (sample > signalMax) signalMax = sample;
    if (sample < signalMin) signalMin = sample;
  }

  unsigned int peakToPeak = (signalMax >= signalMin) ? (signalMax - signalMin) : 0;
  float rawVolts = (peakToPeak * 3.3) / 4095.0;

  // Tự động bám nền nhiễu tĩnh khi phòng yên lặng để không bị treo dB cao
  if (rawVolts < soundNoiseFloorV) {
    soundNoiseFloorV = 0.90 * soundNoiseFloorV + 0.10 * rawVolts;
  } else if (rawVolts < soundNoiseFloorV + 0.08) {
    soundNoiseFloorV = 0.995 * soundNoiseFloorV + 0.005 * rawVolts;
  }
  if (soundNoiseFloorV < 0.04) soundNoiseFloorV = 0.04;
  if (soundNoiseFloorV > 0.35) soundNoiseFloorV = 0.35;

  float netVolts = (rawVolts > soundNoiseFloorV) ? (rawVolts - soundNoiseFloorV) : 0.0;

  // Quy đổi sang thang đo dB tự nhiên (yên tĩnh ~ 43-46 dB, nói chuyện ~ 60-72 dB, vỗ tay ~ 80-98 dB)
  float targetDb = 43.5;
  if (netVolts > 0.01) {
    targetDb = 43.5 + 18.0 * log10(1.0 + netVolts * 18.0) + (netVolts * 12.0);
  }
  if (targetDb > 102.0) targetDb = 102.0;
  if (targetDb < 43.0)  targetDb = 43.0;

  // Bộ lọc EMA bất đối xứng: Tăng lên cực nhanh (bắt tiếng vỗ tay tức thì), giảm xuống mượt mà
  if (targetDb > smoothSoundDb) {
    smoothSoundDb = 0.75 * targetDb + 0.25 * smoothSoundDb;
  } else {
    smoothSoundDb = 0.30 * targetDb + 0.70 * smoothSoundDb;
  }

  if (smoothSoundDb > peakSoundDb) {
    peakSoundDb = smoothSoundDb;
  }

  if (isRunning) {
    Serial.print(F("Do to: "));
    Serial.print(smoothSoundDb, 1);
    Serial.print(F(" dB  |  Dinh: "));
    Serial.print(peakSoundDb, 1);
    Serial.print(F(" dB  |  Bien do Vpp: "));
    Serial.print(netVolts, 2);
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

    display.setCursor(0, 15);
    display.setTextSize(2);
    display.print(smoothSoundDb, 1);
    display.print(F(" dB"));

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.print(F("Max:"));
    display.print(peakSoundDb, 1);
    display.print(F("dB | Vpp:"));
    display.print(netVolts, 2);
    display.print(F("V"));

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)smoothSoundDb, 43, 96, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 0) barW = 0;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);

    // Vạch đánh dấu Đỉnh âm cực đại (Peak Hold Marker) trên thanh VU
    int peakX = map((int)peakSoundDb, 43, 96, 2, 125);
    if (peakX > 125) peakX = 125;
    if (peakX > 4) {
      display.drawFastVLine(peakX, 53, 9, SSD1306_WHITE);
    }
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
      lastPhotogateBroadcastMs = millis();

      Serial.print(F("Van toc: "));
      Serial.print(lastRecordedVel, 2);
      Serial.print(F(" cm/s  |  Thoi gian t: "));
      Serial.print(lastRecordedTime, 4);
      Serial.print(F(" s  |  s = "));
      Serial.print(distance_s_cm, 1);
      Serial.println(F(" cm"));
    } else if (millis() - lastPhotogateBroadcastMs >= 1200) {
      // Định kỳ phát lại kết quả đang giữ trên màn hình để Web luôn bắt được kể cả khi cắm cáp sau
      lastPhotogateBroadcastMs = millis();
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
      display.print(lastRecordedVel, 1);
      display.print(F(" cm/s"));

      display.setTextSize(1);
      display.setCursor(0, 38);
      display.print(F("t="));
      display.print(lastRecordedTime, 3);
      display.print(F("s | s="));
      display.print(distance_s_cm, 0);
      display.print(F("cm"));

      display.setCursor(0, 52);
      display.print(F("N1:Luot moi | N2:Menu"));
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
    if (oledOK) {
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print(F("TOC DO IR | [N2:Menu]"));
      display.setCursor(0, 18);
      display.println(F("SAN SANG: THA XE"));
      display.setTextSize(2);
      display.setCursor(0, 32);
      display.print(F("s = "));
      display.print(distance_s_cm, 0);
      display.print(F(" cm"));
      display.setTextSize(1);
      display.setCursor(0, 52);
      display.println(F("N1:Doi s   N2:Ve Menu"));
      display.display();
    }
  }
  delay(40);
}

// ================= [BÀI 3]: LỰC KẾ LOADCELL 5KG (KHỞI ĐỘNG TỨC THÌ & BẮT ĐỈNH) =================
void loopLoadcellExperiment() {
  if (digitalRead(BTN_OK) == LOW) {
    delay(30);
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
          if (scale.wait_ready_timeout(120)) {
            scale.tare(2); // Tare cực nhanh 2 mẫu (~100ms)
          }
          liveForce_N = 0.0;
          liveGrams = 0.0;
          peakForce = 0.0;
          Serial.println(F(">> [TARE]: Da dua luc ke ve 0.00 N!"));
        }
      }

      if (oledOK) {
        display.clearDisplay();
        display.setTextSize(1);
        display.setCursor(15, 26);
        if (forceHold) {
          display.print(F("KHOA: "));
          display.print(holdForceVal, 2);
          display.print(F(" N"));
        } else {
          display.println(F(">> DA TARE VE 0 <<"));
        }
        display.display();
      }
      delay(150);
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  // Đọc không chặn (non-blocking): chỉ lấy 1 mẫu mỗi khi chip HX711 báo sẵn sàng
  if (scale.is_ready()) {
    hx711OK = true;
    float rawGrams = scale.get_units(1);
    if (rawGrams < 0 && rawGrams > -1.5) rawGrams = 0;
    liveGrams = rawGrams;
    liveForce_N = (liveGrams / 1000.0) * 9.80665;
    if (liveForce_N < 0) liveForce_N = 0;

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
      Serial.print(liveGrams, 1);
      Serial.println(F(" g"));
    }
  }

  // Luôn vẽ giao diện OLED ngay lập tức (không chờ HX711 để tránh treo ở "DANG KHOI DONG...")
  if (oledOK) {
    float displayForce = forceHold ? holdForceVal : liveForce_N;
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(forceHold ? F("LUC [DA KHOA] | [N2]") : F("LUC KE | [N2:Menu]"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.print(displayForce, 2);
    display.print(F(" N"));

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.print(F("Dinh(Max): "));
    display.print(peakForce, 2);
    display.print(F(" N"));

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)(displayForce * 10), 0, 100, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 0) barW = 0;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
    display.display();
  }
  delay(35);
}

// ================= [BÀI 4]: ĐỊNH LUẬT ÔM INA219 (LỌC TRUNG BÌNH EMA & TÍNH R = U/I THỰC TẾ) =================
void loopOhmExperiment() {
  // Nút 1: Bấm để Chốt điểm đo (PAUSE) gửi lưu vào bảng trên Web, bấm lần nữa để đo tiếp (RUN)
  if (digitalRead(BTN_OK) == LOW) {
    delay(35);
    if (digitalRead(BTN_OK) == LOW) {
      isRunning = !isRunning;
      Serial.println(isRunning ? F(">> RUN") : F(">> PAUSE"));
      while (digitalRead(BTN_OK) == LOW) delay(10);
    }
  }

  // Lấy trung bình 4 lần đọc liên tiếp từ INA219 để khử nhiễu dao động nguồn
  float sumU = 0.0;
  float sumI = 0.0;
  if (inaOK) {
    for (int i = 0; i < 4; i++) {
      sumU += ina219.getBusVoltage_V() + (ina219.getShuntVoltage_mV() / 1000.0);
      sumI += ina219.getCurrent_mA();
    }
  }
  float rawU = sumU * 0.25;
  float rawI = sumI * 0.25;

  if (rawU < 0.05) rawU = 0.0;
  if (rawI < 0.15) rawI = 0.0;

  if (!ohmFilterInit) {
    smoothOhmU = rawU;
    smoothOhmI = rawI;
    ohmFilterInit = true;
  } else {
    smoothOhmU = 0.55 * rawU + 0.45 * smoothOhmU;
    smoothOhmI = 0.55 * rawI + 0.45 * smoothOhmI;
  }

  float busVoltage_V = (smoothOhmU < 0.05) ? 0.0 : smoothOhmU;
  float current_mA   = (smoothOhmI < 0.15) ? 0.0 : smoothOhmI;
  float current_A    = current_mA / 1000.0;
  float resistance_Ohm = (current_mA > 0.5) ? (busVoltage_V / current_A) : 0.0;
  if (resistance_Ohm > 9999.0) resistance_Ohm = 9999.0;

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
    display.print(isRunning ? F("DINH LUAT OHM | [N2]") : F("OHM [DA CHOT] | [N2]"));

    display.setCursor(0, 15);
    display.setTextSize(2);
    display.print(current_mA, 1);
    display.print(F(" mA"));

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.print(F("U="));
    display.print(busVoltage_V, 2);
    display.print(F("V | R="));
    if (current_mA > 0.5) {
      display.print(resistance_Ohm, 0);
      display.print(F(" Ohm"));
    } else {
      display.print(F("--- Ohm"));
    }

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)current_mA, 0, 60, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 0) barW = 0;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
    display.display();
  }
  delay(50);
}
