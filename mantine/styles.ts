import type { MantineThemeComponents } from "@mantine/core";
import { Badge, Button, Card, InputWrapper, Paper } from "@mantine/core";

export const styles: MantineThemeComponents = {
  Paper: Paper.extend({
    defaultProps: {
      p: 28,
      withBorder: true,
      radius: "lg"
    },
    styles: (theme) => ({
      root: {
        borderColor: theme.colors.slate?.[2] ?? theme.colors.gray[2],
        backgroundColor: theme.white,
        boxShadow: "0 14px 44px rgba(15, 23, 42, 0.08)"
      }
    })
  }),
  Card: Card.extend({
    defaultProps: {
      withBorder: true,
      radius: "lg",
      p: "lg"
    },
    styles: (theme) => ({
      root: {
        borderColor: theme.colors.slate?.[2] ?? theme.colors.gray[2],
        backgroundColor: theme.white,
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.06)"
      }
    })
  }),
  Button: Button.extend({
    defaultProps: {
      radius: "md"
    }
  }),
  Badge: Badge.extend({
    defaultProps: {
      radius: "sm",
      tt: "uppercase"
    }
  }),
  InputWrapper: InputWrapper.extend({
    styles: {
      error: {
        fontSize: "14px"
      }
    }
  })
};
