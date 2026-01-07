
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

const Assistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    { text: "Hi! I'm your EarnPulse assistant. How can I help you earn more today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setIsTyping(true);

    const response = await chatWithAssistant(userMsg);
    setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-green-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-robot"></i>
              <span className="font-bold">Earning Coach</span>
            </div>
            <button onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-gray-400 italic">Coach is thinking...</div>}
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button onClick={handleSend} className="bg-green-600 text-white w-10 h-10 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
      )}
    </div>
  );
};

export default Assistant;
