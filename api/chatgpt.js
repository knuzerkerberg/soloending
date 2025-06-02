// api/chatgpt.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
    }

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

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("OpenAI 응답 형식 오류:", data);
      return res.status(500).json({ error: "ChatGPT 응답 형식 오류" });
    }

    const content = data.choices[0].message.content;

    return res.status(200).json({ result: content });
  } catch (error) {
    console.error("ChatGPT API 호출 오류:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
