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

    // 환경변수에서 API 키와 Project ID 가져오기
    const apiKey = process.env.OPENAI_API_KEY;
    const projectId = process.env.OPENAI_PROJECT_ID;  // 👈 반드시 필요

    // 요청 보내기
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Project": projectId  // 👈 프로젝트 키를 사용할 때는 꼭 필요!
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const data = await response.json();

    // 로그 출력 (디버깅용)
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
