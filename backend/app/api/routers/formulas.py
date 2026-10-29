"""
Formula management and direct calculation API for KHTN THCS (Grades 6-9).
Follows ISO 80000 / SI conventions, supports CRUD and dynamic calculation.
"""
import json
import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/formulas", tags=["Formulas Management (Direct System Adjuster)"])

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "formulas.json")

class VariableItem(BaseModel):
    symbol: str
    unit: str
    name: str

class FormulaItem(BaseModel):
    id: str
    grade: int = Field(..., ge=6, le=9)
    category: str = Field(..., description="co | dien | quang | am | nhiet")
    name: str
    intlMath: str
    vnMath: str
    intlVariables: List[VariableItem] = []
    vnVariables: List[VariableItem] = []
    explanation: str
    latexCode: str
    isCustom: Optional[bool] = False

DEFAULT_FORMULAS: List[dict] = [
    {
        "id": "density",
        "grade": 6,
        "category": "co",
        "name": "Khối lượng riêng của chất",
        "intlMath": r"\rho = \frac{m}{V}",
        "vnMath": r"D = \frac{m}{V}",
        "intlVariables": [
            {"symbol": r"\rho", "unit": "kg/m³", "name": "Khối lượng riêng của chất"},
            {"symbol": "m", "unit": "kg", "name": "Khối lượng vật"},
            {"symbol": "V", "unit": "m³", "name": "Thể tích vật"}
        ],
        "vnVariables": [
            {"symbol": "D", "unit": "kg/m³", "name": "Khối lượng riêng"},
            {"symbol": "m", "unit": "kg", "name": "Khối lượng vật"},
            {"symbol": "V", "unit": "m³", "name": "Thể tích vật"}
        ],
        "explanation": "Khối lượng riêng là khối lượng của một mét khối (1 m³) chất đó. Nước nguyên chất có khối lượng riêng 1000 kg/m³.",
        "latexCode": r"\rho = \frac{m}{V}",
        "isCustom": False
    },
    {
        "id": "weight",
        "grade": 6,
        "category": "co",
        "name": "Trọng lượng & Trọng lực",
        "intlMath": r"W = m \cdot g",
        "vnMath": r"P = 10 \cdot m",
        "intlVariables": [
            {"symbol": "W", "unit": "N", "name": "Trọng lượng của vật"},
            {"symbol": "m", "unit": "kg", "name": "Khối lượng của vật"},
            {"symbol": "g", "unit": "N/kg", "name": "Gia tốc trọng trường (9.807 N/kg)"}
        ],
        "vnVariables": [
            {"symbol": "P", "unit": "N", "name": "Trọng lượng của vật"},
            {"symbol": "m", "unit": "kg", "name": "Khối lượng của vật"}
        ],
        "explanation": "Trọng lượng là độ lớn lực hút Trái Đất tác dụng lên vật. Theo chuẩn ISO 80000, trọng lượng ký hiệu W (Weight) hoặc F_g.",
        "latexCode": r"W = m \cdot g",
        "isCustom": False
    },
    {
        "id": "hooke",
        "grade": 6,
        "category": "co",
        "name": "Độ biến dạng đàn hồi lò xo (Định luật Hooke)",
        "intlMath": r"F = k \cdot \Delta l",
        "vnMath": r"F = k \cdot |l - l_0|",
        "intlVariables": [
            {"symbol": "F", "unit": "N", "name": "Lực đàn hồi của lò xo"},
            {"symbol": "k", "unit": "N/m", "name": "Độ cứng của lò xo"},
            {"symbol": r"\Delta l", "unit": "m", "name": "Độ biến dạng dãn/nén"}
        ],
        "vnVariables": [
            {"symbol": "F", "unit": "N", "name": "Lực đàn hồi"},
            {"symbol": "k", "unit": "N/m", "name": "Độ cứng lò xo"},
            {"symbol": "l", "unit": "m", "name": "Chiều dài khi dãn"},
            {"symbol": "l_0", "unit": "m", "name": "Chiều dài tự nhiên"}
        ],
        "explanation": "Độ dãn của lò xo treo thẳng đứng tỉ lệ thuận với khối lượng vật hoặc độ lớn lực kéo tác dụng vào nó.",
        "latexCode": r"F = k \cdot \Delta l",
        "isCustom": False
    },
    {
        "id": "speed",
        "grade": 7,
        "category": "co",
        "name": "Tốc độ chuyển động",
        "intlMath": r"v = \frac{s}{t}",
        "vnMath": r"v = \frac{s}{t}",
        "intlVariables": [
            {"symbol": "v", "unit": "m/s hoặc km/h", "name": "Tốc độ chuyển động"},
            {"symbol": "s", "unit": "m hoặc km", "name": "Quãng đường đi được"},
            {"symbol": "t", "unit": "s hoặc h", "name": "Thời gian đi quãng đường đó"}
        ],
        "vnVariables": [
            {"symbol": "v", "unit": "m/s", "name": "Tốc độ chuyển động"},
            {"symbol": "s", "unit": "m", "name": "Quãng đường đi được"},
            {"symbol": "t", "unit": "s", "name": "Thời gian đi"}
        ],
        "explanation": "Tốc độ là đại lượng đặc trưng cho sự nhanh hay chậm của chuyển động, đo bằng thương số quãng đường và thời gian.",
        "latexCode": r"v = \frac{s}{t}",
        "isCustom": False
    },
    {
        "id": "frequency",
        "grade": 7,
        "category": "am",
        "name": "Tần số dao động sóng âm",
        "intlMath": r"f = \frac{N}{t} = \frac{1}{T}",
        "vnMath": r"f = \frac{n}{t}",
        "intlVariables": [
            {"symbol": "f", "unit": "Hz", "name": "Tần số dao động"},
            {"symbol": "N", "unit": "dao động", "name": "Số dao động thực hiện được"},
            {"symbol": "t", "unit": "s", "name": "Thời gian thực hiện dao động"},
            {"symbol": "T", "unit": "s", "name": "Chu kỳ dao động (Period)"}
        ],
        "vnVariables": [
            {"symbol": "f", "unit": "Hz", "name": "Tần số âm"},
            {"symbol": "n", "unit": "dao động", "name": "Số dao động"},
            {"symbol": "t", "unit": "s", "name": "Thời gian"}
        ],
        "explanation": "Số dao động trong 1 giây gọi là tần số. Tần số càng lớn âm phát ra càng cao (bổng); tần số nhỏ âm càng trầm.",
        "latexCode": r"f = \frac{N}{t}",
        "isCustom": False
    },
    {
        "id": "reflection",
        "grade": 7,
        "category": "quang",
        "name": "Định luật phản xạ ánh sáng",
        "intlMath": r"i = i' \quad (\theta_{\text{r}} = \theta_{\text{i}})",
        "vnMath": r"i' = i",
        "intlVariables": [
            {"symbol": "i", "unit": "độ (°)", "name": "Góc tới (tạo bởi tia tới và pháp tuyến)"},
            {"symbol": "i'", "unit": "độ (°)", "name": "Góc phản xạ (tạo bởi tia phản xạ và pháp tuyến)"}
        ],
        "vnVariables": [
            {"symbol": "i", "unit": "độ (°)", "name": "Góc tới"},
            {"symbol": "i'", "unit": "độ (°)", "name": "Góc phản xạ"}
        ],
        "explanation": "Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới; Góc phản xạ luôn bằng góc tới.",
        "latexCode": r"i' = i",
        "isCustom": False
    },
    {
        "id": "pressure",
        "grade": 8,
        "category": "co",
        "name": "Áp suất tác dụng lên mặt bị ép",
        "intlMath": r"p = \frac{F}{A}",
        "vnMath": r"p = \frac{F}{S}",
        "intlVariables": [
            {"symbol": "p", "unit": "Pa (N/m²)", "name": "Áp suất (Pressure)"},
            {"symbol": "F", "unit": "N", "name": "Áp lực tác dụng vuông góc lên mặt ép"},
            {"symbol": "A", "unit": "m²", "name": "Diện tích mặt bị ép (Area, ISO 80000)"}
        ],
        "vnVariables": [
            {"symbol": "p", "unit": "N/m²", "name": "Áp suất"},
            {"symbol": "F", "unit": "N", "name": "Áp lực"},
            {"symbol": "S", "unit": "m²", "name": "Diện tích mặt bị ép"}
        ],
        "explanation": "Áp suất là độ lớn áp lực trên một đơn vị diện tích bị ép. 1 Pa = 1 N/m².",
        "latexCode": r"p = \frac{F}{A}",
        "isCustom": False
    },
    {
        "id": "liquid_pressure",
        "grade": 8,
        "category": "co",
        "name": "Áp suất thủy tĩnh trong lòng chất lỏng",
        "intlMath": r"p = p_0 + \rho \cdot g \cdot h",
        "vnMath": r"p = d \cdot h",
        "intlVariables": [
            {"symbol": "p", "unit": "Pa", "name": "Áp suất chất lỏng ở độ sâu h"},
            {"symbol": r"\rho", "unit": "kg/m³", "name": "Khối lượng riêng của chất lỏng"},
            {"symbol": "g", "unit": "N/kg", "name": "Gia tốc trọng trường"},
            {"symbol": "h", "unit": "m", "name": "Độ sâu tính từ mặt thoáng chất lỏng"}
        ],
        "vnVariables": [
            {"symbol": "p", "unit": "Pa", "name": "Áp suất đáy/thành bình"},
            {"symbol": "d", "unit": "N/m³", "name": "Trọng lượng riêng của chất lỏng"},
            {"symbol": "h", "unit": "m", "name": "Độ sâu so với mặt thoáng"}
        ],
        "explanation": "Chất lỏng gây áp suất theo mọi hướng. Áp suất tại một điểm càng lớn khi độ sâu h càng tăng.",
        "latexCode": r"p = \rho \cdot g \cdot h",
        "isCustom": False
    },
    {
        "id": "buoyancy",
        "grade": 8,
        "category": "co",
        "name": "Lực đẩy Ác-si-mét (Archimedes' Principle)",
        "intlMath": r"F_{\text{b}} = \rho \cdot g \cdot V_{\text{disp}}",
        "vnMath": r"F_A = d \cdot V",
        "intlVariables": [
            {"symbol": r"F_{\text{b}}", "unit": "N", "name": "Lực đẩy Ác-si-mét (Buoyant force, ISO 80000)"},
            {"symbol": r"\rho", "unit": "kg/m³", "name": "Khối lượng riêng chất lỏng"},
            {"symbol": "g", "unit": "N/kg", "name": "Gia tốc trọng trường (9.807 N/kg)"},
            {"symbol": r"V_{\text{disp}}", "unit": "m³", "name": "Thể tích phần chất lỏng bị chiếm chỗ"}
        ],
        "vnVariables": [
            {"symbol": "F_A", "unit": "N", "name": "Lực đẩy Ác-si-mét"},
            {"symbol": "d", "unit": "N/m³", "name": "Trọng lượng riêng chất lỏng"},
            {"symbol": "V", "unit": "m³", "name": "Thể tích phần chìm trong chất lỏng"}
        ],
        "explanation": "Mọi vật chìm trong chất lỏng đều chịu một lực nâng hướng thẳng đứng từ dưới lên có độ lớn bằng trọng lượng khối chất lỏng bị vật chiếm chỗ.",
        "latexCode": r"F_{\text{b}} = \rho \cdot g \cdot V_{\text{disp}}",
        "isCustom": False
    },
    {
        "id": "lever",
        "grade": 8,
        "category": "co",
        "name": "Quy tắc đòn bẩy & Moment lực",
        "intlMath": r"\sum M = 0 \iff F_1 \cdot d_1 = F_2 \cdot d_2",
        "vnMath": r"F_1 \cdot d_1 = F_2 \cdot d_2",
        "intlVariables": [
            {"symbol": "M", "unit": "N·m", "name": "Moment của lực (M = F · d - Vật lí 10)"},
            {"symbol": "F_1, F_2", "unit": "N", "name": "Các lực tác dụng ở hai đầu đòn bẩy"},
            {"symbol": "d_1, d_2", "unit": "m", "name": "Cánh tay đòn (khoảng cách từ trục quay đến giá lực)"}
        ],
        "vnVariables": [
            {"symbol": "F_1, F_2", "unit": "N", "name": "Lực tác dụng ở hai phía điểm tựa"},
            {"symbol": "d_1, d_2", "unit": "m", "name": "Khoảng cách từ điểm tựa đến giá của lực (cánh tay đòn)"}
        ],
        "explanation": "Ở Lớp 8, học sinh nhận biết tác dụng làm quay (moment lực) và quy tắc thăng bằng đòn bẩy F₁·d₁ = F₂·d₂ giúp được lợi về lực khi d₁ > d₂. Việc tính toán định lượng moment lực M = F·d sẽ học ở lớp 10.",
        "latexCode": r"F_1 \cdot d_1 = F_2 \cdot d_2",
        "isCustom": False
    },
    {
        "id": "energy",
        "grade": 8,
        "category": "co",
        "name": "Cơ năng: Động năng & Thế năng trọng trường",
        "intlMath": r"E = E_{\text{k}} + E_{\text{p}} = \frac{1}{2}m v^2 + m g h",
        "vnMath": r"W = W_đ + W_t = \frac{1}{2}m v^2 + 10 m h",
        "intlVariables": [
            {"symbol": "E", "unit": "J", "name": "Cơ năng toàn phần"},
            {"symbol": r"E_{\text{k}}", "unit": "J", "name": "Động năng của vật"},
            {"symbol": r"E_{\text{p}}", "unit": "J", "name": "Thế năng trọng trường"},
            {"symbol": "m", "unit": "kg", "name": "Khối lượng"},
            {"symbol": "v", "unit": "m/s", "name": "Vận tốc"},
            {"symbol": "h", "unit": "m", "name": "Độ cao so với mốc"}
        ],
        "vnVariables": [
            {"symbol": "W", "unit": "J", "name": "Cơ năng toàn phần"},
            {"symbol": "W_đ", "unit": "J", "name": "Động năng"},
            {"symbol": "W_t", "unit": "J", "name": "Thế năng"}
        ],
        "explanation": "Cơ năng bảo toàn khi bỏ qua ma sát và lực cản: động năng và thế năng có thể chuyển hóa qua lại lẫn nhau.",
        "latexCode": r"E = \frac{1}{2}mv^2 + mgh",
        "isCustom": False
    },
    {
        "id": "ohm_law",
        "grade": 9,
        "category": "dien",
        "name": "Định luật Ôm cho đoạn mạch",
        "intlMath": r"I = \frac{U}{R} \iff U = I \cdot R",
        "vnMath": r"I = \frac{U}{R}",
        "intlVariables": [
            {"symbol": "I", "unit": "A", "name": "Cường độ dòng điện"},
            {"symbol": "U", "unit": "V", "name": "Hiệu điện thế giữa hai đầu đoạn mạch"},
            {"symbol": "R", "unit": "Ω", "name": "Điện trở của đoạn mạch"}
        ],
        "vnVariables": [
            {"symbol": "I", "unit": "A", "name": "Cường độ dòng điện"},
            {"symbol": "U", "unit": "V", "name": "Hiệu điện thế"},
            {"symbol": "R", "unit": "Ω", "name": "Điện trở"}
        ],
        "explanation": "Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu dây và tỉ lệ nghịch với điện trở của dây.",
        "latexCode": r"I = \frac{U}{R}",
        "isCustom": False
    },
    {
        "id": "series_circuit",
        "grade": 9,
        "category": "dien",
        "name": "Điện trở tương đương mạch nối tiếp",
        "intlMath": r"R_{\text{eq}} = R_1 + R_2, \quad I = I_1 = I_2, \quad U = U_1 + U_2",
        "vnMath": r"R_{tđ} = R_1 + R_2",
        "intlVariables": [
            {"symbol": r"R_{\text{eq}}", "unit": "Ω", "name": "Điện trở tương đương (Equivalent Resistance)"},
            {"symbol": "R_1, R_2", "unit": "Ω", "name": "Các điện trở thành phần"}
        ],
        "vnVariables": [
            {"symbol": "R_{tđ}", "unit": "Ω", "name": "Điện trở tương đương"},
            {"symbol": "R_1, R_2", "unit": "Ω", "name": "Các điện trở"}
        ],
        "explanation": "Đoạn mạch mắc nối tiếp có dòng điện bằng nhau tại mọi điểm, hiệu điện thế tổng bằng tổng các hiệu điện thế thành phần.",
        "latexCode": r"R_{\text{eq}} = R_1 + R_2",
        "isCustom": False
    },
    {
        "id": "parallel_circuit",
        "grade": 9,
        "category": "dien",
        "name": "Điện trở tương đương mạch song song",
        "intlMath": r"\frac{1}{R_{\text{eq}}} = \frac{1}{R_1} + \frac{1}{R_2} \iff R_{\text{eq}} = \frac{R_1 \cdot R_2}{R_1 + R_2}",
        "vnMath": r"\frac{1}{R_{tđ}} = \frac{1}{R_1} + \frac{1}{R_2}",
        "intlVariables": [
            {"symbol": r"R_{\text{eq}}", "unit": "Ω", "name": "Điện trở tương đương"},
            {"symbol": "U", "unit": "V", "name": "Hiệu điện thế mạch: U = U1 = U2"},
            {"symbol": "I", "unit": "A", "name": "Dòng điện mạch chính: I = I1 + I2"}
        ],
        "vnVariables": [
            {"symbol": "R_{tđ}", "unit": "Ω", "name": "Điện trở tương đương"}
        ],
        "explanation": "Đoạn mạch song song có cùng hiệu điện thế, cường độ dòng điện mạch chính bằng tổng cường độ dòng điện các nhánh rẽ.",
        "latexCode": r"R_{\text{eq}} = \frac{R_1 \cdot R_2}{R_1 + R_2}",
        "isCustom": False
    },
    {
        "id": "electric_power",
        "grade": 9,
        "category": "dien",
        "name": "Công suất điện & Định luật Joule-Lenz",
        "intlMath": r"P = U \cdot I = I^2 \cdot R = \frac{U^2}{R}, \quad Q = I^2 \cdot R \cdot t",
        "vnMath": r"P = U \cdot I, \quad Q = I^2 \cdot R \cdot t",
        "intlVariables": [
            {"symbol": "P", "unit": "W", "name": "Công suất điện tiêu thụ"},
            {"symbol": "Q", "unit": "J", "name": "Nhiệt lượng tỏa ra (Joule's heat)"},
            {"symbol": "t", "unit": "s", "name": "Thời gian dòng điện chạy qua"}
        ],
        "vnVariables": [
            {"symbol": "P", "unit": "W", "name": "Công suất điện"},
            {"symbol": "Q", "unit": "J", "name": "Nhiệt lượng tỏa ra trên dây"},
            {"symbol": "t", "unit": "s", "name": "Thời gian"}
        ],
        "explanation": "Công suất điện biểu thị tốc độ tiêu thụ điện năng. Định luật Joule-Lenz tính nhiệt lượng tỏa ra trên vật dẫn thuần trở.",
        "latexCode": r"P = U \cdot I = I^2 R = \frac{U^2}{R}",
        "isCustom": False
    },
    {
        "id": "wire_resistance",
        "grade": 9,
        "category": "dien",
        "name": "Điện trở của dây dẫn",
        "intlMath": r"R = \rho \cdot \frac{l}{A}",
        "vnMath": r"R = \rho \cdot \frac{l}{S}",
        "intlVariables": [
            {"symbol": "R", "unit": "Ω", "name": "Điện trở của dây dẫn"},
            {"symbol": r"\rho", "unit": "Ω·m", "name": "Điện trở suất của vật liệu"},
            {"symbol": "l", "unit": "m", "name": "Chiều dài dây dẫn"},
            {"symbol": "A", "unit": "m²", "name": "Tiết diện ngang của dây (Area)"}
        ],
        "vnVariables": [
            {"symbol": "R", "unit": "Ω", "name": "Điện trở dây dẫn"},
            {"symbol": r"\rho", "unit": "Ω·m", "name": "Điện trở suất"},
            {"symbol": "l", "unit": "m", "name": "Chiều dài dây"},
            {"symbol": "S", "unit": "m²", "name": "Tiết diện dây"}
        ],
        "explanation": "Điện trở tỉ lệ thuận với chiều dài l, tỉ lệ nghịch với tiết diện ngang A (theo chuẩn ISO dùng A thay vì S).",
        "latexCode": r"R = \rho \cdot \frac{l}{A}",
        "isCustom": False
    },
    {
        "id": "thin_lens",
        "grade": 9,
        "category": "quang",
        "name": "Phương trình thấu kính mỏng (Thin Lens Equation)",
        "intlMath": r"\frac{1}{f} = \frac{1}{d_{\text{o}}} + \frac{1}{d_{\text{i}}} \iff d_{\text{i}} = \frac{d_{\text{o}} \cdot f}{d_{\text{o}} - f}",
        "vnMath": r"\frac{1}{f} = \frac{1}{d} + \frac{1}{d'}",
        "intlVariables": [
            {"symbol": "f", "unit": "cm hoặc m", "name": "Tiêu cự thấu kính (hội tụ: f > 0)"},
            {"symbol": r"d_{\text{o}}", "unit": "cm hoặc m", "name": "Khoảng cách từ vật đến quang tâm O"},
            {"symbol": r"d_{\text{i}}", "unit": "cm hoặc m", "name": "Khoảng cách từ ảnh đến quang tâm O"}
        ],
        "vnVariables": [
            {"symbol": "f", "unit": "cm hoặc m", "name": "Tiêu cự thấu kính"},
            {"symbol": "d", "unit": "cm hoặc m", "name": "Khoảng cách từ vật đến thấu kính"},
            {"symbol": "d'", "unit": "cm hoặc m", "name": "Khoảng cách từ ảnh đến thấu kính"}
        ],
        "explanation": "Quy ước: Thấu kính hội tụ f > 0. Vật thật d_o > 0. Ảnh thật d_i > 0 (ngược chiều, hứng được trên màn); Ảnh ảo d_i < 0 (cùng chiều).",
        "latexCode": r"\frac{1}{f} = \frac{1}{d_{\text{o}}} + \frac{1}{d_{\text{i}}}",
        "isCustom": False
    },
    {
        "id": "magnification",
        "grade": 9,
        "category": "quang",
        "name": "Độ phóng đại tuyến tính & Độ tụ",
        "intlMath": r"m = -\frac{d_{\text{i}}}{d_{\text{o}}} = \frac{h_{\text{i}}}{h_{\text{o}}}, \quad D = \frac{1}{f}",
        "vnMath": r"k = -\frac{d'}{d}, \quad D = \frac{1}{f}",
        "intlVariables": [
            {"symbol": "m", "unit": "không thứ nguyên", "name": "Độ phóng đại tuyến tính"},
            {"symbol": r"h_{\text{i}}, h_{\text{o}}", "unit": "cm", "name": "Chiều cao của ảnh và của vật"},
            {"symbol": "D", "unit": "dp (diopter)", "name": "Độ tụ của thấu kính (với f tính bằng mét)"}
        ],
        "vnVariables": [
            {"symbol": "k", "unit": "hệ số", "name": "Hệ số phóng đại ảnh"},
            {"symbol": "D", "unit": "dp", "name": "Độ tụ thấu kính"}
        ],
        "explanation": "|m| > 1: ảnh lớn hơn vật; |m| < 1: ảnh nhỏ hơn vật; m < 0: ảnh ngược chiều vật (ảnh thật); m > 0: ảnh cùng chiều vật (ảnh ảo).",
        "latexCode": r"m = -\frac{d_{\text{i}}}{d_{\text{o}}} = \frac{h_{\text{i}}}{h_{\text{o}}}",
        "isCustom": False
    }
]


def load_formulas() -> List[dict]:
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        save_formulas(DEFAULT_FORMULAS)
        return DEFAULT_FORMULAS
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_FORMULAS


def save_formulas(formulas: List[dict]):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(formulas, f, ensure_ascii=False, indent=2)


@router.get("", response_model=List[FormulaItem])
def get_all_formulas():
    """Lấy danh sách công thức hiện hữu trong hệ thống."""
    return load_formulas()


@router.post("", response_model=FormulaItem)
def create_or_update_formula(item: FormulaItem):
    """
    Thêm mới hoặc chỉnh sửa trực tiếp công thức trên hệ thống.
    Nếu ID đã tồn tại -> cập nhật; nếu chưa -> thêm mới.
    """
    formulas = load_formulas()
    existing_idx = next((i for i, f in enumerate(formulas) if f["id"] == item.id), None)
    item_dict = item.model_dump()
    if existing_idx is not None:
        formulas[existing_idx] = item_dict
    else:
        formulas.append(item_dict)
    save_formulas(formulas)
    return item


@router.delete("/{formula_id}")
def delete_formula(formula_id: str):
    """Xóa một công thức khỏi hệ thống."""
    formulas = load_formulas()
    new_formulas = [f for f in formulas if f["id"] != formula_id]
    if len(new_formulas) == len(formulas):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy công thức với id '{formula_id}'")
    save_formulas(new_formulas)
    return {"status": "success", "message": f"Đã xóa công thức '{formula_id}' thành công."}


@router.post("/reset")
def reset_formulas():
    """Khôi phục toàn bộ danh mục công thức chuẩn ISO 80000 mặc định."""
    save_formulas(DEFAULT_FORMULAS)
    return {"status": "success", "message": "Đã khôi phục danh mục công thức chuẩn quốc tế ISO 80000 ban đầu."}


class EvalParams(BaseModel):
    formula_template: str = Field(..., description="Tên template hoặc biểu thức, vd: ohm | buoyancy | speed | pressure | power")
    inputs: dict = Field(..., description="Các giá trị biến số, vd: {'U': 12, 'R': 24}")

@router.post("/evaluate")
def evaluate_custom(p: EvalParams):
    """
    Tính toán nhanh và trả về biểu thức thế số từng bước cho công thức tùy biến.
    """
    t = p.formula_template.lower()
    inp = p.inputs
    result = 0.0
    steps = ""
    unit = ""

    if t in ("speed", "v_s_t"):
        s = float(inp.get("s", 0))
        time = float(inp.get("t", 1))
        if time <= 0:
            raise HTTPException(status_code=400, detail="Thời gian t phải lớn hơn 0")
        result = s / time
        steps = f"v = \\frac{{s}}{{t}} = \\frac{{{s}}}{{{time}}} = {round(result, 3)}\\text{{ m/s}}"
        unit = "m/s"
    elif t in ("density", "rho_m_v"):
        m = float(inp.get("m", 0))
        vol = float(inp.get("V", 1))
        if vol <= 0:
            raise HTTPException(status_code=400, detail="Thể tích V phải lớn hơn 0")
        result = m / vol
        steps = f"\\rho = \\frac{{m}}{{V}} = \\frac{{{m}}}{{{vol}}} = {round(result, 2)}\\text{{ kg/m}}^3"
        unit = "kg/m³"
    elif t in ("pressure", "p_f_a"):
        f = float(inp.get("F", 0))
        area = float(inp.get("A", 1))
        if area <= 0:
            raise HTTPException(status_code=400, detail="Diện tích A phải lớn hơn 0")
        result = f / area
        steps = f"p = \\frac{{F}}{{A}} = \\frac{{{f}}}{{{area}}} = {round(result, 2)}\\text{{ Pa}}"
        unit = "Pa"
    elif t in ("ohm", "i_u_r"):
        u = float(inp.get("U", 0))
        r = float(inp.get("R", 1))
        if r <= 0:
            raise HTTPException(status_code=400, detail="Điện trở R phải lớn hơn 0")
        result = u / r
        steps = f"I = \\frac{{U}}{{R}} = \\frac{{{u}}}{{{r}}} = {round(result, 3)}\\text{{ A}}"
        unit = "A"
    elif t in ("power", "p_u_i"):
        u = float(inp.get("U", 0))
        i = float(inp.get("I", 0))
        result = u * i
        steps = f"P = U \\cdot I = {u} \\times {i} = {round(result, 2)}\\text{{ W}}"
        unit = "W"
    elif t in ("heat", "q_m_c_dt"):
        m = float(inp.get("m", 0))
        c = float(inp.get("c", 4200)) # Nhiệt dung riêng nước mặc định
        dt = float(inp.get("delta_t", 0))
        result = m * c * dt
        steps = f"Q = m \\cdot c \\cdot \\Delta t = {m} \\times {c} \\times {dt} = {round(result, 1)}\\text{{ J}}"
        unit = "J"
    else:
        raise HTTPException(status_code=400, detail=f"Chưa hỗ trợ template '{p.formula_template}'")

    return {
        "template": t,
        "result": round(result, 4),
        "unit": unit,
        "latex_steps": steps
    }
