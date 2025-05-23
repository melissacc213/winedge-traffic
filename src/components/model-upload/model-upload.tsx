import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Progress,
  Paper,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";
import { ModelsList } from "./models-list";
import { useModelUpload } from "../../hooks/use-model-upload";

export function ModelUpload() {
  const { t } = useTranslation(["models", "common"]);
  const {
    models,
    isLoading,
    uploadProgress,
    isUploading,
    handleDrop,
    handleDelete,
    handleDownload,
    resetUpload,
  } = useModelUpload();

  return (
    <Stack gap="lg">
      <Paper withBorder p="md">
        <Title order={3} mb="md">
          {t("models:upload.title")}
        </Title>
        <Text c="dimmed" mb="lg">
          {t("models:upload.description")}
        </Text>

        <Card withBorder>
          <Dropzone
            onDrop={handleDrop}
            onReject={(files) => console.log("rejected files", files)}
            maxSize={500 * 1024 * 1024} // 500MB
            accept={{
              "application/zip": [".zip", ".onnx"],
              "application/octet-stream": [
                ".pt",
                ".pth",
                ".bin",
                ".onnx",
                ".tflite",
              ],
              "application/x-zip-compressed": [".zip"],
            }}
            disabled={isUploading}
            padding="xl"
          >
            <Group
              justify="center"
              gap="xl"
              style={{ minHeight: 180, pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <Icons.Check size={50} color="green" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <Icons.X size={50} color="red" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <Icons.Upload size={50} stroke={1.5} />
              </Dropzone.Idle>

              <Box>
                <Text size="xl" inline>
                  {t("models:upload.dropzone_text")}
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  {t("models:upload.dropzone_hint")}
                </Text>
              </Box>
            </Group>
          </Dropzone>

          {isUploading && (
            <Box mt="md">
              <Group justify="space-between" mb={5}>
                <Text size="sm" weight={500}>
                  {uploadProgress.fileName}
                </Text>
                <Text size="sm" color="dimmed">
                  {Math.round(uploadProgress.progress)}%
                </Text>
              </Group>
              <Progress
                value={uploadProgress.progress}
                size="md"
                radius="xl"
                color={uploadProgress.progress < 100 ? "blue" : "green"}
              />
              {uploadProgress.progress === 100 && !uploadProgress.error && (
                <Text size="sm" color="green" mt={5}>
                  {t("models:upload.processing")}
                </Text>
              )}
              {uploadProgress.error && (
                <Text size="sm" color="red" mt={5}>
                  {uploadProgress.error}
                </Text>
              )}
              <Button
                variant="subtle"
                color="red"
                size="xs"
                mt="xs"
                onClick={resetUpload}
              >
                {t("common:action.cancel")}
              </Button>
            </Box>
          )}
        </Card>
      </Paper>

      <ModelsList
        models={models}
        isLoading={isLoading}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </Stack>
  );
}
