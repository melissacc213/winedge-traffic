import { useState } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import {
  Stack,
  TextInput,
  Switch,
  Button,
  Group,
  Text,
  Paper,
  rem,
  Card,
  Title,
  ThemeIcon,
  Badge,
  Progress,
  Alert,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import {
  IconUpload,
  IconFile,
  IconX,
  IconLicense,
  IconCheck,
  IconInfoCircle,
  IconFileDescription,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CreateLicenseRequest } from '../../lib/validator/license';
import { createLicenseSchema } from '../../lib/validator/license';
import { useTheme } from '../../providers/theme-provider';

interface LicenseUploadProps {
  onSubmit: (values: CreateLicenseRequest & { file: File }) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function LicenseUpload({ onSubmit, isLoading, onCancel }: LicenseUploadProps) {
  const { t } = useTranslation(['licenses', 'common']);
  const [file, setFile] = useState<File | null>(null);
  const mantineTheme = useMantineTheme();
  const { colorScheme, theme } = useTheme();

  const form = useForm<CreateLicenseRequest>({
    initialValues: {
      name: '',
      is_default: false,
    },
    validate: zodResolver(createLicenseSchema),
  });

  const handleSubmit = (values: CreateLicenseRequest) => {
    if (!file) {
      return;
    }
    onSubmit({ ...values, file });
  };

  // Calculate completion status
  const hasName = !!form.values.name;
  const hasFile = !!file;
  const isComplete = hasName && hasFile;
  const completionPercentage = ([hasName, hasFile].filter(Boolean).length / 2) * 100;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* License Information Section */}
        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <div>
              <Title order={5} mb={4}>{t('licenses:upload.licenseInformation')}</Title>
              <Text size="sm" c="dimmed">
                {t('licenses:upload.licenseInformationDescription')}
              </Text>
            </div>
            
            <TextInput
              label={t('licenses:form.name')}
              placeholder={t('licenses:form.namePlaceholder')}
              leftSection={<IconLicense size={16} />}
              required
              size="md"
              {...form.getInputProps('name')}
            />

            <Switch
              label={t('licenses:form.setAsDefault')}
              description={t('licenses:form.setAsDefaultDescription')}
              size="md"
              {...form.getInputProps('is_default', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        {/* File Upload Section */}
        <Card withBorder radius="md" p="lg">
          <Stack gap="md">
            <div>
              <Title order={5} mb={4}>{t('licenses:upload.uploadLicenseFile')}</Title>
              <Text size="sm" c="dimmed">
                {t('licenses:upload.uploadDescription')}
              </Text>
            </div>

            {!file ? (
              <Dropzone
                onDrop={(files) => setFile(files[0])}
                onReject={() => setFile(null)}
                maxSize={5 * 1024 ** 2}
                accept={{
                  'application/x-x509-ca-cert': ['.rsa', '.pem', '.key', '.lic'],
                  'text/plain': ['.rsa', '.pem', '.key', '.lic'],
                  'application/octet-stream': ['.lic'],
                }}
                multiple={false}
                styles={{
                  root: {
                    border: `2px dashed ${colorScheme === "dark" ? theme.colors.gray[6] : theme.colors.gray[3]}`,
                    borderRadius: mantineTheme.radius.md,
                    padding: "40px",
                    backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
                      borderColor: colorScheme === "dark" ? theme.colors.gray[5] : theme.colors.gray[4],
                    },
                  },
                }}
              >
                <Stack align="center" justify="center" style={{ minHeight: 180 }} gap="md">
                  <Dropzone.Accept>
                    <ThemeIcon size={64} radius="xl" variant="light" color="green">
                      <IconCheck size={32} />
                    </ThemeIcon>
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <ThemeIcon size={64} radius="xl" variant="light" color="red">
                      <IconX size={32} />
                    </ThemeIcon>
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <ThemeIcon size={64} radius="xl" variant="light" color="blue">
                      <IconUpload size={32} />
                    </ThemeIcon>
                  </Dropzone.Idle>
                  
                  <div style={{ textAlign: "center" }}>
                    <Text size="lg" fw={500}>
                      {t('licenses:upload.dragDrop')}
                    </Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      {t('licenses:upload.or')}
                    </Text>
                  </div>
                  <Button variant="light" color="blue">
                    {t('licenses:upload.browse')}
                  </Button>
                  <Text size="xs" c="dimmed" ta="center">
                    {t('licenses:upload.acceptedFormats')}
                  </Text>
                </Stack>
              </Dropzone>
            ) : (
              <Paper 
                withBorder 
                p="lg" 
                radius="md"
                style={{
                  backgroundColor: colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                }}
              >
                <Group justify="space-between">
                  <Group gap="md">
                    <ThemeIcon size={48} radius="md" variant="light" color="teal">
                      <IconFileDescription size={24} />
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{file.name}</Text>
                      <Group gap="xs" mt={4}>
                        <Badge variant="light" color="blue" size="sm">
                          {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {(file.size / 1024).toFixed(2)} KB
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  <Button
                    variant="subtle"
                    color="red"
                    size="sm"
                    leftSection={<IconX size={16} />}
                    onClick={() => setFile(null)}
                  >
                    {t('common:button.remove')}
                  </Button>
                </Group>
              </Paper>
            )}
          </Stack>
        </Card>

        {/* Info Alert */}
        <Alert 
          icon={<IconInfoCircle />} 
          color="blue" 
          variant="light"
          radius="md"
        >
          <Text size="sm">
            {t('licenses:upload.infoMessage')}
          </Text>
        </Alert>

        {/* Action Buttons */}
        <Group justify="flex-end">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
              size="md"
            >
              {t('common:button.cancel')}
            </Button>
          )}
          <Button 
            type="submit" 
            loading={isLoading}
            disabled={!isComplete}
            leftSection={<IconUpload size={18} />}
            size="md"
            color="blue"
          >
            {t('licenses:form.uploadLicense')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}