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
import { useTheme } from '@/providers/theme-provider';

export function LoginPage() {
  const { t } = useTranslation(["common", "auth"]);
  const navigate = useNavigate();
  const { theme } = useTheme();
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
      await login(values);

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

      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof AxiosError && err.response?.data?.message
        ? err.response.data.message
        : t("auth:notification.login_failed.message");
        
      notifications.show({
        color: "red",
        title: t("auth:notification.login_failed.title"),
        message: errorMessage,
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
          
          {/* Mock Credentials Info */}
          <Divider
            label="Mock Credentials"
            labelPosition="center"
            my="lg"
          />
          
          <Stack gap="xs">
            <Card withBorder p="xs" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="sm" fw={500}>Admin Account</Text>
                  <Text size="xs" c="dimmed">Email: admin@winedge.com</Text>
                  <Text size="xs" c="dimmed">Password: admin123</Text>
                </Box>
                <Button
                  variant="light"
                  onClick={() => {
                    form.setValues({
                      email: "admin@winedge.com",
                      password: "admin123",
                    });
                  }}
                  size="xs"
                >
                  Use
                </Button>
              </Group>
            </Card>
            
            <Card withBorder p="xs" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="sm" fw={500}>User Account</Text>
                  <Text size="xs" c="dimmed">Email: user@winedge.com</Text>
                  <Text size="xs" c="dimmed">Password: user123</Text>
                </Box>
                <Button
                  variant="light"
                  onClick={() => {
                    form.setValues({
                      email: "user@winedge.com",
                      password: "user123",
                    });
                  }}
                  size="xs"
                >
                  Use
                </Button>
              </Group>
            </Card>
            
            <Card withBorder p="xs" radius="md">
              <Group justify="space-between">
                <Box>
                  <Text size="sm" fw={500}>Demo Account</Text>
                  <Text size="xs" c="dimmed">Email: demo@winedge.com</Text>
                  <Text size="xs" c="dimmed">Password: demo123</Text>
                </Box>
                <Button
                  variant="light"
                  onClick={() => {
                    form.setValues({
                      email: "demo@winedge.com",
                      password: "demo123",
                    });
                  }}
                  size="xs"
                >
                  Use
                </Button>
              </Group>
            </Card>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
