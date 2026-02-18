import type { MantineThemeComponents } from "@mantine/core";
import { Paper } from "@mantine/core";

export const styles: MantineThemeComponents = {
  Paper: Paper.extend({
    defaultProps: {
      p: 30,
      withBorder: true,
      radius: "md"
    }
  })
};
