import { Button, Group, Modal, useComputedColorScheme,useMantineTheme } from "@mantine/core";

import { useModals } from "../lib/modal";

export function ModalProvider() {
  const { confirmModal, isOpen, handleConfirm, handleCancel } = useModals();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

  if (!confirmModal || !isOpen) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      title={confirmModal.title}
      centered
      styles={{
        content: {
          backgroundColor: isDark ? theme.colors.gray[9] : theme.white,
        },
        header: {
          backgroundColor: isDark ? theme.colors.gray[9] : theme.white,
        },
      }}
    >
      <div>{confirmModal.children}</div>
      <Group justify="right" mt="md">
        <Button variant="default" onClick={handleCancel}>
          {confirmModal.labels.cancel}
        </Button>
        <Button
          color={confirmModal.confirmProps?.color || "blue"}
          onClick={handleConfirm}
        >
          {confirmModal.labels.confirm}
        </Button>
      </Group>
    </Modal>
  );
}
