import {
  Card,
  Text,
  Grid,
  Group,
  RingProgress,
  SimpleGrid,
  Paper,
} from "@mantine/core";
import {
  IconCar,
  IconTruckLoading,
  IconBus,
  IconMotorbike,
  IconUser,
  IconBike,
} from "@tabler/icons-react";

interface TaskMetricsCardProps {
  metrics: Record<string, any> | undefined;
}

export function TaskMetricsCard({ metrics }: TaskMetricsCardProps) {
  if (!metrics) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text fw={500} size="lg" mb="md">
          Performance Metrics
        </Text>
        <Text c="dimmed">No metrics available</Text>
      </Card>
    );
  }

  const { objectsCounted, detectionRate, processingFps, totalObjects } =
    metrics;

  // Calculate total objects for percentage calculations
  const totalObjectsCount = totalObjects
    ? Object.values(totalObjects).reduce(
        (total: number, count: any) => total + (Number(count) || 0),
        0
      )
    : 0;

  // Object type icons
  const objectIcons: Record<string, any> = {
    car: { icon: IconCar, color: "blue" },
    truck: { icon: IconTruckLoading, color: "teal" },
    bus: { icon: IconBus, color: "grape" },
    motorcycle: { icon: IconMotorbike, color: "orange" },
    bicycle: { icon: IconBike, color: "green" },
    person: { icon: IconUser, color: "red" },
  };

  return (
    <Card padding="md" radius="md" withBorder>
      <Text fw={500} size="lg" mb="md">
        Performance Metrics
      </Text>

      <Grid gutter="md">
        {/* Primary Metrics */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Group wrap="nowrap" mb="md">
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[
                {
                  value: detectionRate ? detectionRate * 100 : 0,
                  color: "blue",
                },
              ]}
              label={
                <Text ta="center" fz="lg" fw={700}>
                  {detectionRate
                    ? `${(detectionRate * 100).toFixed(0)}%`
                    : "N/A"}
                </Text>
              }
            />
            <div>
              <Text fw={700}>Detection Rate</Text>
              <Text size="sm" c="dimmed">
                Model confidence
              </Text>
            </div>
          </Group>

          <Group grow>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" fw={500}>
                Total Objects
              </Text>
              <Text fw={700} size="xl">
                {objectsCounted || 0}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" fw={500}>
                Processing Speed
              </Text>
              <Text fw={700} size="xl">
                {processingFps ? `${processingFps.toFixed(1)}` : "N/A"}
              </Text>
              <Text size="xs" c="dimmed">
                FPS
              </Text>
            </Paper>
          </Group>
        </Grid.Col>

        {/* Object Distribution */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Text fw={500} mb="xs">
            Object Distribution
          </Text>

          {totalObjects && Object.keys(totalObjects).length > 0 ? (
            <SimpleGrid cols={{ base: 1, xs: 2 }}>
              {Object.entries(totalObjects).map(([type, count]) => {
                const TypeIcon = objectIcons[type]?.icon || IconCar;
                const iconColor = objectIcons[type]?.color || "blue";
                const percentage = totalObjectsCount
                  ? Math.round((Number(count) / totalObjectsCount) * 100)
                  : 0;

                return (
                  <Paper withBorder p="md" radius="md" key={type}>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <TypeIcon size="1.2rem" color={iconColor} />
                        <Text fw={500} transform="capitalize">
                          {type}
                        </Text>
                      </Group>
                      <Text fw={700}>{count}</Text>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {percentage}% of total
                    </Text>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "4px",
                        backgroundColor: iconColor,
                        borderRadius: "2px",
                        marginTop: "6px",
                      }}
                    />
                  </Paper>
                );
              })}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No object distribution data available</Text>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  );
}
