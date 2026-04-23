import { apiClient } from "./client";

export type UploadType = "PROFILE" | "SHOP" | "COMMUNITY" | "PROOF";

/**
 * 스웨거 명세에 따른 티켓 응답 구조 (data 래퍼 없음)
 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  imgUrl: string;
  uploadParams?: Record<string, any>;
}

/**
 * 1. 업로드 티켓 발급 요청
 */
export const getUploadTicket = async (params: {
  type: UploadType;
  extension: string;
  contentType?: string;
}): Promise<PresignedUrlResponse> => {
  // 서버가 status/message/data 구조가 아닌 순수 객체를 반환하므로 타입을 직접 지정
  const res = await apiClient<PresignedUrlResponse>("/files/upload-ticket", {
    query: params,
  });
  return res;
};

/**
 * 2. 이미지 업로드 수행 (OCI 또는 Cloudinary)
 */
export const uploadFileToStorage = async (
  ticket: PresignedUrlResponse,
  file: File
): Promise<string> => {
  if (!ticket || !ticket.uploadUrl) {
    throw new Error("유효하지 않은 업로드 티켓입니다.");
  }

  const { uploadUrl, uploadParams, imgUrl } = ticket;

  if (!uploadParams || Object.keys(uploadParams).length === 0) {
    // 케이스 A: OCI (S3 방식) - PUT 요청
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) throw new Error("OCI 업로드에 실패했습니다.");
  } else {
    // 케이스 B: Cloudinary - FormData POST 요청
    const formData = new FormData();
    Object.entries(uploadParams).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Cloudinary 업로드에 실패했습니다.");
  }

  return imgUrl;
};
