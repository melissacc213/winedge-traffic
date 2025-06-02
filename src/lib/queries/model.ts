import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import { modelService } from '../api';
import { useModelStore } from '../store/model-store';

export const modelKeys = {
  all: ['models'] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
  details: () => [...modelKeys.all, 'detail'] as const,
  list: (filters: string) => [...modelKeys.lists(), { filters }] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
};

export function useModels() {
  const setModels = useModelStore((state) => state.setModels);
  const setLoading = useModelStore((state) => state.setLoading);
  const setError = useModelStore((state) => state.setError);

  return useQuery({
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await modelService.getModels();
        setModels(data);
        setError(null);
        return data;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch models');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    queryKey: modelKeys.lists(),
  });
}

export function useModelDetails(id: string) {
  const updateModel = useModelStore((state) => state.updateModel);

  return useQuery({
    enabled: !!id,
    queryFn: async () => {
      const data = await modelService.getModel(id);
      updateModel(id, data);
      return data;
    },
    queryKey: modelKeys.detail(id),
  });
}

export function useUploadModel() {
  const queryClient = useQueryClient();
  const addModel = useModelStore((state) => state.addModel);
  const setUploadProgress = useModelStore((state) => state.setUploadProgress);
  const clearUploadProgress = useModelStore((state) => state.clearUploadProgress);
  const updateModel = useModelStore((state) => state.updateModel);

  return useMutation({
    mutationFn: async (file: File) => {
      // Generate a temp ID for tracking upload progress
      const tempId = uuidv4();
      
      // Create a temporary model entry
      const tempModel = {
        id: tempId,
        name: file.name,
        size: file.size,
        status: 'processing' as const,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      };
      
      // Add to store
      addModel(tempModel);
      
      // Initialize progress
      setUploadProgress(tempId, {
        progress: 0,
        status: 'uploading',
      });
      
      try {
        // Handle upload progress
        const handleProgress = (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          
          setUploadProgress(tempId, {
            progress: percentCompleted,
            status: 'uploading',
          });
        };
        
        // Upload the file
        const data = await modelService.uploadModel(file, handleProgress);
        
        // Update with real data from server
        updateModel(tempId, {
          id: data.id,
          status: 'available',
        });
        
        // Clear progress tracking
        clearUploadProgress(tempId);
        
        return data;
      } catch (error) {
        // Handle error
        updateModel(tempId, {
          error: error instanceof Error ? error.message : 'Upload failed',
          status: 'error',
        });
        
        setUploadProgress(tempId, {
          error: error instanceof Error ? error.message : 'Upload failed',
          progress: 0,
          status: 'error',
        });
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: modelKeys.lists(),
      });
    },
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  const removeModel = useModelStore((state) => state.removeModel);

  return useMutation({
    mutationFn: async (id: string) => {
      await modelService.deleteModel(id);
      removeModel(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: modelKeys.lists(),
      });
    },
  });
}

export function useCreateModel() {
  const queryClient = useQueryClient();
  const addModel = useModelStore((state) => state.addModel);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      type: string;
      size: number;
      description: string;
      parameters?: Record<string, string>;
    }) => {
      const newModel = await modelService.createModel(data);
      addModel(newModel);
      return newModel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: modelKeys.lists(),
      });
    },
  });
}