import { apiClient } from "./client";

export type UploadType = "PROFILE" | "SHOP" | "COMMUNITY" | "PROOF" | "BACKGROUND";

/**
 * 모든 가능성 있는 응답 구조를 수용하는 인터페이스
 */
export interface PresignedUrlResponse {
  status?: string;
  message?: string;
  data?: {
    upload_url?: string;
    uploadUrl?: string;
    img_url?: string;
    imgUrl?: string;
    upload_params?: Record<string, any>;
    uploadParams?: Record<string, any>;
  };
  // 평평한 구조일 경우를 대비
  upload_url?: string;
  uploadUrl?: string;
  img_url?: string;
  imgUrl?: string;
  upload_params?: Record<string, any>;
  uploadParams?: Record<string, any>;
}

/**
 * 1. 업로드 티켓 발급 요청
 */
export const getUploadTicket = async (params: {
  type: UploadType;
  extension: string;
  contentType?: string;
}): Promise<any> => {
  const res = await apiClient<PresignedUrlResponse>("/files/upload-ticket", {
    query: params,
  });

  // 1. 감싸진 구조 (Guide 방식)
  if (res.status === "SUCCESS" && res.data) {
    return res.data;
  }

  // 2. 평평한 구조 (Swagger 방식) 또는 status가 없는 경우
  if (res.upload_url || res.uploadUrl) {
    return res;
  }

  // 3. 진짜 에러인 경우
  throw new Error(res.message || "티켓 발급에 실패했습니다.");
};

/**
 * 2. 이미지 업로드 수행 (OCI 또는 Cloudinary)
 */
export const uploadFileToStorage = async (
  ticket: any,
  file: File
): Promise<string> => {
  // 스네이크 케이스와 카멜 케이스 모두 지원
  const uploadUrl = ticket.upload_url || ticket.uploadUrl;
  const uploadParams = ticket.upload_params || ticket.uploadParams;
  const imgUrl = ticket.img_url || ticket.imgUrl;

  if (!uploadUrl) {
    throw new Error("유효하지 않은 업로드 티켓입니다. (URL 누락)");
  }

  if (!uploadParams || Object.keys(uploadParams).length === 0) {
    // 케이스 A: OCI (S3 방식) - PUT 요청
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) throw new Error(`OCI 업로드 실패 (${response.status})`);
  } else {
    // 케이스 B: Cloudinary - FormData POST 요청
    const formData = new FormData();
    
    // ✨ 백엔드 강조 사항: uploadParams에 있는 모든 값을 반드시 전송
    if (uploadParams) {
      Object.entries(uploadParams).forEach(([key, value]) => {
        // 모든 값을 문자열로 변환하여 빠짐없이 추가
        formData.append(key, String(value));
      });
    }
    
    // 마지막에 파일 추가
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`Cloudinary 업로드 실패 (${response.status})`);
  }

  return imgUrl;
};
