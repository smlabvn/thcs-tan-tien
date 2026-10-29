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
    content: "Khối lượng riêng: $\\rho = \\frac{m}{V}$ (đơn vị $\\text{kg/m}^3$). Trọng lượng: $P = 10 \\cdot m$ hoặc $W = m \\cdot g$ (đơn vị $\\text{N}$, với $g \\approx 9{,}8\\text{ m/s}^2$). Trọng lượng riêng: $d = \\rho \\cdot g = 10 \\cdot \\rho$ ($\\text{N/m}^3$). Nước nguyên chất có khối lượng riêng $\\rho = 1000\\text{ kg/m}^3$.",
    source: "SGK KHTN 6 — Lực & Năng lượng",
  },
  {
    id: "doc-02",
    grade: 6,
    topic: "Lực & Biến dạng đàn hồi lò xo",
    title: "Định luật Hooke và Độ biến dạng lò xo",
    content: "Độ biến dạng của lò xo: $\\Delta l = |l - l_0|$ (với $l_0$ là chiều dài tự nhiên, $l$ là chiều dài khi biến dạng). Lực đàn hồi tỉ lệ thuận với độ biến dạng: $F_{\\text{đh}} = k \\cdot \\Delta l$ (trong đó $k$ là độ cứng của lò xo, đơn vị $\\text{N/m}$).",
    source: "SGK KHTN 6 — Lực đàn hồi",
  },
  {
    id: "doc-03",
    grade: 6,
    topic: "Lực tương tác, Lực và Phản lực",
    title: "Tác dụng tương hỗ giữa hai vật — Lực và Phản lực (KHTN 6 & 8)",
    content: "Khi vật A tác dụng một lực lên vật B, thì vật B cũng tác dụng trở lại vật A một lực. Hai lực này gọi là **lực và phản lực**:\n- **Đặc điểm:** Cùng phương, ngược chiều, cùng độ lớn nhưng **đặt vào hai vật khác nhau** (không triệt tiêu nhau): $\\vec{F}_{\\text{AB}} = -\\vec{F}_{\\text{BA}}$, độ lớn: $F_{\\text{tác dụng}} = F_{\\text{phản lực}}$.\n- **Ví dụ thực tiễn:**\n  1. Khi người bước đi, chân tác dụng một lực đạp về phía sau lên mặt đất, mặt đất tác dụng một **phản lực** đẩy người về phía trước.\n  2. Một cuốn sách đặt trên mặt bàn: Sách tác dụng lực nén xuống mặt bàn, mặt bàn tác dụng **phản lực đỡ** $\\vec{N}$ hướng thẳng đứng lên trên ($N = P = m \\cdot g$).\n  3. Tên lửa hoặc bóng bay xì hơi: Khí phụt ra phía sau tạo phản lực đẩy tên lửa bay về phía trước.",
    source: "SGK KHTN 6 & 8 — Tương tác lực",
  },
  {
    id: "doc-04",
    grade: 7,
    topic: "Tốc độ chuyển động",
    title: "Tốc độ trung bình và Đồ thị quãng đường - thời gian",
    content: "Tốc độ: $v = \\frac{s}{t}$ (đơn vị $\\text{m/s}$ hoặc $\\text{km/h}$; quy đổi $1\\text{ m/s} = 3{,}6\\text{ km/h}$). Đồ thị $s - t$ biểu diễn quãng đường theo thời gian, độ dốc của đường biểu diễn đặc trưng cho tốc độ chuyển động.",
    source: "SGK KHTN 7 — Tốc độ",
  },
  {
    id: "doc-05",
    grade: 7,
    topic: "Sóng âm & Đặc trưng âm thanh",
    title: "Tần số, Biên độ và Độ to, Độ cao của âm",
    content: "Tần số dao động: $f = \\frac{n}{t}$ (đơn vị Hertz, $\\text{Hz}$), tần số càng lớn âm càng bổng (cao). Biên độ dao động $A$ càng lớn âm phát ra càng to (đo bằng decibel, $\\text{dB}$). Tốc độ truyền âm: $v_{\\text{rắn}} > v_{\\text{lỏng}} > v_{\\text{khí}}$; sóng âm không truyền được trong chân không.",
    source: "SGK KHTN 7 — Âm thanh",
  },
  {
    id: "doc-06",
    grade: 7,
    topic: "Quang học & Định luật phản xạ ánh sáng",
    title: "Định luật phản xạ và Ảnh qua gương phẳng",
    content: "Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới. Góc phản xạ bằng góc tới: $i' = i$. Ảnh tạo bởi gương phẳng là **ảnh ảo**, cùng kích thước với vật và đối xứng với vật qua mặt phẳng gương.",
    source: "SGK KHTN 7 — Ánh sáng",
  },
  {
    id: "doc-07",
    grade: 8,
    topic: "Áp suất chất lỏng & Khí quyển",
    title: "Áp suất chất lưu và Áp suất thủy tĩnh",
    content: "Áp suất chất rắn: $p = \\frac{F}{S}$ (đơn vị Pascal, $1\\text{ Pa} = 1\\text{ N/m}^2$). Áp suất chất lỏng ở độ sâu $h$: $p = d \\cdot h = \\rho \\cdot g \\cdot h$ ($d$ là trọng lượng riêng $\\text{N/m}^3$, $h$ là độ sâu tính bằng $\\text{m}$). Áp suất tại đáy bình chứa: $p = p_0 + \\rho \\cdot g \\cdot h$. Nguyên lý bình thông nhau và máy thủy lực: $\\frac{F_1}{S_1} = \\frac{F_2}{S_2}$.",
    source: "SGK KHTN 8 — Áp suất",
  },
  {
    id: "doc-08",
    grade: 8,
    topic: "Lực đẩy Ác-si-mét & Điều kiện chìm nổi",
    title: "Nguyên lý Archimedes và Trọng lượng biểu kiến",
    content: "Lực đẩy Ác-si-mét (Archimedes): $$F_{\\text{A}} = d \\cdot V = \\rho \\cdot g \\cdot V$$ (trong đó $V$ là thể tích phần chất lỏng bị vật chiếm chỗ, $\\rho$ là khối lượng riêng của chất lỏng). Điều kiện chìm nổi của vật:\n- Vật nổi: $F_{\\text{A}} > P \\iff \\rho_{\\text{chất lỏng}} > \\rho_{\\text{vật}}$.\n- Vật lơ lửng: $F_{\\text{A}} = P \\iff \\rho_{\\text{chất lỏng}} = \\rho_{\\text{vật}}$.\n- Vật chìm: $F_{\\text{A}} < P \\iff \\rho_{\\text{chất lỏng}} < \\rho_{\\text{vật}}$.",
    source: "SGK KHTN 8 — Lực đẩy Ác-si-mét",
  },
  {
    id: "doc-09",
    grade: 8,
    topic: "Quy tắc đòn bẩy & Tác dụng làm quay (Moment lực)",
    title: "Tác dụng làm quay của lực (Moment lực) và Đòn bẩy KHTN 8",
    content: "Tác dụng làm quay (moment lực) càng lớn khi lực $F$ càng lớn hoặc khoảng cách từ trục quay đến giá của lực (cánh tay đòn $d$) càng lớn. Quy tắc thăng bằng đòn bẩy:\n$$F_1 \\cdot d_1 = F_2 \\cdot d_2$$\nKhi $d_1 > d_2$ thì $F_1 < F_2$ (được lợi về lực nâng vật nặng). **Lưu ý sư phạm:** Thuật ngữ chuẩn SGK KHTN 8 là **moment lực** (không viết 'mômen'). Việc tính toán định lượng $M = F \\cdot d$ hay điều kiện tổng moment $\\sum M = 0$ thuộc chương trình Vật lí lớp 10.",
    source: "SGK KHTN 8 — Tác dụng làm quay của lực",
  },
  {
    id: "doc-10",
    grade: 8,
    topic: "Hiện tượng nhiễm điện & Lực tĩnh điện",
    title: "Điện tích và Tương tác tĩnh điện",
    content: "Có hai loại điện tích: điện tích dương ($+$) và điện tích âm ($-$). Các điện tích cùng dấu thì đẩy nhau, khác dấu thì hút nhau. Vật nhiễm điện do cọ xát là do sự dịch chuyển của các hạt electron mang điện tích âm từ vật này sang vật khác.",
    source: "SGK KHTN 8 — Điện học",
  },
  {
    id: "doc-11",
    grade: 9,
    topic: "Định luật Ôm & Điện trở",
    title: "Định luật Ôm và Điện trở tương đương",
    content: "Định luật Ôm cho đoạn mạch: $$I = \\frac{U}{R}$$\n(Cường độ dòng điện $I$ tính bằng Ampe $\\text{A}$, hiệu điện thế $U$ tính bằng Vôn $\\text{V}$, điện trở $R$ tính bằng Ôm $\\Omega$).\n- Đoạn mạch nối tiếp: $R_{\\text{tđ}} = R_1 + R_2$, $I = I_1 = I_2$, $U = U_1 + U_2$.\n- Đoạn mạch song song: $\\frac{1}{R_{\\text{tđ}}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\implies R_{\\text{tđ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2}$, $U = U_1 = U_2$, $I = I_1 + I_2$.\n- Công thức điện trở dây dẫn: $R = \\rho \\cdot \\frac{l}{S}$ (với $\\rho$ là điện trở suất $\\Omega \\cdot \\text{m}$).",
    source: "SGK KHTN 9 — Điện học",
  },
  {
    id: "doc-12",
    grade: 9,
    topic: "Công suất điện & Định luật Joule - Lenz",
    title: "Công suất tiêu thụ và Điện năng",
    content: "Công suất điện: $$P = U \\cdot I = I^2 \\cdot R = \\frac{U^2}{R}\\quad (\\text{W})$$\nĐiện năng tiêu thụ: $A = P \\cdot t = U \\cdot I \\cdot t$ (đơn vị $\\text{J}$ hoặc $\\text{kW}\\cdot\\text{h}$; quy đổi $1\\text{ kW}\\cdot\\text{h} = 3{,}6 \\times 10^6\\text{ J}$). Định luật Joule - Lenz: $Q = I^2 \\cdot R \\cdot t$ (nhiệt lượng tỏa ra trên dây dẫn, đơn vị $\\text{J}$).",
    source: "SGK KHTN 9 — Điện học",
  },
  {
    id: "doc-13",
    grade: 9,
    topic: "Thấu kính hội tụ & Phân kì",
    title: "Phương trình tạo ảnh thấu kính mỏng và Độ tụ",
    content: "Phương trình thấu kính mỏng chuẩn quốc tế:\n$$\\frac{1}{f} = \\frac{1}{d_{\\text{o}}} + \\frac{1}{d_{\\text{i}}} \\iff d_{\\text{i}} = \\frac{d_{\\text{o}} \\cdot f}{d_{\\text{o}} - f}$$\n(với $f$ là tiêu cự, $d_{\\text{o}}$ là khoảng cách từ vật tới thấu kính, $d_{\\text{i}}$ là khoảng cách từ ảnh tới thấu kính). Tỉ số phóng đại chiều cao ảnh: $k = \\frac{h_{\\text{i}}}{h_{\\text{o}}} = \\frac{d_{\\text{i}}}{d_{\\text{o}}}$. Độ tụ $D = \\frac{1}{f}$ (đơn vị đi-ốp $\\text{dp}$, $f$ đo bằng mét $\\text{m}$).\n- Thấu kính hội tụ ($f > 0$): $d_{\\text{o}} > f$ cho ảnh thật ngược chiều; $d_{\\text{o}} < f$ cho ảnh ảo cùng chiều lớn hơn vật (nguyên lý kính lúp).\n- Thấu kính phân kì ($f < 0$): luôn cho ảnh ảo cùng chiều và nhỏ hơn vật.",
    source: "SGK KHTN 9 — Quang học",
  },
  {
    id: "doc-14",
    grade: 9,
    topic: "Động năng & Bảo toàn cơ năng",
    title: "Cơ năng toàn phần và Định luật bảo toàn",
    content: "Động năng của vật: $$W_{\\text{đ}} = \\frac{1}{2} m \\cdot v^2\\quad (\\text{J})$$\nThế năng trọng trường: $W_{\\text{t}} = m \\cdot g \\cdot h$ (đơn vị $\\text{J}$). Cơ năng toàn phần: $W = W_{\\text{đ}} + W_{\\text{t}}$. Khi bỏ qua ma sát và sức cản không khí, cơ năng của vật được bảo toàn: $W = \\text{const}$.",
    source: "SGK KHTN 9 — Cơ năng",
  },
  {
    id: "doc-15",
    grade: 9,
    topic: "Hiện tượng cảm ứng điện từ",
    title: "Từ thông và Hiện tượng cảm ứng điện từ",
    content: "Từ thông qua tiết diện cuộn dây: $\\Phi = B \\cdot S \\cdot \\cos(\\alpha)$ (đơn vị Weber, $\\text{Wb}$). Khi số đường sức từ xuyên qua tiết diện cuộn dây dẫn kín biến thiên thì trong cuộn dây xuất hiện dòng điện cảm ứng. Suất điện động cảm ứng: $e_{\\text{c}} = -\\frac{\\Delta\\Phi}{\\Delta t}$.",
    source: "SGK KHTN 9 — Điện từ học",
  },
];

function findRelevantDocs(query: string, grade?: number): KnowledgeDoc[] {
  const q = query.toLowerCase().trim();
  const scored = KHTN_DOCS.map((doc) => {
    let score = 0;
    const topicLow = doc.topic.toLowerCase();
    const titleLow = doc.title.toLowerCase();
    const contentLow = doc.content.toLowerCase();

    // Exact phrase match bonus
    if (topicLow.includes(q)) score += 20;
    if (titleLow.includes(q)) score += 15;
    if (contentLow.includes(q)) score += 8;

    // Specific key term matching
    if (q.includes("phản lực") && (topicLow.includes("phản lực") || contentLow.includes("phản lực"))) score += 40;
    if (q.includes("đòn bẩy") && topicLow.includes("đòn bẩy")) score += 35;
    if (q.includes("thấu kính") && topicLow.includes("thấu kính")) score += 35;
    if (q.includes("ô-m") || q.includes("ohm") || q.includes("ôm")) {
      if (topicLow.includes("ôm")) score += 35;
    }
    if (q.includes("ác-si-mét") || q.includes("archimedes") || q.includes("acsimet")) {
      if (topicLow.includes("ác-si-mét")) score += 35;
    }
    if (q.includes("đàn hồi") || q.includes("hooke") || q.includes("lò xo")) {
      if (topicLow.includes("đàn hồi")) score += 35;
    }

    if (grade && doc.grade === grade) score += 2;
    const words = q.split(/\s+/);
    for (const w of words) {
      if (w.length < 2) continue;
      if (topicLow.includes(w)) score += 4;
      if (titleLow.includes(w)) score += 3;
      if (contentLow.includes(w)) score += 1;
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

QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG CÔNG THỨC VÀ NỘI DUNG:
1. ĐỊNH DẠNG CÔNG THỨC TOÁN HỌC & VẬT LÝ CHUẨN QUỐC TẾ (KaTeX / LaTeX):
   - Mọi công thức, ký hiệu toán học hoặc đại lượng vật lý BẮT BUỘC phải đặt trong cặp dấu $...$ cho công thức nội dòng (ví dụ: $F = m \\cdot a$, $\\rho = \\frac{m}{V}$, $v = \\frac{s}{t}$, $N = P = m \\cdot g$).
   - Các công thức trọng tâm, phương trình chính đặt trong cặp dấu $$...$$ riêng một dòng để hiển thị nổi bật và căn giữa (ví dụ: $$F_{\\text{A}} = \\rho \\cdot g \\cdot V$$, $$I = \\frac{U}{R}$$, $$F_1 \\cdot d_1 = F_2 \\cdot d_2$$).
   - Dùng phép nhân là dấu chấm $\\cdot$ (\\cdot), không dùng dấu x hay *. Dùng phân số $\\frac{tử}{mẫu}$.
   - Ký hiệu vectơ: $\\vec{F}$.

2. CẤU TRÚC BÀI GIẢNG RÕ RÀNG, SƯ PHẠM THCS:
   - **1. Khái niệm cốt lõi & Bản chất hiện tượng**: Giải thích ngắn gọn, súc tích, dễ hiểu nhất cho học sinh THCS.
   - **2. Công thức toán học chuẩn quốc tế (ISO 80000 / SI)**: Trình bày công thức nổi bật.
   - **3. Chú thích các đại lượng & Đơn vị đo chuẩn SI**: Liệt kê rõ từng ký hiệu và đơn vị đo (N, kg, m, s, Pa, J, W, \\Omega, V, A...).
   - **4. Ví dụ thực tế & Hiện tượng đời sống**: Nêu 2-3 ví dụ gần gũi trong đời sống hoặc trong thí nghiệm trường THCS Tây Tiến.

3. NGUYÊN TẮC GIÁO TRÌNH GDPT 2018:
   - Với Lớp 8: Dùng chuẩn thuật ngữ quốc tế "moment lực" (không dùng "mômen"). Quy tắc thăng bằng đòn bẩy là $F_1 \\cdot d_1 = F_2 \\cdot d_2$. Không đưa công thức tính moment $M = F \\cdot d$ hay điều kiện cân bằng tổng moment $\\sum M = 0$ vì đó là chương trình Vật lí 10.
   - Thân thiện, khích lệ tinh thần tự học khám phá của học sinh.

TƯ LIỆU THAM CHIẾU SGK KHTN THCS:
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
