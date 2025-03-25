import { useRef, useEffect } from "react";

interface ChatFormProps {
  chatHistory: Array<{ role: string; text: string; hideInChat?: boolean; isError?: boolean }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ role: string; text: string; hideInChat?: boolean; isError?: boolean }>>>;
  generateBotResponse: (history: Array<{ role: string; text: string; hideInChat?: boolean; isError?: boolean }>) => void;
}

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }: ChatFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure the input field has proper styling
    if (inputRef.current) {
      inputRef.current.style.borderRadius = "24px";
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    
    inputRef.current.value = "";

    // Update chat history with the user's message
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    // Generate the bot's response immediately
    generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);
  };

  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <input 
        ref={inputRef} 
        placeholder="Ask something about ChemPad..." 
        className="message-input" 
        required 
      />
      <button type="submit" className="send-btn">
        <span className="material-symbols-rounded">send</span>
      </button>
    </form>
  );
};

export default ChatForm;
