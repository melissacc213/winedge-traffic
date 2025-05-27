import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Stack,
  Group,
  Title,
  Button,
  Select,
  Switch,
  Text,
  ActionIcon,
  Divider,
  Alert,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconUserCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useUserDetails, useUpdateUser } from '../../lib/queries/user';
import { PageLoader } from '../ui';
import type { UserRole } from '../../lib/validator/user';

export function UserEdit() {
  const { t } = useTranslation(['users', 'common']);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserDetails(Number(userId));
  const updateUser = useUpdateUser();

  const [role, setRole] = useState<UserRole | undefined>();
  const [active, setActive] = useState<boolean | undefined>();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('users:edit.notFound')}
        color="red"
      >
        {t('users:edit.notFoundDescription')}
      </Alert>
    );
  }

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'Admin', label: t('users:roles.admin') },
    { value: 'Operator', label: t('users:roles.operator') },
    { value: 'Viewer', label: t('users:roles.viewer') },
  ];

  const handleSave = async () => {
    const updates: any = {};
    if (role !== undefined && role !== user.role) {
      updates.role = role;
    }
    if (active !== undefined && active !== user.active) {
      updates.active = active;
    }

    if (Object.keys(updates).length > 0) {
      await updateUser.mutateAsync({ id: user.id, data: updates });
      navigate(`/users/${userId}`);
    }
  };

  const hasChanges = 
    (role !== undefined && role !== user.role) ||
    (active !== undefined && active !== user.active);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate(`/users/${userId}`)}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={3}>{t('users:edit.title')}</Title>
        </Group>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSave}
          loading={updateUser.isPending}
          disabled={!hasChanges}
        >
          {t('common:button.save')}
        </Button>
      </Group>

      <Paper withBorder p="lg" radius="md">
        <Stack gap="xl">
          <div>
            <Title order={4} mb="md">
              {t('users:edit.userSettings')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('users:edit.userSettingsDescription', { username: user.username })}
            </Text>
          </div>

          <Divider />

          <Stack gap="lg">
            <Select
              label={t('users:form.role')}
              leftSection={<IconUserCircle size={16} />}
              data={roleOptions}
              value={role ?? user.role}
              onChange={(value) => setRole(value as UserRole)}
              description={t('users:edit.roleDescription')}
            />

            <Switch
              label={t('users:edit.accountStatus')}
              description={t('users:edit.accountStatusDescription')}
              checked={active ?? user.active}
              onChange={(event) => setActive(event.currentTarget.checked)}
              color="green"
              size="md"
            />
          </Stack>

          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('users:edit.warningTitle')}
            color="yellow"
          >
            {t('users:edit.warningMessage')}
          </Alert>
        </Stack>
      </Paper>
    </Stack>
  );
}