import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messaggi non validi" });
  }

  try {
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = chat.choices[0]?.message?.content ?? "";

    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: reply,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    res.json({ reply, audio: audioBase64 });
  } catch (error) {
    console.error("Errore chat:", error);
    res.status(500).json({ error: "Impossibile completare la richiesta" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
