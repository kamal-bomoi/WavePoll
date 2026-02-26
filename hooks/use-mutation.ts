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

/**
 * Creates a React Query mutation hook bound to the specified mutation key.
 *
 * @param key - The mutation key identifying which API mutation to execute
 * @param options - Optional TanStack `useMutation` options to configure lifecycle callbacks and behavior
 * @returns The `UseMutationResult` object for the specified mutation key, containing mutation state and helpers
 */
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
