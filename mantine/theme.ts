"use client";

import { createTheme } from "@mantine/core";
import { colors } from "./colors";
import { styles } from "./styles";

export const theme = createTheme({
  fontFamily: "Manrope, sans-serif",
  primaryColor: "indigo",
  defaultRadius: "md",
  components: styles,
  colors
});
