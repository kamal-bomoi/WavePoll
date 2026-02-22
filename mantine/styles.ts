import type { MantineThemeComponents } from "@mantine/core";
import { Badge, Button, Paper, TextInput } from "@mantine/core";

export const styles: MantineThemeComponents = {
  Paper: Paper.extend({
    defaultProps: {
      p: 28,
      withBorder: true,
      radius: "lg"
    },
    styles: {
      root: {
        borderColor: "rgba(13, 148, 136, 0.2)",
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(6px)"
      }
    }
  }),
  Button: Button.extend({
    defaultProps: {
      radius: "xl"
    }
  }),
  Badge: Badge.extend({
    defaultProps: {
      radius: "sm",
      tt: "uppercase"
    }
  }),
  TextInput: TextInput.extend({
    styles: {
      error: {
        fontSize: "14px"
      }
    }
  })
};
