import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { CardSkeleton, InfoCardGridSkeleton, PageHeaderSkeleton, PageLoader } from '../../components/ui';
import { PageHeader } from '../../components/page-header/page-header';
import { IconLicense } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Mock license data
const MOCK_LICENSE = {
  key: 'WINEDGE-TRAF-2025-XXXX-XXXX-XXXX-XXXX',
  status: 'active', // 'active', 'expired', 'trial'
  product: 'WinEdge Traffic Advanced',
  customer: 'ACME Corporation',
  issued: '2025-01-01T00:00:00Z',
  expiry: '2026-01-01T00:00:00Z',
  features: ['Traffic Analysis', 'AI Models', 'Reporting', 'Data Export', 'API Access'],
  maxDevices: 25,
  activeDevices: 18,
};

interface License {
  key: string;
  status: 'active' | 'expired' | 'trial';
  product: string;
  customer: string;
  issued: string;
  expiry: string;
  features: string[];
  maxDevices: number;
  activeDevices: number;
}

export function LicensePage() {
  const { t } = useTranslation(['components', 'common']);
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setLicense(MOCK_LICENSE);
      setLoading(false);
    }, 800);
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Calculate remaining days
  const calculateRemainingDays = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'trial':
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  // License usage percentage
  const deviceUsagePercentage = license 
    ? Math.round((license.activeDevices / license.maxDevices) * 100) 
    : 0;

  // Device usage color
  const getDeviceUsageColor = (percentage: number) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <Container size="xl" px="xs">
        <PageHeaderSkeleton mb="lg" />
        <Paper p="md" withBorder mb="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <CardSkeleton withHeader withBorder />
                <CardSkeleton withHeader withBorder />
                <CardSkeleton withHeader withBorder />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <CardSkeleton withHeader withFooter withBorder minHeight={300} />
            </Grid.Col>
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!license) {
    return (
      <Container size="xl">
        <Paper p="xl" withBorder className="flex items-center justify-center" h={400}>
          <Text size="lg" c="red">
            No license information found.
          </Text>
        </Paper>
      </Container>
    );
  }

  const remainingDays = calculateRemainingDays(license.expiry);

  return (
    <Container size="xl" px="xs">
      <PageHeader
        title={t('components:license.title')}
        description={t('components:license.description')}
        icon={<IconLicense size={rem(24)} stroke={1.5} />}
        rightSection={
          <Badge size="lg" color={getStatusColor(license.status)}>
            {t(`components:license.status.${license.status}`)}
          </Badge>
        }
      />
      <Paper p="md" withBorder mb="lg">

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Paper p="md" withBorder>
                <Title order={4} mb="md">{t('components:license.info.title', 'License Information')}</Title>
                <Grid>
                  <Grid.Col span={6}>
                    <Text fw={500} size="sm" c="dimmed">
                      {t('components:license.info.product')}
                    </Text>
                    <Text>{license.product}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} size="sm" c="dimmed">
                      {t('components:license.info.customer')}
                    </Text>
                    <Text>{license.customer}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} size="sm" c="dimmed">
                      {t('components:license.info.issued')}
                    </Text>
                    <Text>{formatDate(license.issued)}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text fw={500} size="sm" c="dimmed">
                      {t('components:license.info.expiry')}
                    </Text>
                    <Text>{formatDate(license.expiry)}</Text>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Text fw={500} size="sm" c="dimmed" mb={5}>
                      {t('components:license.info.key')}
                    </Text>
                    <Text 
                      ff="monospace"
                      p="xs"
                      bg="gray.1"
                      style={{ borderRadius: '4px' }}
                    >
                      {license.key}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Paper>

              <Paper p="md" withBorder>
                <Title order={4} mb="md">{t('components:license.info.features', 'Features')}</Title>
                <div className="flex flex-wrap gap-2">
                  {license.features.map((feature, index) => (
                    <Badge key={index} size="lg" radius="sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </Paper>

              <Paper p="md" withBorder>
                <Title order={4} mb="md">{t('components:license.info.deviceUsage', 'Device Usage')}</Title>
                <Text mb={10}>
                  {license.activeDevices} of {license.maxDevices} {t('components:license.info.devicesActive', 'devices active')}
                </Text>
                <Progress
                  value={deviceUsagePercentage}
                  color={getDeviceUsageColor(deviceUsagePercentage)}
                  size="lg"
                  radius="xl"
                  mb={5}
                />
                <Text size="xs" c="dimmed" ta="right">
                  {deviceUsagePercentage}% {t('components:license.info.usage', 'usage')}
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card p="lg" radius="md" withBorder h="100%">
              <Title order={3}>{t('components:license.renewal.title')}</Title>
              <Text mb="xl" size="sm" c="dimmed">
                {t('components:license.renewal.description')}
              </Text>

              <Card withBorder mb="lg">
                <Group>
                  <div style={{ width: '100%' }}>
                    <Text fw={700} size="xl" c={
                      remainingDays > 30 ? 'teal' : remainingDays > 7 ? 'orange' : 'red'
                    }>
                      {t('components:license.renewal.remaining', { days: remainingDays })}
                    </Text>
                    <Progress
                      value={(remainingDays / 365) * 100}
                      size="sm"
                      mt={5}
                      color={
                        remainingDays > 30 ? 'teal' : remainingDays > 7 ? 'orange' : 'red'
                      }
                    />
                  </div>
                </Group>
              </Card>

              <Button fullWidth color="blue">
                {t('components:license.renewal.contact')}
              </Button>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
}