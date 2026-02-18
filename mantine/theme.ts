"use client";

import { createTheme } from "@mantine/core";
import { colors } from "./colors";
import { styles } from "./styles";

export const theme = createTheme({
  fontFamily: "Finlandica, sans-serif",
  primaryColor: "indigo",
  components: styles,
  colors
});
