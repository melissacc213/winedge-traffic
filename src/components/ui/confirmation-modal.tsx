import { Box,Button, Group, Modal, Stack, Text, ThemeIcon, useComputedColorScheme,useMantineTheme } from "@mantine/core";

import { Icons } from "../icons";

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
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

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
        body: {
          padding: `${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.xl}`,
        },
        close: {
          '&:hover': {
            backgroundColor: isDark ? theme.colors.gray[8] : theme.colors.gray[1],
            borderColor: isDark ? theme.colors.gray[6] : theme.colors.gray[4],
          },
          alignItems: 'center',
          border: `2px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`,
          borderRadius: theme.radius.xl,
          color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
          display: 'flex',
          height: 34,
          justifyContent: 'center',
          width: 34,
        },
        content: {
          backgroundColor: isDark ? theme.colors.gray[9] : theme.white,
          border: 'none',
          overflow: 'visible',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'none',
          padding: `${theme.spacing.xl} ${theme.spacing.xl} 0`,
        },
        inner: {
          padding: theme.spacing.md,
        },
        root: {
          zIndex: 1000,
        },
        title: {
          color: isDark ? theme.colors.gray[1] : theme.colors.gray[9],
          fontSize: 20,
          fontWeight: 600,
        }
      }}
    >
      <Stack gap={variant === "warning" ? "lg" : "xl"}>
        {/* Message with optional icon */}
        {icon !== "none" && variant === "warning" ? (
          <Group gap="md" align="flex-start" wrap="nowrap">
            <Box
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors[getIconColor()][1],
                borderRadius: '50%',
                display: 'flex',
                flexShrink: 0,
                height: 48,
                justifyContent: 'center',
                width: 48,
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
                  color: isDark ? theme.colors.gray[2] : theme.colors.gray[7],
                  lineHeight: 1.5,
                }}
              >
                {message}
              </Text>
              {subMessage && (
                <Text 
                  size="sm" 
                  style={{ 
                    color: isDark ? theme.colors.gray[4] : theme.colors.gray[6],
                    lineHeight: 1.5,
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
              color: isDark ? theme.colors.gray[2] : theme.colors.gray[7],
              lineHeight: 1.5,
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
                color: isDark ? theme.colors.gray[4] : theme.colors.gray[7],
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