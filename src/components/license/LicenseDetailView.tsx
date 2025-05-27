import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Divider,
  Box,
  Grid,
  Card,
  ActionIcon,
  Timeline,
  ThemeIcon,
  Progress,
  Avatar,
  Tooltip,
  Menu,
  rem,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconLicense,
  IconFile,
  IconCalendar,
  IconClock,
  IconUser,
  IconDownload,
  IconStar,
  IconStarFilled,
  IconFileDescription,
  IconCircleCheck,
  IconAlertCircle,
  IconHourglass,
  IconDots,
  IconTrash,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLicenseDetails, useSetDefaultLicense } from '../../lib/queries/license';
import { PageLoader } from '../ui';
import { USE_MOCK_DATA } from '../../lib/config/mock-data';

export function LicenseDetailView() {
  const { t } = useTranslation(['licenses', 'common']);
  const { licenseId } = useParams<{ licenseId: string }>();
  const navigate = useNavigate();

  const { data: license, isLoading } = useLicenseDetails(Number(licenseId), USE_MOCK_DATA.licenses);
  const setDefaultMutation = useSetDefaultLicense();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!license) {
    return (
      <Card withBorder p="xl">
        <Text ta="center" c="dimmed">
          {t('licenses:detail.notFound')}
        </Text>
      </Card>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'invalid':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Calculate days until expiry
  const calculateDaysUntilExpiry = () => {
    if (!license.expires_at) return null;
    const now = new Date();
    const expiry = new Date(license.expires_at);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();
  const expiryPercentage = daysUntilExpiry !== null && daysUntilExpiry >= 0 
    ? Math.min((daysUntilExpiry / 365) * 100, 100) 
    : 0;

  // Get status icon
  const getStatusIcon = () => {
    switch (license.status) {
      case 'active':
        return <IconCircleCheck size={16} />;
      case 'expired':
        return <IconAlertCircle size={16} />;
      case 'invalid':
        return <IconAlertCircle size={16} />;
      default:
        return <IconHourglass size={16} />;
    }
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <Group>
            <ActionIcon 
              variant="subtle" 
              onClick={() => navigate('/licenses')}
              size="lg"
              radius="md"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Group gap="xs">
                <Title order={3}>{license.name}</Title>
                {license.is_default && (
                  <Badge 
                    color="yellow" 
                    variant="filled" 
                    leftSection={<IconStarFilled size={12} />}
                    size="lg"
                  >
                    {t('licenses:table.defaultLicense')}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed" mt={4}>
                {t('licenses:detail.title')} • {license.file_name}
              </Text>
            </div>
          </Group>
          
          <Group>
            {!license.is_default && (
              <Button
                variant="light"
                leftSection={<IconStar size={16} />}
                onClick={() => setDefaultMutation.mutate(license.id)}
                loading={setDefaultMutation.isPending}
                color="yellow"
              >
                {t('licenses:actions.setAsDefault')}
              </Button>
            )}
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => navigate(`/licenses/${licenseId}/edit`)}
            >
              {t('common:button.edit')}
            </Button>
            
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconDownload size={14} />}
                  onClick={() => {/* TODO: Implement download */}}
                >
                  {t('licenses:actions.download')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={() => {/* TODO: Copy license key */}}
                >
                  Copy License Key
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => {/* TODO: View in vendor portal */}}
                >
                  View in Vendor Portal
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => {/* TODO: Delete license */}}
                >
                  {t('licenses:actions.delete')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>

      <Grid>
        {/* Main Content */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* Status Card */}
            <Card withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color={getStatusBadgeColor(license.status)}
                  >
                    {getStatusIcon()}
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">
                      License Status
                    </Text>
                    <Badge
                      color={getStatusBadgeColor(license.status)}
                      variant="filled"
                      size="lg"
                      mt={4}
                    >
                      {t(`licenses:status.${license.status}`)}
                    </Badge>
                  </div>
                </Group>
                
                {license.expires_at && (
                  <Box style={{ textAlign: 'right' }}>
                    <Text size="sm" c="dimmed">
                      {daysUntilExpiry && daysUntilExpiry > 0 
                        ? `${daysUntilExpiry} days remaining`
                        : 'Expired'}
                    </Text>
                    <Progress
                      value={expiryPercentage}
                      color={daysUntilExpiry && daysUntilExpiry > 30 ? 'green' : daysUntilExpiry && daysUntilExpiry > 0 ? 'yellow' : 'red'}
                      size="sm"
                      radius="xl"
                      mt={8}
                      w={200}
                    />
                  </Box>
                )}
              </Group>
            </Card>

            {/* License Information */}
            <Paper withBorder p="lg" radius="md">
              <Title order={4} mb="lg">{t('licenses:detail.licenseInfo')}</Title>

              <Grid gutter="xl">
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color="blue">
                          <IconLicense size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="dimmed">
                          {t('licenses:detail.name')}
                        </Text>
                      </Group>
                      <Text size="md">{license.name}</Text>
                    </Box>

                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color="cyan">
                          <IconFileDescription size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="dimmed">
                          {t('licenses:detail.fileName')}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="md">{license.file_name}</Text>
                        <Badge variant="light" size="sm">
                          {formatFileSize(license.file_size)}
                        </Badge>
                      </Group>
                    </Box>

                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color="violet">
                          <IconUser size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="dimmed">
                          {t('licenses:detail.uploadedBy')}
                        </Text>
                      </Group>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl" color="violet">
                          {license.uploaded_by.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="md">{license.uploaded_by}</Text>
                      </Group>
                    </Box>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color="green">
                          <IconCalendar size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="dimmed">
                          {t('licenses:detail.uploadedAt')}
                        </Text>
                      </Group>
                      <Text size="md">
                        {new Date(license.uploaded_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {new Date(license.uploaded_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Box>

                    <Box>
                      <Group gap="xs" mb={8}>
                        <ThemeIcon size="sm" variant="light" color={license.expires_at ? 'orange' : 'gray'}>
                          <IconClock size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500} c="dimmed">
                          {t('licenses:detail.expiresAt')}
                        </Text>
                      </Group>
                      {license.expires_at ? (
                        <>
                          <Text size="md">
                            {new Date(license.expires_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Text>
                          {daysUntilExpiry !== null && (
                            <Badge 
                              variant="light" 
                              color={daysUntilExpiry > 30 ? 'green' : daysUntilExpiry > 0 ? 'yellow' : 'red'}
                              size="sm"
                              mt={4}
                            >
                              {daysUntilExpiry > 0 
                                ? `${daysUntilExpiry} days left`
                                : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="light" color="blue" size="lg">
                          {t('licenses:table.noExpiry')}
                        </Badge>
                      )}
                    </Box>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* License Key Preview */}
            <Paper withBorder p="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Title order={5}>License Key Preview</Title>
                <Tooltip label="Copy to clipboard">
                  <ActionIcon variant="subtle" onClick={() => {/* TODO: Copy key */}}>
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Box
                p="md"
                style={{
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  borderRadius: rem(8),
                  fontFamily: 'monospace',
                  fontSize: rem(13),
                  overflowX: 'auto',
                }}
              >
                <Text c="dimmed" size="xs">WINEDGE-TRAF-{new Date().getFullYear()}-XXXX-XXXX-XXXX</Text>
              </Box>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Quick Actions */}
            <Paper withBorder p="lg" radius="md">
              <Title order={5} mb="md">Quick Actions</Title>
              <Stack gap="sm">
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  fullWidth
                  onClick={() => {/* TODO: Implement download */}}
                >
                  Download License File
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconCopy size={16} />}
                  fullWidth
                  onClick={() => {/* TODO: Copy license info */}}
                >
                  Copy License Info
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconExternalLink size={16} />}
                  fullWidth
                  onClick={() => {/* TODO: Open vendor portal */}}
                >
                  Open Vendor Portal
                </Button>
              </Stack>
            </Paper>

            {/* Activity Timeline */}
            <Paper withBorder p="lg" radius="md">
              <Title order={5} mb="md">
                {t('licenses:detail.timeline')}
              </Title>
              <Timeline active={-1} bulletSize={28} lineWidth={2}>
                <Timeline.Item
                  bullet={
                    <ThemeIcon size={28} radius="xl" variant="filled" color="blue">
                      <IconClock size={16} />
                    </ThemeIcon>
                  }
                  title={t('licenses:detail.lastChecked')}
                >
                  <Text size="sm" c="dimmed">
                    {new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    System verification successful
                  </Text>
                </Timeline.Item>

                {license.is_default && (
                  <Timeline.Item
                    bullet={
                      <ThemeIcon size={28} radius="xl" variant="filled" color="yellow">
                        <IconStar size={16} />
                      </ThemeIcon>
                    }
                    title="Set as Default"
                  >
                    <Text size="sm" c="dimmed">
                      This license is currently active
                    </Text>
                  </Timeline.Item>
                )}

                <Timeline.Item
                  bullet={
                    <ThemeIcon size={28} radius="xl" variant="filled" color="green">
                      <IconCalendar size={16} />
                    </ThemeIcon>
                  }
                  title={t('licenses:detail.uploaded')}
                >
                  <Text size="sm" c="dimmed">
                    {new Date(license.uploaded_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {t('licenses:detail.uploadedByUser', { user: license.uploaded_by })}
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Paper>

            {/* License Metadata */}
            <Paper withBorder p="lg" radius="md">
              <Title order={5} mb="md">Metadata</Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">License ID</Text>
                  <Text size="sm" fw={500}>#{license.id}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">File Type</Text>
                  <Badge variant="light" size="sm">
                    {license.file_name.split('.').pop()?.toUpperCase()}
                  </Badge>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Checksum</Text>
                  <Text size="sm" fw={500} ff="monospace">SHA256</Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}