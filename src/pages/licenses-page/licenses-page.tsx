import { useState } from 'react';
import { Button, Stack, Menu, ActionIcon, Badge, Group, Text } from '@mantine/core';
import { Icons } from '@/components/icons';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { PageLayout } from '@/components/page-layout/page-layout';
import { DataTable } from '@/components/ui';
import { LicenseCreateDialog, LicenseEdit } from '@/components/license';
import { useLicenses, useDeleteLicense, useUpdateLicense } from '@/lib/queries/license';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { License } from '@/lib/validator/license';

export function LicensesPage() {
  const { t } = useTranslation(['licenses', 'common']);
  const { data, isLoading } = useLicenses();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const deleteLicenseMutation = useDeleteLicense();
  const updateLicenseMutation = useUpdateLicense();

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
  };

  const handleDeleteLicense = (license: License) => {
    modals.openConfirmModal({
      title: t('licenses:confirmDelete.title'),
      children: (
        <Text size="sm">
          {t('licenses:confirmDelete.message', { name: license.name })}
        </Text>
      ),
      labels: { confirm: t('common:action.delete'), cancel: t('common:action.cancel') },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteLicenseMutation.mutateAsync(license.id);
          notifications.show({
            title: t('licenses:notifications.deleteSuccess'),
            message: t('licenses:notifications.deleteSuccessMessage'),
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: t('common:error'),
            message: t('licenses:notifications.deleteError'),
            color: 'red',
          });
        }
      },
    });
  };

  const columns = [
    {
      key: 'is_default',
      label: '',
      width: 40,
      sortable: false,
      render: (license: License) => (
        <ActionIcon
          variant={license.is_default ? 'filled' : 'subtle'}
          color="yellow"
          size="sm"
          onClick={async (e) => {
            e.stopPropagation();
            if (!license.is_default) {
              try {
                await updateLicenseMutation.mutateAsync({
                  id: license.id,
                  data: { is_default: true }
                });
                notifications.show({
                  title: t('licenses:notifications.defaultSet'),
                  message: t('licenses:notifications.defaultSetMessage'),
                  color: 'green',
                });
              } catch (error) {
                notifications.show({
                  title: t('common:error'),
                  message: t('licenses:notifications.updateError'),
                  color: 'red',
                });
              }
            }
          }}
          style={{ cursor: license.is_default ? 'default' : 'pointer' }}
        >
          {license.is_default ? <Icons.StarFilled size={16} /> : <Icons.Star size={16} />}
        </ActionIcon>
      ),
    },
    {
      key: 'name',
      label: t('licenses:table.name'),
      render: (license: License) => (
        <Text fw={500}>{license.name}</Text>
      ),
    },
    {
      key: 'file_name',
      label: t('licenses:table.fileName'),
      render: (license: License) => (
        <Text size="sm" c="dimmed">{license.file_name}</Text>
      ),
    },
    {
      key: 'status',
      label: t('licenses:table.status'),
      render: (license: License) => (
        <Badge 
          variant="light" 
          color={license.status === 'active' ? 'green' : license.status === 'expired' ? 'red' : 'yellow'}
        >
          {t(`licenses:status.${license.status}`)}
        </Badge>
      ),
    },
    {
      key: 'expires_at',
      label: t('licenses:table.expiresAt'),
      render: (license: License) => {
        if (!license.expires_at) return <Text size="sm">—</Text>;
        const date = new Date(license.expires_at);
        const isExpired = date < new Date();
        return (
          <Text size="sm" c={isExpired ? 'red' : undefined}>
            {date.toLocaleDateString()}
          </Text>
        );
      },
    },
    {
      key: 'uploaded_by',
      label: t('licenses:table.uploadedBy'),
      render: (license: License) => (
        <Text size="sm">{license.uploaded_by}</Text>
      ),
    },
    {
      key: 'uploaded_at',
      label: t('licenses:table.uploadedAt'),
      render: (license: License) => (
        <Text size="sm">{new Date(license.uploaded_at).toLocaleDateString()}</Text>
      ),
    },
  ];

  const actions = (license: License) => (
    <Menu position="bottom-end" withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <Icons.Dots size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Icons.Edit size={16} />}
          onClick={() => handleEditLicense(license)}
        >
          {t('common:action.edit')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => handleDeleteLicense(license)}
        >
          {t('common:action.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <PageLayout
        title={t('licenses:page.title')}
        description={t('licenses:page.description')}
        actions={
          <Button
            leftSection={<Icons.Plus size={16} />}
            onClick={open}
          >
            {t('licenses:actions.createLicense')}
          </Button>
        }
      >
        <Stack gap="lg">
          <DataTable
            data={data?.results || []}
            columns={columns}
            loading={isLoading}
            actions={actions}
            height={600}
            emptyMessage={t('licenses:noLicenses')}
            defaultSort={{ key: 'is_default', direction: 'desc' }}
          />
        </Stack>
      </PageLayout>

      <LicenseCreateDialog
        opened={opened}
        onClose={close}
      />

      {editingLicense && (
        <LicenseEdit
          license={editingLicense}
          opened={!!editingLicense}
          onClose={() => setEditingLicense(null)}
          onSuccess={() => setEditingLicense(null)}
        />
      )}
    </>
  );
}