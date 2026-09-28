'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  SendHorizontal,
  Sparkles,
  Bot,
  RotateCcw,
  Minus,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hasLead?: boolean;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  '💎 Bảng giá các gói thiệp',
  '💌 Xem các mẫu thiệp cưới hot',
  '⚡ Hộp mừng cưới VietQR hoạt động ra sao?',
  '📞 Tôi muốn làm mẫu thiệp riêng',
];

export function AiConsultantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo sessionId từ localStorage hoặc tạo mới
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let stored = localStorage.getItem('website_thiep_ai_session');
      if (!stored) {
        stored = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('website_thiep_ai_session', stored);
      }
      setSessionId(stored);

      // Tin nhắn chào mừng ban đầu
      const initialGreeting: ChatMessage = {
        id: 'greet-1',
        role: 'assistant',
        content:
          'Xin chào bạn! 🌸 Tôi là **Trợ lý AI của WebsiteThiep**.\n\nTôi sẵn sàng tư vấn **bảng giá các gói (FREE, BASIC, VIP)**, hướng dẫn chọn **mẫu thiệp cưới**, hay giải đáp về tính năng **nhận tiền mừng cưới VietQR** & **RSVP**.\n\nBạn cần hỗ trợ điều gì hôm nay?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: DEFAULT_SUGGESTIONS,
      };
      setMessages([initialGreeting]);
    }
  }, []);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen && messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await ApiClient.request<{
        sessionId: string;
        answer: string;
        hasLead: boolean;
        suggestions?: string[];
      }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          sessionId,
        }),
      });

      if (res.success && res.data) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: res.data.answer,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          hasLead: res.data.hasLead,
          suggestions: res.data.suggestions || DEFAULT_SUGGESTIONS,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(res.message || 'Lỗi kết nối AI');
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'Dạ hiện tại đường truyền đang bận một chút. Bạn có thể để lại Số điện thoại/Zalo để chuyên viên liên hệ trực tiếp hỗ trợ nhé! 💌',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['📞 Tôi muốn tư vấn qua Zalo', '💎 Bảng giá các gói thiệp'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const newSession = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('website_thiep_ai_session', newSession);
    setSessionId(newSession);
    setMessages([
      {
        id: 'greet-reset',
        role: 'assistant',
        content: 'Cuộc trò chuyện mới đã bắt đầu! Bạn muốn tìm hiểu thông tin gì về thiệp điện tử ạ? 💌',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: DEFAULT_SUGGESTIONS,
      },
    ]);
  };

  // Helper format Markdown đơn giản (bold, links, bullet points, line breaks)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      const parts = formatted.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-[#8a331c]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('- ') || part.startsWith('• ')) {
              return (
                <span key={pIdx} className="inline-flex items-start gap-1.5">
                  <span className="text-[#c59533] font-bold">•</span>
                  <span>{part.slice(2)}</span>
                </span>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* 1. NÚT KÍCH HOẠT FLOATING CHAT BUBBLE (Góc phải dưới) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex items-center gap-2 mb-2 pointer-events-auto"
            >
              {hasNewBadge && (
                <div className="relative bg-[#fffdf9]/95 text-[#3b302a] text-xs py-1.5 px-3.5 rounded-full border border-[#d9af62]/40 shadow-xl backdrop-blur-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-medium text-[#7d4e13]">AI Tư Vấn Thiệp Cưới 24/7</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHasNewBadge(false);
                    }}
                    className="text-[#96877d] hover:text-[#3b302a]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasNewBadge(false);
          }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isOpen
              ? 'bg-[#ece3d4] text-[#3b302a] border border-[#d4c5b2]'
              : 'bg-gradient-to-tr from-[#9c3a21] via-[#ba4f33] to-[#c59533] text-white shadow-[#9c3a21]/30'
          }`}
          aria-label="Mở khung chat AI tư vấn"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#fffdf9] rounded-full" />
              <Sparkles className="absolute -top-1 -left-1 w-4 h-4 text-amber-200 animate-pulse" />
            </>
          )}
        </motion.button>
      </div>

      {/* 2. CỬA SỔ CHAT AI RAG (GIAO DIỆN TONE BE KEM CAO CẤP) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh] bg-[#fdfbf7]/98 backdrop-blur-2xl border border-[#e5dcce] rounded-3xl shadow-2xl shadow-stone-800/15 flex flex-col overflow-hidden text-[#2e2520]"
          >
            {/* Header Tone Be Kem Sang Trọng */}
            <div className="relative px-5 py-4 border-b border-[#e5dcce] bg-gradient-to-r from-[#f7efe1] via-[#faf4ea] to-[#f4ebe0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c59533] to-[#9c3a21] p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-[#fffdf9] rounded-[14px] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#9c6f1d]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#fffdf9] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm tracking-wide text-[#2e2520]">Trợ Lý AI WebsiteThiep</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#c59533]/15 text-[#85581a] font-medium border border-[#c59533]/30">
                      RAG Smart
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7d6e64] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Sẵn sàng tư vấn báo giá & chọn mẫu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Làm mới cuộc trò chuyện"
                  className="p-1.5 rounded-lg text-[#7d6e64] hover:text-[#2e2520] hover:bg-[#eadecc]/60 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Thu nhỏ"
                  className="p-1.5 rounded-lg text-[#7d6e64] hover:text-[#2e2520] hover:bg-[#eadecc]/60 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Message Feed) - Nền Be Nhẹ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-[13px] bg-[#f8f4ee]/70 scrollbar-thin scrollbar-thumb-[#d9ccba]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#ba4f33] to-[#9c3a21] text-white rounded-tr-xs shadow-[#ba4f33]/20'
                        : 'bg-white border border-[#e5dcce] text-[#2e2520] rounded-tl-xs'
                    }`}
                  >
                    {renderFormattedContent(msg.content)}
                  </div>

                  {/* Thông báo nếu đã bắt được lead */}
                  {msg.hasLead && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã lưu thông tin liên hệ! Đội ngũ tư vấn sẽ gọi cho bạn ngay.</span>
                    </motion.div>
                  )}

                  {/* Gợi ý câu hỏi nhanh từ bot */}
                  {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          disabled={isLoading}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-[#f2ece2] border border-[#dfd4c5] text-[#5c4f46] hover:text-[#2e2520] hover:border-[#c59533] transition-all text-left shadow-2xs"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-[#9c8e84] mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-[#7d6e64] text-xs px-2 py-1">
                  <div className="w-6 h-6 rounded-lg bg-[#c59533]/15 flex items-center justify-center border border-[#c59533]/25">
                    <Sparkles className="w-3 h-3 text-[#9c6f1d] animate-spin" />
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-[#e5dcce] px-3 py-2 rounded-2xl rounded-tl-xs shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59533] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59533] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c59533] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-[#7d6e64] ml-1.5">AI đang tra cứu tài liệu...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input Bar - Be Kem Ấm Áp */}
            <div className="p-3 border-t border-[#e5dcce] bg-[#fbf7f0]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Hỏi bảng giá, mẫu thiệp, tính năng..."
                  disabled={isLoading}
                  className="flex-1 bg-white border border-[#dfd4c5] focus:border-[#c59533] focus:ring-1 focus:ring-[#c59533]/20 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#2e2520] placeholder-[#9c8e84] outline-none transition-all pr-10 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-[#ba4f33] to-[#9c3a21] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-opacity shadow-sm"
                  aria-label="Gửi tin nhắn"
                >
                  <SendHorizontal className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[10px] text-[#8a7c72] px-1">
                <span>⚡ Trả lời tự động bởi Gemini & RAG</span>
                <a
                  href="/dashboard/billing"
                  className="text-[#9c3a21] hover:underline transition-colors flex items-center gap-0.5"
                >
                  <span>Bảng giá</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
