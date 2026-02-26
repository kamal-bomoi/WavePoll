/**
 * Centers its children within a full-size container using CSS Grid.
 *
 * @returns A React element that fills the available space and centers `children` both horizontally and vertically.
 */
export function AbsoluteCenter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center"
      }}
    >
      {children}
    </div>
  );
}
