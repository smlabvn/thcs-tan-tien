"""
PhysiX Knowledge Base & Quiz Data for GDPT 2018 Physics Curriculum
Standardized according to International Standards (ISO 80000 / IUPAP / SI)
Specialized for THCS: Khoa Học Tự Nhiên (Vật Lý Lớp 6, 7, 8, 9)
"""

PHYSICS_KNOWLEDGE_DOCS = [
    # ================= KHOA HỌC TỰ NHIÊN / VẬT LÝ THCS (CHUẨN ISO 80000 / SI) =================
    {
        "id": "doc-thcs-01",
        "level": "thcs",
        "grade": 6,
        "topic": "Khối lượng riêng & Trọng lượng (ISO 80000-4)",
        "title": "Công thức Khối lượng riêng và Trọng lượng theo chuẩn SI",
        "content": (
            "Khối lượng riêng (Density - ký hiệu quốc tế: rho): rho = m / V (đơn vị SI: kg/m3). "
            "Trọng lượng (Weight - ký hiệu quốc tế: W hoặc F_g): W = m * g (đơn vị: N), "
            "với g là gia tốc trọng trường (g xấp xỉ 9.8 N/kg hoặc 10 N/kg). "
            "Trọng lượng riêng w = rho * g (đơn vị: N/m3). "
            "Khối lượng riêng của nước nguyên chất chuẩn là rho = 1000 kg/m3 (tương ứng trọng lượng riêng 10000 N/m3)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-4 & SGK KHTN 6"
    },
    {
        "id": "doc-thcs-02",
        "level": "thcs",
        "grade": 6,
        "topic": "Lực & Biến dạng đàn hồi của lò xo",
        "title": "Định luật Hooke và Biến dạng đàn hồi",
        "content": (
            "Lực F là đại lượng vectơ đặc trưng cho tác dụng đẩy hoặc kéo của vật này lên vật khác (đơn vị SI: Newton, N). "
            "Lực có thể làm biến đổi vận tốc của vật (gia tốc a) hoặc gây biến dạng. "
            "Định luật Hooke (Hooke's Law): Độ dãn của lò xo tỉ lệ thuận với lực tác dụng: F = k * Delta l, "
            "trong đó k là độ cứng của lò xo (N/m), Delta l = |l - l_0| là độ biến dạng đàn hồi (m)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-4 & SGK KHTN 6"
    },
    {
        "id": "doc-thcs-03",
        "level": "thcs",
        "grade": 7,
        "topic": "Tốc độ & Động học chất điểm (Kinematics)",
        "title": "Tốc độ trung bình và Đồ thị chuyển động s - t",
        "content": (
            "Tốc độ trung bình (Average Speed): v = s / t (đơn vị chuẩn SI: m/s; quy đổi: 1 m/s = 3.6 km/h). "
            "Đồ thị quãng đường - thời gian (s - t): "
            "- Độ dốc (gradient/slope) của đồ thị s - t biểu thị tốc độ: v = Delta s / Delta t. "
            "- Đường thẳng xiên: Chuyển động thẳng đều (tốc độ v không đổi). "
            "- Đường nằm ngang: Vật đứng yên (v = 0)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-3 & SGK KHTN 7"
    },
    {
        "id": "doc-thcs-04",
        "level": "thcs",
        "grade": 7,
        "topic": "Sóng âm & Đặc trưng âm học (Acoustics)",
        "title": "Tần số, Bước sóng và Mức cường độ âm",
        "content": (
            "Sóng âm là sóng cơ học lan truyền dao động trong môi trường vật chất (rắn, lỏng, khí). "
            "Tần số (Frequency): f = 1 / T (đơn vị: Hertz, Hz). "
            "Mối liên hệ giữa tốc độ truyền âm, bước sóng và chu kỳ: v = lambda * f = lambda / T (với lambda là bước sóng, m). "
            "Đặc trưng sinh lý và vật lý: Tần số f quyết định độ cao (bổng/trầm); Biên độ dao động quyết định độ to của âm (đo bằng decibel, dB). "
            "Sóng âm không thể truyền qua chân không."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-8 & SGK KHTN 7"
    },
    {
        "id": "doc-thcs-05",
        "level": "thcs",
        "grade": 7,
        "topic": "Quang học & Định luật phản xạ (Geometrical Optics)",
        "title": "Định luật truyền thẳng và Định luật phản xạ ánh sáng",
        "content": (
            "Nguyên lý Fermat và định luật truyền thẳng: Ánh sáng truyền theo đường thẳng trong môi trường trong suốt và đồng tính. "
            "Định luật phản xạ ánh sáng (Law of Reflection): "
            "1. Tia phản xạ nằm trong mặt phẳng tới. "
            "2. Góc phản xạ bằng góc tới: theta_r = theta_i (hoặc i' = i). "
            "Gương phẳng tạo ảnh ảo (Virtual Image), đối xứng qua gương, có độ phóng đại m = +1 (kích thước ảnh bằng kích thước vật)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-7 & SGK KHTN 7"
    },
    {
        "id": "doc-thcs-06",
        "level": "thcs",
        "grade": 8,
        "topic": "Áp suất & Thủy tĩnh học (Fluid Mechanics)",
        "title": "Áp suất chất lưu và Áp suất thủy tĩnh",
        "content": (
            "Áp suất (Pressure): p = F / A (đơn vị SI: Pascal, Pa = N/m2). "
            "Áp suất thủy tĩnh ở độ sâu h trong chất lỏng có khối lượng riêng rho: "
            "p = p_0 + rho * g * h (với p_0 là áp suất khí quyển trên mặt thoáng, xấp xỉ 101325 Pa = 1 atm). "
            "Độ chênh áp suất thủy tĩnh giữa hai điểm: Delta p = rho * g * Delta h. "
            "Nguyên lý Pascal: Áp suất tác dụng lên chất lỏng kín được truyền nguyên vẹn theo mọi hướng."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-4 & SGK KHTN 8"
    },
    {
        "id": "doc-thcs-07",
        "level": "thcs",
        "grade": 8,
        "topic": "Lực đẩy Ác-si-mét & Nguyên lý Archimedes (Buoyancy)",
        "title": "Lực đẩy Buoyant Force và Điều kiện cân bằng nổi",
        "content": (
            "Nguyên lý Archimedes (Archimedes' Principle - ISO 80000-4): Lực đẩy tác dụng lên vật nhúng chìm trong chất lưu bằng trọng lượng của khối chất lưu bị vật chiếm chỗ: "
            "F_b = rho_fluid * g * V_disp = m_disp * g (đơn vị: N). "
            "Trọng lượng biểu kiến khi nhúng trong chất lỏng (Apparent Weight): W_app = W - F_b (với W = m_obj * g là trọng lượng thực). "
            "Điều kiện nổi / chìm (Buoyancy conditions): "
            "- Vật chìm (Sink): rho_obj > rho_fluid <=> W > F_b. "
            "- Vật lơ lửng (Neutral Buoyancy): rho_obj = rho_fluid <=> W = F_b. "
            "- Vật nổi trên mặt thoáng (Float): rho_obj < rho_fluid <=> W = F_b (ở trạng thái cân bằng với V_disp < V_total)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-4 & SGK KHTN 8"
    },
    {
        "id": "doc-thcs-08",
        "level": "thcs",
        "grade": 8,
        "topic": "Quy tắc đòn bẩy & Tác dụng làm quay (Moment lực)",
        "title": "Tác dụng làm quay của lực (Moment lực) và Quy tắc thăng bằng đòn bẩy (KHTN 8)",
        "content": (
            "Tác dụng làm quay của lực (Moment lực) trong KHTN 8: Lực tác dụng lên vật có thể làm quay vật quanh trục hoặc điểm tựa. "
            "Tác dụng làm quay phụ thuộc vào độ lớn của lực (F) và khoảng cách từ trục quay đến giá của lực (d - cánh tay đòn). Lực càng lớn hoặc khoảng cách càng xa thì tác dụng làm quay càng mạnh. "
            "Quy tắc đòn bẩy (Điều kiện thăng bằng): F1 * d1 = F2 * d2. "
            "Ứng dụng đòn bẩy: Khi d1 > d2 thì F1 < F2 (được lợi về lực để nâng vật nặng). "
            "Lưu ý phân biệt cấp học: Ở THCS Lớp 8, học sinh dừng lại ở việc làm thí nghiệm trực quan để hình dung tác dụng làm quay của lực (moment lực) và quy tắc đòn bẩy; việc tính toán định lượng moment lực M = F * d và điều kiện cân bằng tổng quát Sigma M = 0 thuộc chương trình Vật lí lớp 10."
        ),
        "source": "SGK KHTN 8 (GDPT 2018) & ISO 80000-4"
    },
    {
        "id": "doc-thcs-09",
        "level": "thcs",
        "grade": 8,
        "topic": "Năng lượng cơ học & Bảo toàn cơ năng (Energy)",
        "title": "Động năng, Thế năng và Định luật bảo toàn cơ năng",
        "content": (
            "Công cơ học (Mechanical Work): W = F * s * cos(theta) (đơn vị: Joule, J). "
            "Động năng (Kinetic Energy): E_k = 1/2 * m * v^2. "
            "Thế năng trọng trường (Gravitational Potential Energy): E_p = m * g * h. "
            "Cơ năng toàn phần (Mechanical Energy): E = E_k + E_p = const (bảo toàn khi chỉ có trọng lực tác dụng, bỏ qua ma sát)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-5 & SGK KHTN 8"
    },
    {
        "id": "doc-thcs-10",
        "level": "thcs",
        "grade": 9,
        "topic": "Định luật Ôm & Mạch điện (Circuit Analysis - IEC)",
        "title": "Định luật Ôm và Điện trở tương đương R_eq",
        "content": (
            "Định luật Ôm (Ohm's Law - IEC 60050 / ISO 80000-6): I = U / R (hoặc I = V / R, V = I * R). "
            "Điện trở tương đương của đoạn mạch (Equivalent Resistance R_eq): "
            "- Mạch nối tiếp (Series): R_eq = R1 + R2 + ...; I = I1 = I2; U = U1 + U2. "
            "- Mạch song song (Parallel): 1 / R_eq = 1 / R1 + 1 / R2 <=> R_eq = (R1 * R2) / (R1 + R2); U = U1 = U2; I = I1 + I2. "
            "Điện trở của dây dẫn dẫn đồng chất: R = rho * (l / A), với rho là điện trở suất (Ohm.m), l là chiều dài (m), A là tiết diện ngang (m2)."
        ),
        "source": "Chuẩn Quốc Tế IEC & ISO 80000-6 & SGK KHTN 9"
    },
    {
        "id": "doc-thcs-11",
        "level": "thcs",
        "grade": 9,
        "topic": "Công suất & Định luật Joule (Electric Power & Heating)",
        "title": "Công suất điện tiêu thụ và Định luật Joule - Lenz",
        "content": (
            "Công suất điện (Electric Power): P = U * I = I^2 * R = U^2 / R (đơn vị: Watt, W). "
            "Điện năng tiêu thụ (Electrical Energy / Work): W = P * t = U * I * t (đơn vị: Joule, J; hoặc kW.h: 1 kW.h = 3.6e6 J). "
            "Định luật nhiệt Joule (Joule's Law of Heating): Nhiệt lượng tỏa ra trên điện trở thuần: Q = I^2 * R * t (J)."
        ),
        "source": "Chuẩn Quốc Tế ISO 80000-6 & SGK KHTN 9"
    },
    {
        "id": "doc-thcs-12",
        "level": "thcs",
        "grade": 9,
        "topic": "Phương trình thấu kính mỏng (Thin Lens Equation - ISO 10110)",
        "title": "Phương trình tạo ảnh thấu kính mỏng và Độ phóng đại tuyến tính",
        "content": (
            "Phương trình thấu kính mỏng chuẩn quốc tế (Thin Lens Equation - Gaussian Optics): "
            "1 / f = 1 / d_o + 1 / d_i (tương đương 1/f = 1/u + 1/v), "
            "trong đó f là tiêu cự (focal length), d_o là khoảng cách vật (object distance), d_i là khoảng cách ảnh (image distance). "
            "Độ phóng đại tuyến tính (Lateral Magnification): m = -d_i / d_o = h_i / h_o (|m| = A'B' / AB). "
            "Quy ước dấu chuẩn Cartesian: "
            "- Thấu kính hội tụ: f > 0; thấu kính phân kỳ: f < 0. "
            "- Ảnh thật (Real Image): d_i > 0, m < 0 (ngược chiều). "
            "- Ảnh ảo (Virtual Image): d_i < 0, m > 0 (cùng chiều). "
            "Độ tụ quang học: D = 1 / f (đơn vị: diopter, dp)."
        ),
        "source": "Chuẩn Quốc Tế ISO 10110 & SGK KHTN 9"
    }
]

# FORMAT ĐỀ THI ÔN LUYỆN & VÀO 10 THCS (CHUẨN QUỐC TẾ ISO / SI)
EXAM_THCS_DATA = {
    "title": "Đề Khảo Sát Năng Lực Vật Lý THCS (Ôn Thi Vào Lớp 10 & Chuẩn Quốc Tế SI)",
    "duration_minutes": 15,
    "part_1_multiple_choice": [
        {
            "id": "thcs_p1_1",
            "question": "Công thức nào sau đây mô tả đúng Định luật Ôm (Ohm's Law) cho đoạn mạch có điện trở R theo chuẩn IEC / SI?",
            "options": ["A. $I = U \\cdot R$", "B. $I = \\frac{U}{R}$", "C. $I = \\frac{R}{U}$", "D. $U = \\frac{I}{R}$"],
            "correct": 1,
            "explanation": "Định luật Ôm (Ohm's Law): Cường độ dòng điện $I$ tỉ lệ thuận với hiệu điện thế $U$ và tỉ lệ nghịch với điện trở $R$: $I = \\frac{U}{R}$ (hoặc $V = I \\cdot R$).",
            "topic": "Điện học THCS"
        },
        {
            "id": "thcs_p1_2",
            "question": "Một vật có thể tích $V = 0.002\\text{ m}^3$ được nhúng chìm hoàn toàn trong nước có khối lượng riêng $\\rho = 1000\\text{ kg/m}^3$ (lấy gia tốc trọng trường $g = 10\\text{ N/kg}$). Lực đẩy Ác-si-mét tác dụng lên vật theo chuẩn SI là:",
            "options": ["A. $20\\text{ N}$", "B. $200\\text{ N}$", "C. $5\\text{ N}$", "D. $50\\text{ N}$"],
            "correct": 0,
            "explanation": "Theo chuẩn quốc tế ISO 80000-4: Lực đẩy Buoyant $F_{\\text{b}} = \\rho \\cdot g \\cdot V = 1000 \\times 10 \\times 0.002 = 20\\text{ N}$.",
            "topic": "Lực đẩy Ác-si-mét"
        }
    ],
    "part_2_true_false": [
        {
            "id": "thcs_p2_1",
            "context": "Một đoạn mạch gồm hai điện trở $R_1 = 20\\ \\Omega$ và $R_2 = 30\\ \\Omega$ được mắc nối tiếp vào nguồn điện có hiệu điện thế không đổi $U = 12\\text{ V}$.",
            "items": [
                {"id": "a", "statement": "Điện trở tương đương của đoạn mạch nối tiếp là $R_{\\text{eq}} = 50\\ \\Omega$.", "correct": True, "explanation": "$R_{\\text{eq}} = R_1 + R_2 = 20 + 30 = 50\\ \\Omega$."},
                {"id": "b", "statement": "Cường độ dòng điện chạy qua điện trở $R_1$ là $I_1 = 0.24\\text{ A}$.", "correct": True, "explanation": "$I = \\frac{U}{R_{\\text{eq}}} = \\frac{12}{50} = 0.24\\text{ A}$. Mạch nối tiếp nên $I_1 = I_2 = I = 0.24\\text{ A}$."},
                {"id": "c", "statement": "Hiệu điện thế giữa hai đầu điện trở $R_2$ là $U_2 = 4.8\\text{ V}$.", "correct": False, "explanation": "$U_2 = I \\cdot R_2 = 0.24 \\times 30 = 7.2\\text{ V}$."},
                {"id": "d", "statement": "Công suất tiêu thụ toàn mạch là $P = 2.88\\text{ W}$.", "correct": True, "explanation": "$P = U \\cdot I = 12 \\times 0.24 = 2.88\\text{ W}$."}
            ],
            "topic": "Mạch điện nối tiếp"
        }
    ],
    "part_3_short_answer": [
        {
            "id": "thcs_p3_1",
            "question": "Đặt một vật sáng AB trước thấu kính hội tụ có tiêu cự $f = 12\\text{ cm}$, khoảng cách từ vật đến quang tâm thấu kính là $d_{\\text{o}} = 36\\text{ cm}$. Khoảng cách ảnh $d_{\\text{i}}$ (hoặc $d'$) từ thấu kính đến màn hứng để thu được ảnh rõ nét là bao nhiêu xentimét (cm)?",
            "correct_value": 18,
            "unit": "cm",
            "explanation": "Áp dụng phương trình thấu kính mỏng chuẩn quốc tế (Thin Lens Equation): $\\frac{1}{f} = \\frac{1}{d_{\\text{o}}} + \\frac{1}{d_{\\text{i}}} \\Rightarrow \\frac{1}{d_{\\text{i}}} = \\frac{1}{12} - \\frac{1}{36} = \\frac{2}{36} = \\frac{1}{18} \\Rightarrow d_{\\text{i}} = 18\\text{ cm}$.",
            "topic": "Thấu kính hội tụ"
        }
    ]
}

# Compatibility alias
EXAM_2025_DATA = EXAM_THCS_DATA
