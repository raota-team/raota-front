import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function AIFollowUpChat({ contextLabel }: { contextLabel: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesPanelRef = useRef<HTMLDivElement>(null);
  const initialMount = useRef(true);

  const scrollToBottom = () => {
    const panel = messagesPanelRef.current;
    if (!panel) return;
    panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const mockResponses = [
        "해당 매장은 주차 공간이 따로 마련되어 있지 않습니다. 근처 공영 주차장을 이용하시는 것을 추천해 드려요.",
        "네, 매운 맛을 조절할 수 있는 옵션이 있습니다. 보통맛부터 아주 매운맛까지 선택 가능해요.",
        "주말 점심 시간대에는 평균 20~30분 정도의 웨이팅이 발생합니다. 오픈런을 추천드려요.",
        "혼밥하기 아주 좋은 분위기입니다. 다찌(바) 좌석이 잘 되어 있어서 편하게 식사하실 수 있습니다.",
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", content: randomResponse },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div layout className="mt-8 border border-stone-200 bg-white">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 p-4">
        <Sparkles className="h-4 w-4 text-[#e60000]" />
        <h3 className="text-sm font-bold text-[#25282b]">
          AI에게 더 물어보기 <span className="text-[#7e7e7e] font-medium ml-1">({contextLabel})</span>
        </h3>
      </div>

      <motion.div
        layout
        ref={messagesPanelRef}
        className="flex max-h-60 min-h-[7rem] flex-col gap-4 overflow-y-auto bg-[#f7f7f7] p-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-[#7e7e7e] py-4">
            추천 결과에 대해 궁금한 점을 질문해보세요.
            <br />
            (예: "여기 혼밥하기 좋아?", "매운 메뉴도 있어?")
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[6px] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#25282b] text-white"
                    : "bg-white border border-stone-200 text-[#25282b]"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-[6px] px-4 py-3 bg-white border border-stone-200 text-[#25282b] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#bebebe] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#bebebe] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#bebebe] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="p-3 border-t border-stone-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 자유롭게 입력해보세요."
            className="flex-1 rounded-[2px] border border-[#333333] bg-white px-[10px] py-[12px] text-[16px] font-normal text-[#333333] outline-none transition-colors focus:border-[#e60000]"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-[2px] bg-[#e60000] text-white transition-opacity hover:opacity-90 disabled:bg-[#bebebe] disabled:opacity-100"
          >
            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
