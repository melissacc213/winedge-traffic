import { Modal, Text, Button, Group, Stack, ThemeIcon, useMantineTheme } from "@mantine/core";
import { Icons } from "../icons";
import { useTheme } from "../../providers/theme-provider";

export interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  confirmColor?: "red" | "orange" | "yellow" | "blue" | "teal" | "green";
  icon?: "warning" | "danger" | "info" | "question";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  confirmColor = "red",
  icon = "warning",
  size = "sm",
  loading = false,
}: ConfirmationModalProps) {
  const { colorScheme, theme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";

  const getIcon = () => {
    switch (icon) {
      case "danger":
        return <Icons.AlertCircle size={22} />;
      case "info":
        return <Icons.InfoCircle size={22} />;
      case "question":
        return <Icons.InfoCircle size={22} />;
      case "warning":
      default:
        return <Icons.AlertCircle size={22} />;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case "danger":
        return "red";
      case "info":
        return "blue";
      case "question":
        return "blue";
      case "warning":
      default:
        return "orange";
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size={size}
      withinPortal
      padding="xl"
      radius="lg"
      shadow="xl"
      styles={{
        header: {
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
          paddingBottom: mantineTheme.spacing.md,
        },
        content: {
          backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
          border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        },
        title: {
          fontWeight: 600,
          fontSize: 18,
          color: isDark ? theme.colors.gray[1] : theme.colors.gray[9],
        },
        close: {
          color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
          '&:hover': {
            backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[1],
          },
        },
      }}
    >
      <Stack gap="xl">
        {/* Message with icon */}
        <Group gap="md" align="flex-start" wrap="nowrap">
          <ThemeIcon
            size={48}
            radius="xl"
            variant="light"
            color={getIconColor()}
            style={{ 
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            {getIcon()}
          </ThemeIcon>
          <Text 
            size="md" 
            style={{ 
              flex: 1, 
              lineHeight: 1.6,
              color: isDark ? theme.colors.gray[2] : theme.colors.gray[7],
            }}
          >
            {message}
          </Text>
        </Group>

        {/* Action buttons */}
        <Group justify="flex-end" gap="md" pt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={loading}
            size="md"
            radius="md"
            style={{
              color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
              fontWeight: 500,
              minWidth: 100,
            }}
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onClick={onConfirm}
            loading={loading}
            size="md"
            radius="md"
            variant="filled"
            style={{
              fontWeight: 600,
              minWidth: 120,
              boxShadow: `0 2px 8px ${mantineTheme.colors[confirmColor][3]}40`,
            }}
          >
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}