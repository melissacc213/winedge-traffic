import { useState } from "react";
import {
  Button,
  Stack,
  Menu,
  ActionIcon,
  Badge,
  Group,
  Text,
  Modal,
  Tabs,
  Card,
  Progress,
  Box,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { UserCreateDialog } from "./user-create-dialog";
import { UserEdit } from "./user-edit";
import { DataTable } from "@/components/ui";
import { useDisclosure } from "@mantine/hooks";
import { highlightSearchTerm } from "@/lib/utils";
import {
  useUsers,
  useToggleUserStatus,
  useDeleteUser,
} from "@/lib/queries/user";
import { notifications } from "@mantine/notifications";
import { confirmDelete } from "@/lib/confirmation";
import type { User } from "@/lib/validator/user";

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
      tasks: [
        {
          id: "1",
          name: "Traffic Analysis - Main Street",
          status: "completed",
          createdAt: "2024-12-20",
          progress: 100,
        },
        {
          id: "2",
          name: "Vehicle Count - Highway A1",
          status: "running",
          createdAt: "2024-12-25",
          progress: 75,
        },
        {
          id: "3",
          name: "Speed Detection - Zone B",
          status: "pending",
          createdAt: "2024-12-26",
          progress: 0,
        },
      ],
      recipes: [
        {
          id: "1",
          name: "Highway Traffic Monitor",
          status: "active",
          usage: 24,
          lastUsed: "2024-12-25",
        },
        {
          id: "2",
          name: "City Center Detection",
          status: "active",
          usage: 12,
          lastUsed: "2024-12-24",
        },
      ],
      activity: [
        {
          type: "task_created",
          description: "Created traffic analysis task",
          timestamp: "2024-12-26T10:30:00Z",
        },
        {
          type: "recipe_updated",
          description: "Updated Highway Traffic Monitor recipe",
          timestamp: "2024-12-25T14:15:00Z",
        },
        {
          type: "login",
          description: "Logged into system",
          timestamp: "2024-12-25T09:00:00Z",
        },
        {
          type: "task_completed",
          description: "Completed Vehicle Count task",
          timestamp: "2024-12-24T16:45:00Z",
        },
      ],
      permissions: [
        { resource: "tasks", action: "create", granted: true },
        { resource: "tasks", action: "edit", granted: true },
        { resource: "tasks", action: "delete", granted: user.role === "admin" },
        { resource: "recipes", action: "create", granted: true },
        { resource: "recipes", action: "edit", granted: true },
        {
          resource: "recipes",
          action: "delete",
          granted: user.role === "admin",
        },
        { resource: "users", action: "manage", granted: user.role === "admin" },
        {
          resource: "licenses",
          action: "manage",
          granted: user.role === "admin",
        },
      ],
    };
  };

  const handleDeleteUser = (user: User) => {
    confirmDelete(user.username, t("users:common.user"), async () => {
      try {
        await deleteUserMutation.mutateAsync(user.id);
        notifications.show({
          title: t("users:notifications.deleteSuccess"),
          message: t("users:notifications.deleteSuccessMessage"),
          color: "green",
        });
      } catch (error) {
        notifications.show({
          title: t("common:error"),
          message: t("users:notifications.deleteError"),
          color: "red",
        });
      }
    });
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = !(user.is_active ?? user.active ?? true);
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        active: newStatus,
      });
      notifications.show({
        title: t("users:notifications.statusUpdated"),
        message: newStatus
          ? t("users:notifications.userEnabled")
          : t("users:notifications.userDisabled"),
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: t("common:error"),
        message: t("users:notifications.statusUpdateError"),
        color: "red",
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
            <div style={{ fontWeight: 500, fontSize: '14px' }}>
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
            <div style={{ fontSize: '14px', color: 'var(--mantine-color-dimmed)' }}>
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
      width: 120,
      render: (user: User) => (
        <Badge variant="light" color={user.role === "admin" ? "blue" : "gray"} size="md">
          {t(`users:role.${user.role}`)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: t("users:table.status"),
      width: 100,
      render: (user: User) => {
        const isActive = user.is_active ?? user.active ?? true;
        return (
          <Badge variant="light" color={isActive ? "green" : "red"} size="md">
            {isActive ? t("users:status.active") : t("users:status.disabled")}
          </Badge>
        );
      },
    },
    {
      key: "date_joined",
      label: t("users:table.created"),
      width: 120,
      render: (user: User) => {
        const date = user.date_joined || user.created_at;
        return <Text size="sm">{date ? new Date(date).toLocaleDateString() : "—"}</Text>;
      },
    },
    {
      key: "last_login",
      label: t("users:table.lastLogin"),
      width: 120,
      render: (user: User) => {
        if (!user.last_login) return <Text size="sm" c="dimmed">—</Text>;
        return <Text size="sm">{new Date(user.last_login).toLocaleDateString()}</Text>;
      },
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