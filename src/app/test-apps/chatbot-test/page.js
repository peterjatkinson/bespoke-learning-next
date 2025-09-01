'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Send, BookOpen, LoaderCircle } from 'lucide-react';

// Chat bubble component
const ChatMessage = ({ message, innerRef }) => {
  const { content, annotations, role } = message;

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div
          ref={innerRef}
          tabIndex={-1}
          className="relative max-w-lg px-5 py-3 rounded-t-2xl rounded-bl-2xl shadow-lg border-2 border-black bg-[#0056B3] text-white"
        >
          <p className="text-sm font-bold" style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
        </div>
      </div>
    );
  }

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
        <span
          aria-label={`Source ${number}: ${filename || 'Unknown file'}`}
          className="bg-gray-200 text-blue-600 font-semibold px-1.5 py-0.5 rounded-md text-xs cursor-default ml-1"
        >
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
      <div
        ref={innerRef}
        tabIndex={-1}
        className="relative max-w-lg px-5 py-3 rounded-t-2xl rounded-br-2xl shadow-lg border-2 border-black bg-white text-gray-800"
      >
        <div className="prose prose-sm max-w-none prose-p:text-gray-700 prose-strong:text-gray-900">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{ cite: Cite }}>
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

  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const textareaRef = useRef(null);

  // Live regions + timers
  const liveAssertiveRef = useRef(null);
  const livePoliteRef = useRef(null);
  const announcerTimerRef = useRef(null);
  const toggleRef = useRef(false);

  // Pre-announce timing guard
  const lastPreAnnounceTsRef = useRef(0);

  // Force-interrupting alert (new node each time)
  const announceAlertNow = (text) => {
    try {
      const el = document.createElement('div');
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-atomic', 'true');
      el.className = 'sr-only';
      el.textContent = text;
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, 1500);
    } catch {}
  };

  // Debounced wrapper so we don't double-fire on key+pointer combos
  const announceSendNow = () => {
    const now = Date.now();
    if (now - lastPreAnnounceTsRef.current < 400) return;
    lastPreAnnounceTsRef.current = now;
    announceAlertNow('Sending your message. Awaiting response.');
  };

  const announce = (msg, mode = 'polite') => {
    const ref = mode === 'assertive' ? liveAssertiveRef : livePoliteRef;
    if (!ref.current) return;
    toggleRef.current = !toggleRef.current;
    ref.current.textContent = '';
    setTimeout(() => {
      const suffix = toggleRef.current ? '\u00A0' : '\u00A0\u00A0';
      ref.current.textContent = `${msg}${suffix}`;
    }, 10);
  };

  // Only periodic updates here (initial "Sending..." comes from announceSendNow)
  const startAnnouncer = () => {
    clearInterval(announcerTimerRef.current);
    announcerTimerRef.current = setInterval(() => {
      announce('Still working on your answer…', 'polite');
    }, 6000);
  };

  const stopAnnouncer = (finalMsg = 'Response received.') => {
    clearInterval(announcerTimerRef.current);
    announcerTimerRef.current = null;
    announce(finalMsg, 'assertive');
  };

  // Scroll only the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus newest assistant message only (silent focus to avoid double read)
  useEffect(() => {
    const last = messages[messages.length - 1];
    const el = lastMessageRef.current;
    if (!isLoading && last && last.role === 'assistant' && el) {
      el.setAttribute('aria-hidden', 'true');
      el.focus();
      setTimeout(() => el.removeAttribute('aria-hidden'), 120);
    }
  }, [messages, isLoading]);

  // Cleanup timers
  useEffect(() => () => clearInterval(announcerTimerRef.current), []);

  // Auto-expanding textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const MAX_PX = 144; // 9rem
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, MAX_PX);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_PX ? 'auto' : 'hidden';
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If submission comes from textarea Enter or very fast click, ensure we pre-announce
    const now = Date.now();
    if (now - lastPreAnnounceTsRef.current > 500) {
      announceAlertNow('Sending your message. Awaiting response.');
      lastPreAnnounceTsRef.current = now;
    }

    setIsLoading(true);
    startAnnouncer();

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch("/test-apps/chatbot-test/api", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const data = await response.json();
      setConversationId(data.conversationId);

      // Append assistant message
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, annotations: data.annotations }
      ]);

      // Final announcements
      stopAnnouncer('Response received.');
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
      stopAnnouncer(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-slate-100 font-sans antialiased p-0 sm:p-4 sm:flex sm:items-center sm:justify-center">
      <div
        className="mx-0 sm:mx-auto flex flex-col h-auto max-h-[700px] w-full sm:max-w-4xl bg-white border-4 border-black rounded-none sm:rounded-2xl sm:shadow-lg overflow-hidden"
        role="application"
        aria-label="IMC Module Assistant"
      >
        <header className="p-4 sm:p-5 text-center shrink-0 border-b-4 border-black bg-white">
          <div className="flex justify-center items-center gap-3">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-[#ED1C24]" aria-hidden="true" focusable="false" />
            <h1 id="chat-title" className="text-2xl sm:text-4xl font-bold text-gray-800 tracking-tighter">
              IMC Module Assistant
            </h1>
          </div>
          <p className="mt-2 text-sm sm:text-md text-gray-600">
            Ask me anything about the Integrated Marketing Communications module!
          </p>
        </header>

        {/* Live regions */}
        <div ref={liveAssertiveRef} className="sr-only" role="alert" aria-atomic="true" />
        <div ref={livePoliteRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

        {/* Chat log (not a live region to avoid announcing user messages) */}
        <main
          id="chat-log"
          ref={chatContainerRef}
          role="log"
          aria-live="off"
          aria-relevant="additions text"
          aria-busy={isLoading ? 'true' : 'false'}
          aria-labelledby="chat-title"
          className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          <div className="w-full">
            {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const attachRef = isLast && msg.role === 'assistant' ? lastMessageRef : null;
              return (
                <ChatMessage
                  key={index}
                  message={msg}
                  innerRef={attachRef}
                />
              );
            })}

            {isLoading && (
              <div className="flex justify-start mb-4" role="status" aria-label="Assistant is composing a reply">
                <div className="max-w-lg px-4 py-3 rounded-2xl shadow bg-white border-2 border-black">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  </div>
                  <p className="sr-only">Assistant is typing…</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="p-3 sm:p-4 shrink-0 bg-white/80 backdrop-blur-lg border-t-4 border-black">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              id="message-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the module..."
              aria-label="Type your message"
              aria-description="Press Enter to send. Press Shift plus Enter for a new line."
              aria-controls="chat-log"
              className="w-full p-3 pr-14 sm:pr-16 border-2 border-black rounded-lg text-gray-800 placeholder-gray-500 leading-6 focus:outline-none focus:ring-4 focus:ring-[#ED1C24] transition-all resize-none overflow-y-hidden max-h-36 min-h-[72px] sm:min-h-[50px]"
              rows={1}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              // Pre-announce in capture phase to interrupt SR label speech
              onPointerDownCapture={announceSendNow}
              onKeyDownCapture={(e) => {
                if (e.key === 'Enter' || e.key === ' ') announceSendNow();
              }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 -mt-1 inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full font-bold text-white bg-[#ED1C24] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-200 active:scale-95
                         focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ED1C25] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              disabled={isLoading}
              aria-label="Send message"
              aria-controls="chat-log"
              aria-busy={isLoading ? 'true' : 'false'}
            >
              {isLoading ? (
                <LoaderCircle className="w-5 h-5 animate-spin" aria-hidden="true" focusable="false" />
              ) : (
                <Send className="w-5 h-5" aria-hidden="true" focusable="false" />
              )}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
