import "axios";
import type { ApiError } from "@/types";

declare module "axios" {
  interface AxiosRequestConfig<D = Any> {
    meta?: {
      toast?: boolean | ((error: ApiError) => boolean);
    };
  }
}
