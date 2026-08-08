import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend chal raha hai ✅");
});

app.post("/chat", (req, res) => {
  const { message } = req.body;
  res.json({ reply: "Tu bola: " + message });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server chal gaya 🚀");
});