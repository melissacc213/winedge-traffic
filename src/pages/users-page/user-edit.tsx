import { Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { useUpdateUser } from "@/lib/queries/user";
import type { User } from "@/lib/validator/user";

import { UserForm } from "./user-form";

interface UserEditProps {
  user: User;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserEdit({ user, opened, onClose, onSuccess }: UserEditProps) {
  const { t } = useTranslation(["users"]);
  const updateMutation = useUpdateUser();

  const handleSubmit = async (values: any) => {
    // Only send changed fields
    const updates: any = {};
    if (values.role !== user.role) {
      updates.role = values.role;
    }
    
    await updateMutation.mutateAsync({ 
      data: updates, 
      id: user.id 
    });
    onSuccess?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("users:form.editUser")}
      size="md"
      centered
      withinPortal
    >
      <UserForm
        initialValues={{
          email: user.email,
          role: user.role,
          username: user.username,
        }}
        onSubmit={handleSubmit}
        submitLabel={t("common:action.save")}
        isLoading={updateMutation.isPending}
        isEdit
      />
    </Modal>
  );
}