import { useForm, zodResolver } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Button,
  Group,
} from '@mantine/core';
import { Icons } from '@/components/icons';
import { useTranslation } from 'react-i18next';
import type { CreateUserRequest, UserRole } from '../../lib/validator/user';
import { createUserSchema } from '../../lib/validator/user';

interface UserFormProps {
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  isEdit?: boolean;
  initialValues?: Partial<CreateUserRequest & { username: string; email: string }>;
}

export function UserForm({ 
  onSubmit, 
  isLoading, 
  onCancel, 
  submitLabel,
  isEdit = false,
  initialValues 
}: UserFormProps) {
  const { t } = useTranslation(['users', 'common']);

  const form = useForm<CreateUserRequest>({
    initialValues: {
      username: initialValues?.username || '',
      email: initialValues?.email || '',
      password: '',
      password2: '',
      role: initialValues?.role || 'Operator',
    },
    validate: isEdit ? undefined : zodResolver(createUserSchema),
  });

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: t('users:role.admin') },
    { value: 'Operator', label: t('users:role.Operator') },
  ];

  const handleSubmit = (values: CreateUserRequest) => {
    if (isEdit) {
      // For edit, only pass the fields that can be changed
      onSubmit({ role: values.role });
    } else {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label={t('users:form.username')}
          placeholder={t('users:form.usernamePlaceholder')}
          leftSection={<Icons.User size={16} />}
          required={!isEdit}
          disabled={isEdit}
          {...form.getInputProps('username')}
        />

        <TextInput
          label={t('users:form.email')}
          placeholder={t('users:form.emailPlaceholder')}
          type="email"
          leftSection={<Icons.Mail size={16} />}
          required={!isEdit}
          disabled={isEdit}
          {...form.getInputProps('email')}
        />

        {!isEdit && (
          <>
            <PasswordInput
              label={t('users:form.password')}
              placeholder={t('users:form.passwordPlaceholder')}
              leftSection={<Icons.Lock size={16} />}
              required
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label={t('users:form.confirmPassword')}
              placeholder={t('users:form.confirmPasswordPlaceholder')}
              leftSection={<Icons.Lock size={16} />}
              required
              {...form.getInputProps('password2')}
            />
          </>
        )}

        <Select
          label={t('users:form.role')}
          placeholder={t('users:form.rolePlaceholder')}
          leftSection={<Icons.UserCircle size={16} />}
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
            {submitLabel || t('users:form.createUser')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}