import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  Progress,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { DataTable } from "@/components/ui";
import { confirmDelete } from "@/lib/confirmation";
import {
  useDeleteUser,
  useToggleUserStatus,
  useUsers,
} from "@/lib/queries/user";
import { highlightSearchTerm } from "@/lib/utils";
import type { User } from "@/lib/validator/user";

import { UserCreateDialog } from "./user-create-dialog";
import { UserEdit } from "./user-edit";

export function UsersPage() {
  const { t } = useTranslation(["users", "common"]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [
    relationshipModalOpened,
    { close: closeRelationshipModal },
  ] = useDisclosure(false);
  const [selectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("tasks");
  const { data, isLoading } = useUsers();
  const toggleStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };


  // Mock data for user relationships - in a real app this would come from API
  const getUserRelationships = (user: User) => {
    return {
      activity: [
        {
          description: "Created traffic analysis task",
          timestamp: "2024-12-26T10:30:00Z",
          type: "task_created",
        },
        {
          description: "Updated Highway Traffic Monitor recipe",
          timestamp: "2024-12-25T14:15:00Z",
          type: "recipe_updated",
        },
        {
          description: "Logged into system",
          timestamp: "2024-12-25T09:00:00Z",
          type: "login",
        },
        {
          description: "Completed Vehicle Count task",
          timestamp: "2024-12-24T16:45:00Z",
          type: "task_completed",
        },
      ],
      permissions: [
        { action: "create", granted: true, resource: "tasks" },
        { action: "edit", granted: true, resource: "tasks" },
        { action: "delete", granted: user.role === "admin", resource: "tasks" },
        { action: "create", granted: true, resource: "recipes" },
        { action: "edit", granted: true, resource: "recipes" },
        {
          action: "delete",
          granted: user.role === "admin",
          resource: "recipes",
        },
        { action: "manage", granted: user.role === "admin", resource: "users" },
        {
          action: "manage",
          granted: user.role === "admin",
          resource: "licenses",
        },
      ],
      recipes: [
        {
          id: "1",
          lastUsed: "2024-12-25",
          name: "Highway Traffic Monitor",
          status: "active",
          usage: 24,
        },
        {
          id: "2",
          lastUsed: "2024-12-24",
          name: "City Center Detection",
          status: "active",
          usage: 12,
        },
      ],
      tasks: [
        {
          createdAt: "2024-12-20",
          id: "1",
          name: "Traffic Analysis - Main Street",
          progress: 100,
          status: "completed",
        },
        {
          createdAt: "2024-12-25",
          id: "2",
          name: "Vehicle Count - Highway A1",
          progress: 75,
          status: "running",
        },
        {
          createdAt: "2024-12-26",
          id: "3",
          name: "Speed Detection - Zone B",
          progress: 0,
          status: "pending",
        },
      ],
    };
  };

  const handleDeleteUser = (user: User) => {
    confirmDelete(user.username, t("users:common.user"), async () => {
      try {
        await deleteUserMutation.mutateAsync(user.id);
        notifications.show({
          color: "green",
          message: t("users:notifications.deleteSuccessMessage"),
          title: t("users:notifications.deleteSuccess"),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          message: t("users:notifications.deleteError"),
          title: t("common:error"),
        });
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = !(user.is_active ?? user.active ?? true);
    try {
      await toggleStatusMutation.mutateAsync({
        active: newStatus,
        id: user.id,
      });
      notifications.show({
        color: "green",
        message: newStatus
          ? t("users:notifications.userEnabled")
          : t("users:notifications.userDisabled"),
        title: t("users:notifications.statusUpdated"),
      });
    } catch (error) {
      notifications.show({
        color: "red",
        message: t("users:notifications.statusUpdateError"),
        title: t("common:error"),
      });
    }
  };

  const columns = [
    {
      key: "username",
      label: t("users:table.username"),
      render: (user: User, globalFilter?: string) => {
        if (globalFilter) {
          return (
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {highlightSearchTerm(user.username, globalFilter)}
            </div>
          );
        }
        return <Text fw={500} size="sm">{user.username}</Text>;
      },
    },
    {
      key: "email",
      label: t("users:table.email"),
      render: (user: User, globalFilter?: string) => {
        if (globalFilter) {
          return (
            <div style={{ color: 'var(--mantine-color-dimmed)', fontSize: '14px' }}>
              {highlightSearchTerm(user.email, globalFilter)}
            </div>
          );
        }
        return <Text size="sm" c="dimmed">{user.email}</Text>;
      },
    },
    {
      key: "role",
      label: t("users:table.role"),
      render: (user: User) => (
        <Badge variant="light" color={user.role === "admin" ? "blue" : "gray"} size="md">
          {t(`users:role.${user.role}`)}
        </Badge>
      ),
      width: 120,
    },
    {
      key: "status",
      label: t("users:table.status"),
      render: (user: User) => {
        const isActive = user.is_active ?? user.active ?? true;
        return (
          <Badge variant="light" color={isActive ? "green" : "red"} size="md">
            {isActive ? t("users:status.active") : t("users:status.disabled")}
          </Badge>
        );
      },
      width: 100,
    },
    {
      key: "date_joined",
      label: t("users:table.created"),
      render: (user: User) => {
        const date = user.date_joined || user.created_at;
        return <Text size="sm">{date ? new Date(date).toLocaleDateString() : "—"}</Text>;
      },
      width: 120,
    },
    {
      key: "last_login",
      label: t("users:table.lastLogin"),
      render: (user: User) => {
        if (!user.last_login) return <Text size="sm" c="dimmed">—</Text>;
        return <Text size="sm">{new Date(user.last_login).toLocaleDateString()}</Text>;
      },
      width: 120,
    },
  ];

  const actions = (user: User) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <Icons.Dots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {/* <Menu.Item
          leftSection={<Icons.Eye size={16} />}
          onClick={() => handleViewRelationships(user)}
        >
          {t("users:action.viewRelationships")}
        </Menu.Item> */}
        <Menu.Item
          leftSection={<Icons.Edit size={16} />}
          onClick={() => handleEditUser(user)}
        >
          {t("common:action.edit")}
        </Menu.Item>
        <Menu.Item
          leftSection={
            (user.is_active ?? user.active ?? true) ? (
              <Icons.UserOff size={16} />
            ) : (
              <Icons.UserCheck size={16} />
            )
          }
          onClick={() => handleToggleStatus(user)}
        >
          {(user.is_active ?? user.active ?? true)
            ? t("users:action.disable")
            : t("users:action.enable")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => handleDeleteUser(user)}
        >
          {t("common:action.delete")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <PageLayout
        title={t("users:title")}
        description={t("users:description")}
        actions={
          <Button 
            leftSection={<Icons.Plus size={16} />} 
            onClick={open}
            color="blue"
          >
            {t("users:form.createUser")}
          </Button>
        }
      >
        <Stack gap="lg">
          <DataTable
            data={data?.results || []}
            columns={columns}
            loading={isLoading}
            actions={actions}
            height={700}
            emptyMessage={t("users:noUsers")}
            showPagination={true}
            pageSize={10}
            enableGlobalFilter={true}
          />
        </Stack>
      </PageLayout>

      <UserCreateDialog opened={opened} onClose={close} onSuccess={close} />

      {editingUser && (
        <UserEdit
          user={editingUser}
          opened={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => setEditingUser(null)}
        />
      )}

      {/* User Relationships Modal */}
      <Modal
        opened={relationshipModalOpened}
        onClose={closeRelationshipModal}
        title={
          selectedUser
            ? `${selectedUser.username} - Relationships`
            : "User Relationships"
        }
        size="xl"
        centered
        scrollAreaComponent={undefined}
      >
        {selectedUser && (
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="tasks" leftSection={<Icons.Play size={16} />}>
                Tasks
              </Tabs.Tab>
              <Tabs.Tab value="recipes" leftSection={<Icons.Book size={16} />}>
                Recipes
              </Tabs.Tab>
              <Tabs.Tab
                value="activity"
                leftSection={<Icons.Clock size={16} />}
              >
                Activity
              </Tabs.Tab>
              <Tabs.Tab
                value="permissions"
                leftSection={<Icons.Shield size={16} />}
              >
                Permissions
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="tasks" pt="md">
              <Stack gap="md">
                {getUserRelationships(selectedUser).tasks.map((task) => (
                  <Card key={task.id} p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{task.name}</Text>
                      <Badge
                        variant="light"
                        color={
                          task.status === "completed"
                            ? "green"
                            : task.status === "running"
                              ? "blue"
                              : task.status === "pending"
                                ? "yellow"
                                : "gray"
                        }
                      >
                        {task.status}
                      </Badge>
                    </Group>
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </Text>
                      <Group gap="xs">
                        <Text size="sm">Progress:</Text>
                        <Progress value={task.progress} w={100} size="sm" />
                        <Text size="sm">{task.progress}%</Text>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="recipes" pt="md">
              <Stack gap="md">
                {getUserRelationships(selectedUser).recipes.map((recipe) => (
                  <Card key={recipe.id} p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{recipe.name}</Text>
                      <Badge
                        variant="light"
                        color={recipe.status === "active" ? "green" : "gray"}
                      >
                        {recipe.status}
                      </Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Used {recipe.usage} times
                      </Text>
                      <Text size="sm" c="dimmed">
                        Last used:{" "}
                        {new Date(recipe.lastUsed).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="activity" pt="md">
              <Stack gap="md">
                {getUserRelationships(selectedUser).activity.map(
                  (activity, index) => (
                    <Card key={index} p="md" withBorder>
                      <Group gap="md">
                        <Icons.Clock size={16} />
                        <Box style={{ flex: 1 }}>
                          <Text fw={500}>{activity.description}</Text>
                          <Text size="sm" c="dimmed">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Text>
                        </Box>
                        <Badge variant="light" size="sm">
                          {activity.type.replace("_", " ")}
                        </Badge>
                      </Group>
                    </Card>
                  )
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="permissions" pt="md">
              <Stack gap="md">
                {getUserRelationships(selectedUser).permissions.map(
                  (permission, index) => (
                    <Card key={index} p="md" withBorder>
                      <Group justify="space-between" align="center">
                        <Group gap="md">
                          <Icons.Shield size={16} />
                          <Box>
                            <Text fw={500}>{permission.resource}</Text>
                            <Text size="sm" c="dimmed">
                              {permission.action}
                            </Text>
                          </Box>
                        </Group>
                        <Badge
                          variant="light"
                          color={permission.granted ? "green" : "red"}
                        >
                          {permission.granted ? "Granted" : "Denied"}
                        </Badge>
                      </Group>
                    </Card>
                  )
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>
    </>
  );
}