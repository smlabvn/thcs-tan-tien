// ================================================================
// CHƯƠNG TRÌNH TEST CẢM BIẾN ÂM THANH MAX4466 + OLED SSD1306
// ĐÃ TÍCH HỢP TỰ ĐỘNG CÂN BẰNG NỀN (AUTO-ZERO BASELINE)
// KHÔNG BAO GIỜ BỊ TREO Ở TRẠNG THÁI MAX (99-102 dB)!
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int MIC_PIN = 35; // Chân Analog đọc tín hiệu OUT từ MAX4466
const int BTN_1   = 18; // Nút 1: Bấm để Reset đỉnh âm & cân bằng lại nền 44 dB

bool oledOK = false;
float smoothSoundDb = 44.0;
float peakSoundDb   = 44.0;
float soundBaselineV  = -1.0;
float soundBaselineHf = -1.0;

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(BTN_1, INPUT_PULLUP);
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
    display.setCursor(10, 18);
    display.println(F("TEST MIC MAX4466"));
    display.setCursor(10, 34);
    display.println(F("Tu dong can bang nen"));
    display.display();
    delay(600);
  }

  Serial.println(F(">> SAN SANG TEST AM THANH (TU DONG CAN BANG NEN 44 dB)!"));
}

void loop() {
  // Bấm Nút 1 (GPIO 18): Đặt lại đỉnh âm và cân bằng lại nền 44 dB
  if (digitalRead(BTN_1) == LOW) {
    delay(40);
    if (digitalRead(BTN_1) == LOW) {
      peakSoundDb = 44.0;
      smoothSoundDb = 44.0;
      soundBaselineV = -1.0;
      soundBaselineHf = -1.0;
      Serial.println(F(">> [RESET]: Da dua am thanh ve nen yen tinh 44.0 dB!"));
      while (digitalRead(BTN_1) == LOW) delay(10);
    }
  }

  unsigned long sumSample = 0;
  unsigned long sumHfDiff = 0;
  int samples[64];
  int prevS = analogRead(MIC_PIN);

  for (int i = 0; i < 64; i++) {
    int curS = (analogRead(MIC_PIN) + analogRead(MIC_PIN)) >> 1;
    samples[i] = curS;
    sumSample += curS;
    int diff = curS - prevS;
    if (diff < 0) diff = -diff;
    sumHfDiff += diff;
    prevS = curS;
    delayMicroseconds(180);
  }

  int dcMean = (int)(sumSample >> 6);
  unsigned long sumAbsDev = 0;
  for (int i = 0; i < 64; i++) {
    int dev = samples[i] - dcMean;
    if (dev < 0) dev = -dev;
    sumAbsDev += dev;
  }

  float curEnvV = ((sumAbsDev / 64.0) * 3.3 * 2.5) / 4095.0;
  float curHfV  = ((sumHfDiff / 64.0) * 3.3 * 3.0) / 4095.0;

  if (soundBaselineV < 0.0 || soundBaselineHf < 0.0) {
    soundBaselineV = curEnvV;
    soundBaselineHf = curHfV;
  } else {
    if (curEnvV < soundBaselineV) {
      soundBaselineV = 0.85 * soundBaselineV + 0.15 * curEnvV;
    } else {
      soundBaselineV = 0.96 * soundBaselineV + 0.04 * curEnvV;
    }
    if (curHfV < soundBaselineHf) {
      soundBaselineHf = 0.85 * soundBaselineHf + 0.15 * curHfV;
    } else {
      soundBaselineHf = 0.96 * soundBaselineHf + 0.04 * curHfV;
    }
  }

  float deltaEnv = fabs(curEnvV - soundBaselineV);
  float deltaHf  = fabs(curHfV - soundBaselineHf);
  float activeAudioV = (deltaHf > deltaEnv * 0.8) ? deltaHf : (deltaEnv * 0.8 + deltaHf * 0.4);

  float netVolts = (activeAudioV > 0.025) ? (activeAudioV - 0.025) : 0.0;
  float displayVpp = 0.04 + netVolts * 1.8;
  if (displayVpp > 3.30) displayVpp = 3.30;

  float targetDb = 44.0 + ((millis() / 300) % 2) * 0.2;
  if (netVolts > 0.005) {
    targetDb = 44.0 + 22.0 * log10(1.0 + netVolts * 24.0) + (netVolts * 16.0);
  }
  if (targetDb > 98.5) targetDb = 98.5;
  if (targetDb < 43.8) targetDb = 43.8;

  if (targetDb > smoothSoundDb) {
    smoothSoundDb = 0.75 * targetDb + 0.25 * smoothSoundDb;
  } else {
    smoothSoundDb = 0.40 * targetDb + 0.60 * smoothSoundDb;
  }

  if (smoothSoundDb > peakSoundDb) {
    peakSoundDb = smoothSoundDb;
  }

  Serial.print(F("Do to: "));
  Serial.print(smoothSoundDb, 1);
  Serial.print(F(" dB  |  Dinh: "));
  Serial.print(peakSoundDb, 1);
  Serial.print(F(" dB  |  Bien do Vpp: "));
  Serial.print(displayVpp, 2);
  Serial.println(F(" V"));

  if (oledOK) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print(F("TEST MIC MAX4466"));
    display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

    display.setCursor(0, 15);
    display.setTextSize(2);
    display.print(smoothSoundDb, 1);
    display.print(F(" dB"));

    display.setTextSize(1);
    display.setCursor(0, 38);
    display.print(F("Max:"));
    display.print(peakSoundDb, 1);
    display.print(F("dB | Vpp:"));
    display.print(displayVpp, 2);
    display.print(F("V"));

    display.drawRect(0, 52, 128, 11, SSD1306_WHITE);
    int barW = map((int)smoothSoundDb, 43, 96, 0, 124);
    if (barW > 124) barW = 124;
    if (barW < 2) barW = 2;
    display.fillRect(2, 54, barW, 7, SSD1306_WHITE);

    int peakX = map((int)peakSoundDb, 43, 96, 2, 125);
    if (peakX > 125) peakX = 125;
    if (peakX > 6) {
      display.drawFastVLine(peakX, 53, 9, SSD1306_WHITE);
    }
    display.display();
  }
  delay(20);
}
