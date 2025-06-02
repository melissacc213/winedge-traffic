import { Modal, useComputedColorScheme,useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useCreateKey } from '../../lib/queries/settings';
import type { CreateLicenseRequest } from '../../lib/validator/license';
import { LicenseUpload } from './LicenseUpload';

interface LicenseCreateDialogProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LicenseCreateDialog({ opened, onClose, onSuccess }: LicenseCreateDialogProps) {
  const { t } = useTranslation(['licenses']);
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();
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
          borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[3]}`,
          flexShrink: 0,
          padding: '1rem',
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