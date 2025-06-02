import { Button, Group, Modal, Stack, Switch,TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { Icons } from "@/components/icons";
import { useUpdateLicense } from "@/lib/queries/license";
import type { License } from "@/lib/validator/license";

interface LicenseEditProps {
  license: License;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LicenseEdit({ license, opened, onClose, onSuccess }: LicenseEditProps) {
  const { t } = useTranslation(["licenses", "common"]);
  const updateMutation = useUpdateLicense();

  const form = useForm({
    initialValues: {
      is_default: license.is_default,
      name: license.name,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await updateMutation.mutateAsync({
      data: values,
      id: license.id,
    });
    onSuccess?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("licenses:form.editLicense")}
      size="md"
      centered
      withinPortal
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t("licenses:form.name")}
            placeholder={t("licenses:form.namePlaceholder")}
            leftSection={<Icons.FileText size={16} />}
            {...form.getInputProps("name")}
          />

          <TextInput
            label={t("licenses:form.fileName")}
            value={license.file_name}
            disabled
            leftSection={<Icons.File size={16} />}
          />

          <Switch
            label={t("licenses:form.setAsDefault")}
            description={t("licenses:form.setAsDefaultDescription")}
            checked={form.values.is_default}
            onChange={(event) => form.setFieldValue('is_default', event.currentTarget.checked)}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose}>
              {t("common:action.cancel")}
            </Button>
            <Button type="submit" loading={updateMutation.isPending}>
              {t("common:action.save")}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}