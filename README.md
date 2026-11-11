# PhysiX - Cổng Học & Thực Nghiệm Vật Lý THPT (FullStack)

> Nền tảng học Vật Lý tương tác, thí nghiệm ảo, kết nối cảm biến Vernier IoT và Trợ lý AI RAG SGK GDPT 2018 (Kết Nối Tri Thức Với Cuộc Sống, Chân Trời Sáng Tạo).

---

## 🏗️ Cấu Trúc Dự Án

```
RAG_VAT_LY/
├── backend/                  # FastAPI (Python 3.10)
│   ├── .venv/                # Virtual environment
│   ├── app/
│   │   ├── api/routers/
│   │   │   ├── rag.py        # API hỏi đáp RAG với Gemini & SGK
│   │   │   ├── lab.py        # API mô phỏng dao động, cơ năng
│   │   │   ├── quiz.py       # API ngân hàng đề thi & chấm điểm THPTQG
│   │   │   └── iot.py        # WebSocket stream dữ liệu cảm biến Vernier
│   │   ├── core/config.py    # Cấu hình dự án & CORS
│   │   ├── services/
│   │   │   ├── rag_service.py   # RAG pipeline + Gemini GenAI
│   │   │   └── physics_data.py  # Kho tri thức & đề thi chuẩn SGK
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 # Next.js 16 (React 19 + TypeScript + Tailwind v4)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Trang chủ PhysiX
│   │   │   ├── lab/          # Phòng thí nghiệm ảo (Interactive Canvas)
│   │   │   ├── iot/          # Phòng thí nghiệm Vernier IoT (WebSocket Telemetry)
│   │   │   ├── quiz/         # Luyện thi THPTQG & Xem lời giải chi tiết
│   │   │   ├── ai-tutor/     # Gia sư AI RAG hỏi đáp kiến thức SGK
│   │   │   └── progress/     # Bảng theo dõi tiến độ cá nhân & năng lực
│   │   └── components/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   └── package.json
│
├── design/                   # Tài liệu thiết kế giao diện
│   ├── design-system/        # Design System (Colors, Typography) - DESIGN.md
│   └── mockups/              # Bản mẫu giao diện (code.html + screen.png)
│       ├── home/                    # Trang chủ PhysiX
│       ├── lab-harmonic-oscillation/ # Bài học thí nghiệm ảo dao động điều hòa
│       ├── iot-vernier-lab/         # Phòng thí nghiệm kết nối Vernier IoT
│       ├── quiz-exam-bank/          # Ngân hàng đề luyện thi THPTQG
│       ├── quiz-result-solution/    # Kết quả & hướng dẫn giải chi tiết
│       └── progress-dashboard/      # Bảng theo dõi tiến độ & năng lực
│
└── run_dev.ps1               # Script khởi động nhanh cả 2 dịch vụ
```

---

## 🚀 Hướng Dẫn Khởi Động

### Cách 1: Khởi động tự động bằng Script
Chạy file PowerShell ở thư mục gốc:
```powershell
.\run_dev.ps1
```

### Cách 2: Khởi động thủ công từng phần

#### 1. Backend (FastAPI):
```powershell
cd backend
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- **API Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Root**: [http://localhost:8000/](http://localhost:8000/)

#### 2. Frontend (Next.js):
```powershell
cd frontend
npm run dev
```
- **Truy cập Website**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Cấu Hình Gemini AI Key (RAG)
Mở file `backend/.env` và điền key của bạn:
```env
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```
*(Nếu chưa cấu hình Key, hệ thống tự động chạy ở chế độ Gia Sư Cục Bộ với kho tri thức SGK GDPT 2018 có sẵn).*
