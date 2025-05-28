import { Icons } from "../icons";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useTheme } from "@/providers/theme-provider";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation(["components"]);
  const { colorScheme, toggleColorScheme } = useTheme();

  return (
    <Tooltip
      zIndex={999999}
      label={
        colorScheme === "light"
          ? t("components:theme.switch_to_dark")
          : t("components:theme.switch_to_light")
      }
    >
      <ActionIcon
        variant="light"
        size="lg"
        aria-label="Toggle color theme"
        onClick={toggleColorScheme}
      >
        {colorScheme === "light" ? (
          <Icons.Moon className="h-5 w-5" />
        ) : (
          <Icons.Sun className="h-5 w-5" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
