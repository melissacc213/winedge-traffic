import { useState } from 'react';
import {
  Table,
  ScrollArea,
  Badge,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Switch,
  Menu,
  Pagination,
  Box,
} from '@mantine/core';
import {
  IconEdit,
  IconEye,
  IconDots,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUsers, useToggleUserStatus } from '../../lib/queries/user';
import { TableSkeleton } from '../ui';
import type { User, UserRole } from '../../lib/validator/user';

interface UserListProps {
  onEditUser?: (user: User) => void;
}

export function UserList({ onEditUser }: UserListProps) {
  const { t } = useTranslation(['users', 'common']);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const { data, isLoading } = useUsers({ page, size });
  const toggleStatusMutation = useToggleUserStatus();

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

  const handleToggleStatus = async (user: User) => {
    await toggleStatusMutation.mutateAsync({
      id: user.id,
      active: !user.active,
    });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  const users = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / size) : 0;

  return (
    <Box>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('users:table.username')}</Table.Th>
              <Table.Th>{t('users:table.email')}</Table.Th>
              <Table.Th>{t('users:table.role')}</Table.Th>
              <Table.Th>{t('users:table.status')}</Table.Th>
              <Table.Th>{t('users:table.createdAt')}</Table.Th>
              <Table.Th>{t('users:table.lastLogin')}</Table.Th>
              <Table.Th align="right">{t('users:table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Text fw={500}>{user.username}</Text>
                </Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Badge color={getRoleBadgeColor(user.role)} variant="filled">
                    {t(`users:roles.${user.role.toLowerCase()}`)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Switch
                    checked={user.active}
                    onChange={() => handleToggleStatus(user)}
                    color="green"
                    size="sm"
                    label={
                      user.active
                        ? t('users:status.active')
                        : t('users:status.inactive')
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : t('users:table.neverLoggedIn')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label={t('common:button.view')}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('common:button.edit')}>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => onEditUser?.(user)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={
                            user.active ? (
                              <IconUserX size={14} />
                            ) : (
                              <IconUserCheck size={14} />
                            )
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.active
                            ? t('users:actions.deactivate')
                            : t('users:actions.activate')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            boundaries={1}
            siblings={1}
          />
        </Group>
      )}
    </Box>
  );
}