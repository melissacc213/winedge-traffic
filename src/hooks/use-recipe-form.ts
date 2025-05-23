import { useForm } from '@mantine/form';
import { useState } from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

export interface Region {
  id: string;
  name: string;
  type: 'polygon' | 'rectangle';
  points: { x: number; y: number }[];
  directions?: { from: string; to: string[] }[];
}

export interface RecipeFormValues {
  id?: string;
  name: string;
  description: string;
  taskType: 'traffic_count' | 'train_detection' | '';
  sceneType: 'road' | 't_junction' | 'cross_junction' | '';
  videoFile: File | null;
  videoUrl: string;
  videoName: string;
  extractedFrame: string | null;
  extractedFrameTime: number | null;
  regions: Region[];
  modelId: string;
  modelName: string;
  modelParams: {
    confidenceThreshold: number;
    detectionClasses: string[];
    inferenceStep: number;
  };
}

const initialValues: RecipeFormValues = {
  name: '',
  description: '',
  taskType: '',
  sceneType: '',
  videoFile: null,
  videoUrl: '',
  videoName: '',
  extractedFrame: null,
  extractedFrameTime: null,
  regions: [],
  modelId: '',
  modelName: '',
  modelParams: {
    confidenceThreshold: 0.5,
    detectionClasses: ['car', 'bus', 'truck'],
    inferenceStep: 3,
  },
};

// Step validation schema
const stepValidationSchema = [
  // Step 1: Task Type
  z.object({
    taskType: z.enum(['traffic_count', 'train_detection'], {
      required_error: 'Please select a task type',
    }),
    sceneType: z.string().min(1, 'Please select a scene type'),
  }),
  
  // Step 2: Import Video
  z.object({
    videoFile: z.any().refine(val => val !== null, 'Please upload a video'),
    extractedFrame: z.string().min(1, 'Please extract a frame from the video'),
  }),
  
  // Step 3: Region Setup
  z.object({
    regions: z.array(z.any()).min(1, 'Please define at least one region'),
  }),
  
  // Step 4: Model Config
  z.object({
    modelId: z.string().min(1, 'Please select a model'),
    modelParams: z.object({
      confidenceThreshold: z.number().min(0.1).max(1),
      detectionClasses: z.array(z.string()).min(1),
      inferenceStep: z.number().min(1).max(10),
    }),
  }),
  
  // Step 5: Review & Submit
  z.object({
    name: z.string().min(3, 'Recipe name must be at least 3 characters'),
    description: z.string(),
  }),
];

export function useRecipeForm() {
  const { t } = useTranslation(['recipe', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RecipeFormValues>({
    initialValues,
    validate: (values) => {
      const errors: Record<string, string> = {};
      
      // Always validate these fields if they're entered
      if (values.name && values.name.length < 3) {
        errors.name = t('recipe:validation.name_too_short');
      }
      
      return errors;
    },
  });
  
  // Validate a specific step
  const isStepValid = (stepIndex: number) => {
    try {
      // Get validation schema for current step
      const schema = stepValidationSchema[stepIndex];
      if (!schema) return true;
      
      // Validate just the fields for this step
      schema.parse(form.values);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return false;
      }
      return false;
    }
  };
  
  // Submit the recipe
  const submitRecipe = async () => {
    // Validate all steps
    for (let i = 0; i < stepValidationSchema.length; i++) {
      if (!isStepValid(i)) {
        notifications.show({
          title: t('common:notification.validation_error'),
          message: t('recipe:validation.step_invalid', { step: i + 1 }),
          color: 'red',
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notifications.show({
        title: t('recipe:notification.success.title'),
        message: t('recipe:notification.success.message'),
        color: 'green',
      });
      
      // Reset form or redirect
      form.reset();
    } catch (error) {
      console.error('Error submitting recipe:', error);
      notifications.show({
        title: t('recipe:notification.error.title'),
        message: t('recipe:notification.error.message'),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isStepValid,
    submitRecipe,
    isSubmitting,
  };
}