import apiClient from "../../shared/services/apiClient";

export async function fetchUserProfile() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  return user;
}

export async function fetchLoyaltyInfo(userId) {
  try {
    const response = await apiClient.get(`/loyalty/${userId}`);
    return response.data?.data || { currentPoints: 0, dollarValue: 0, transactions: [] };
  } catch (error) {
    console.error("Failed to fetch loyalty info:", error);
    return { currentPoints: 0, dollarValue: 0, transactions: [] };
  }
}