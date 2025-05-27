import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Divider,
  Box,
  Grid,
  Card,
  ActionIcon,
  Timeline,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconUser,
  IconMail,
  IconUserCircle,
  IconCalendar,
  IconClock,
  IconLogin,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useUserDetails } from '../../lib/queries/user';
import { PageLoader } from '../ui';
import type { UserRole } from '../../lib/validator/user';

export function UserDetailView() {
  const { t } = useTranslation(['users', 'common']);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserDetails(Number(userId));

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Card withBorder p="xl">
        <Text ta="center" c="dimmed">
          {t('users:detail.notFound')}
        </Text>
      </Card>
    );
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'red';
      case 'Operator':
        return 'blue';
      case 'Viewer':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <ActionIcon variant="subtle" onClick={() => navigate('/users')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={3}>{t('users:detail.title')}</Title>
        </Group>
        <Button
          leftSection={<IconEdit size={16} />}
          onClick={() => navigate(`/users/${userId}/edit`)}
        >
          {t('common:button.edit')}
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Stack gap="lg">
              <Group justify="space-between">
                <Title order={4}>{t('users:detail.userInfo')}</Title>
                <Badge
                  color={user.active ? 'green' : 'red'}
                  variant="filled"
                  size="lg"
                >
                  {user.active
                    ? t('users:status.active')
                    : t('users:status.inactive')}
                </Badge>
              </Group>

              <Divider />

              <Grid>
                <Grid.Col span={6}>
                  <Group gap="xs">
                    <IconUser size={16} color="gray" />
                    <Text size="sm" c="dimmed">
                      {t('users:detail.username')}
                    </Text>
                  </Group>
                  <Text fw={500} mt={4}>
                    {user.username}
                  </Text>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Group gap="xs">
                    <IconMail size={16} color="gray" />
                    <Text size="sm" c="dimmed">
                      {t('users:detail.email')}
                    </Text>
                  </Group>
                  <Text fw={500} mt={4}>
                    {user.email}
                  </Text>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Group gap="xs">
                    <IconUserCircle size={16} color="gray" />
                    <Text size="sm" c="dimmed">
                      {t('users:detail.role')}
                    </Text>
                  </Group>
                  <Badge
                    color={getRoleBadgeColor(user.role)}
                    variant="filled"
                    mt={4}
                  >
                    {t(`users:roles.${user.role.toLowerCase()}`)}
                  </Badge>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Group gap="xs">
                    <IconCalendar size={16} color="gray" />
                    <Text size="sm" c="dimmed">
                      {t('users:detail.createdAt')}
                    </Text>
                  </Group>
                  <Text fw={500} mt={4}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={5} mb="md">
              {t('users:detail.activity')}
            </Title>
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconLogin size={12} />}
                title={t('users:detail.lastLogin')}
              >
                <Text size="sm" c="dimmed">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : t('users:table.neverLoggedIn')}
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconClock size={12} />}
                title={t('users:detail.lastUpdated')}
              >
                <Text size="sm" c="dimmed">
                  {new Date(user.updated_at).toLocaleString()}
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconCalendar size={12} />}
                title={t('users:detail.accountCreated')}
              >
                <Text size="sm" c="dimmed">
                  {new Date(user.created_at).toLocaleString()}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}