import {
  Button,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconFolder,
  IconLicense,
  IconSettings,
  IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreateLicenseRequest } from '../../lib/validator/license';
import { createLicenseSchema } from '../../lib/validator/license';

interface LicenseUploadProps {
  onSubmit: (values: CreateLicenseRequest & { file: File }) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function LicenseUpload({ onSubmit, isLoading, onCancel }: LicenseUploadProps) {
  const { t } = useTranslation(['licenses', 'common']);
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState('');
  const [taskType, setTaskType] = useState<string | null>(null);
  // Theme variables removed as they were unused

  const form = useForm<CreateLicenseRequest>({
    initialValues: {
      is_default: false,
      name: '',
    },
    validate: zodResolver(createLicenseSchema),
  });

  const handleSubmit = (values: CreateLicenseRequest) => {
    if (!file) {
      return;
    }
    onSubmit({ ...values, file });
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.rsa,.pem,.key,.lic';
    input.onchange = (e) => {
      const selectedFile = (e.target as HTMLInputElement).files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setFilePath(selectedFile.name);
      }
    };
    input.click();
  };

  // Calculate completion status
  const hasName = !!form.values.name;
  const hasTaskType = !!taskType;
  const hasFile = !!file;
  const isComplete = hasName && hasTaskType && hasFile;

  const taskTypeOptions = [
    { label: 'License Validation', value: 'license_validation' },
    { label: 'License Installation', value: 'license_installation' },
    { label: 'License Verification', value: 'license_verification' },
  ];

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Task Configuration Section */}
        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <div>
              <Title order={5} mb={4}>{t('licenses:upload.taskConfiguration')}</Title>
              <Text size="sm" c="dimmed">
                {t('licenses:upload.taskConfigurationDescription')}
              </Text>
            </div>
            
            <TextInput
              label={t('licenses:form.name')}
              placeholder={t('licenses:form.namePlaceholder')}
              leftSection={<IconLicense size={16} />}
              size="md"
              {...form.getInputProps('name')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t('licenses:upload.taskType.title')}
                  placeholder={t('licenses:upload.taskType.placeholder')}
                  leftSection={<IconSettings size={16} />}
                  data={taskTypeOptions}
                  value={taskType}
                  onChange={setTaskType}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('licenses:upload.localFilePath')}
                  placeholder={t('licenses:form.filePathPlaceholder')}
                  leftSection={<IconFolder size={16} />}
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  rightSection={
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={handleFileSelect}
                      style={{ marginRight: 4 }}
                    >
                      {t('licenses:upload.browse')}
                    </Button>
                  }
                  rightSectionWidth={80}
                  size="md"
                />
              </Grid.Col>
            </Grid>

            <Switch
              label={t('licenses:form.setAsDefault')}
              description={t('licenses:form.setAsDefaultDescription')}
              size="md"
              {...form.getInputProps('is_default', { type: 'checkbox' })}
            />
          </Stack>
        </Paper>

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