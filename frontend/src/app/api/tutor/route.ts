import { NextRequest, NextResponse } from "next/server";

interface KnowledgeDoc {
  id: string;
  grade: number;
  topic: string;
  title: string;
  content: string;
  source: string;
}

const KHTN_DOCS: KnowledgeDoc[] = [
  {
    id: "doc-01",
    grade: 6,
    topic: "Khối lượng riêng & Trọng lượng",
    title: "Công thức Khối lượng riêng và Trọng lượng",
    content: "Khối lượng riêng: \\rho = m / V (kg/m³). Trọng lượng: P = 10·m hoặc W = m·g (N). Trọng lượng riêng: d = \\rho·g = 10·\\rho (N/m³). Nước nguyên chất có khối lượng riêng 1000 kg/m³.",
    source: "SGK KHTN 6 — Lực & Năng lượng",
  },
  {
    id: "doc-02",
    grade: 6,
    topic: "Lực & Biến dạng đàn hồi lò xo",
    title: "Định luật Hooke và Độ biến dạng lò xo",
    content: "Độ biến dạng lò xo: \\Delta l = |l - l_0|. Lực đàn hồi tỉ lệ thuận với độ biến dạng: F = k·\\Delta l (k là độ cứng lò xo, N/m).",
    source: "SGK KHTN 6 — Lực đàn hồi",
  },
  {
    id: "doc-03",
    grade: 7,
    topic: "Tốc độ chuyển động",
    title: "Tốc độ trung bình và Đồ thị quãng đường - thời gian",
    content: "Tốc độ v = s / t (m/s hoặc km/h; 1 m/s = 3.6 km/h). Đồ thị s - t biểu diễn quãng đường theo thời gian, độ dốc là tốc độ.",
    source: "SGK KHTN 7 — Tốc độ",
  },
  {
    id: "doc-04",
    grade: 7,
    topic: "Sóng âm & Đặc trưng âm thanh",
    title: "Tần số, Biên độ và Độ to, Độ cao của âm",
    content: "Tần số dao động f = n / t (Hz), f càng lớn âm càng bổng (cao). Biên độ dao động A càng lớn âm càng to (đo bằng dB). Tốc độ truyền âm: v_rắn > v_lỏng > v_khí; âm không truyền được trong chân không.",
    source: "SGK KHTN 7 — Âm thanh",
  },
  {
    id: "doc-05",
    grade: 7,
    topic: "Quang học & Định luật phản xạ ánh sáng",
    title: "Định luật phản xạ và Ảnh qua gương phẳng",
    content: "Tia phản xạ nằm trong mặt phẳng tới. Góc phản xạ bằng góc tới: i' = i. Ảnh tạo bởi gương phẳng là ảnh ảo, cùng kích thước với vật và đối xứng với vật qua mặt gương.",
    source: "SGK KHTN 7 — Ánh sáng",
  },
  {
    id: "doc-06",
    grade: 8,
    topic: "Áp suất chất lỏng & Khí quyển",
    title: "Áp suất chất lưu và Áp suất thủy tĩnh",
    content: "Áp suất chất rắn p = F / S (Pa). Áp suất chất lỏng ở độ sâu h: p = d·h = \\rho·g·h (d là trọng lượng riêng N/m³, h là độ sâu m). Áp suất tại đáy bình: p = p_0 + \\rho·g·h. Bình thông nhau và máy nén thủy lực: F1 / S1 = F2 / S2.",
    source: "SGK KHTN 8 — Áp suất",
  },
  {
    id: "doc-07",
    grade: 8,
    topic: "Lực đẩy Ác-si-mét & Điều kiện chìm nổi",
    title: "Nguyên lý Archimedes và Trọng lượng biểu kiến",
    content: "Lực đẩy Ác-si-mét: F_A = d·V = \\rho·g·V (V là thể tích phần chất lỏng bị vật chiếm chỗ). Điều kiện chìm nổi: F_A > P (\\rho_cl > \\rho_vật) vật nổi; F_A = P (\\rho_cl = \\rho_vật) vật lơ lửng; F_A < P (\\rho_cl < \\rho_vật) vật chìm.",
    source: "SGK KHTN 8 — Lực đẩy Ác-si-mét",
  },
  {
    id: "doc-08",
    grade: 8,
    topic: "Quy tắc đòn bẩy & Tác dụng làm quay (Moment lực)",
    title: "Tác dụng làm quay của lực (Moment lực) và Đòn bẩy KHTN 8",
    content: "Tác dụng làm quay (moment lực) càng lớn khi lực F càng lớn hoặc khoảng cách từ trục quay đến giá của lực (cánh tay đòn d) càng lớn. Quy tắc thăng bằng đòn bẩy: F1·d1 = F2·d2. Khi d1 > d2 thì F1 < F2 (được lợi về lực nâng vật nặng). Lưu ý: Tính toán định lượng moment M = F·d và tổng moment \\sum M = 0 là kiến thức của Vật lí lớp 10.",
    source: "SGK KHTN 8 — Tác dụng làm quay của lực",
  },
  {
    id: "doc-09",
    grade: 8,
    topic: "Hiện tượng nhiễm điện & Lực tĩnh điện",
    title: "Điện tích và Tương tác tĩnh điện",
    content: "Có hai loại điện tích: dương (+) và âm (-). Các điện tích cùng dấu đẩy nhau, trái dấu hút nhau. Nhiễm điện do cọ xát là do dịch chuyển electron giữa các vật.",
    source: "SGK KHTN 8 — Điện học",
  },
  {
    id: "doc-10",
    grade: 9,
    topic: "Định luật Ôm & Điện trở",
    title: "Định luật Ôm và Điện trở tương đương",
    content: "Định luật Ôm: I = U / R (I: A, U: V, R: \\Omega). Đoạn mạch nối tiếp: R_tđ = R1 + R2, I = I1 = I2, U = U1 + U2. Đoạn mạch song song: 1/R_tđ = 1/R1 + 1/R2 <=> R_tđ = (R1·R2)/(R1+R2), U = U1 = U2, I = I1 + I2. Điện trở dây dẫn: R = \\rho·(l / S).",
    source: "SGK KHTN 9 — Điện học",
  },
  {
    id: "doc-11",
    grade: 9,
    topic: "Công suất điện & Định luật Joule - Lenz",
    title: "Công suất tiêu thụ và Điện năng",
    content: "Công suất điện: P = U·I = I²·R = U² / R (W). Điện năng tiêu thụ: A = P·t = U·I·t (J hoặc kW·h; 1 kW·h = 3.600.000 J). Định luật Joule - Lenz: Q = I²·R·t (J).",
    source: "SGK KHTN 9 — Điện học",
  },
  {
    id: "doc-12",
    grade: 9,
    topic: "Thấu kính hội tụ & Phân kì",
    title: "Phương trình tạo ảnh thấu kính mỏng và Độ tụ",
    content: "Công thức khoảng cách: 1/f = 1/d_o + 1/d_i <=> d_i = (d_o·f)/(d_o - f). Tỉ lệ chiều cao: h_i / h_o = d_i / d_o. Độ tụ D = 1/f (dp, f tính bằng mét). TKHT (f > 0): d_o > f cho ảnh thật ngược chiều; d_o < f cho ảnh ảo cùng chiều lớn hơn vật (kính lúp). TKPK (f < 0): luôn cho ảnh ảo cùng chiều nhỏ hơn vật.",
    source: "SGK KHTN 9 — Quang học",
  },
  {
    id: "doc-13",
    grade: 9,
    topic: "Động năng & Bảo toàn cơ năng",
    title: "Cơ năng toàn phần và Định luật bảo toàn",
    content: "Động năng: W_đ = 1/2·m·v² (J). Thế năng trọng trường: W_t = m·g·h (J). Cơ năng toàn phần: W = W_đ + W_t. Khi bỏ qua ma sát và lực cản, cơ năng được bảo toàn: W = const.",
    source: "SGK KHTN 9 — Cơ năng",
  },
  {
    id: "doc-14",
    grade: 9,
    topic: "Hiện tượng cảm ứng điện từ",
    title: "Từ thông và Hiện tượng cảm ứng điện từ",
    content: "Từ thông: \\Phi = B·S·cos(\\alpha) (Wb). Khi số đường sức từ qua tiết diện cuộn dây kín biến thiên thì xuất hiện dòng điện cảm ứng. Suất điện động cảm ứng: e_c = -\\Delta\\Phi / \\Delta t.",
    source: "SGK KHTN 9 — Điện từ học",
  },
];

function findRelevantDocs(query: string, grade?: number): KnowledgeDoc[] {
  const q = query.toLowerCase();
  const scored = KHTN_DOCS.map((doc) => {
    let score = 0;
    if (grade && doc.grade === grade) score += 2;
    const words = q.split(/\s+/);
    for (const w of words) {
      if (w.length < 2) continue;
      if (doc.topic.toLowerCase().includes(w)) score += 3;
      if (doc.title.toLowerCase().includes(w)) score += 3;
      if (doc.content.toLowerCase().includes(w)) score += 1;
    }
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.doc);
  return matched.length > 0 ? matched : KHTN_DOCS.slice(0, 2);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, grade, userApiKey } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Thiếu nội dung câu hỏi" }, { status: 400 });
    }

    const apiKey = (userApiKey || process.env.GEMINI_API_KEY || "").trim();
    const relevantDocs = findRelevantDocs(query, grade);
    const contextText = relevantDocs
      .map((d) => `[Chủ đề: ${d.topic} (Lớp ${d.grade})] - ${d.title}\nNội dung: ${d.content}\nNguồn: ${d.source}`)
      .join("\n\n");

    // If Gemini API Key is present, call Google Gemini API
    if (apiKey) {
      const systemInstruction = `Bạn là Trợ Lý Gia Sư Trí Tuệ Nhân Tạo PhysiX của Trường THCS Tây Tiến, chuyên sâu môn Khoa Học Tự Nhiên (phân môn Vật Lý Lớp 6, 7, 8, 9) theo Chương Trình Giáo Dục Phổ Thông 2018 (SGK Kết nối tri thức, Chân trời sáng tạo, Cánh Diều) và chuẩn quốc tế ISO 80000 / SI.

NGUYÊN TẮC TRẢ LỜI:
1. Thân thiện, sư phạm, khuyến khích học sinh tư duy khoa học.
2. Trình bày rõ ràng: Khái niệm cốt lõi -> Công thức toán học (dùng ký hiệu LaTeX như $F = m \\cdot a$, $\\rho = \\frac{m}{V}$) -> Đơn vị đo chuẩn SI -> Ý nghĩa vật lý / Ví dụ thực tế.
3. Luôn bám sát chương trình THCS:
   - Với Lớp 8: Dùng thuật ngữ "moment" (không dùng "mômen"). Quy tắc đòn bẩy $F_1 \\cdot d_1 = F_2 \\cdot d_2$. Không bắt tính toán moment lực $\\sum M = 0$ hay $M = F \\cdot d$ (vì đó là chương trình Vật lí 10).
   - Với các bài thí nghiệm, gợi ý học sinh vào mục "Thí nghiệm ảo" của hệ thống để trải nghiệm trực quan.
4. Căn cứ vào tư liệu SGK được cung cấp:
${contextText}`;

      const prompt = `Câu hỏi của học sinh: "${query}"\n\nHãy giải thích cặn kẽ, chính xác và dễ hiểu nhất cho học sinh THCS.`;

      // Call Gemini 2.5 Flash (or 2.0 / 1.5 flash)
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let answerText = "";
      let usedModel = "";

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemInstruction }],
                },
                contents: [
                  {
                    parts: [{ text: prompt }],
                  },
                ],
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 1500,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (answerText) {
              usedModel = model;
              break;
            }
          } else {
            const errJson = await geminiRes.json();
            console.warn(`[Gemini API ${model} failed]:`, errJson);
          }
        } catch (e) {
          console.warn(`[Gemini API fetch error with ${model}]:`, e);
        }
      }

      if (answerText) {
        return NextResponse.json({
          answer: answerText,
          sources: relevantDocs.map((d) => ({
            title: d.title,
            source: d.source,
            topic: d.topic,
          })),
          provider: `Google Gemini (${usedModel}) + PhysiX RAG THCS Tây Tiến`,
        });
      }
    }

    // Fallback if no API key or Gemini request failed
    const docSummary = relevantDocs
      .map((d) => `• **${d.topic} (Lớp ${d.grade}):** ${d.content}`)
      .join("\n\n");

    const fallbackAnswer = `Chào bạn! Dưới đây là kiến thức chuẩn SGK Khoa Học Tự Nhiên THCS (GDPT 2018) cho thắc mắc của bạn:\n\n${docSummary}\n\n---\n💡 **Mẹo:** Bạn có thể nhấn nút **🔑 Cài đặt Gemini API Key** ở góc trên để kết nối trực tiếp với mô hình AI Gemini mở rộng của Google và giải đáp mọi bài tập chuyên sâu!`;

    return NextResponse.json({
      answer: fallbackAnswer,
      sources: relevantDocs.map((d) => ({
        title: d.title,
        source: d.source,
        topic: d.topic,
      })),
      provider: "PhysiX RAG Tri Thức SGK (THCS Tây Tiến)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Lỗi xử lý yêu cầu gia sư AI: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
