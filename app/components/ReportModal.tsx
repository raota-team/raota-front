'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { reportShop } from '@/lib/api/ramen-shops';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopId: number; // shopId 추가
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, shopName, shopId }) => {
  const [reportType, setReportType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useApp();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !message.trim()) {
      showToast('제보 유형과 내용을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 백엔드 Enum 명세에 100% 맞춤
      let mappedType = "OTHERS";
      if (reportType === "hours") mappedType = "OPENING_HOURS_ERROR";
      else if (reportType === "closed") mappedType = "CLOSED";
      else if (reportType === "menu") mappedType = "MENU_INFO_ERROR";
      else if (reportType === "event") mappedType = "EVENT";

      await reportShop(shopId, {
        reportType: mappedType,
        content: message.trim()
      });

      showToast('제보해주셔서 감사합니다! 검토 후 반영하겠습니다.', 'success');
      setReportType('');
      setMessage('');
      onClose();
    } catch (error: any) {
      console.error('Report submission failed:', error);
      showToast(error.message || '제보 전송 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">정보 제보하기</h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{shopName}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 hover:bg-stone-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">제보 유형</label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 py-3 px-4 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-sm"
              >
                <option value="">선택해주세요</option>
                <option value="hours">영업시간 오류</option>
                <option value="closed">폐업했어요</option>
                <option value="menu">메뉴 정보 오류</option>
                <option value="event">이벤트 메뉴 제보 ✨</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">상세 내용</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="자세한 내용을 알려주세요..."
              className="w-full bg-stone-50 border border-stone-200 text-stone-700 py-3 px-4 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-sm resize-none placeholder:text-stone-400"
              rows={5}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !reportType || !message.trim()}
            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${isSubmitting || !reportType || !message.trim()
                ? 'bg-stone-300 cursor-not-allowed shadow-none'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-xl'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>전송 중...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>제보하기</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
