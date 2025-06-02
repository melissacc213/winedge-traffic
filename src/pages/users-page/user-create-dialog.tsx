import { Modal, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { UserForm } from './user-form';
import { useCreateUser } from '../../lib/queries/user';
import type { CreateUserRequest } from '../../lib/validator/user';

interface UserCreateDialogProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserCreateDialog({ opened, onClose, onSuccess }: UserCreateDialogProps) {
  const { t } = useTranslation(['users']);
  const createUser = useCreateUser();

  const handleSubmit = async (values: CreateUserRequest) => {
    await createUser.mutateAsync(values);
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Title order={4}>{t('users:createDialog.title')}</Title>
          <Text size="sm" c="dimmed" mt={4}>
            {t('users:createDialog.description')}
          </Text>
        </div>
      }
      size="md"
      centered
      withinPortal
    >
      <UserForm 
        onSubmit={handleSubmit} 
        isLoading={createUser.isPending}
        onCancel={onClose}
      />
    </Modal>
  );
}