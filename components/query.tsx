import { Loader } from "@mantine/core";
import { omit } from "es-toolkit/object";
import { isEqual } from "es-toolkit/predicate";
import { memo } from "react";
import { useQuery } from "@/hooks/use-query";
import type { QueryKey, QueryResult } from "@/lib/api/queries";
import type { ApiError } from "@/types";
import { AbsoluteCenter } from "./absolute-center";
import { WaveAlert } from "./wave-alert";

interface Props<T extends QueryKey> {
  query: Parameters<typeof useQuery<T>>;
  children: (data: QueryResult<T>) => React.ReactNode;
  tracker?: "isLoading" | "isFetching" | "isPending";
  loader?: React.ReactNode;
  error?: React.FC<{ error: ApiError }>;
}

export const Query = memo(
  <T extends QueryKey>({
    query,
    children,
    tracker = "isLoading",
    loader,
    error: ErrorComponent
  }: Props<T>) => {
    const q = useQuery<T>(...query);

    if (q[tracker])
      return (
        loader ?? (
          <AbsoluteCenter>
            <Loader size="md" />
          </AbsoluteCenter>
        )
      );

    if (q.error)
      return ErrorComponent ? (
        <ErrorComponent error={q.error} />
      ) : (
        <WaveAlert type="error" message={q.error} />
      );

    return <>{children(q.data as QueryResult<T>)}</>;
  },
  (prev, next) => isEqual(omit(prev, ["children"]), omit(next, ["children"]))
) as unknown as <T extends QueryKey>(props: Props<T>) => React.JSX.Element;
