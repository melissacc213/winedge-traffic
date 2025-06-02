import { Group, rem,Text,Title } from "@mantine/core";
import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const usePageStyles = () => ({
  content: {
    flex: 1,
    // Only content area scrolls
minHeight: 0, 
    overflow: "auto", // Allow content to shrink
  },
  contentWrapper: {
    display: "flex", 
    
flexDirection: "column" as const, 
    

height: "calc(100vh - 64px)",
    
// Fixed width
margin: "0 auto",
    
overflow: "hidden",
    // Fixed height accounting for padding
width: rem(1200),
  },
  header: {
    flexShrink: 0,
    marginBottom: rem(32), // Don't allow header to shrink
    minHeight: rem(80), // Fixed header height
  },
  pageContainer: {
    height: "(100vh - 70px)", 
    overflow: "hidden",
    
paddingBottom: rem(32),
    // Fixed viewport height
paddingTop: rem(8),
    position: "relative" as const, // Prevent page-level scrolling
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
