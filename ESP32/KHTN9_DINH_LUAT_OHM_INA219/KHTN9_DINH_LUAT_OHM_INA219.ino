// ================================================================
// HỘP THÍ NGHIỆM KHTN 9: KHẢO SÁT ĐỊNH LUẬT ÔM & ĐẶC TUYẾN V - A
// Cảm biến: Cảm biến Dòng điện & Điện áp I2C INA219 (Địa chỉ 0x40)
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Màn hình OLED: SDA -> GPIO 21, SCL -> GPIO 22
// Điện trở mẫu: R = 120 Ohm | Biến trở điều khiển: 10k Ohm (B10K)
// 2 Nút nhấn: Nút 1 (GPIO 18), Nút 2 (GPIO 19)
// Baudrate Serial: 115200 bps
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_INA219.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
Adafruit_INA219 ina219(0x40);

const int BTN_START = 18;
const int BTN_RESET = 19;
bool isRunning = true;
bool oledOK = false;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println(F("\n=================================================="));
  Serial.println(F(">> HE THONG DINH LUAT OHM INA219 KHOI DONG THANH CONG! <<"));
  Serial.println(F("=================================================="));

  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_RESET, INPUT_PULLUP);

  Wire.begin(21, 22); // ESP32: SDA=21, SCL=22
  ina219.begin();
  ina219.setCalibration_32V_2A();

  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(15, 18);
    display.println(F("KHTN 9: DINH LUAT OHM"));
    display.setCursor(10, 34);
    display.println(F("Sensor: INA219 (120R)"));
    display.display();
    delay(1000);
  }
}

void loop() {
  if (digitalRead(BTN_START) == LOW) {
    delay(50);
    if (digitalRead(BTN_START) == LOW) {
      isRunning = !isRunning;
      while (digitalRead(BTN_START) == LOW) delay(10);
    }
  }

  float busVoltage_V = ina219.getBusVoltage_V();
  float current_mA   = ina219.getCurrent_mA();
  if (current_mA < 0.2) current_mA = 0;

  float current_A      = current_mA / 1000.0;
  float resistance_Ohm = (current_mA > 1.0) ? (busVoltage_V / current_A) : 0.0;

  // 1. Gửi dữ liệu lên Web PhysiX
  if (isRunning) {
    Serial.print(F("Dong dien I: "));
    Serial.print(current_mA, 2);
    Serial.print(F(" mA  |  Dien ap U: "));
    Serial.print(busVoltage_V, 2);
    Serial.print(F(" V  |  R do duoc: "));
    Serial.print(resistance_Ohm, 1);
    Serial.println(F(" Ohm"));
  }

  // 2. Hiển thị trên màn hình OLED SSD1306
  if (oledOK) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("DINH LUAT OHM | "));
    display.print(isRunning ? F("RUN") : F("PAUSE"));

    display.setCursor(0, 16);
    display.setTextSize(2);
    display.printf("%.1f mA", current_mA);

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.printf("U = %.2f V | R = 120R", busVoltage_V);

    // Thanh đo mini theo dòng điện 0 - 50mA
    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barWidth = map((int)current_mA, 0, 50, 0, 124);
    if (barWidth > 124) barWidth = 124;
    if (barWidth < 0) barWidth = 0;
    display.fillRect(2, 54, barWidth, 7, SSD1306_WHITE);

    display.display();
  }

  delay(100);
}
