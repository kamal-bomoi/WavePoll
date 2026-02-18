import axios, { type AxiosInstance } from "axios";

class Api {
  readonly #client: AxiosInstance;

  constructor() {
    this.#client = axios.create({
      baseURL: "/api",
      withCredentials: true,
      timeout: 15_000
    });
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
}

export const api = new Api();
