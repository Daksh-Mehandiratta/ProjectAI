import axios from "axios";

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }],
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (err) {
    console.log(err.message);
    res.json({ reply: "Error aaya 😢" });
  }
});