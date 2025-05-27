import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { LicenseUpload } from './LicenseUpload';
import { useUploadLicense } from '../../lib/queries/license';
import type { CreateLicenseRequest } from '../../lib/validator/license';

interface LicenseCreateDialogProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LicenseCreateDialog({ opened, onClose, onSuccess }: LicenseCreateDialogProps) {
  const { t } = useTranslation(['licenses']);
  const uploadLicense = useUploadLicense();

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
      padding="lg"
    >
      <LicenseUpload 
        onSubmit={handleSubmit} 
        isLoading={uploadLicense.isPending}
        onCancel={onClose}
      />
    </Modal>
  );
}