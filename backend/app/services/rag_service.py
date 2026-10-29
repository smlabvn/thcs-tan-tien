import os
import re
from typing import List, Dict, Any
from app.services.physics_data import PHYSICS_KNOWLEDGE_DOCS
from app.core.config import settings

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

class PhysicsRAGService:
    def __init__(self):
        self.docs = PHYSICS_KNOWLEDGE_DOCS
        self.client = None
        if settings.GEMINI_API_KEY and genai:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"[RAG] Warning: Unable to initialize Google GenAI Client: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Simple BM25 / token-overlap keyword scoring for retrieval."""
        words = re.findall(r'\w+', query.lower())
        scored = []
        for doc in self.docs:
            score = 0
            text = (doc["title"] + " " + doc["content"] + " " + doc["topic"]).lower()
            for w in words:
                if len(w) > 2 and w in text:
                    score += text.count(w)
            scored.append((score, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        # Return top_k docs that have score > 0, or top 2 default
        top_docs = [doc for score, doc in scored if score > 0][:top_k]
        if not top_docs:
            top_docs = self.docs[:2]
        return top_docs

    async def answer_physics_query(self, query: str) -> Dict[str, Any]:
        """RAG query answering pipeline."""
        retrieved_docs = self.retrieve(query)
        context_str = "\n\n".join(
            f"--- [TÀI LIỆU {i+1}: {doc['title']} ({doc['source']})] ---\n{doc['content']}"
            for i, doc in enumerate(retrieved_docs)
        )

        system_instruction = (
            "Bạn là Gia Sư Trí Tuệ Nhân Tạo PhysiX - chuyên gia Khoa Học Tự Nhiên & Vật Lý THCS (Lớp 6, 7, 8, 9) theo chương trình GDPT 2018 và Chuẩn Quốc Tế (ISO 80000 / IUPAP / SI).\n"
            "Hãy trả lời câu hỏi của học sinh một cách dễ hiểu, sư phạm, chính xác, sử dụng kiến thức từ tài liệu trích dẫn sau đây.\n"
            "Khi trình bày công thức toán học và vật lý, BẮT BUỘC sử dụng ký hiệu chuẩn quốc tế (SI / ISO 80000):\n"
            "- Khối lượng riêng: \\rho (kg/m³); Trọng lượng: W = m·g; Lực đẩy Archimedes: F_b = \\rho·g·V_disp.\n"
            "- Điện trở tương đương: R_eq; Công suất: P = U·I; Nhiệt lượng: Q = I²·R·t.\n"
            "- Thấu kính mỏng: 1/f = 1/d_o + 1/d_i (hoặc 1/f = 1/u + 1/v); Độ phóng đại: m = -d_i / d_o.\n"
            "- Quy tắc đòn bẩy & tác dụng làm quay (moment lực): F₁·d₁ = F₂·d₂ (cân bằng đòn bẩy lớp 8, d₁ > d₂ được lợi về lực; tính toán định lượng moment lực M = F·d và Sigma M = 0 là lớp 10).\n"
            "Sau phần giải thích, hãy trích dẫn nguồn sách hoặc quy chuẩn tham khảo."
        )

        prompt = f"""TÀI LIỆU THAM KHẢO TỪ SGK KHTN THCS & NGÂN HÀNG KIẾN THỨC:
{context_str}

CÂU HỎI CỦA HỌC SINH THCS:
{query}

TRẢ LỜI CHI TIẾT (DỄ HIỂU, CHUẨN KHTN 6-9):"""

        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3
                    )
                )
                answer_text = response.text
                return {
                    "query": query,
                    "answer": answer_text,
                    "sources": retrieved_docs,
                    "provider": f"Gemini ({settings.GEMINI_MODEL})"
                }
            except Exception as e:
                print(f"[RAG] Gemini call failed ({e}), falling back to offline tutor mode.")

        # Smart fallback tutor when API key is not yet provided
        fallback_answer = (
            f"Dựa trên kiến thức SGK Khoa Học Tự Nhiên THCS ({retrieved_docs[0]['source']}):\n\n"
            f"Về chủ đề **{retrieved_docs[0]['topic']}**: {retrieved_docs[0]['content']}\n\n"
            f"💡 **Tóm tắt cốt lõi:**\n"
            f"- Hãy ghi nhớ các công thức tính toán và đơn vị đo tương ứng.\n"
            f"- Bạn có thể vào tab 'Phòng Thí Nghiệm' để thực hành trực quan mô phỏng bài học này!\n"
            f"- Để kết nối trực tiếp với mô hình Gemini AI mở rộng, vui lòng cấu hình `GEMINI_API_KEY` trong file `backend/.env`."
        )
        return {
            "query": query,
            "answer": fallback_answer,
            "sources": retrieved_docs,
            "provider": "PhysiX THCS Local Knowledge Base (GDPT 2018)"
        }

rag_service = PhysicsRAGService()
