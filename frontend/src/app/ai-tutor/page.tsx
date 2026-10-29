"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, BookOpen, Bot, User, Lightbulb, Key, X, ExternalLink, Check } from "lucide-react";

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
      text: "Xin chào bạn! Mình là Gia Sư Trí Tuệ Nhân Tạo PhysiX THCS (THCS Tây Tiến). Mình sử dụng mô hình Google Gemini kết hợp hệ thống RAG bám sát SGK Khoa Học Tự Nhiên Lớp 6, 7, 8, 9 GDPT 2018 và chuẩn quốc tế ISO 80000 / SI. Bạn đang cần giải đáp câu hỏi hay bài tập nào hôm nay?",
      provider: "Google Gemini + PhysiX RAG Engine",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [tempKeyInput, setTempKeyInput] = useState<string>("");
  const [keySavedToast, setKeySavedToast] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("physix_gemini_api_key") || "";
      setApiKey(saved);
      setTempKeyInput(saved);
    } catch {
      // Ignore
    }
  }, []);

  const handleSaveApiKey = () => {
    const k = tempKeyInput.trim();
    setApiKey(k);
    try {
      localStorage.setItem("physix_gemini_api_key", k);
    } catch {}
    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    // Tự động nhận diện nếu người dùng dán Gemini API Key trực tiếp vào ô chat
    if (q.startsWith("AIzaSy") || (q.length >= 35 && /^[A-Za-z0-9_-]{35,}$/.test(q))) {
      setApiKey(q);
      try {
        localStorage.setItem("physix_gemini_api_key", q);
      } catch {}
      setInput("");
      setMessages([
        ...messages,
        { sender: "user", text: "🔑 Cài đặt Gemini API Key: " + q.substring(0, 10) + "••••••••••••••••••••" },
        {
          sender: "ai",
          text: "🎉 **Đã kích hoạt thành công Google Gemini API!**\n\nKhóa API của bạn đã được kết nối và lưu an toàn trên trình duyệt. Từ bây giờ, Gia Sư AI THCS Tây Tiến sẽ sử dụng trực tiếp trí tuệ nhân tạo Google Gemini kết hợp kho dữ liệu KHTN THCS để giải đáp mọi bài tập và hiện tượng vật lý chuyên sâu cho bạn. Hãy đặt câu hỏi tiếp theo nhé!",
          provider: "Google Gemini Activated (THCS Tây Tiến)",
        },
      ]);
      return;
    }

    const newMessages: Message[] = [...messages, { sender: "user", text: q }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, grade: 9, userApiKey: apiKey }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: data.answer || "Không nhận được phản hồi từ mô hình AI.",
          sources: data.sources,
          provider: data.provider || "Google Gemini + PhysiX RAG",
        },
      ]);
    } catch (e: any) {
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
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Gia Sư AI THCS Tây Tiến</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Google Gemini API + RAG
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Tra cứu và giải đáp bài tập Vật Lý THCS (KHTN Lớp 6 - 9) theo SGK GDPT 2018
              </p>
            </div>
          </div>

          {/* Gemini API Key Setting Button */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
              apiKey
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
            title="Cài đặt khóa API Google Gemini"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span>{apiKey ? "Gemini API: Đã kết nối" : "Cài đặt Gemini API Key"}</span>
          </button>
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

                {/* Inline Action if fallback message */}
                {msg.text.includes("Cài đặt Gemini API Key") && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setTempKeyInput(apiKey);
                        setIsKeyModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-300" />
                      <span>Bấm vào đây để dán API Key</span>
                    </button>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Lấy key miễn phí (Google AI Studio)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Sources Citation */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5 font-mono">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Nguồn tài liệu SGK KHTN THCS tham chiếu:
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
                    Mô hình: {msg.provider}
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
                <span>Google Gemini AI đang suy luận câu trả lời theo SGK KHTN 6-9...</span>
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
          {/* Quick API Key banner if not entered */}
          {!apiKey && (
            <div className="mb-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Key className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Chưa kết nối Gemini API:</strong> Dán mã API Key vào đây để kích hoạt AI trả lời mọi câu hỏi:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-[260px] max-w-md">
                <input
                  type="password"
                  placeholder="Dán mã AIzaSy... vào đây"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                  className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-2xs cursor-pointer"
                >
                  Lưu Key
                </button>
              </div>
            </div>
          )}

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

      {/* GEMINI API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Cấu hình Google Gemini API</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập mã <strong>Google Gemini API Key</strong> để Gia sư AI gọi trực tiếp mô hình AI Gemini (gemini-2.5-flash) và giải đáp mọi bài tập phân môn Vật Lý THCS không giới hạn.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Gemini API Key:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-500">
                Khóa được lưu bảo mật trong trình duyệt của bạn (LocalStorage) và không bị chia sẻ.
              </span>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:underline font-bold"
            >
              <span>Lấy khóa Gemini API miễn phí tại Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setTempKeyInput("");
                  setApiKey("");
                  try {
                    localStorage.removeItem("physix_gemini_api_key");
                  } catch {}
                  setIsKeyModalOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                Xóa khóa
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
              >
                {keySavedToast ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{keySavedToast ? "Đã lưu thành công!" : "Lưu khóa API"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
