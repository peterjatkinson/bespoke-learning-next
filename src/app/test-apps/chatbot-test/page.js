'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { MessageSquare, Send, BookOpen, LoaderCircle } from 'lucide-react';

// A component to render chat messages with the new pop-art styling.
const ChatMessage = ({ message }) => {
  const { content, annotations, role } = message;

  // User message styling
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="relative max-w-lg px-5 py-3 rounded-t-2xl rounded-bl-2xl shadow-lg border-2 border-black bg-[#00AEEF] text-white">
          <p className="text-sm font-bold" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
        </div>
      </div>
    );
  }

  // Assistant message styling
  let processedContent = content;
  if (annotations && annotations.length > 0) {
    const uniqueAnnotations = annotations.filter((annotation, index, self) =>
      index === self.findIndex((a) => a.index === annotation.index && a.filename === annotation.filename)
    );
    let matchIndex = 0;
    processedContent = content.replace(/【\d+†source】/g, (match) => {
      const annotation = uniqueAnnotations[matchIndex];
      matchIndex++;
      if (annotation) {
        return `<cite data-filename="${annotation.filename}" data-match="${match}"></cite>`;
      }
      return match;
    });
  }

  const Cite = ({ node }) => {
    const filename = node.properties.dataFilename;
    const match = node.properties.dataMatch;
    const number = match.match(/\d+/)[0];

    return (
      <span className="group relative inline-block">
        <span className="bg-gray-200 text-blue-600 font-semibold px-1.5 py-0.5 rounded-md text-xs cursor-pointer ml-1">
          {number}
        </span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-max max-w-xs mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-700">
          Source: <strong>{filename || 'Unknown File'}</strong>
        </span>
      </span>
    );
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="relative max-w-lg px-5 py-3 rounded-t-2xl rounded-br-2xl shadow-lg border-2 border-black bg-white text-gray-800">
        <div className="prose prose-sm max-w-none prose-p:text-gray-700 prose-strong:text-gray-900">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{ cite: Cite }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null); // Ref for the scrollable chat area
  const textareaRef = useRef(null);

  // **FIX:** Changed scrolling logic to only affect the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Effect to handle the auto-expanding textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch("/test-apps/chatbot-test/api", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversationId: conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message, annotations: data.annotations }]);

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-100 font-sans antialiased flex items-center justify-center p-4">
      <div className="flex flex-col h-[600px] w-full max-w-4xl bg-white border-4 border-black rounded-2xl shadow-lg overflow-hidden">
        <header className="p-4 text-center shrink-0 border-b-4 border-black bg-white">
          <div className="flex justify-center items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#ED1C24]" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tighter">
                IMC Module Assistant
              </h1>
          </div>
          <p className="mt-2 text-md text-gray-600">
              Ask me anything about the Integrated Marketing Communications module!
          </p>
        </header>

        {/* **FIX:** Added ref to the main chat area */}
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl mx-auto w-full">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-lg px-4 py-3 rounded-2xl shadow bg-white border-2 border-black">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            {/* The messagesEndRef is no longer needed for scrolling */}
          </div>
        </main>

        <footer className="p-4 shrink-0 bg-white/80 backdrop-blur-lg border-t-4 border-black">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-start space-x-3">
              <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the module..."
                    className="w-full p-3 pr-4 border-2 border-black rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#D90081]/50 transition-all resize-none overflow-y-auto max-h-36 min-h-[50px]"
                    rows="1"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                      }
                    }}
                  />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center p-3 rounded-full font-bold text-white bg-[#ED1C24] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:bg-red-600 active:bg-red-700 hover:scale-105 active:scale-95"
                disabled={isLoading}
              >
                  {isLoading ? (
                      <LoaderCircle className="w-6 h-6 animate-spin" />
                  ) : (
                      <Send className="w-6 h-6" />
                  )}
              </button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
