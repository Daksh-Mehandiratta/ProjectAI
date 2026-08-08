import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend chal raha hai ✅");
});

// Chat route (Gemini AI)
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({ reply: "GEMINI WORKING ✅ " + reply });

  } catch (err) {
    console.log("ERROR:", err.message);
    res.json({ reply: "Error aaya 😢" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chal gaya 🚀");
});