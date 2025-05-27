import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Stack,
  Group,
  Title,
  Button,
  TextInput,
  Switch,
  Text,
  ActionIcon,
  Divider,
  Alert,
  Card,
  Badge,
  Box,
  Grid,
  ThemeIcon,
  Progress,
  rem,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconAlertCircle,
  IconLicense,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconStar,
  IconFileDescription,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLicenseDetails, useUpdateLicense } from '../../lib/queries/license';
import { PageLoader } from '../ui';
import { USE_MOCK_DATA } from '../../lib/config/mock-data';

export function LicenseEdit() {
  const { t } = useTranslation(['licenses', 'common']);
  const { licenseId } = useParams<{ licenseId: string }>();
  const navigate = useNavigate();

  const { data: license, isLoading } = useLicenseDetails(Number(licenseId), USE_MOCK_DATA.licenses);
  const updateLicense = useUpdateLicense();

  const [name, setName] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean | undefined>();
  const [initialValues, setInitialValues] = useState<{ name: string; isDefault: boolean } | null>(null);

  // Initialize form values when license loads
  useEffect(() => {
    if (license && !initialValues) {
      setName(license.name);
      setIsDefault(license.is_default);
      setInitialValues({ name: license.name, isDefault: license.is_default });
    }
  }, [license, initialValues]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!license) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('licenses:edit.notFound')}
        color="red"
      >
        {t('licenses:edit.notFoundDescription')}
      </Alert>
    );
  }

  const handleSave = async () => {
    const updates: any = {};
    if (name && name !== license.name) {
      updates.name = name;
    }
    if (isDefault !== undefined && isDefault !== license.is_default) {
      updates.is_default = isDefault;
    }

    if (Object.keys(updates).length > 0) {
      await updateLicense.mutateAsync({ id: license.id, data: updates });
      navigate(`/licenses/${licenseId}`);
    }
  };

  const hasChanges = initialValues ? 
    (name !== initialValues.name || isDefault !== initialValues.isDefault) : false;

  // Calculate completion for visual feedback
  const changedFields = [];
  if (initialValues) {
    if (name !== initialValues.name) changedFields.push('name');
    if (isDefault !== initialValues.isDefault) changedFields.push('default');
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <Group>
            <ActionIcon 
              variant="subtle" 
              onClick={() => navigate(`/licenses/${licenseId}`)}
              size="lg"
              radius="md"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <div>
              <Title order={3}>{t('licenses:edit.title')}</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Editing: {license.name}
              </Text>
            </div>
          </Group>
          <Group>
            <Button
              variant="outline"
              onClick={() => navigate(`/licenses/${licenseId}`)}
            >
              {t('common:button.cancel')}
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={updateLicense.isPending}
              disabled={!hasChanges}
            >
              {hasChanges ? t('common:button.save') : 'No Changes'}
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Changes Summary */}
      {hasChanges && (
        <Alert 
          icon={<IconInfoCircle />} 
          color="blue" 
          variant="light"
          radius="md"
        >
          <Text size="sm" fw={500} mb={4}>Pending Changes:</Text>
          <Group gap="xs">
            {changedFields.map(field => (
              <Badge key={field} variant="filled" size="sm">
                {field === 'name' ? 'License Name' : 'Default Status'}
              </Badge>
            ))}
          </Group>
        </Alert>
      )}

      <Grid>
        {/* Main Content */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {/* License Settings */}
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xl">
                <div>
                  <Title order={4} mb="md">
                    {t('licenses:edit.licenseSettings')}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {t('licenses:edit.licenseSettingsDescription')}
                  </Text>
                </div>

                <Divider />

                <Stack gap="lg">
                  <div>
                    <TextInput
                      label={t('licenses:form.name')}
                      leftSection={<IconLicense size={16} />}
                      value={name}
                      onChange={(event) => setName(event.currentTarget.value)}
                      description={t('licenses:edit.nameDescription')}
                      size="md"
                      styles={{
                        input: {
                          backgroundColor: name !== initialValues?.name 
                            ? 'var(--mantine-color-blue-0)' 
                            : undefined,
                        }
                      }}
                    />
                    {name !== initialValues?.name && (
                      <Group gap="xs" mt={8}>
                        <ThemeIcon size="xs" color="blue" variant="light">
                          <IconCheck size={12} />
                        </ThemeIcon>
                        <Text size="xs" c="blue">
                          Changed from: "{initialValues?.name}"
                        </Text>
                      </Group>
                    )}
                  </div>

                  <Box>
                    <Switch
                      label={
                        <Group gap="xs">
                          <IconStar size={16} />
                          <Text>{t('licenses:edit.defaultLicense')}</Text>
                        </Group>
                      }
                      description={t('licenses:edit.defaultLicenseDescription')}
                      checked={isDefault ?? false}
                      onChange={(event) => setIsDefault(event.currentTarget.checked)}
                      color="yellow"
                      size="md"
                      styles={{
                        track: {
                          backgroundColor: isDefault !== initialValues?.isDefault
                            ? 'var(--mantine-color-blue-1)'
                            : undefined,
                        }
                      }}
                    />
                    {isDefault !== initialValues?.isDefault && (
                      <Group gap="xs" mt={8}>
                        <ThemeIcon size="xs" color="blue" variant="light">
                          <IconCheck size={12} />
                        </ThemeIcon>
                        <Text size="xs" c="blue">
                          Changed from: {initialValues?.isDefault ? 'Default' : 'Not Default'}
                        </Text>
                      </Group>
                    )}
                  </Box>
                </Stack>

                {isDefault && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title={t('licenses:edit.warningTitle')}
                    color="yellow"
                    variant="light"
                  >
                    {t('licenses:edit.warningMessage')}
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* License Info Card */}
            <Card withBorder padding="lg" radius="md">
              <Stack gap="md">
                <Group>
                  <ThemeIcon size={48} radius="md" variant="light" color="blue">
                    <IconFileDescription size={24} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">Current License</Text>
                    <Text fw={500}>{license.file_name}</Text>
                  </div>
                </Group>
                
                <Divider />
                
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Status</Text>
                    <Badge 
                      color={license.status === 'active' ? 'green' : 'red'} 
                      variant="filled"
                    >
                      {license.status}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Uploaded</Text>
                    <Text size="sm" fw={500}>
                      {new Date(license.uploaded_at).toLocaleDateString()}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Size</Text>
                    <Text size="sm" fw={500}>
                      {(license.file_size / 1024).toFixed(2)} KB
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>

            {/* Help Card */}
            <Card withBorder padding="lg" radius="md">
              <Title order={5} mb="sm">Tips</Title>
              <Stack gap="sm">
                <Group gap="xs" align="flex-start">
                  <ThemeIcon size="sm" variant="light" radius="xl">
                    <IconInfoCircle size={14} />
                  </ThemeIcon>
                  <Text size="sm" style={{ flex: 1 }}>
                    License names should be descriptive to help identify them easily.
                  </Text>
                </Group>
                <Group gap="xs" align="flex-start">
                  <ThemeIcon size="sm" variant="light" radius="xl">
                    <IconStar size={14} />
                  </ThemeIcon>
                  <Text size="sm" style={{ flex: 1 }}>
                    Only one license can be set as default at a time.
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}