import axios, { type AxiosInstance } from "axios";
import { toast } from "sonner";
import type { ApiError } from "@/types";
import { parse_api_error } from "@/utils/error";

class Api {
  readonly #client: AxiosInstance;

  constructor() {
    this.#client = axios.create({
      baseURL: "/api",
      withCredentials: true,
      timeout: 15_000
    });

    this.#interceptors();
  }

  async get<T>(...args: Parameters<typeof axios.get>): Promise<T> {
    return (await this.#client.get<T>(...args)).data;
  }

  async post<T>(...args: Parameters<typeof axios.post>): Promise<T> {
    return (await this.#client.post<T>(...args)).data;
  }

  async put<T>(...args: Parameters<typeof axios.put>): Promise<T> {
    return (await this.#client.put<T>(...args)).data;
  }

  async patch<T>(...args: Parameters<typeof axios.patch>): Promise<T> {
    return (await this.#client.patch<T>(...args)).data;
  }

  async delete<T>(...args: Parameters<typeof axios.delete>): Promise<T> {
    return (await this.#client.delete<T>(...args)).data;
  }

  #interceptors(): void {
    this.#client.interceptors.response.use(undefined, (original: ApiError) => {
      const { errors } = parse_api_error(original);

      errors.forEach((error) => void toast.error(error.message));

      return Promise.reject(original);
    });
  }
}

export const api = new Api();
