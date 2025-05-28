import { useLogin } from "@/lib/queries/auth";
import { useSiteConfig } from "@/lib/queries/config";
import { useSelf } from "@/lib/queries/user";
import { createLoginFormInputSchema } from "@/lib/validator/auth";

import {
  Button,
  Center,
  Loader,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Box,
  Group,
  BackgroundImage,
  Stack,
  Title,
  rem,
  Divider,
  Card,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { Trans, useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";

// This function mimics a successful login response
function mockLogin(email: string, password: string) {
  // For testing, we'll accept any credentials
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a mock token
      const token = "mock_token_" + Math.random().toString(36).substring(2);

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Store user data in localStorage for mock authentication
      const mockUser = {
        id: "1",
        username: email.split("@")[0],
        email: email,
        date_joined: new Date().toISOString(),
        is_superuser: true,
        is_owner: true,
      };
      localStorage.setItem("mock_user", JSON.stringify(mockUser));

      resolve({ token });
    }, 800);
  });
}

export function LoginPage() {
  const { t } = useTranslation(["common", "auth"]);
  const navigate = useNavigate();
  const { data: siteConfig } = useSiteConfig();
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const {
    data: self,
    isSuccess: isSelfSuccess,
    isError: isSelfError,
  } = useSelf();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zodResolver(createLoginFormInputSchema(t)),
  });

  if (self && isSelfSuccess) {
    return <Navigate to="/" replace />;
  }

  if (!isSelfSuccess && !isSelfError) {
    return (
      <Center className="h-screen w-full">
        <Loader size="xl" />
      </Center>
    );
  }

  const backgroundUrl =
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop";

  // This handles the actual login attempt using the mock function
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      // Use our mock login instead of the real API
      await mockLogin(values.email, values.password);

      notifications.show({
        color: "green",
        title: t("auth:notification.login_success.title"),
        message: (
          <Trans
            t={t}
            i18nKey="auth:notification.login_success.message"
            values={{
              email: values.email,
            }}
            components={{
              b: <Text component="b" c="blue" fw="bold" />,
            }}
          />
        ),
      });

      // Force a page reload to update the authentication state
      window.location.href = "/";
    } catch (err) {
      notifications.show({
        color: "red",
        title: t("auth:notification.login_failed.title"),
        message: t("auth:notification.login_failed.message"),
      });
    }
  };

  return (
    <Box className="h-screen w-full overflow-hidden flex">
      <Box className="flex-1 hidden md:block">
        <BackgroundImage src={backgroundUrl} className="h-full w-full" />
      </Box>

      <Box className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <Paper
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: theme.other.backgrounds.glassMorphism,
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack align="center" mb={rem(20)}>
            <Title
              order={1}
              style={{
                color: theme.colors.blue[5],
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
              size={rem(32)}
            >
              {siteConfig?.name || "WinEdge"}
            </Title>
            <Text size="sm" c="dimmed">
              {t("auth:login.welcome")}
            </Text>
          </Stack>

          <form
            className="flex flex-col gap-4"
            onSubmit={form.onSubmit(handleLogin)}
          >
            <TextInput
              withAsterisk
              label={t("common:label.email")}
              placeholder="your.email@example.com"
              size="md"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              withAsterisk
              label={t("common:label.password")}
              placeholder="••••••••"
              size="md"
              {...form.getInputProps("password")}
            />
            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed">
                {t("auth:login.forgot_password")}
              </Text>
            </Group>
            <Button
              fullWidth
              size="md"
              mt="xl"
              loading={isLoggingIn}
              type="submit"
              style={{
                backgroundColor: "#1890ff",
                color: "white",
              }}
            >
              {t("auth:button.login")}
            </Button>
          </form>

          <Divider
            label={t("common:label.demo_accounts")}
            labelPosition="center"
            my="lg"
          />

          <Card withBorder p="xs" radius="md" mb="sm">
            <Group justify="space-between">
              <Box>
                <Text size="sm" fw={500}>
                  Admin Account
                </Text>
                <Text size="xs" c="dimmed">
                  Email: admin@example.com
                </Text>
                <Text size="xs" c="dimmed">
                  Password: any password
                </Text>
              </Box>
              <Button
                variant="light"
                onClick={() => {
                  form.setValues({
                    email: "admin@example.com",
                    password: "admin123",
                  });
                }}
                size="xs"
              >
                {t("common:button.use")}
              </Button>
            </Group>
          </Card>

          <Card withBorder p="xs" radius="md">
            <Group justify="space-between">
              <Box>
                <Text size="sm" fw={500}>
                  User Account
                </Text>
                <Text size="xs" c="dimmed">
                  Email: user@example.com
                </Text>
                <Text size="xs" c="dimmed">
                  Password: any password
                </Text>
              </Box>
              <Button
                variant="light"
                onClick={() => {
                  form.setValues({
                    email: "user@example.com",
                    password: "password123",
                  });
                }}
                size="xs"
              >
                {t("common:button.use")}
              </Button>
            </Group>
          </Card>
        </Paper>
      </Box>
    </Box>
  );
}
