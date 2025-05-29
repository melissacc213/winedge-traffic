import type { ReactNode } from "react";
import { Title, Text, Group, rem } from "@mantine/core";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const usePageStyles = () => ({
  pageContainer: {
    height: "(100vh - 70px)", // Fixed viewport height
    paddingTop: rem(8),
    paddingBottom: rem(32),
    position: "relative" as const,
    overflow: "hidden", // Prevent page-level scrolling
  },
  contentWrapper: {
    height: "calc(100vh - 64px)", // Fixed height accounting for padding
    width: rem(1200), // Fixed width
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  header: {
    marginBottom: rem(32),
    flexShrink: 0, // Don't allow header to shrink
    minHeight: rem(80), // Fixed header height
  },
  content: {
    flex: 1,
    overflow: "auto", // Only content area scrolls
    minHeight: 0, // Allow content to shrink
  },
});

export function PageLayout({
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  const styles = usePageStyles();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <Group justify="space-between" align="center" style={styles.header}>
          <div>
            <Title order={1} mb="xs">
              {title}
            </Title>
            {description && (
              <Text size="md" c="dimmed">
                {description}
              </Text>
            )}
          </div>
          {actions && <Group>{actions}</Group>}
        </Group>

        {/* Content Section */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}
