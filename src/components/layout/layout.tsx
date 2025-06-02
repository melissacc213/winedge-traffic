import { useLogout } from "@/lib/queries/auth";
import { useSiteConfig } from "@/lib/queries/config";
import { useSelf } from "@/lib/queries/user";
import { useTheme } from "@/providers/theme-provider";
import {
  AppShell,
  Burger,
  Loader,
  Menu,
  Text,
  Title,
  Avatar,
  Group,
  Tooltip,
  UnstyledButton,
  rem,
  Box,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "../icons";
import LanguageMenu from "./language-menu";
import { ThemeToggle } from "./theme-toggle";
import type { User } from "@/lib/validator/user";

type LayoutProps = PropsWithChildren;

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation(["components", "auth", "common"]);
  const location = useLocation();
  const { data: siteConfig } = useSiteConfig();
  const [sidebarExpanded, { toggle: toggleSidebar }] = useDisclosure(true); // Start expanded
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { data: self } = useSelf();
  const { theme, colorScheme } = useTheme();

  // Theme color utility function
  const getThemeColor = (colorPath: string): string => {
    // Parse the color path (e.g., "blue.5" -> theme.colors.blue[5])
    const [colorName, index] = colorPath.split(".");

    // Special handling for theme's other properties
    if (colorName === "ui") {
      return theme.other?.ui?.[index] || colorPath;
    }

    if (colorName === "backgrounds") {
      return theme.other?.backgrounds?.[index] || colorPath;
    }

    // Standard color from theme colors
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };

  // State for mock user
  const [mockUser, setMockUser] = useState<User | null>(null);

  // Effect to check for mock user
  useEffect(() => {
    const mockUserStr = localStorage.getItem("mock_user");
    if (mockUserStr) {
      try {
        const parsedUser = JSON.parse(mockUserStr);
        setMockUser(parsedUser);
      } catch (e) {
        console.error("Error parsing mock user:", e);
      }
    }
  }, []);

  // Use either the API user or the mock user
  const currentUser = self || mockUser;

  const navItems = [
    {
      path: "/tasks",
      label: t("components:layout.nav.tasks"),
      icon: <Icons.Task className="h-5 w-5" />,
    },
    {
      path: "/recipes",
      label: t("components:layout.nav.recipes"),
      icon: <Icons.Recipe className="h-5 w-5" />,
    },
    {
      path: "/models",
      label: t("components:layout.nav.models"),
      icon: <Icons.Model className="h-5 w-5" />,
    },
    {
      path: "/users",
      label: t("components:layout.nav.users"),
      icon: <Icons.Users className="h-5 w-5" />,
    },
    {
      path: "/licenses",
      label: t("components:layout.nav.license"),
      icon: <Icons.License className="h-5 w-5" />,
    },
  ] as const;

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  async function onLogout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("mock_user");

      if (!mockUser) {
        await logout();
      }

      notifications.show({
        color: "green",
        title: t("auth:notification.logout_success.title"),
        message: (
          <Trans
            t={t}
            i18nKey="auth:notification.logout_success.message"
            values={{
              email: currentUser?.email,
            }}
            components={{
              b: <Text component="b" c="blue" fw="bold" />,
            }}
          />
        ),
      });

      window.location.href = "/login";
    } catch {
      notifications.show({
        color: "red",
        title: t("auth:notification.logout_error.title"),
        message: t("auth:notification.logout_error.message"),
      });
    }
  }

  const getUserInitials = () => {
    if (!currentUser) return "?";
    const username = currentUser.username || currentUser.email?.split("@")[0];
    return username?.substring(0, 2).toUpperCase() || "?";
  };

  const navbarWidth = sidebarExpanded ? 280 : 80;

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: navbarWidth,
        breakpoint: "xs",
        collapsed: { desktop: false, mobile: false },
      }}
      styles={(theme) => ({
        root: {
          backgroundColor:
            colorScheme === "dark"
              ? getThemeColor("gray.9")
              : getThemeColor("gray.0"),
        },
        main: {
          backgroundColor:
            colorScheme === "dark"
              ? getThemeColor("gray.9")
              : getThemeColor("gray.0"),
          transition: "padding-left 300ms ease",
        },
        header: {
          backgroundColor:
            colorScheme === "dark" ? theme.colors.dark[7] : "white",
          borderBottom: `1px solid ${colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          boxShadow:
            colorScheme === "dark"
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        },
        navbar: {
          backgroundColor:
            colorScheme === "dark" ? theme.colors.dark[7] : "white",
          borderRight: `1px solid ${colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
          transition: "width 300ms ease",
          overflow: "hidden",
          zIndex: 999,
          boxShadow: theme.other.shadows.md,
        },
      })}
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Box
              component="span"
              onClick={toggleSidebar}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: rem(8),
                borderRadius: rem(8),
                cursor: "pointer",
                transition: "transform 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Burger opened={sidebarExpanded} size="sm" />
            </Box>

            <Title
              order={3}
              style={{
                color: getThemeColor("blue.5"),
                fontWeight: 600,
                letterSpacing: "-0.5px",
                marginLeft: rem(8),
              }}
            >
              {siteConfig?.name || "WinEdge"}
            </Title>
          </Group>

          <Group gap="sm">
            <ThemeToggle />
            <LanguageMenu />

            <Menu position="bottom-end" shadow="xl" width={220} offset={8}>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    padding: rem(8),
                    borderRadius: rem(12),
                    transition: "background-color 200ms ease",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colorScheme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Group gap="sm">
                    <Avatar radius="xl" size="md" color="blue" variant="filled">
                      {getUserInitials()}
                    </Avatar>
                    <Box className="hidden md:block">
                      <Text
                        size="sm"
                        fw={500}
                        c={colorScheme === "dark" ? "white" : "dark"}
                      >
                        {currentUser?.username ||
                          currentUser?.email?.split("@")[0] ||
                          "User"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {currentUser?.email || "user@example.com"}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {currentUser && (
                  <>
                    <Menu.Label>
                      <Text size="xs" fw={500} tt="uppercase" c="dimmed">
                        Account
                      </Text>
                    </Menu.Label>
                    <Divider my="xs" />
                  </>
                )}
                <Menu.Item
                  leftSection={<Icons.User className="h-4 w-4" />}
                  component={Link}
                  to="/profile"
                >
                  {t("common:label.user_profile")}
                </Menu.Item>

                <Divider my="xs" />

                <Menu.Item
                  leftSection={
                    isLoggingOut ? (
                      <Loader size="sm" color="red" />
                    ) : (
                      <Icons.Logout className="h-4 w-4" />
                    )
                  }
                  onClick={onLogout}
                  color="red"
                >
                  {t("auth:button.logout")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <Box
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Navigation Items */}
          <Box style={{ flex: 1 }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: rem(6) }}
            >
              {navItems.map((item) => (
                <Tooltip
                  key={item.path}
                  label={item.label}
                  position="right"
                  disabled={sidebarExpanded}
                  withArrow
                  offset={10}
                >
                  <UnstyledButton
                    component={Link}
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: rem(16),
                      padding: rem(16),
                      borderRadius: rem(12),
                      transition: "all 200ms ease",
                      backgroundColor: location.pathname.startsWith(item.path)
                        ? colorScheme === "dark"
                          ? "rgba(64, 192, 255, 0.15)"
                          : "rgba(25, 144, 255, 0.1)"
                        : "transparent",
                      color: location.pathname.startsWith(item.path)
                        ? getThemeColor("blue.5")
                        : colorScheme === "dark"
                          ? "white"
                          : "inherit",
                      justifyContent: sidebarExpanded ? "flex-start" : "center",
                      minHeight: rem(56),
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      if (!location.pathname.startsWith(item.path)) {
                        e.currentTarget.style.backgroundColor =
                          colorScheme === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!location.pathname.startsWith(item.path)) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: location.pathname.startsWith(item.path)
                          ? getThemeColor("blue.5")
                          : "inherit",
                        flexShrink: 0,
                        fontSize: rem(20),
                      }}
                    >
                      {item.icon}
                    </Box>
                    {sidebarExpanded && (
                      <Text
                        size="md"
                        fw={location.pathname.startsWith(item.path) ? 600 : 500}
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          opacity: sidebarExpanded ? 1 : 0,
                          transition: "opacity 200ms ease",
                          fontSize: rem(15),
                          letterSpacing: "0.25px",
                        }}
                      >
                        {item.label}
                      </Text>
                    )}
                  </UnstyledButton>
                </Tooltip>
              ))}
            </div>
          </Box>

          {/* Footer section in navbar */}
          {sidebarExpanded && (
            <Box
              mt="auto"
              pt="md"
              style={{
                borderTop: `1px solid ${colorScheme === "dark" ? getThemeColor("ui.border") : getThemeColor("ui.border")}`,
                opacity: sidebarExpanded ? 1 : 0,
                transition: "opacity 300ms ease",
              }}
            >
              <Text size="xs" c="dimmed" ta="center">
                WinEdge v1.0
              </Text>
            </Box>
          )}
        </Box>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main
        style={{
          minHeight: "calc(100vh - 70px)",
          transition: "padding-left 300ms ease",
        }}
      >
        <Box style={{ height: "100%" }}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
}
