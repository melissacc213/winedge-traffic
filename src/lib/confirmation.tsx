import { Box, Button,Group, Stack, Text, ThemeIcon, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { modals } from '@mantine/modals';
import React from 'react';

import { Icons } from '@/components/icons';
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
    cancelProps: variant === 'warning' ? {
      color: options.confirmColor || 'red',
      fullWidth: true,
      radius: 'md',
      size: 'md',
      style: {
        fontWeight: 500,
        height: 44,
      },
      variant: 'filled'
    } : {
      color: 'gray',
      radius: 'md',
      size: 'md',
      style: {
        borderWidth: 1.5,
        fontWeight: 500,
        height: 38,
        minWidth: 90,
      },
      variant: 'outline'
    },
    centered: true,
    children: hasIcon ? (
      <Group gap="lg" align="flex-start" wrap="nowrap" mb={variant === 'warning' ? 'xl' : 'md'}>
        <Box
          style={{
            alignItems: 'center',
            backgroundColor: `var(--mantine-color-${getIconColor()}-1)`,
            borderRadius: '50%',
            display: 'flex',
            flexShrink: 0,
            height: 40,
            justifyContent: 'center',
            width: 40,
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
          <Text size="md" style={{ color: 'var(--mantine-color-gray-7)', lineHeight: 1.6 }}>
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
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Text size="md" style={{ color: 'var(--mantine-color-gray-7)', lineHeight: 1.6 }}>
          {options.message}
        </Text>
        {options.subMessage && (
          <Text size="sm" c="dimmed" mt={12} style={{ lineHeight: 1.5 }}>
            {options.subMessage}
          </Text>
        )}
      </div>
    ) : (
      <Text size="md" style={{ color: 'var(--mantine-color-gray-7)', lineHeight: 1.6 }}>
        {options.message}
      </Text>
    ),
    confirmProps: variant === 'warning' ? {
      color: 'dark',
      fullWidth: true,
      radius: 'md',
      size: 'md',
      style: {
        '&:hover': {
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
        backgroundColor: 'transparent',
        fontWeight: 500,
        height: 44
      },
      variant: 'subtle'
    } : { 
      color: options.confirmColor || 'red',
      radius: 'md',
      size: 'md',
      style: {
        fontWeight: 500,
        height: 38,
        minWidth: 110,
      },
      variant: 'filled'
    },
    labels: variant === 'warning' ? {
      cancel: options.confirmText || 'Confirm',
      confirm: options.cancelText || 'Cancel'
    } : { 
      cancel: options.cancelText || 'Cancel', 
      confirm: options.confirmText || 'Confirm' 
    },
    onCancel: variant === 'warning' ? options.onConfirm : undefined,
    onConfirm: variant === 'warning' ? undefined : options.onConfirm,
    padding: 0,
    radius: 'lg',
    size: 440,
    styles: {
      body: {
        padding: variant === 'warning' 
          ? `${theme.spacing.md} ${theme.spacing.xl} ${theme.spacing.xl}` 
          : `${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.xl}`,
      },
      close: {
        '&:hover': {
          backgroundColor: 'var(--mantine-color-blue-0)',
          borderColor: 'var(--mantine-color-blue-7)',
        },
        alignItems: 'center',
        border: `2px solid var(--mantine-color-blue-6)`,
        borderRadius: '50%',
        color: 'var(--mantine-color-blue-6)',
        display: 'flex',
        height: 32,
        justifyContent: 'center',
        minHeight: 32,
        minWidth: 32,
        padding: 0,
        svg: {
          height: 16,
          strokeWidth: 3,
          width: 16,
        },
        width: 32
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
      inner: {
        padding: theme.spacing.md,
      },
      root: {
        zIndex: 1000,
      },
      title: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.3,
      }
    },
    title: options.title,
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
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';
  
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
              ? theme.colors.dark[4]
              : theme.colors.gray[4],
            color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          style={{
            "&:hover": {
              backgroundColor: theme.colors.red[7],
            },
            backgroundColor: theme.colors.red[6],
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
    centered: true,
    children: (
      <DeleteConfirmationModal
        itemName={itemName}
        itemType={itemType}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    closeOnClickOutside: false,
    closeOnEscape: true,
    onClose: handleCancel,
    size: 'sm',
    title: `Delete ${itemType}?`,
    withCloseButton: true,
  });
};

export const confirmRemove = (itemName: string, itemType: string = 'item', onConfirm?: () => void | Promise<void>) => 
  showConfirmation({
    cancelText: 'Cancel',
    confirmColor: 'red',
    confirmText: 'Remove',
    message: `Are you sure you want to remove '${itemName}'? This action cannot be undone.`,
    onConfirm,
    title: `Remove ${itemType}`,
    variant: 'standard',
  });

export const confirmNavigation = (
  title: string, 
  message: string, 
  confirmText: string = 'Leave', 
  cancelText: string = 'Stay', 
  onConfirm?: () => void | Promise<void>
) => 
  showConfirmation({
    cancelText,
    confirmColor: 'red',
    confirmText,
    icon: 'warning',
    message,
    onConfirm,
    title,
    variant: 'warning',
  });

export const confirmDataLoss = (
  title: string = 'Leave Recipe Creation?',
  message: string = 'You have unsaved changes in your recipe. Are you sure you want to leave?',
  subMessage?: string,
  onConfirm?: () => void | Promise<void>
) => 
  showConfirmation({
    cancelText: 'Continue Editing',
    confirmColor: 'red',
    confirmText: 'Leave Without Saving',
    icon: 'none',
    message,
    onConfirm,
    subMessage: subMessage || 'All your progress will be lost.',
    title,
    variant: 'warning',
  });

export const confirmAction = (title: string, message: string, confirmText: string = 'Confirm', onConfirm?: () => void | Promise<void>) => 
  showConfirmation({
    cancelText: 'Cancel',
    confirmColor: 'blue',
    confirmText,
    message,
    onConfirm,
    title,
    variant: 'standard',
  });