import { useCallback } from "react";
import { create } from "zustand";

// Types for modals
interface ConfirmModalProps {
  title: string;
  children: React.ReactNode;
  labels: {
    confirm: string;
    cancel: string;
  };
  confirmProps?: {
    color?: string;
    variant?: string;
    size?: string;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    autoContrast?: boolean;
    gradient?: { from: string; to: string; deg?: number };
    radius?: string | number;
    [key: string]: unknown;
  };
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ModalsState {
  confirmModal: ConfirmModalProps | null;
  isOpen: boolean;
  openConfirmModal: (props: ConfirmModalProps) => void;
  closeModal: () => void;
}

// Create a Zustand store for modals
export const useModalsStore = create<ModalsState>((set) => ({
  closeModal: () => set({ confirmModal: null, isOpen: false }),
  confirmModal: null,
  isOpen: false,
  openConfirmModal: (props) => set({ confirmModal: props, isOpen: true }),
}));

// Export a modals object that mimics @mantine/modals API
export const modals = {
  closeAll: () => {
    useModalsStore.getState().closeModal();
  },
  openConfirmModal: (props: ConfirmModalProps) => {
    useModalsStore.getState().openConfirmModal(props);
  },
};

// Hook to use modals in components
export function useModals() {
  const { confirmModal, isOpen, closeModal } = useModalsStore();

  const handleConfirm = useCallback(() => {
    if (confirmModal?.onConfirm) {
      confirmModal.onConfirm();
    }
    closeModal();
  }, [confirmModal, closeModal]);

  const handleCancel = useCallback(() => {
    if (confirmModal?.onCancel) {
      confirmModal.onCancel();
    }
    closeModal();
  }, [confirmModal, closeModal]);

  return {
    closeModal,
    confirmModal,
    handleCancel,
    handleConfirm,
    isOpen,
  };
}
