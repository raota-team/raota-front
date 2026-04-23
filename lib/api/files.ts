import { apiClient } from "./client";

export type UploadType = "PROFILE" | "SHOP" | "COMMUNITY" | "PROOF";

export interface PresignedUrlResponse {
  status: string;
  message: string;
  data: {
    uploadUrl: string;
    imgUrl: string;
    uploadParams?: Record<string, string>;
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
  const res = await apiClient<PresignedUrlResponse>("/files/upload-ticket", {
    query: params,
  });
  return res.data;
};

/**
 * 2. 이미지 업로드 수행 (OCI 또는 Cloudinary)
 */
export const uploadFileToStorage = async (
  ticket: PresignedUrlResponse["data"],
  file: File
): Promise<string> => {
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
      formData.append(key, value);
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
