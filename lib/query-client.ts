import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryClient
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

let browser_query_client: QueryClient | undefined;

/**
 * Get the application's QueryClient: a new client for server contexts or a lazily-initialized singleton in the browser.
 *
 * On the server this always creates and returns a fresh QueryClient; in browsers it creates the client once and returns the cached instance on subsequent calls.
 *
 * @returns The active QueryClient instance — a new client for server execution or the cached browser singleton.
 */
export function query_client(): QueryClient {
  if (isServer) return create_client();

  if (!browser_query_client) browser_query_client = create_client();

  return browser_query_client;
}

/**
 * Create a preconfigured QueryClient for TanStack React Query.
 *
 * @returns A QueryClient with defaults that disable retries and automatic refetching, treat queries with status `"pending"` as dehydrable, and a MutationCache that surfaces non-Axios errors with a toast.
 */
function create_client() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        gcTime: Infinity
      },
      mutations: {
        retry: false
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending"
      }
    },
    mutationCache: new MutationCache({
      onError(error) {
        if (error instanceof Error && !axios.isAxiosError(error))
          toast.error(error.message);
      }
    })
  });
}
