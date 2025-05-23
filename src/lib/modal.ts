import { useState, useCallback } from 'react';
import { create } from 'zustand';

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
    [key: string]: any;
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
  confirmModal: null,
  isOpen: false,
  openConfirmModal: (props) => set({ confirmModal: props, isOpen: true }),
  closeModal: () => set({ isOpen: false, confirmModal: null }),
}));

// Export a modals object that mimics @mantine/modals API
export const modals = {
  openConfirmModal: (props: ConfirmModalProps) => {
    useModalsStore.getState().openConfirmModal(props);
  },
  closeAll: () => {
    useModalsStore.getState().closeModal();
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
    confirmModal,
    isOpen,
    closeModal,
    handleConfirm,
    handleCancel,
  };
}