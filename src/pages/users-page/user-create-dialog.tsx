import { Modal, Text,Title, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useCreateUser } from '../../lib/queries/user';
import type { CreateUserRequest } from '../../lib/validator/user';
import { UserForm } from './user-form';

interface UserCreateDialogProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserCreateDialog({ opened, onClose, onSuccess }: UserCreateDialogProps) {
  const { t } = useTranslation(['users']);
  const createUser = useCreateUser();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

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
      styles={{
        content: {
          backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[9] : theme.white,
        },
        header: {
          backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[9] : theme.white,
        },
      }}
    >
      <UserForm 
        onSubmit={handleSubmit} 
        isLoading={createUser.isPending}
        onCancel={onClose}
      />
    </Modal>
  );
}