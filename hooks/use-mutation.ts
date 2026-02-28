import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation as useTanStackMutation
} from "@tanstack/react-query";
import {
  type MutationKey,
  type MutationResult,
  type MutationVariables,
  mutations
} from "@/lib/api/mutations";
import type { ApiError, Fn } from "@/types";

export function useMutation<T extends MutationKey>(
  key: T,
  options?: UseMutationOptions<
    MutationResult<T>,
    ApiError,
    MutationVariables<T>
  >
): UseMutationResult<MutationResult<T>, ApiError, MutationVariables<T>> {
  return useTanStackMutation({
    ...(options ?? {}),
    mutationKey: [key],
    mutationFn(variables) {
      const fn = mutations[key] as Fn;

      return fn(variables);
    }
  });
}
