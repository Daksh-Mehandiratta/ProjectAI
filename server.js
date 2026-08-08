import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

// ✅ Test route (ye rehne de)
app.get("/", (req, res) => {
  res.send("Backend chal raha hai ✅");
});

// ✅ SIRF YE CHANGE KARNA HAI
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }
    );

    console.log("FULL RESPONSE:", response.data);

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ reply: reply || "No response from AI 😢" });

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    res.json({ reply: "Error aaya 😢" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal gaya 🚀");
});