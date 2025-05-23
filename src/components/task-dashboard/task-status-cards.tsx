import { useMemo, type JSX } from "react";
import { useTranslation } from "react-i18next";
import {
  Group,
  Paper,
  Text,
  RingProgress,
  SimpleGrid,
  Card,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconPlayerPlay,
  IconClock,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import { useTaskStats } from "../../lib/queries/task";
import type { TaskStats } from "../../types/task";

interface StatCardProps {
  title: string;
  value: number;
  total: number;
  icon: JSX.Element;
  color: string;
}

function StatCard({ title, value, total, icon, color }: StatCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Paper withBorder radius="md" p="xs">
      <Group>
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[{ value: percentage, color }]}
          label={
            <Text ta="center" fw={700} size="lg">
              {value}
            </Text>
          }
        />

        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Group align="flex-end" gap={8}>
            <Text fw={700}>{percentage}%</Text>
            <Text c="dimmed" size="sm">
              {`of ${total}`}
            </Text>
          </Group>
          {icon}
        </div>
      </Group>
    </Paper>
  );
}

export function TaskStatusCards() {
  const { t } = useTranslation(["common"]);
  const theme = useMantineTheme();
  const { data: stats, isLoading } = useTaskStats();

  const defaultStats: TaskStats = useMemo(
    () => ({
      total: 0,
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    }),
    []
  );

  const taskStats = stats || defaultStats;

  if (isLoading) {
    return (
      <Card withBorder p="md" radius="md">
        <Text fw={500}>{t("common:status.loading")}</Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="md">
      <Text fw={700} size="lg" mb="md">
        {t("common:taskStatus")}
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3, lg: 5 }}>
        <StatCard
          title={t("common:status.completed")}
          value={taskStats.completed}
          total={taskStats.total}
          color={theme.colors.green[6]}
          icon={<IconCircleCheck size={18} color={theme.colors.green[6]} />}
        />

        <StatCard
          title={t("common:status.running")}
          value={taskStats.running}
          total={taskStats.total}
          color={theme.colors.blue[6]}
          icon={<IconPlayerPlay size={18} color={theme.colors.blue[6]} />}
        />

        <StatCard
          title={t("common:status.queued")}
          value={taskStats.queued}
          total={taskStats.total}
          color={theme.colors.yellow[6]}
          icon={<IconClock size={18} color={theme.colors.yellow[6]} />}
        />

        <StatCard
          title={t("common:status.failed")}
          value={taskStats.failed}
          total={taskStats.total}
          color={theme.colors.red[6]}
          icon={<IconAlertTriangle size={18} color={theme.colors.red[6]} />}
        />

        <StatCard
          title={t("common:status.cancelled")}
          value={taskStats.cancelled}
          total={taskStats.total}
          color={theme.colors.gray[6]}
          icon={<IconX size={18} color={theme.colors.gray[6]} />}
        />
      </SimpleGrid>
    </Card>
  );
}
