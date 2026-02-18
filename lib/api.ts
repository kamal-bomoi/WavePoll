import axios from "axios";
import type { ApiError } from "@/types";
import { parse_api_error } from "@/utils/error";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000
});

// todo: from v1, do we need this for v2?
api.interceptors.request.use((config) => {
  const vid =
    typeof localStorage !== "undefined" && localStorage.getItem("vid");

  if (vid) config.headers["x-vid"] = vid;

  return config;
});

// todo: from v1, do we need this for v2?
api.interceptors.response.use(
  (response) => {
    const vid = (response.data as Record<string, string>).vid;

    if (vid && !localStorage.getItem("vid")) localStorage.setItem("vid", vid);

    return response;
  },
  (error: ApiError) => {
    const { errors } = parse_api_error(error);

    errors.forEach(() => {
      // toast.error(error.message)
    });

    return Promise.reject(error);
  }
);
