import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2, Trash2, Copy, Check, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import Modal from './Modal';

const AIDoubtSolver: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('aspirant_chat');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('AIDoubtSolver: Error parsing chat history', e);
      localStorage.removeItem('aspirant_chat');
    }
    return [
      { role: 'model', content: "Hello! I'm your AI Study Assistant. Ask me any doubt from JEE, NEET, UPSC, NDA, or Board exams (CBSE, ICSE, State Boards). I can help with concepts, problems, or study tips!", timestamp: Date.now() }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('aspirant_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (customInput?: string) => {
    const messageContent = customInput || input;
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: messageContent, timestamp: Date.now() };
    
    if (!customInput) {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat(userMessage).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are an expert tutor for competitive exams like JEE, NEET, UPSC, and NDA, as well as board exams like CBSE, ICSE, and State Boards. Provide clear, step-by-step explanations. Use Markdown for formatting math and code. Be encouraging and concise."
        }
      });

      const response = await model;
      const aiMessage: ChatMessage = { 
        role: 'model', 
        content: response.text || "I'm sorry, I couldn't process that.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AIDoubtSolver: Error in handleSend', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Error: Could not connect to AI. Details: ${errorMessage}. Please check your API key.`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearChat = () => {
    setMessages([{ role: 'model', content: "Chat cleared. How can I help you now?", timestamp: Date.now() }]);
    setShowClearConfirm(false);
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500 relative">
      {/* Clear Chat Confirmation Overlay */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Clear Chat?</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              Are you sure you want to clear the chat history? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log("AIDoubtSolver Clear All confirmed");
                  clearChat();
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-600" size={20} />
          <h2 className="font-semibold text-gray-800">AI Doubt Solver</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRetry}
            disabled={isLoading || !messages.some(m => m.role === 'user')}
            className="p-2 text-gray-400 hover:text-brand-600 transition-colors disabled:opacity-30"
            title="Retry last message"
          >
            <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group/msg ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-white">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => copyMessage(msg.content, idx)}
                    className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-brand-600 opacity-0 group-hover/msg:opacity-100 transition-all"
                    title="Copy response"
                  >
                    {copiedIdx === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-gray-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your doubt here... (e.g. Explain Newton's 3rd law with examples)"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none h-20"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI can make mistakes. Verify important facts.
        </p>
      </div>
    </div>
  );
};

export default AIDoubtSolver;
