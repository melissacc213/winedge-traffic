import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LicenseUpload } from './LicenseUpload';
import { useCreateKey } from '../../lib/queries/settings';
import { useTheme } from '../../providers/theme-provider';
import type { CreateLicenseRequest } from '../../lib/validator/license';

interface LicenseCreateDialogProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LicenseCreateDialog({ opened, onClose, onSuccess }: LicenseCreateDialogProps) {
  const { t } = useTranslation(['licenses']);
  const { colorScheme, theme } = useTheme();
  const uploadLicense = useCreateKey();

  const handleSubmit = async (values: CreateLicenseRequest & { file: File }) => {
    await uploadLicense.mutateAsync(values);
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('licenses:createDialog.title')}
      size="lg"
      centered
      radius="md"
      withinPortal
      styles={{
        body: {
          maxHeight: 'calc(100vh - 120px)',
          overflow: 'hidden',
          padding: 0,
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)',
        },
        header: {
          flexShrink: 0,
          padding: '1rem',
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark?.[4] || theme.colors.gray[6] : theme.colors.gray[3]}`,
        }
      }}
      scrollAreaComponent={undefined}
    >
      <LicenseUpload 
        onSubmit={handleSubmit} 
        isLoading={uploadLicense.isPending}
        onCancel={onClose}
      />
    </Modal>
  );
}