import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient
} from "@tanstack/react-query";

let browser_query_client: QueryClient | undefined;

export function query_client(): QueryClient {
  if (isServer) return create_client();

  if (!browser_query_client) browser_query_client = create_client();

  return browser_query_client;
}

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
    }
  });
}
