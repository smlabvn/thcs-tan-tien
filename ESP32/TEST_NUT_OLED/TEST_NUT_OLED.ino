// ================================================================
// CODE TEST MÀN HÌNH OLED 0.96" (SSD1306) & 2 NÚT NHẤN VẬT LÝ
// Vi điều khiển: ESP32 (Type-C WROOM-32)
// Màn hình OLED I2C: SDA -> GPIO 21, SCL -> GPIO 22
// Nút 1: Chân tín hiệu -> GPIO 18 (Chân còn lại nối GND)
// Nút 2: Chân tín hiệu -> GPIO 19 (Chân còn lại nối GND)
// ================================================================

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// Khởi tạo màn hình OLED với I2C mặc định
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int BTN_1 = 18; // Nút 1 nối GPIO 18
const int BTN_2 = 19; // Nút 2 nối GPIO 19

int countBtn1 = 0; // Đếm số lần bấm Nút 1
int countBtn2 = 0; // Đếm số lần bấm Nút 2

bool lastBtn1 = HIGH;
bool lastBtn2 = HIGH;
bool oledOK = false;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=================================================="));
  Serial.println(F("    CHUONG TRINH TEST MAN HINH OLED & 2 NUT NHAN  "));
  Serial.println(F("=================================================="));

  // Cấu hình 2 nút nhấn với trở kéo nội (Pull-up)
  pinMode(BTN_1, INPUT_PULLUP);
  pinMode(BTN_2, INPUT_PULLUP);

  // 1. Khởi động I2C trên GPIO 21 (SDA) và GPIO 22 (SCL)
  Wire.begin(21, 22);

  // 2. Thử kết nối OLED tại địa chỉ 0x3C
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledOK = true;
    Serial.println(F(">> [OLED]: KET NOI THANH CONG (Dia chi 0x3C)!"));

    // Hiệu ứng màn hình chào mừng
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(15, 10);
    display.println(F("TEST OLED & BUTTON"));
    display.drawFastHLine(0, 22, 128, SSD1306_WHITE);
    display.setCursor(20, 30);
    display.println(F("ESP32 PHYSIX"));
    display.setCursor(10, 48);
    display.println(F("Khoi dong xong..."));
    display.display();
    delay(1200);
  } else {
    Serial.println(F(">> [OLED LOI]: Khong tim thay OLED! Kiem tra day SDA=21, SCL=22 va nguon 3V3/GND"));
  }

  Serial.println(F(">> SAN SANG! Hay thu nhan Nut 1 (GPIO 18) va Nut 2 (GPIO 19)..."));
}

void loop() {
  // Đọc trạng thái 2 nút (LOW = Đang bấm, HIGH = Đang nhả)
  bool curBtn1 = digitalRead(BTN_1);
  bool curBtn2 = digitalRead(BTN_2);

  // Xử lý sự kiện bấm Nút 1 (GPIO 18)
  if (curBtn1 == LOW && lastBtn1 == HIGH) {
    countBtn1++;
    Serial.print(F(">>> [NUT 1 - GPIO 18]: DA BAM! | Tong so lan: "));
    Serial.println(countBtn1);
  }

  // Xử lý sự kiện bấm Nút 2 (GPIO 19)
  if (curBtn2 == LOW && lastBtn2 == HIGH) {
    countBtn2++;
    Serial.print(F(">>> [NUT 2 - GPIO 19]: DA BAM! | Tong so lan: "));
    Serial.println(countBtn2);
  }

  lastBtn1 = curBtn1;
  lastBtn2 = curBtn2;

  // Cập nhật giao diện lên màn hình OLED
  if (oledOK) {
    display.clearDisplay();

    // Tiêu đề
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.print(F("TEST NUT"));
    display.setCursor(65, 0);
    display.printf("T: %lus", millis() / 1000);
    display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

    // Dòng hiển thị NÚT 1 (GPIO 18)
    display.setCursor(0, 15);
    display.print(F("N1(18): "));
    if (curBtn1 == LOW) {
      // Đang bấm: Hiển thị khối nổi bật âm bản
      display.fillRect(45, 14, 80, 11, SSD1306_WHITE);
      display.setTextColor(SSD1306_BLACK);
      display.setCursor(48, 16);
      display.printf("BAM! (%d)", countBtn1);
      display.setTextColor(SSD1306_WHITE);
    } else {
      display.printf("Nha  (%d)", countBtn1);
    }

    // Dòng hiển thị NÚT 2 (GPIO 19)
    display.setCursor(0, 30);
    display.print(F("N2(19): "));
    if (curBtn2 == LOW) {
      // Đang bấm: Hiển thị khối nổi bật âm bản
      display.fillRect(45, 29, 80, 11, SSD1306_WHITE);
      display.setTextColor(SSD1306_BLACK);
      display.setCursor(48, 31);
      display.printf("BAM! (%d)", countBtn2);
      display.setTextColor(SSD1306_WHITE);
    } else {
      display.printf("Nha  (%d)", countBtn2);
    }

    // Khung trang trí & Thanh đo đồ họa ở đáy màn hình
    display.drawRect(0, 46, 128, 16, SSD1306_WHITE);
    
    // Nếu cả 2 nút cùng nhả: Hiện thông báo chờ
    if (curBtn1 == HIGH && curBtn2 == HIGH) {
      display.setCursor(18, 50);
      display.print(F("CHO BAM NUT..."));
    } else {
      // Khi bấm nút: Vẽ thanh tiến trình đồ họa
      int totalPress = countBtn1 + countBtn2;
      int barW = (totalPress * 10) % 124;
      display.fillRect(2, 48, barW, 12, SSD1306_WHITE);
    }

    display.display();
  }

  delay(40); // Tốc độ quét màn hình ~25 khung hình/giây
}