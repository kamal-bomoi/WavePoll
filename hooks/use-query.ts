import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { isServer, useQuery as useTanStackQuery } from "@tanstack/react-query";
import {
  type QueryKey,
  type QueryParams,
  type QueryResult,
  queries
} from "@/lib/api/queries";
import type { ApiError, Fn } from "@/types";

export type QueryOptions<T extends QueryKey> = Partial<
  UseQueryOptions<QueryResult<T>, ApiError>
>;

export function useQuery<T extends QueryKey>(
  ...args: QueryParams<T> extends []
    ? [key: T, options?: QueryOptions<T>]
    : [key: T, params: QueryParams<T>, options?: QueryOptions<T>]
): UseQueryResult<QueryResult<T>, ApiError> {
  return useTanStackQuery(useQuery.options<T>(...args));
}

useQuery.options = <T extends QueryKey>(
  ...args: QueryParams<T> extends []
    ? [key: T, options?: QueryOptions<T>]
    : [key: T, params: QueryParams<T>, options?: QueryOptions<T>]
): UseQueryOptions<QueryResult<T>, ApiError> => {
  const key = args[0];
  const params = args[1] && Array.isArray(args[1]) ? args[1] : [];
  const options = args[1] && !Array.isArray(args[1]) ? args[1] : args[2];

  const query = queries[key];

  return {
    ...(options ?? {}),
    queryKey: (query.key as Fn)(...params),
    queryFn() {
      return (query.fn as Fn)(...params) as Promise<QueryResult<T>>;
    },
    enabled:
      typeof options?.enabled === "function"
        ? (q) => !isServer && (options.enabled as (query: object) => boolean)(q)
        : !isServer && (options?.enabled ?? true)
  };
};
