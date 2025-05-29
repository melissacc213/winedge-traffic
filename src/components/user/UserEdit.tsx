import { Modal } from "@mantine/core";
import { UserForm } from "./UserForm";
import { useUpdateUser } from "@/lib/queries/user";
import { useTranslation } from "react-i18next";
import type { User } from "@/lib/validator/user";

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
      id: user.id, 
      data: updates 
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
          username: user.username,
          email: user.email,
          role: user.role,
        }}
        onSubmit={handleSubmit}
        submitLabel={t("common:action.save")}
        isLoading={updateMutation.isPending}
        isEdit
      />
    </Modal>
  );
}