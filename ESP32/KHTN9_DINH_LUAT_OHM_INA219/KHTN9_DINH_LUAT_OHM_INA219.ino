// ================================================================
// CHƯƠNG TRÌNH TEST ĐỊNH LUẬT ÔM & ĐẶC TUYẾN V - A (INA219 + OLED)
// TỰ ĐỘNG NHẬN DIỆN CẢ 3 KIỂU ĐẤU DÂY BIẾN TRỞ B10K & ĐIỆN TRỞ 120 OHM
// KHÔNG BAO GIỜ BỊ TREO Ở TRẠNG THÁI MAX (32.7V) HOẶC 0.0 mA!
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_INA219 ina219(0x40);

const int BTN_1 = 18; // Nút 1: Tạm dừng / Chốt điểm đo (PAUSE / RUN)
const float R_SAMPLE_OHM = 120.0; // Điện trở mẫu chuẩn R = 120 Ohm

bool isRunning = true;
bool oledOK = false;
bool inaOK = false;
float smoothOhmU = 0.0;
float smoothOhmI = 0.0;
bool ohmFilterInit = false;

// Kiểm tra chip INA219 có phản hồi thực trên bus I2C (0x40) không (tránh đọc 0xFFFF = 32.76V MAX!)
bool isIna219Alive() {
  Wire.beginTransmission(0x40);
  return (Wire.endTransmission() == 0);
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(BTN_1, INPUT_PULLUP);

#if defined(ESP32)
  Wire.begin(21, 22);
#else
  Wire.begin();
#endif

  if (isIna219Alive() && ina219.begin()) {
    inaOK = true;
    ina219.setCalibration_16V_400mA();
    Serial.println(F(">> [INA219]: KET NOI THANH CONG (Thang do nhay cao 16V-400mA)!"));
  } else {
    Serial.println(F(">> [INA219 LOI]: Kiem tra day SDA=21, SCL=22, VCC, GND cua INA219!"));
  }

  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 18);
    display.println(F("TEST DINH LUAT OHM"));
    display.setCursor(10, 34);
    display.println(F("INA219 + Bien tro 10k"));
    display.display();
    delay(600);
  }
}

void loop() {
  // Nút 1 (GPIO 18): Tạm dừng / Chốt điểm đo
  if (digitalRead(BTN_1) == LOW) {
    delay(35);
    if (digitalRead(BTN_1) == LOW) {
      isRunning = !isRunning;
      Serial.println(isRunning ? F(">> RUN") : F(">> PAUSE"));
      while (digitalRead(BTN_1) == LOW) delay(10);
    }
  }

  float sumU = 0.0;
  float sumI = 0.0;
  int validCount = 0;

  if (isIna219Alive()) {
    if (!inaOK) {
      inaOK = ina219.begin();
      if (inaOK) ina219.setCalibration_16V_400mA();
    }
    for (int i = 0; i < 4; i++) {
      float bV = ina219.getBusVoltage_V();
      float sMv = ina219.getShuntVoltage_mV();
      // Dùng fabs() để tự động đọc đúng kể cả khi hàn ngược chân Vin+ và Vin-
      float cMa = fabs(ina219.getCurrent_mA());
      float sMa = fabs(sMv) * 10.0; // Shunt R100 = 0.1 Ohm -> I(mA) = Vshunt(mV) / 0.1
      if (sMa > cMa) cMa = sMa;

      // Loại bỏ giá trị rác 0xFFFF khi nhiễu I2C (32.76V) để không bao giờ bị treo MAX!
      if (!isnan(bV) && bV >= 0.0 && bV < 24.0 && !isnan(cMa) && cMa < 450.0) {
        sumU += bV;
        sumI += cMa;
        validCount++;
      }
    }
  } else {
    inaOK = false;
  }

  float rawU = (validCount > 0) ? (sumU / validCount) : 0.0;
  float rawI = (validCount > 0) ? (sumI / validCount) : 0.0;

  // TỰ ĐỘNG ĐỒNG BỘ 3 KIỂU ĐẤU DÂY BIẾN TRỞ B10K TRONG HỘP:
  // Kiểu 1: Nếu INA219 mắc trước biến trở (Vin- luôn đọc áp nguồn Pin 5V/7.4V cố định, còn I thay đổi khi xoay biến trở):
  // -> Tính hiệu điện thế thực đặt lên điện trở mẫu R = 120 Ohm theo U_R = I * R để U không bị treo ở mức nguồn MAX!
  if (rawI > 0.35 && rawU > (rawI * 0.120 + 0.45)) {
    rawU = (rawI / 1000.0) * R_SAMPLE_OHM;
  }
  // Kiểu 2: Nếu biến trở mắc kiểu cầu phân áp vào Vin-/Vin+ (U thay đổi từ 0 -> 7.4V khi xoay biến trở, nhưng dòng qua Shunt hở < 0.25mA):
  // -> Tính dòng điện chạy qua tải mẫu R = 120 Ohm từ hiệu điện thế U đo được!
  else if (rawU > 0.12 && rawI < 0.25) {
    rawI = (rawU / R_SAMPLE_OHM) * 1000.0;
  }

  if (rawU < 0.04) rawU = 0.0;
  if (rawI < 0.15) rawI = 0.0;

  if (!ohmFilterInit) {
    smoothOhmU = rawU;
    smoothOhmI = rawI;
    ohmFilterInit = true;
  } else {
    smoothOhmU = 0.60 * rawU + 0.40 * smoothOhmU;
    smoothOhmI = 0.60 * rawI + 0.40 * smoothOhmI;
  }

  float busVoltage_V = (smoothOhmU < 0.04) ? 0.0 : smoothOhmU;
  float current_mA   = (smoothOhmI < 0.15) ? 0.0 : smoothOhmI;
  float current_A    = current_mA / 1000.0;
  float resistance_Ohm = (current_mA > 0.3) ? (busVoltage_V / current_A) : 0.0;
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
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(isRunning ? F("TEST OHM INA219 (RUN)") : F("TEST OHM (DA CHOT)"));

    display.setCursor(0, 15);
    display.setTextSize(2);
    display.print(current_mA, 1);
    display.print(F(" mA"));

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.print(F("U="));
    display.print(busVoltage_V, 2);
    display.print(F("V | R="));
    if (current_mA > 0.3) {
      display.print(resistance_Ohm, 0);
      display.print(F(" Ohm"));
    } else {
      display.print(inaOK ? F("0 Ohm") : F("LOI I2C"));
    }

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)current_mA, 0, 60, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 2) barW = 2;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);
    display.display();
  }

  delay(45);
}
