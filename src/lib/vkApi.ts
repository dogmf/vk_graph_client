import axios from "axios";

const API_VERSION = "5.131";
const USER_FIELDS = ["nickname", "screen_name", "photo_50"].join(",");

export type VkUser = {
  id: number;
  nickname: string;
  screen_name: string;
  photo_50: string;
  last_name: string;
  first_name: string;
  [prop: string]: any;
};

let vkApi = axios.create({
  baseURL: "/api",
  timeout: 1000,
  params: { v: API_VERSION },
});

vkApi.interceptors.response.use((res) => {
  if (res.data.error) {
    let { error_msg } = res.data.error;
    let error = new Error(error_msg);
    error.name = "Ошибка запроса";
    throw error;
  }
  return res;
});

const api = {
  getUser: async (user_id: string | number): Promise<VkUser> => {
    const params = {
      user_ids: user_id,
      fields: USER_FIELDS,
    };
    let res = await vkApi.get("/method/users.get", { params });
    return res?.data?.response?.[0];
  },
  getFriends: async (
    user_id: number
  ): Promise<{ count: number; items: VkUser[] }> => {
    const params = {
      user_id,
      fields: USER_FIELDS,
      count: 1000,
    };
    let res = await vkApi.get("/method/friends.get", { params });
    return res?.data?.response;
  },
};

export default api;
