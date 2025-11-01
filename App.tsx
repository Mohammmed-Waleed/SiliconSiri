
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { createChatSession, sendMessageToGemini } from './services/geminiService';
import { BotIcon, UserIcon, SendIcon } from './components/icons';
import type { Chat } from '@google/genai';

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isBot = message.sender === 'bot';
    return (
        <div className={`flex items-start gap-4 my-4 ${isBot ? '' : 'justify-end'}`}>
            {isBot && (
                <div className="flex-shrink-0 bg-gray-800 rounded-full p-1">
                    <BotIcon />
                </div>
            )}
            <div className={`max-w-md md:max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isBot ? 'bg-gray-700 text-white rounded-tl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
            {!isBot && (
                 <div className="flex-shrink-0 bg-gray-800 rounded-full p-1">
                    <UserIcon />
                </div>
            )}
        </div>
    );
};


const TypingIndicator = () => (
    <div className="flex items-start gap-4 my-4">
        <div className="flex-shrink-0 bg-gray-800 rounded-full p-1">
            <BotIcon />
        </div>
        <div className="max-w-md px-5 py-3 rounded-2xl shadow-md bg-gray-700 text-white rounded-tl-none">
            <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
        </div>
    </div>
);


function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const initializeChat = useCallback(() => {
        chatRef.current = createChatSession();
        setMessages([
            {
                id: 'init',
                text: 'Namaskara! I am SiliconSiri. How can I help you learn about Karnataka\'s amazing IT sector today?',
                sender: 'bot'
            }
        ]);
    }, []);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading || !chatRef.current) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: trimmedInput,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        const botResponseText = await sendMessageToGemini(chatRef.current, trimmedInput);

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            sender: 'bot',
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 shadow-lg text-center">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">SiliconSiri</h1>
                <p className="text-sm text-gray-400">Your AI guide to Karnataka's IT Prowess</p>
            </header>
            
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && <TypingIndicator />}
                </div>
            </main>

            <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about Karnataka's IT exports..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default App;
