import type { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect,useState } from "react";
import { useTranslation } from "react-i18next";

import { confirmDelete } from "../lib/confirmation";
import { useModelStore } from "../lib/store/model-store";
import { validateModelFile } from "../lib/validator/model";

interface UploadProgressState {
  fileName: string;
  progress: number;
  error: string | null;
}

export function useModelUpload() {
  const { t } = useTranslation(["models", "common"]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    error: null,
    fileName: "",
    progress: 0,
  });

  // Get models from store
  const { models, isLoading, addModel, removeModel, fetchModels } =
    useModelStore();

  // Fetch models when component mounts
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Handle file drop
  const handleDrop = useCallback(
    async (files: FileWithPath[]) => {
      if (files.length === 0) return;

      const file = files[0];

      // Validate file
      try {
        validateModelFile(file);
      } catch (error) {
        notifications.show({
          color: "red",
          message: error instanceof Error ? error.message : String(error),
          title: t("models:notification.upload_error"),
        });
        return;
      }

      setIsUploading(true);
      setUploadProgress({
        error: null,
        fileName: file.name,
        progress: 0,
      });

      // Simulate file upload with progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev.progress + Math.random() * 10, 100);
          return {
            ...prev,
            progress: newProgress,
          };
        });
      }, 300);

      try {
        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Clear interval
        clearInterval(uploadInterval);

        // Set progress to 100%
        setUploadProgress((prev) => ({
          ...prev,
          progress: 100,
        }));

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate random ID
        const id = `model_${Date.now()}`;

        // Add model to store
        addModel({
          createdAt: new Date().toISOString(),
          description: "",
          id,
          name: file.name.split(".")[0],
          size: file.size,
          status: "active",
          type: file.name.split(".").pop() || "unknown",
        });

        notifications.show({
          color: "green",
          message: t("models:notification.upload_success_message", {
            name: file.name,
          }),
          title: t("models:notification.upload_success"),
        });

        // Reset upload state
        setIsUploading(false);
        setUploadProgress({
          error: null,
          fileName: "",
          progress: 0,
        });
      } catch (error) {
        clearInterval(uploadInterval);

        setUploadProgress((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : String(error),
        }));

        notifications.show({
          color: "red",
          message: error instanceof Error ? error.message : String(error),
          title: t("models:notification.upload_error"),
        });

        setIsUploading(false);
      }
    },
    [addModel, t]
  );

  // Handle delete model
  const handleDelete = useCallback(
    (id: string) => {
      const model = models.find((m) => m.id === id);
      if (!model) return;

      confirmDelete(model.name, t("models:common.model"), () => {
        removeModel(id);

        notifications.show({
          color: "green",
          message: t("models:notification.delete_success_message"),
          title: t("models:notification.delete_success"),
        });
      });
    },
    [models, removeModel, t]
  );


  // Reset upload state
  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress({
      error: null,
      fileName: "",
      progress: 0,
    });
  }, []);

  return {
    handleDelete,
    handleDrop,
    isLoading,
    isUploading,
    models,
    resetUpload,
    uploadProgress,
  };
}
