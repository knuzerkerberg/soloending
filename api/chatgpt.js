export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(buffers).toString());
    const prompt = body.prompt;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const data = await response.json();

    // 🔍 로그 추가
    console.log("🔎 OpenAI 응답:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        error: "ChatGPT 응답 형식 오류",
        detail: data.error?.message || "응답 형식이 예상과 다릅니다"
      });
    }

    const content = data.choices[0].message.content;
    res.status(200).json({ result: content });

  } catch (err) {
    console.error("❗ 서버 내부 오류:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
