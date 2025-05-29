import { Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { PageLayout } from '@/components/page-layout/page-layout';
import { LicenseTable } from '@/components/license/LicenseTable';
import { LicenseCreateDialog } from '@/components/license/LicenseCreateDialog';
import { useKeys } from '@/lib/queries/settings';

export function LicensesPage() {
  const { t } = useTranslation(['licenses', 'common']);
  const { data, isLoading } = useKeys();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <PageLayout
        title={t('licenses:page.title')}
        description={t('licenses:page.description')}
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={open}
          >
            {t('licenses:actions.upload')}
          </Button>
        }
      >
        <Stack gap="lg">
          <LicenseTable isLoading={isLoading} onEditLicense={(license) => {
            // TODO: Implement edit functionality
            console.log('Edit license:', license);
          }} />
        </Stack>
      </PageLayout>

      <LicenseCreateDialog
        opened={opened}
        onClose={close}
      />
    </>
  );
}