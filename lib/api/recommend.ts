import { apiClient } from "@/lib/api/client";

export interface CompareShopsRequest {
  shopAId: number;
  shopBId: number;
  focus?: string;
}

export interface CompareShopsResponse {
  success: boolean;
  data: {
    shopA: {
      id: number;
      name: string;
    };
    shopB: {
      id: number;
      name: string;
    };
    focus?: string;
    narratives: {
      title: string;
      body: string;
    }[];
  };
}

export const compareShops = async (data: CompareShopsRequest) => {
  console.log("비교 요청 데이터", data);

  return apiClient<CompareShopsResponse>("/ramen-shops/compare", {
    method: "POST",
    body: data,
  });
};

export const getReviewSummary = async (data: {
  shopId: number;
  focus?: string;
}) => {
  return apiClient<any>("/recommendations/summary", {
    method: "POST",
    body: data,
  });
};

export const sendFollowUpChat = async (data: {
  contextType: "summary" | "compare";
  shopIds: number[];
  messages: {
    role: "user" | "ai";
    content: string;
  }[];
}) => {
  return apiClient<any>("/recommendations/chat", {
    method: "POST",
    body: data,
  });
};

export const getTasteRecommendations = async (data: {
  soup: string;
  mood: string;
  priority: string;
  freeText?: string;
}) => {
  return apiClient<{
    status: string;
    message: string;
    data: {
      recommendedShops: {
        id: number;
        name: string;
        type: string;
        location: string;
        description: string;
        imageUrl: string;
        matchScore: number;
        isBookmarked: boolean;
      }[];
    };
  }>("/recommendations/taste", {
    method: "POST",
    body: data,
  });
};
