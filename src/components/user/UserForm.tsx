import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Button,
  Group,
  Paper,
  Text,
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconLock,
  IconUserCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CreateUserRequest, UserRole } from '../../lib/validator/user';
import { createUserSchema } from '../../lib/validator/user';

interface UserFormProps {
  onSubmit: (values: CreateUserRequest) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function UserForm({ onSubmit, isLoading, onCancel }: UserFormProps) {
  const { t } = useTranslation(['users', 'common']);

  const form = useForm<CreateUserRequest>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      password2: '',
      role: 'Viewer',
    },
    validate: zodResolver(createUserSchema),
  });

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'Admin', label: t('users:roles.admin') },
    { value: 'Operator', label: t('users:roles.operator') },
    { value: 'Viewer', label: t('users:roles.viewer') },
  ];

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label={t('users:form.username')}
          placeholder={t('users:form.usernamePlaceholder')}
          leftSection={<IconUser size={16} />}
          required
          {...form.getInputProps('username')}
        />

        <TextInput
          label={t('users:form.email')}
          placeholder={t('users:form.emailPlaceholder')}
          type="email"
          leftSection={<IconMail size={16} />}
          required
          {...form.getInputProps('email')}
        />

        <PasswordInput
          label={t('users:form.password')}
          placeholder={t('users:form.passwordPlaceholder')}
          leftSection={<IconLock size={16} />}
          required
          {...form.getInputProps('password')}
        />

        <PasswordInput
          label={t('users:form.confirmPassword')}
          placeholder={t('users:form.confirmPasswordPlaceholder')}
          leftSection={<IconLock size={16} />}
          required
          {...form.getInputProps('password2')}
        />

        <Select
          label={t('users:form.role')}
          placeholder={t('users:form.rolePlaceholder')}
          leftSection={<IconUserCircle size={16} />}
          data={roleOptions}
          required
          {...form.getInputProps('role')}
        />

        <Group justify="flex-end" mt="xl">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
              {t('common:button.cancel')}
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            {t('users:form.createUser')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}