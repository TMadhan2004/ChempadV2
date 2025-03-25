import { useState, useEffect, useRef } from "react";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import companyInfo from "./about";
import "./chatbot.css";

interface ChatMessage {
  role: string;
  text: string;
  hideInChat?: boolean;
  isError?: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "bot", text: companyInfo.defaultGreeting }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const generateBotResponse = async (history: ChatMessage[]) => {
    setIsThinking(true);
    
    try {
      const formattedHistory = history.filter(msg => !msg.hideInChat).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.text
      }));

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: companyInfo.chatbotInstructions + "\n\n" + companyInfo.companyInfo
              }
            ]
          },
          ...formattedHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      };

      console.log('Fetching response from API:', import.meta.env.VITE_API_URL);
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      console.log('API Response:', response);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Bot Response:', data);
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
        throw new Error("Invalid response format from API");
      }
      
      const botResponse = data.candidates[0].content.parts[0].text.trim();
      
      // Remove the last message if it was a "Thinking..." message
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory];
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].text === "Thinking...") {
          newHistory.pop();
        }
        return [...newHistory, { role: "bot", text: botResponse }];
      });
      
      setIsThinking(false);
    } catch (error) {
      console.error('Error:', error);
      
      // Remove the last message if it was a "Thinking..." message
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory];
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].text === "Thinking...") {
          newHistory.pop();
        }
        return [...newHistory, { role: "bot", text: "I'm sorry, I encountered an error. Please try again.", isError: true }];
      });
      
      setIsThinking(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button
        id="chatbot-toggler"
        onClick={toggleChatbot}
        aria-label="Toggle chatbot"
        title="Chat with ChemPad Assistant"
      >
        <span className="material-symbols-rounded">
          {isOpen ? "close" : "chat"}
        </span>
      </button>

      <div className={`chatbot-container ${isOpen ? "open" : "closed"}`}>
        <div className="chatbot-header">
          <h3 className="chatbot-title">ChemPad Assistant</h3>
          <button
            className="chatbot-toggle"
            onClick={toggleChatbot}
            aria-label="Close chatbot"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="chat-messages" ref={chatContainerRef}>
          {chatHistory.map((message, index) => (
            <ChatMessage key={index} chat={message} />
          ))}
          
          {isThinking && (
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
        </div>

        <ChatForm
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          generateBotResponse={generateBotResponse}
        />
      </div>
    </div>
  );
};

export default Chatbot;
