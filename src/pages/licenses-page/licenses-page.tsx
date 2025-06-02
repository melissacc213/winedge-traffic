import {
  ActionIcon,
  Badge,
  Button,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icons } from "@/components/icons";
import { LicenseCreateDialog, LicenseEdit } from "@/components/license";
import { PageLayout } from "@/components/page-layout/page-layout";
import { DataTable } from "@/components/ui";
import { confirmDelete } from "@/lib/confirmation";
import {
  useDeleteLicense,
  useLicenses,
  useUpdateLicense,
} from "@/lib/queries/license";
import { highlightSearchTerm } from "@/lib/utils";
import type { License } from "@/lib/validator/license";

export function LicensesPage() {
  const { t } = useTranslation(["licenses", "common"]);
  const { data, isLoading } = useLicenses();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const deleteLicenseMutation = useDeleteLicense();
  const updateLicenseMutation = useUpdateLicense();

  const handleEditLicense = (license: License) => {
    setEditingLicense(license);
  };

  const handleDeleteLicense = (license: License) => {
    confirmDelete(license.name, t("licenses:common.license"), async () => {
      try {
        await deleteLicenseMutation.mutateAsync(license.id);
        notifications.show({
          color: "green",
          message: t("licenses:notifications.deleteSuccessMessage"),
          title: t("licenses:notifications.deleteSuccess"),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          message: t("licenses:notifications.deleteError"),
          title: t("common:error"),
        });
      }
    });
  };

  const columns = [
    {
      key: "is_default",
      label: "",
      render: (license: License) => (
        <Tooltip
          label={
            license.is_default
              ? t("licenses:defaultLicense")
              : t("licenses:setAsDefault")
          }
          withArrow
        >
          <ActionIcon
            variant={license.is_default ? "filled" : "subtle"}
            color="yellow"
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              if (!license.is_default) {
                try {
                  await updateLicenseMutation.mutateAsync({
                    data: { is_default: true },
                    id: license.id,
                  });
                  notifications.show({
                    color: "green",
                    message: t("licenses:notifications.defaultSetMessage"),
                    title: t("licenses:notifications.defaultSet"),
                  });
                } catch (error) {
                  notifications.show({
                    color: "red",
                    message: t("licenses:notifications.updateError"),
                    title: t("common:error"),
                  });
                }
              }
            }}
            style={{ cursor: license.is_default ? "default" : "pointer" }}
          >
            {license.is_default ? (
              <Icons.StarFilled size={16} />
            ) : (
              <Icons.Star size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      ),
      sortable: false,
      width: 50,
    },
    {
      key: "name",
      label: t("licenses:table.name"),
      render: (license: License, globalFilter?: string) => {
        // Return highlighted content directly without Text wrapper to preserve highlight styles
        if (globalFilter) {
          return (
            <div style={{ fontSize: "14px", fontWeight: 500 }}>
              {highlightSearchTerm(license.name, globalFilter)}
            </div>
          );
        }
        return (
          <Text fw={500} size="sm">
            {license.name}
          </Text>
        );
      },
    },
    {
      key: "file_name",
      label: t("licenses:table.fileName"),
      render: (license: License, globalFilter?: string) => {
        // Return highlighted content directly without Text wrapper to preserve highlight styles
        if (globalFilter) {
          return (
            <div
              style={{ color: "var(--mantine-color-dimmed)", fontSize: "14px" }}
            >
              {highlightSearchTerm(license.file_name, globalFilter)}
            </div>
          );
        }
        return (
          <Text size="sm" c="dimmed">
            {license.file_name}
          </Text>
        );
      },
    },
    {
      key: "status",
      label: t("licenses:table.status"),
      render: (license: License) => (
        <Badge
          variant="light"
          color={
            license.status === "active"
              ? "green"
              : license.status === "expired"
                ? "red"
                : "yellow"
          }
          size="md"
        >
          {t(`licenses:status.${license.status}`)}
        </Badge>
      ),
      width: 100,
    },
    {
      key: "expires_at",
      label: t("licenses:table.expiresAt"),
      render: (license: License) => {
        if (!license.expires_at) return <Text size="sm">—</Text>;
        const date = new Date(license.expires_at);
        const isExpired = date < new Date();
        return (
          <Text size="sm" c={isExpired ? "red" : undefined}>
            {date.toLocaleDateString()}
          </Text>
        );
      },
      width: 120,
    },
    {
      key: "uploaded_by",
      label: t("licenses:table.uploadedBy"),
      render: (license: License, globalFilter?: string) => {
        // Return highlighted content directly without Text wrapper to preserve highlight styles
        if (globalFilter) {
          return (
            <div style={{ fontSize: "14px" }}>
              {highlightSearchTerm(license.uploaded_by, globalFilter)}
            </div>
          );
        }
        return <Text size="sm">{license.uploaded_by}</Text>;
      },
    },
    {
      key: "uploaded_at",
      label: t("licenses:table.uploadedAt"),
      render: (license: License) => (
        <Text size="sm">
          {new Date(license.uploaded_at).toLocaleDateString()}
        </Text>
      ),
      width: 120,
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
          {t("common:action.edit")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Icons.Trash size={16} />}
          color="red"
          onClick={() => handleDeleteLicense(license)}
        >
          {t("common:action.delete")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <PageLayout
        title={t("licenses:page.title")}
        description={t("licenses:page.description")}
        actions={
          <Button
            leftSection={<Icons.Plus size={16} />}
            onClick={open}
            color="blue"
          >
            {t("licenses:actions.uploadLicense")}
          </Button>
        }
      >
        <Stack gap="lg">
          <DataTable
            data={data?.results || []}
            columns={columns}
            loading={isLoading}
            actions={actions}
            height={700}
            emptyMessage={t("licenses:noLicenses")}
            defaultSort={{ direction: "desc", key: "is_default" }}
            showPagination={true}
            pageSize={10}
            enableGlobalFilter={true}
          />
        </Stack>
      </PageLayout>

      <LicenseCreateDialog opened={opened} onClose={close} />

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
