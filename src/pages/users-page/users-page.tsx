import { Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UsersTable } from "./users-table";
import { Icons } from "../../components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";

// Mock user data
const MOCK_USERS = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    status: "active",
    role: "admin",
    created: "2025-01-15T00:00:00Z",
  },
  {
    id: "2",
    username: "john.doe",
    email: "john.doe@example.com",
    status: "active",
    role: "user",
    created: "2025-02-10T00:00:00Z",
  },
  {
    id: "3",
    username: "jane.smith",
    email: "jane.smith@example.com",
    status: "active",
    role: "user",
    created: "2025-02-15T00:00:00Z",
  },
  {
    id: "4",
    username: "robert.williams",
    email: "robert.williams@example.com",
    status: "disabled",
    role: "viewer",
    created: "2025-03-01T00:00:00Z",
  },
  {
    id: "5",
    username: "emily.johnson",
    email: "emily.johnson@example.com",
    status: "active",
    role: "user",
    created: "2025-03-12T00:00:00Z",
  },
  {
    id: "6",
    username: "michael.brown",
    email: "michael.brown@example.com",
    status: "disabled",
    role: "viewer",
    created: "2025-03-20T00:00:00Z",
  },
] as User[];

export interface User {
  id: string;
  username: string;
  email: string;
  status: "active" | "disabled";
  role: "admin" | "user" | "viewer";
  created: string;
}

export function UsersPage() {
  const { t } = useTranslation(["components", "common"]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 500);
  }, []);

  const handleDeleteUser = (id: string) => {
    console.log(`Delete user with ID: ${id}`);
  };

  const handleEditUser = (id: string) => {
    console.log(`Edit user with ID: ${id}`);
  };

  const handleToggleUserStatus = (
    id: string,
    newStatus: "active" | "disabled"
  ) => {
    console.log(`Toggle user ${id} to status: ${newStatus}`);
  };

  return (
    <PageLayout
      title={t("components:users.title")}
      description={t("components:users.description")}
      actions={
        <Button leftSection={<Icons.Plus size={16} />}>
          {t("components:users.create")}
        </Button>
      }
    >
      <UsersTable
        users={users}
        isLoading={loading}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
      />
    </PageLayout>
  );
}
