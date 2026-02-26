import type { ApiError, ErrorProps } from "@/types";

/**
 * Convert an ApiError into a structured list of error objects and a path-to-message map.
 *
 * @param error - The ApiError to parse. If the response contains `data.errors`, those are used; otherwise a single error entry with `error.message` is returned.
 * @returns An object with `errors` — an array of `ErrorProps` sourced from the API (or a single fallback entry) — and `map` — a Record that maps an error `path` to its `message` for entries that include a path.
 */
export function parse_api_error(error: ApiError): {
  errors: ErrorProps[];
  map: Record<string, string>;
} {
  if (!error.response?.data?.errors)
    return {
      errors: [{ message: error.message }],
      map: {}
    };

  const errors = error.response.data.errors;

  return {
    errors,
    map: errors.reduce<Record<string, string>>((map, e) => {
      if (e.path) map[e.path] = e.message;

      return map;
    }, {})
  };
}
