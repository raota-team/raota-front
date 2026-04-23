import { apiClient } from "./client";

export type UploadType = "PROFILE" | "SHOP" | "COMMUNITY" | "PROOF";

/**
 * 백엔드 권장 가이드에 따른 티켓 응답 구조
 */
export interface PresignedUrlResponse {
  status: string;
  message: string;
  data: {
    upload_url: string;    // 스네이크 케이스 준수
    img_url: string;       // 스네이크 케이스 준수
    upload_params?: Record<string, any>; // 스네이크 케이스 준수
  };
}

/**
 * 1. 업로드 티켓 발급 요청
 */
export const getUploadTicket = async (params: {
  type: UploadType;
  extension: string;
  contentType?: string;
}): Promise<PresignedUrlResponse["data"]> => {
  // 스웨거 명세대로 경로 수정 (api/v1 제거)
  const res = await apiClient<PresignedUrlResponse>("/files/upload-ticket", {
    query: params,
  });

  if (res.status !== "SUCCESS") {
    throw new Error(res.message || "티켓 발급에 실패했습니다.");
  }

  return res.data;
};

/**
 * 2. 이미지 업로드 수행 (OCI 또는 Cloudinary)
 */
export const uploadFileToStorage = async (
  ticket: PresignedUrlResponse["data"],
  file: File
): Promise<string> => {
  if (!ticket || !ticket.upload_url) {
    throw new Error("유효하지 않은 업로드 티켓입니다.");
  }

  const { upload_url, upload_params, img_url } = ticket;

  if (!upload_params || Object.keys(upload_params).length === 0) {
    // 케이스 A: OCI (S3 방식) - PUT 요청
    const response = await fetch(upload_url, {
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
    // 가이드에 따라 모든 파라미터를 FormData에 추가
    Object.entries(upload_params).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    // 마지막에 파일 추가
    formData.append("file", file);

    const response = await fetch(upload_url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Cloudinary 업로드에 실패했습니다.");
  }

  return img_url;
};
