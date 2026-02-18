import type { ApiError, ErrorProps } from "@/types";

export function parse_api_error(error: ApiError): {
  errors: ErrorProps[];
  map: Record<string, string>;
} {
  if (!error.response?.data.errors)
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
