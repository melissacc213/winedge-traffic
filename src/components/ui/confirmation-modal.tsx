import { Modal, Text, Button, Group, Stack, ThemeIcon, useMantineTheme, Box } from "@mantine/core";
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
  icon?: "warning" | "danger" | "info" | "question" | "none";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  variant?: "standard" | "warning";
  subMessage?: string;
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
  icon = "none",
  size = "sm",
  loading = false,
  variant = "standard",
  subMessage,
}: ConfirmationModalProps) {
  const { colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === "dark";

  const getIcon = () => {
    switch (icon) {
      case "danger":
        return <Icons.AlertTriangle size={20} />;
      case "info":
        return <Icons.InfoCircle size={20} />;
      case "question":
        return <Icons.HelpCircle size={20} />;
      case "warning":
        return <Icons.AlertCircle size={20} />;
      case "none":
      default:
        return null;
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
      size={size === "sm" ? 440 : size}
      withinPortal
      radius="lg"
      shadow="xl"
      padding={0}
      styles={{
        root: {
          zIndex: 1000,
        },
        inner: {
          padding: mantineTheme.spacing.md,
        },
        content: {
          backgroundColor: isDark ? mantineTheme.colors.dark?.[7] || mantineTheme.colors.gray[9] : mantineTheme.white,
          border: 'none',
          overflow: 'visible',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'none',
          padding: `${mantineTheme.spacing.xl} ${mantineTheme.spacing.xl} 0`,
        },
        title: {
          fontWeight: 600,
          fontSize: 20,
          color: isDark ? mantineTheme.colors.gray[1] : mantineTheme.colors.gray[9],
        },
        close: {
          color: isDark ? mantineTheme.colors.gray[4] : mantineTheme.colors.gray[6],
          border: `2px solid ${isDark ? mantineTheme.colors.gray[7] : mantineTheme.colors.gray[3]}`,
          borderRadius: mantineTheme.radius.xl,
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: isDark ? mantineTheme.colors.dark?.[6] || mantineTheme.colors.gray[8] : mantineTheme.colors.gray[1],
            borderColor: isDark ? mantineTheme.colors.gray[6] : mantineTheme.colors.gray[4],
          },
        },
        body: {
          padding: `${mantineTheme.spacing.lg} ${mantineTheme.spacing.xl} ${mantineTheme.spacing.xl}`,
        }
      }}
    >
      <Stack gap={variant === "warning" ? "lg" : "xl"}>
        {/* Message with optional icon */}
        {icon !== "none" && variant === "warning" ? (
          <Group gap="md" align="flex-start" wrap="nowrap">
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: mantineTheme.colors[getIconColor()][1],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ThemeIcon
                size={28}
                variant="transparent"
                color={getIconColor()}
              >
                {getIcon()}
              </ThemeIcon>
            </Box>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text 
                size="md" 
                style={{ 
                  lineHeight: 1.5,
                  color: isDark ? mantineTheme.colors.gray[2] : mantineTheme.colors.gray[7],
                }}
              >
                {message}
              </Text>
              {subMessage && (
                <Text 
                  size="sm" 
                  style={{ 
                    lineHeight: 1.5,
                    color: isDark ? mantineTheme.colors.gray[4] : mantineTheme.colors.gray[6],
                  }}
                >
                  {subMessage}
                </Text>
              )}
            </Stack>
          </Group>
        ) : (
          <Text 
            size="md" 
            style={{ 
              lineHeight: 1.5,
              color: isDark ? mantineTheme.colors.gray[2] : mantineTheme.colors.gray[7],
            }}
          >
            {message}
          </Text>
        )}

        {/* Action buttons */}
        {variant === "warning" ? (
          <Stack gap="sm" mt="sm">
            <Button
              fullWidth
              color={confirmColor}
              onClick={onConfirm}
              loading={loading}
              size="md"
              radius="md"
              variant="filled"
              style={{
                fontWeight: 500,
              }}
            >
              {confirmText}
            </Button>
            <Button
              fullWidth
              variant="transparent"
              color="gray"
              onClick={onClose}
              disabled={loading}
              size="md"
              radius="md"
              style={{
                color: isDark ? mantineTheme.colors.gray[4] : mantineTheme.colors.gray[7],
                fontWeight: 500,
              }}
            >
              {cancelText}
            </Button>
          </Stack>
        ) : (
          <Group justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="outline"
              color="gray"
              onClick={onClose}
              disabled={loading}
              size="md"
              radius="md"
              style={{
                borderWidth: 1.5,
                fontWeight: 500,
                minWidth: 90,
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
                fontWeight: 500,
                minWidth: 110,
              }}
            >
              {confirmText}
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}