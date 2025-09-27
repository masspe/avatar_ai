import { useState } from "react";
import { Chat } from "./components/Chat";
import { Avatar } from "./components/Avatar";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Sei un assistente virtuale che spiega convenzioni." }
  ]);

  return (
    <div className="flex h-screen">
      <div className="w-2/3 bg-black">
        <Avatar />
      </div>
      <div className="w-1/3 p-4 bg-gray-100">
        <Chat messages={messages} setMessages={setMessages} />
      </div>
    </div>
  );
}