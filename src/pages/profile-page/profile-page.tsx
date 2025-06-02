import {
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Icons } from "@/components/icons";
import { PageLayout } from "@/components/page-layout/page-layout";
import { PageLoader } from "@/components/ui";
import { useLogout } from "@/lib/queries/auth";
import { useSelf } from "@/lib/queries/user";
import { formatDistanceToNow } from "@/lib/utils";
import type { Self } from "@/lib/validator/user";

interface ProfileEditModalProps {
  user: Self;
  opened: boolean;
  onClose: () => void;
}

function ProfileEditModal(_props: ProfileEditModalProps) {
  // Placeholder for future edit functionality - will be implemented later
  return null;
}

export function ProfilePage() {
  const { t } = useTranslation(["users", "common"]);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const colorScheme = computedColorScheme;
  
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Get current user data
  const { data: user, isLoading, error, refetch } = useSelf();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    modals.openConfirmModal({
      children: (
        <Text size="sm">
          {t("auth:logout.confirmation")}
        </Text>
      ),
      confirmProps: { color: "red" },
      labels: { cancel: t("common:actions.cancel"), confirm: t("common:actions.logout") },
      onConfirm: () => {
        logout(undefined, {
          onSuccess: () => {
            notifications.show({
              color: "green",
              message: t("auth:logout.successMessage"),
              title: t("auth:logout.success"),
            });
            navigate("/login");
          },
        });
      },
      title: t("auth:logout.title"),
    });
  };

  const getInitials = (user: Self) => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (user: Self) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "red";
      case "operator":
        return "blue";
      case "viewer":
        return "gray";
      default:
        return "gray";
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !user) {
    return (
      <PageLayout title="Profile">
        <Container size="md" py="xl">
          <Center style={{ minHeight: "60vh" }}>
            <Stack align="center" gap="xl">
              <ThemeIcon size={80} radius="xl" variant="light" color="red">
                <Icons.AlertCircle size={40} />
              </ThemeIcon>
              <Stack align="center" gap="xs">
                <Title order={2} c="dimmed">Profile Unavailable</Title>
                <Text c="dimmed" size="md" ta="center">
                  Unable to load your profile information. Please try again.
                </Text>
              </Stack>
              <Button 
                variant="light" 
                leftSection={<Icons.Refresh size={20} />}
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </Stack>
          </Center>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Profile">
      <Container size="lg" py="md">
        <Stack gap="lg">
          {/* Profile Header */}
          <Paper p="xl" radius="md" withBorder>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Group gap="lg" wrap="nowrap">
                  <Avatar
                    size={80}
                    radius="xl"
                    color={getRoleBadgeColor(user.role || "")}
                    variant="light"
                  >
                    <Text size="xl" fw={600}>
                      {getInitials(user)}
                    </Text>
                  </Avatar>
                  
                  <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="sm" wrap="wrap">
                      <Title order={2} style={{ margin: 0 }}>
                        {getDisplayName(user)}
                      </Title>
                      <Badge
                        size="md"
                        variant="light"
                        color={getRoleBadgeColor(user.role || "")}
                        radius="sm"
                      >
                        {user.role || "User"}
                      </Badge>
                      {user.is_superuser && (
                        <Badge size="md" variant="filled" color="red" radius="sm">
                          Super Admin
                        </Badge>
                      )}
                    </Group>
                    
                    <Text c="dimmed" size="md">
                      {user.email}
                    </Text>
                    
                    <Group gap="md" wrap="wrap">
                      <Group gap="xs">
                        <Icons.Calendar size={16} />
                        <Text size="sm" c="dimmed">
                          Joined {user.date_joined ? formatDistanceToNow(new Date(user.date_joined)) : "recently"} ago
                        </Text>
                      </Group>
                      
                      <Group gap="xs">
                        <Icons.Shield size={16} />
                        <Text size="sm" c="dimmed">
                          Status: <Text span fw={500} c={user.is_active ? "green" : "red"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Text>
                        </Text>
                      </Group>
                    </Group>
                  </Stack>
                </Group>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Group gap="sm" justify="flex-end">
                  <Button
                    variant="light"
                    leftSection={<Icons.Edit size={18} />}
                    onClick={openEdit}
                  >
                    Edit Profile
                  </Button>
                  
                  <Button
                    color="red"
                    variant="outline"
                    leftSection={<Icons.Logout size={18} />}
                    onClick={handleLogout}
                    loading={isLoggingOut}
                  >
                    Logout
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Account Information */}
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">Account Information</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Group>
                    <Text fw={500} size="sm" w={120}>Username:</Text>
                    <Text size="sm">{user.username}</Text>
                  </Group>
                  
                  <Group>
                    <Text fw={500} size="sm" w={120}>Email:</Text>
                    <Text size="sm">{user.email}</Text>
                  </Group>
                  
                  <Group>
                    <Text fw={500} size="sm" w={120}>Role:</Text>
                    <Badge variant="light" color={getRoleBadgeColor(user.role || "")}>
                      {user.role || "User"}
                    </Badge>
                  </Group>

                  {user.first_name && (
                    <Group>
                      <Text fw={500} size="sm" w={120}>First Name:</Text>
                      <Text size="sm">{user.first_name}</Text>
                    </Group>
                  )}

                  {user.last_name && (
                    <Group>
                      <Text fw={500} size="sm" w={120}>Last Name:</Text>
                      <Text size="sm">{user.last_name}</Text>
                    </Group>
                  )}
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Group>
                    <Text fw={500} size="sm" w={120}>Status:</Text>
                    <Badge variant="light" color={user.is_active ? "green" : "red"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Group>
                  
                  {user.is_superuser && (
                    <Group>
                      <Text fw={500} size="sm" w={120}>Privileges:</Text>
                      <Badge variant="filled" color="red" size="sm">
                        Super Admin
                      </Badge>
                    </Group>
                  )}
                  
                  {user.date_joined && (
                    <Group>
                      <Text fw={500} size="sm" w={120}>Joined:</Text>
                      <Text size="sm">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </Text>
                    </Group>
                  )}
                  
                  {user.expiry_time && (
                    <Group>
                      <Text fw={500} size="sm" w={120}>Expires:</Text>
                      <Text size="sm">
                        {new Date(user.expiry_time).toLocaleDateString()}
                      </Text>
                    </Group>
                  )}

                  <Group>
                    <Text fw={500} size="sm" w={120}>User ID:</Text>
                    <Text size="sm" ff="monospace" c="dimmed">{user.id}</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Quick Actions */}
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">Quick Actions</Title>
            <Group gap="md">
              <Button
                variant="light"
                leftSection={<Icons.Plus size={16} />}
                onClick={() => navigate("/tasks/create")}
              >
                Create Task
              </Button>
              
              <Button
                variant="light"
                leftSection={<Icons.FileText size={16} />}
                onClick={() => navigate("/recipes/create")}
              >
                Create Recipe
              </Button>
              
              <Button
                variant="light"
                leftSection={<Icons.Upload size={16} />}
                onClick={() => navigate("/models")}
              >
                Upload Model
              </Button>

              <Button
                variant="light"
                leftSection={<Icons.Users size={16} />}
                onClick={() => navigate("/users")}
              >
                Manage Users
              </Button>
            </Group>
          </Paper>
        </Stack>
      </Container>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        user={user}
        opened={editOpened}
        onClose={closeEdit}
      />
    </PageLayout>
  );
}