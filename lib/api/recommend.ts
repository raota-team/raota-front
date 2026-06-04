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
      scores: {
        soup: number;
        noodle: number;
        topping: number;
        mood: number;
        access: number;
        revisit: number;
      };
      totalIndex: number;
    };
    shopB: {
      id: number;
      name: string;
      scores: {
        soup: number;
        noodle: number;
        topping: number;
        mood: number;
        access: number;
        revisit: number;
      };
      totalIndex: number;
    };
    narratives: {
      title: string;
      body: string;
    }[];
  };
}

export const compareShops = async (data: CompareShopsRequest) => {
  console.log("비교 요청 데이터", data);

  return apiClient("/recommendations/compare", {
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
}) => {
  return apiClient<any>("/recommendations/taste", {
    method: "POST",
    body: data,
  });
};