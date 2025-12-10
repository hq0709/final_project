'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Bot, User, Sparkles, Zap, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

export default function ChatAgent() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // Initial "Hello" message
    const [messages, setMessages] = useState<{ role: string, text: string }[]>([
        { role: 'bot', text: 'Greeting, Traveler! 🎮\nI am the **GameHub Master**.\n\nI can help you find games, explain features, or guide you comfortably.\n\n*What can I do for you today?*' }
    ]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Quick Actions
    const quickActions = [
        "Recommend a Game",
        "How to Register?",
        "What is this page?",
        "Show my Profile"
    ];

    const sendMessage = async (textOverride?: string) => {
        const userMsg = textOverride || input;
        if (!userMsg.trim()) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // CAPTURE CONTEXT: Current URL and Title
            // Try to find an H1 if possible for more context
            const mainTitle = document.querySelector('h1')?.innerText || '';
            const pageContext = `Current Route: ${window.location.pathname}\nPage Title: ${document.title}\nMain Heading: ${mainTitle}`;

            const res = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    context: pageContext
                }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "**Connection Error** 🔌\n\nI cannot reach the GameHub Brain (chat_server.py).\nPlease check if the python server is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Custom Renderer for Markdown Links -> Buttons
    const components = {
        a: ({ href, children }: any) => {
            const isInternal = href?.startsWith('/');
            if (isInternal) {
                // Helper to extract text from ReactNode children
                const extractText = (node: any): string => {
                    if (typeof node === 'string') return node;
                    if (Array.isArray(node)) return node.map(extractText).join('');
                    if (node?.props?.children) return extractText(node.props.children);
                    return String(node || '');
                };
                const textContent = extractText(children);

                return (
                    <button
                        onClick={() => {
                            router.push(href);
                            setIsOpen(false); // Close chat on nav
                        }}
                        className="mt-2 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md active:scale-95"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        {textContent.replace(/^BUTTON:\s*/, '')}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">{children}</a>;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[600px] bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 ring-1 ring-white/10">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40 rounded-full"></div>
                                <div className="relative p-2 bg-slate-800 border border-slate-700 rounded-xl">
                                    <Bot className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white tracking-wide">GameHub AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Online</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'bot' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {msg.role === 'bot' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[85%] space-y-1`}>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                                        }`}>
                                        {msg.role === 'bot' ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={components as any}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                                    <div className="flex gap-1.5">
                                        {[0, 150, 300].map(delay => (
                                            <div key={delay} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (Chips) */}
                    {!isLoading && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none mask-fade-right">
                            {quickActions.map(action => (
                                <button
                                    key={action}
                                    onClick={() => sendMessage(action)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full text-xs text-slate-300 transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600 shadow-inner"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-purple-500/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto h-16 w-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group relative z-50 ${isOpen ? 'bg-slate-800 rotate-90 border border-slate-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:scale-110 hover:shadow-purple-500/40'
                    }`}
            >
                {isOpen ? (
                    <X className="w-8 h-8 text-slate-300" />
                ) : (
                    <>
                        <MessageSquare className="w-8 h-8 text-white absolute transition-transform group-hover:scale-0 duration-300" />
                        <Sparkles className="w-8 h-8 text-white absolute scale-0 group-hover:scale-100 transition-transform duration-300" />
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900"></span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
}
