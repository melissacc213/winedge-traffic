import React from 'react';
import { modals } from '@mantine/modals';
import { Text, Group, Box, ThemeIcon, Stack, Button, useMantineTheme } from '@mantine/core';
import { Icons } from '@/components/icons';
import { useTheme } from '@/providers/theme-provider';
import type { ConfirmationModalProps } from '@/components/ui/confirmation-modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: ConfirmationModalProps['confirmColor'];
  icon?: ConfirmationModalProps['icon'];
  size?: ConfirmationModalProps['size'];
  onConfirm?: () => void | Promise<void>;
  variant?: 'standard' | 'warning';
  subMessage?: string;
}

export function showConfirmation(options: ConfirmOptions): void {
  const variant = options.variant || 'standard';
  const hasIcon = options.icon && options.icon !== 'none' && variant === 'warning';
  const theme = useMantineTheme();

  const getIcon = () => {
    switch (options.icon) {
      case 'danger':
        return <Icons.AlertTriangle size={20} />;
      case 'info':
        return <Icons.InfoCircle size={20} />;
      case 'question':
        return <Icons.HelpCircle size={20} />;
      case 'warning':
      default:
        return <Icons.AlertCircle size={20} />;
    }
  };

  const getIconColor = () => {
    switch (options.icon) {
      case 'danger':
        return 'red';
      case 'info':
        return 'blue';
      case 'question':
        return 'blue';
      case 'warning':
      default:
        return 'orange';
    }
  };

  modals.openConfirmModal({
    title: options.title,
    centered: true,
    children: hasIcon ? (
      <Group gap="lg" align="flex-start" wrap="nowrap" mb={variant === 'warning' ? 'xl' : 'md'}>
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `var(--mantine-color-${getIconColor()}-1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ThemeIcon
            size={24}
            variant="transparent"
            color={getIconColor()}
          >
            {getIcon()}
          </ThemeIcon>
        </Box>
        <Box style={{ flex: 1, paddingTop: 2 }}>
          <Text size="md" style={{ lineHeight: 1.6, color: 'var(--mantine-color-gray-7)' }}>
            {options.message}
          </Text>
          {options.subMessage && (
            <Text size="sm" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
              {options.subMessage}
            </Text>
          )}
        </Box>
      </Group>
    ) : variant === 'warning' ? (
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Text size="md" style={{ lineHeight: 1.6, color: 'var(--mantine-color-gray-7)' }}>
          {options.message}
        </Text>
        {options.subMessage && (
          <Text size="sm" c="dimmed" mt={12} style={{ lineHeight: 1.5 }}>
            {options.subMessage}
          </Text>
        )}
      </div>
    ) : (
      <Text size="md" style={{ lineHeight: 1.6, color: 'var(--mantine-color-gray-7)' }}>
        {options.message}
      </Text>
    ),
    labels: variant === 'warning' ? {
      confirm: options.cancelText || 'Cancel',
      cancel: options.confirmText || 'Confirm'
    } : { 
      confirm: options.confirmText || 'Confirm', 
      cancel: options.cancelText || 'Cancel' 
    },
    confirmProps: variant === 'warning' ? {
      variant: 'subtle',
      color: 'dark',
      size: 'md',
      radius: 'md',
      fullWidth: true,
      style: {
        fontWeight: 500,
        height: 44,
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--mantine-color-gray-0)',
        }
      }
    } : { 
      color: options.confirmColor || 'red',
      variant: 'filled',
      size: 'md',
      radius: 'md',
      style: {
        fontWeight: 500,
        minWidth: 110,
        height: 38,
      }
    },
    cancelProps: variant === 'warning' ? {
      color: options.confirmColor || 'red',
      variant: 'filled',
      size: 'md',
      radius: 'md',
      fullWidth: true,
      style: {
        fontWeight: 500,
        height: 44,
      }
    } : {
      variant: 'outline',
      color: 'gray',
      size: 'md',
      radius: 'md',
      style: {
        borderWidth: 1.5,
        fontWeight: 500,
        minWidth: 90,
        height: 38,
      }
    },
    onConfirm: variant === 'warning' ? undefined : options.onConfirm,
    onCancel: variant === 'warning' ? options.onConfirm : undefined,
    size: 440,
    radius: 'lg',
    padding: 0,
    styles: {
      root: {
        zIndex: 1000,
      },
      inner: {
        padding: theme.spacing.md,
      },
      content: {
        border: 'none',
        overflow: 'visible',
      },
      header: {
        backgroundColor: 'transparent',
        borderBottom: 'none',
        padding: `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.xs}`,
      },
      title: {
        fontWeight: 600,
        fontSize: 20,
        lineHeight: 1.3,
      },
      close: {
        color: 'var(--mantine-color-blue-6)',
        border: `2px solid var(--mantine-color-blue-6)`,
        borderRadius: '50%',
        width: 32,
        height: 32,
        minWidth: 32,
        minHeight: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        '&:hover': {
          backgroundColor: 'var(--mantine-color-blue-0)',
          borderColor: 'var(--mantine-color-blue-7)',
        },
        svg: {
          width: 16,
          height: 16,
          strokeWidth: 3,
        }
      },
      body: {
        padding: variant === 'warning' 
          ? `${theme.spacing.md} ${theme.spacing.xl} ${theme.spacing.xl}` 
          : `${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.xl}`,
      }
    },
  });
}

// Delete confirmation component with Exit Recipe Creation styling
function DeleteConfirmationModal({ 
  itemName, 
  itemType, 
  onConfirm, 
  onCancel 
}: { 
  itemName: string;
  itemType: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { theme, colorScheme } = useTheme();
  const mantineTheme = useMantineTheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Stack gap="md">
      <Text size="sm">
        Are you sure you want to delete the {itemType.toLowerCase()} '{itemName}'?
      </Text>
      <Text size="sm" c="dimmed">
        This action cannot be undone.
      </Text>
      <Group justify="space-between">
        <Button
          variant="outline"
          onClick={onCancel}
          style={{
            borderColor: isDark
              ? mantineTheme.colors.dark[4]
              : theme.colors.gray[4],
            color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          style={{
            backgroundColor: mantineTheme.colors.red[6],
            "&:hover": {
              backgroundColor: mantineTheme.colors.red[7],
            },
          }}
        >
          Delete {itemType}
        </Button>
      </Group>
    </Stack>
  );
}

// Preset configurations for common actions
export const confirmDelete = (itemName: string, itemType: string = 'item', onConfirm?: () => void | Promise<void>) => {
  let modalId: string;
  
  const handleConfirm = () => {
    modals.close(modalId);
    if (onConfirm) {
      onConfirm();
    }
  };
  
  const handleCancel = () => {
    modals.close(modalId);
  };
  
  modalId = modals.open({
    title: `Delete ${itemType}?`,
    centered: true,
    size: 'sm',
    children: (
      <DeleteConfirmationModal
        itemName={itemName}
        itemType={itemType}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    onClose: handleCancel,
    withCloseButton: true,
    closeOnClickOutside: false,
    closeOnEscape: true,
  });
};

export const confirmRemove = (itemName: string, itemType: string = 'item', onConfirm?: () => void | Promise<void>) => 
  showConfirmation({
    title: `Remove ${itemType}`,
    message: `Are you sure you want to remove '${itemName}'? This action cannot be undone.`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    confirmColor: 'red',
    variant: 'standard',
    onConfirm,
  });

export const confirmNavigation = (
  title: string, 
  message: string, 
  confirmText: string = 'Leave', 
  cancelText: string = 'Stay', 
  onConfirm?: () => void | Promise<void>
) => 
  showConfirmation({
    title,
    message,
    confirmText,
    cancelText,
    confirmColor: 'red',
    icon: 'warning',
    variant: 'warning',
    onConfirm,
  });

export const confirmDataLoss = (
  title: string = 'Leave Recipe Creation?',
  message: string = 'You have unsaved changes in your recipe. Are you sure you want to leave?',
  subMessage?: string,
  onConfirm?: () => void | Promise<void>
) => 
  showConfirmation({
    title,
    message,
    subMessage: subMessage || 'All your progress will be lost.',
    confirmText: 'Leave Without Saving',
    cancelText: 'Continue Editing',
    confirmColor: 'red',
    icon: 'none',
    variant: 'warning',
    onConfirm,
  });

export const confirmAction = (title: string, message: string, confirmText: string = 'Confirm', onConfirm?: () => void | Promise<void>) => 
  showConfirmation({
    title,
    message,
    confirmText,
    cancelText: 'Cancel',
    confirmColor: 'blue',
    variant: 'standard',
    onConfirm,
  });