import { useTranslation } from 'react-i18next';
import {
  Card,
  Group,
  Progress,
  Text,
  ThemeIcon,
  Badge,
  rem,
} from '@mantine/core';
import {
  IconFileCheck,
  IconFileX,
  IconUpload,
} from '@tabler/icons-react';
import type { UploadProgress } from '../../lib/store/model-store';

interface FileUploadProgressProps {
  progress: UploadProgress;
  filename: string;
}

export function UploadProgressItem({ progress, filename }: FileUploadProgressProps) {
  const { t } = useTranslation(['models']);
  
  const renderIcon = () => {
    switch (progress.status) {
      case 'success':
        return (
          <ThemeIcon color="green" size={38} radius="md">
            <IconFileCheck style={{ width: rem(24), height: rem(24) }} />
          </ThemeIcon>
        );
      case 'error':
        return (
          <ThemeIcon color="red" size={38} radius="md">
            <IconFileX style={{ width: rem(24), height: rem(24) }} />
          </ThemeIcon>
        );
      default:
        return (
          <ThemeIcon color="blue" size={38} radius="md">
            <IconUpload style={{ width: rem(24), height: rem(24) }} />
          </ThemeIcon>
        );
    }
  };

  const renderStatusBadge = () => {
    switch (progress.status) {
      case 'success':
        return <Badge color="green">{t('models:status.completed')}</Badge>;
      case 'error':
        return <Badge color="red">{t('models:status.failed')}</Badge>;
      case 'uploading':
        return <Badge color="blue">{`${t('models:status.uploading')} ${progress.progress}%`}</Badge>;
      default:
        return <Badge color="gray">{t('models:status.pending')}</Badge>;
    }
  };

  return (
    <Card withBorder padding="sm" radius="md" className="mb-4">
      <Group justify="space-between" align="flex-start">
        <Group>
          {renderIcon()}
          <div>
            <Text fw={500} size="sm" lineClamp={1} style={{ maxWidth: '250px' }}>
              {filename}
            </Text>
            {progress.error && (
              <Text size="xs" c="red">
                {progress.error}
              </Text>
            )}
          </div>
        </Group>
        
        {renderStatusBadge()}
      </Group>
      
      {progress.status === 'uploading' && (
        <Progress
          value={progress.progress}
          color={progress.status === 'error' ? 'red' : 'blue'}
          size="sm"
          radius="xs"
          className="mt-3"
          striped
          animated={progress.status === 'uploading'}
        />
      )}
    </Card>
  );
}