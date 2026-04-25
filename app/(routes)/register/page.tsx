'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, Check, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateUserProfile } from '@/lib/api/user';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { compressImage } from '@/lib/utils/image-optimization';

export default function RegisterPage() {
  const router = useRouter();
  const { completeRegistration, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    agreeTerms: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('이미지 크기는 10MB 이하여야 합니다.', 'error');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !formData.agreeTerms) return;
    
    setIsLoading(true);

    try {
      let finalImageUrl = '';

      // 1. 이미지가 있다면 압축 후 업로드
      if (selectedFile) {
        const compressed = await compressImage(selectedFile);
        const ticket = await getUploadTicket({
          type: 'PROFILE',
          extension: 'webp',
          contentType: 'image/webp'
        });
        finalImageUrl = await uploadFileToStorage(ticket, compressed);
      }

      // 2. 백엔드 회원가입(프로필 설정) API 호출
      await updateUserProfile({
        nickname: formData.nickname,
        bio: formData.bio,
        profile_image_url: finalImageUrl,
        background_image_url: '',
      });

      // 3. 프론트엔드 로그인 상태 동기화 및 newMember 플래그 해제
      completeRegistration();
      
      // 4. 메인 페이지로 이동
      router.push('/');
      showToast('반갑습니다! 회원가입이 완료되었습니다.', 'success');
    } catch (error: any) {
      console.error('Registration failed:', error);
      showToast(error.message || '회원가입 처리 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center py-12 px-4 min-h-screen bg-transparent">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-stone-900 mb-2 font-black tracking-tight">
                반가워요! <br/> 기본 정보를 알려주세요
              </h1>
              <p className="text-stone-500 text-sm font-medium">
                라오타에서 사용하실 닉네임과 프로필을 설정합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-24 h-24 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center overflow-hidden group-hover:border-orange-400 transition-colors relative">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-stone-400 group-hover:text-orange-400 transition-colors" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-stone-900 p-1.5 rounded-full text-white border-2 border-white shadow-sm">
                      <Camera className="w-3 h-3" />
                    </div>
                    {previewUrl && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute -top-1 -right-1 bg-white border border-stone-200 p-1 rounded-full text-stone-400 hover:text-red-500 shadow-sm transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                  <span className="text-xs text-stone-400 mt-3 font-bold uppercase tracking-widest">프로필 이미지 등록</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">닉네임</label>
                  <input
                    type="text"
                    required
                    placeholder="라멘을사랑하는사람"
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all bg-stone-50 font-bold"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                  <p className="text-[11px] text-stone-400 mt-2 ml-1 font-medium italic">한글, 영문, 숫자 조합 2~12자 이내</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">한줄 소개 (선택)</label>
                  <textarea
                    placeholder="라멘에 진심인 편입니다."
                    className="w-full px-4 py-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all bg-stone-50 min-h-[100px] resize-none text-sm"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      />
                      <div className="w-5 h-5 border-2 border-stone-300 rounded peer-checked:bg-stone-900 peer-checked:border-stone-900 transition-colors flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    </div>
                    <span className="text-sm text-stone-500 leading-tight">
                      <span className="text-stone-800 font-bold">이용약관 및 개인정보처리방침</span>에 동의합니다 (필수)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formData.nickname || !formData.agreeTerms || isLoading}
                  className="w-full bg-stone-950 hover:bg-orange-600 text-white font-black py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 uppercase tracking-widest text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <span>회원가입 완료</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-stone-400 text-xs">
          이미 계정이 있으신가요? <button onClick={() => router.push('/login')} className="text-stone-600 font-bold underline underline-offset-4">로그인하기</button>
        </p>
      </div>
    </div>
  );
}
