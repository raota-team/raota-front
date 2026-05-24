export const shareResult = async (title: string, text: string, url: string) => {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      console.error("공유하기 실패:", error);
    }
  }
  
  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    alert("링크가 클립보드에 복사되었습니다.");
    return true;
  } catch (error) {
    console.error("클립보드 복사 실패:", error);
    alert("공유하기를 지원하지 않는 환경입니다.");
    return false;
  }
};

export const getKakaoMapSearchUrl = (query: string) => {
  return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;
};
