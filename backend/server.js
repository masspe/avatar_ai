import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  const chat = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  const reply = chat.choices[0].message.content;

  const speech = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: reply,
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());
  const audioBase64 = audioBuffer.toString("base64");

  res.json({ reply, audio: audioBase64 });
});

app.listen(3001, () => console.log("Server avviato su http://localhost:3001"));