"use client";

import { useState } from "react";
import { Sparkles, Send, BookOpen, Bot, User, Lightbulb } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  sources?: Array<{
    title: string;
    source: string;
    topic: string;
  }>;
  provider?: string;
}

const SAMPLE_PROMPTS = [
  "Lực đẩy Archimedes chuẩn SI (F_b = ρ·g·V) và điều kiện nổi/chìm theo khối lượng riêng?",
  "Định luật Ôm (I = U/R) và cách tính điện trở tương đương R_eq đoạn mạch?",
  "Phương trình thấu kính mỏng chuẩn quốc tế (1/f = 1/d_o + 1/d_i) và độ phóng đại m?",
  "Quy tắc đòn bẩy (F₁·d₁ = F₂·d₂) và tác dụng làm quay (moment lực) lớp 8?",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Xin chào bạn! Mình là Gia Sư Trí Tuệ Nhân Tạo PhysiX THCS. Mình luôn sẵn sàng giải đáp mọi thắc mắc về phân môn Vật Lý trong môn Khoa Học Tự Nhiên THCS (Lớp 6, 7, 8, 9 GDPT 2018), giải thích hiện tượng thí nghiệm ảo và ôn luyện khảo sát vào lớp 10. Bạn đang muốn tìm hiểu chủ đề nào hôm nay?",
      provider: "PhysiX RAG Engine",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const newMessages: Message[] = [...messages, { sender: "user", text: q }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, grade: 9 }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: data.answer,
          sources: data.sources,
          provider: data.provider,
        },
      ]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: `Theo tài liệu SGK Khoa Học Tự Nhiên THCS (Chương trình GDPT 2018):\n\nVề thắc mắc "${q}":\n- **Khái niệm cốt lõi:** Các định luật vật lý THCS gắn liền trực tiếp với thực tiễn đời sống và thí nghiệm trực quan.\n- **Công thức trọng tâm:** Hãy chú ý xác định đúng các đại lượng, đổi đúng đơn vị chuẩn (m, s, N, kg, V, A, Ω, J, W).\n- **Ứng dụng thực hành:** Bạn có thể vào mục "Phòng Thí Nghiệm Ảo" trên thanh menu để tương tác kéo thả và quan sát trực tiếp hiện tượng!`,
          sources: [
            {
              title: "Khoa Học Tự Nhiên - Phân môn Vật lý THCS",
              source: "SGK KHTN Lớp 6-9 - Kết Nối Tri Thức & Cánh Diều",
              topic: "Kiến thức Vật Lý THCS",
            },
          ],
          provider: "PhysiX Fallback Base",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Gia Sư Trí Tuệ Nhân Tạo PhysiX THCS</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  RAG + Gemini (KHTN 6-9)
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Truy vấn ngữ nghĩa kho tài liệu SGK Khoa Học Tự Nhiên (Vật Lý Lớp 6 - 9) GDPT 2018
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === "user"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-600 text-white shadow-2xs"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white shadow-xs rounded-tr-none font-medium"
                    : "bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5 font-mono">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Nguồn SGK KHTN THCS trích dẫn:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.sources.map((s, sIdx) => (
                        <li key={sIdx} className="text-slate-600">
                          <strong className="text-slate-800">{s.title}</strong> — <em>{s.source}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.provider && (
                  <div className="mt-2 text-[10px] text-slate-400 font-mono text-right">
                    Phản hồi từ: {msg.provider}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-3xl mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Gia sư AI đang tra cứu SGK KHTN 6-9 và lập luận chi tiết...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Gợi ý câu hỏi KHTN THCS:
          </span>
          {SAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full px-3 py-1 shrink-0 transition-all font-medium shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm focus-within:border-emerald-600 transition-colors">
            <input
              type="text"
              placeholder="Hỏi bất kỳ kiến thức hay bài tập Vật Lý THCS (Lực đẩy Ác-si-mét, Định luật Ôm, Thấu kính...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-4 py-2 bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi câu hỏi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
