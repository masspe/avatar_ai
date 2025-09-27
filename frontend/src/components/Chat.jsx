import { useState } from "react";

export function Chat({ messages, setMessages }) {
  const [input, setInput] = useState("");

  async function sendMessage() {
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();

    setMessages([...newMessages, { role: "assistant", content: data.reply }]);

    const audio = new Audio("data:audio/mp3;base64," + data.audio);
    audio.play();
  }

  return (
    <div>
      <div className="h-96 overflow-y-auto border mb-2 p-2 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        className="border p-2 w-full"
        placeholder="Scrivi qui..."
      />
      <button onClick={sendMessage} className="mt-2 w-full bg-blue-500 text-white p-2">
        Invia
      </button>
    </div>
  );
}