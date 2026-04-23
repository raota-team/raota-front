'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateUserProfile } from '@/lib/api/user';

export default function RegisterPage() {
  const router = useRouter();
  const { completeRegistration, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. 백엔드 회원가입(프로필 설정) API 호출
      await updateUserProfile({
        nickname: formData.nickname,
        bio: formData.bio, // bio 필드로 전송
        profile_image_url: '', // 이미지 업로드 로직 추가 시 업데이트 필요
        background_image_url: '',
      });

      // 2. 프론트엔드 로그인 상태 동기화 및 newMember 플래그 해제
      completeRegistration();
      
      // 3. 메인 페이지로 이동
      router.push('/');
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
              <h1 className="text-2xl font-bold text-stone-900 mb-2">
                기본 정보를 알려주세요
              </h1>
              <p className="text-stone-500 text-sm">
                라오타에서 사용하실 닉네임과 프로필을 설정합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Profile Image Upload Mock */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center overflow-hidden group-hover:border-orange-400 transition-colors">
                      <Camera className="w-8 h-8 text-stone-400 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-orange-600 p-1.5 rounded-full text-white border-2 border-white shadow-sm">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 mt-3 font-medium">프로필 이미지 등록</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">닉네임</label>
                  <input
                    type="text"
                    required
                    placeholder="라멘을사랑하는사람"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-stone-50"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                  <p className="text-[11px] text-stone-400 mt-2 ml-1">한글, 영문, 숫자 조합 2~12자 이내</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">한줄 소개 (선택)</label>
                  <textarea
                    placeholder="라멘에 진심인 편입니다."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-stone-50 min-h-[100px] resize-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      />
                      <div className="w-5 h-5 border-2 border-stone-300 rounded peer-checked:bg-orange-600 peer-checked:border-orange-600 transition-colors flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    </div>
                    <span className="text-sm text-stone-500 leading-tight">
                      <span className="text-stone-800 font-medium">이용약관 및 개인정보처리방침</span>에 동의합니다 (필수)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formData.nickname || !formData.agreeTerms || isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
