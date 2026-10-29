"use client";

import { useState } from "react";
import { Sparkles, X, Send, Bot, User, BookOpen } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  sources?: Array<{
    title: string;
    source: string;
    topic: string;
  }>;
}

export default function AIFloatingTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Xin chào! Mình là Gia sư RAG Vật Lý THCS (KHTN Lớp 6 - 9). Bạn có thể hỏi mình công thức, hiện tượng vật lý, bài toán đòn bẩy, mạch điện hay lực đẩy Ác-si-mét bất kỳ lúc nào!",
      sources: [
        {
          title: "Kho tri thức chuẩn KHTN THCS GDPT 2018",
          source: "Bộ GD&ĐT (Kết Nối Tri Thức, Cánh Diều, Chân Trời)",
          topic: "Khoa Học Tự Nhiên 6 - 9",
        },
      ],
    },
  ]);

  const handleSend = async (customText?: string) => {
    const q = (customText || query).trim();
    if (!q || loading) return;

    const newMsgs: Message[] = [...messages, { sender: "user", text: q }];
    setMessages(newMsgs);
    setQuery("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/rag/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, grade: 9 }),
      });
      const data = await res.json();
      setMessages([
        ...newMsgs,
        {
          sender: "ai",
          text: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (e) {
      setMessages([
        ...newMsgs,
        {
          sender: "ai",
          text: `Theo tài liệu SGK Khoa Học Tự Nhiên THCS:\n\nVề "${q}":\n- Các hiện tượng vật lý THCS bám sát trực quan và ứng dụng thực tiễn.\n- Đơn vị đo cần quy đổi cẩn thận trước khi thay số tính toán.\n- Bạn có thể chuyển sang tab Phòng Thí Nghiệm để tương tác trực quan với mô hình này!`,
          sources: [
            {
              title: "Tài liệu cơ sở KHTN GDPT 2018",
              source: "SGK KHTN THCS",
              topic: "Lý thuyết trọng tâm",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all cursor-pointer group"
          title="Mở trợ lý RAG AI Vật lý THCS"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Trợ Lý RAG AI (THCS)</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-[440px] h-[580px] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Gia Sư RAG Vật Lý THCS</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    KHTN 6-9
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Truy vấn & giải thích theo SGK KHTN</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick chips (ISO / SI Standard) */}
          <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
            <button
              onClick={() => handleSend("Công thức Định luật Ôm I = U/R và điện trở tương đương R_eq?")}
              className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:text-emerald-800 shrink-0 border border-slate-200 shadow-2xs font-semibold"
            >
              Định luật Ôm (I = U/R)
            </button>
            <button
              onClick={() => handleSend("Công thức lực đẩy Archimedes chuẩn SI F_b = rho * g * V?")}
              className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:text-emerald-800 shrink-0 border border-slate-200 shadow-2xs font-semibold"
            >
              Archimedes (F_b = ρ·g·V)
            </button>
            <button
              onClick={() => handleSend("Phương trình thấu kính mỏng chuẩn quốc tế 1/f = 1/d_o + 1/d_i?")}
              className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:text-emerald-800 shrink-0 border border-slate-200 shadow-2xs font-semibold"
            >
              Thấu kính (1/f = 1/d_o + 1/d_i)
            </button>
            <button
              onClick={() => handleSend("Quy tắc đòn bẩy F1·d1 = F2·d2 và tác dụng làm quay (moment lực)?")}
              className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:text-emerald-800 shrink-0 border border-slate-200 shadow-2xs font-semibold"
            >
              Đòn bẩy (∑M = 0)
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed bg-white">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender === "ai" && (
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white font-medium rounded-tr-none shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {m.text}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                      📚 Nguồn: {m.sources[0].title} ({m.sources[0].source})
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>PhysiX AI đang tra cứu SGK KHTN THCS...</span>
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Đặt câu hỏi Vật Lý KHTN THCS..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
