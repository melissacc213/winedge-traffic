import { Button, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";
import { PageLayout } from "@/components/page-layout/page-layout";
import { UserCreateDialog } from "@/components/user";
import { UsersTable } from "./users-table";
import { useDisclosure } from "@mantine/hooks";
import { useUsers, useToggleUserStatus } from "@/lib/queries/user";
import { notifications } from "@mantine/notifications";
import { USE_MOCK_DATA } from "@/lib/config/mock-data";

export function UsersPage() {
  const { t } = useTranslation(["users", "common"]);
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const { data, isLoading } = useUsers(undefined, USE_MOCK_DATA.users);
  const toggleStatusMutation = useToggleUserStatus();

  const handleEditUser = (id: string) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDeleteUser = (id: string) => {
    // TODO: Implement delete functionality
    notifications.show({
      title: "Delete User",
      message: "Delete functionality not yet implemented",
      color: "yellow",
    });
  };

  const handleToggleStatus = async (id: string, status: "active" | "disabled") => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: Number(id),
        active: status === "active",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update user status",
        color: "red",
      });
    }
  };

  // Transform the API data to match the table format
  const users = data?.results?.map(user => {
    // Map role from API format to table format
    let role: "admin" | "user" | "viewer" = "viewer";
    if (user.role === "Admin") role = "admin";
    else if (user.role === "Operator") role = "user";
    else if (user.role === "Viewer") role = "viewer";
    
    return {
      id: String(user.id),
      username: user.username,
      email: user.email,
      status: user.active ? "active" as const : "disabled" as const,
      role,
      created: user.created_at,
    };
  }) || [];

  return (
    <>
      <PageLayout
        title={t("users:title")}
        description={t("users:description")}
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            {t("users:form.createUser")}
          </Button>
        }
      >
        <Stack gap="lg">
          <UsersTable
            users={users}
            isLoading={isLoading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
          />
        </Stack>
      </PageLayout>
      
      <UserCreateDialog 
        opened={opened} 
        onClose={close} 
        onSuccess={close}
      />
    </>
  );
}
