# WinEdge Traffic Management System - CLAUDE.md

This is the development guide for WinEdge, a sophisticated traffic statistics and object detection system built with modern web technologies.

## Tech Stack Architecture

### Core Technologies

- **React 19.1.0** with TypeScript 5.8.3 (strict mode)
- **Mantine UI v8.0.1** - Primary component library with comprehensive components (@mantine/core, @mantine/form, @mantine/hooks, @mantine/notifications, @mantine/dates, @mantine/dropzone)
- **Tailwind CSS v4.1.7** - Utility-first CSS framework
- **TanStack React Query v5.76.1** - Server state management and API caching
- **Zustand v4.5.7** - Client state management
- **Zod v3.25.7** - Schema validation and type safety
- **React Router DOM v7.6.0** - Client-side routing
- **Vite v6.3.5** - Build tool and dev server
- **i18next v25.2.0** - Internationalization (English/Chinese Traditional)

### Additional Libraries

- **Konva v9.3.20 + React-Konva v19.0.3** - Canvas-based region drawing and visualization
- **Axios v1.9.0** - HTTP client
- **UUID v9.0.1** - Unique identifier generation
- **JSZip v3.10.1** - File compression/decompression
- **TanStack React Table v8.21.3** - Data table functionality
- **Tabler Icons React v3.33.0** - Icon library
- **clsx v2.1.1 + tailwind-merge v3.3.0** - Conditional CSS class utilities
- **use-image v1.1.2** - Image loading hook for Konva

### Video Processing

- **FFmpeg.wasm** - WebAssembly-based video processing for browser-side video manipulation
  - Reference implementation: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/main/apps/react-vite-app
  - Used for client-side video transcoding, format conversion, and frame extraction
  - Enables processing traffic videos without server-side dependencies

## Project Structure

### Key Directories

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Generic UI components & skeletons
│   ├── layout/          # App layout components
│   ├── model-*/         # Model management components
│   ├── recipe-*/        # Recipe/workflow components
│   ├── task-*/          # Task management components
│   └── road-config/     # Traffic region configuration
├── pages/               # Route-level page components
├── lib/                 # Core utilities and services
│   ├── api/            # API service functions
│   ├── queries/        # React Query hooks
│   ├── store/          # Zustand stores
│   ├── validator/      # Zod validation schemas
│   └── websocket/      # WebSocket connections
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── providers/          # React context providers
└── themes/             # Mantine theme configuration
```

## Development Patterns

### 1. Component Architecture

Use Mantine UI components as the foundation with consistent styling:

```typescript
import { Paper, Stack, Group, Button, Text } from '@mantine/core';
import { useTheme } from '@/providers/theme-provider';

export function ExampleComponent() {
  const { colorScheme, theme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={600}>Title</Text>
        {/* Component content */}
      </Stack>
    </Paper>
  );
}
```

#### Icon Usage

Always import icons from the `Icons` component rather than directly from `@tabler/icons-react`:

```typescript
// ✅ Correct - uses memoized icons
import { Icons } from '@/components/icons';

function MyComponent() {
  return <Icons.Settings size={20} />;
}

// ❌ Incorrect - avoid direct imports
import { IconSettings } from '@tabler/icons-react';
```

The `Icons` component uses `useMemo` for performance optimization, preventing unnecessary re-renders when icons are used throughout the application.

##### Adding New Icons

When you need to add a new icon that's not available in the Icons component:

1. First check if the icon exists in `@tabler/icons-react`
2. Edit `/src/components/ui/icon-map.ts`:

```typescript
// 1. Add the import
import {
  // ... existing imports
  IconVideo, // Add new icon import
  IconRefresh, // Add another icon import
  // ... rest of imports
} from "@tabler/icons-react";

// 2. Add to RawIcons object
export const RawIcons = {
  // ... existing icons
  Video: IconVideo, // Add new icon mapping
  Refresh: IconRefresh, // Add another icon mapping
  // ... rest of icons
};
```

3. Now you can use the new icons:

```typescript
<Icons.Video size={20} />
<Icons.Refresh size="md" color="blue" />
```

### 2. API Integration Pattern

Follow the established pattern: Zod schema → API service → React Query hook → Zustand store

```typescript
// 1. Define Zod schema (lib/validator/)
export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: z.enum(["pending", "running", "completed", "failed"]),
  createdAt: z.string().datetime(),
});

// 2. API service function (lib/api/)
export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get("/api/tasks");
    return taskSchema.array().parse(response.data);
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post("/api/tasks", data);
    return taskSchema.parse(response.data);
  },
};

// 3. React Query hook (lib/queries/)
export function useTasks() {
  const setTasks = useTaskStore((state) => state.setTasks);

  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const data = await taskService.getTasks();
      setTasks(data);
      return data;
    },
  });
}

// 4. Zustand store (lib/store/)
interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
}));
```

### 3. Multi-Step Form Management

For complex workflows (like recipe creation), use both Zustand for persistence and Mantine Form for validation:

```typescript
// Zustand store for cross-step persistence
interface RecipeWorkflowState {
  currentStep: number;
  formData: {
    taskType?: string;
    modelConfig?: ModelConfig;
    regions?: Region[];
  };
  updateFormData: (step: string, data: any) => void;
  nextStep: () => void;
  previousStep: () => void;
}

// Individual step component with Mantine Form
function RegionSetupStep() {
  const { formData, updateFormData, nextStep } = useRecipeStore();

  const form = useForm({
    initialValues: formData.taskType || '',
    validate: zodResolver(taskTypeSchema),
  });

  const handleSubmit = (values: any) => {
    updateFormData('taskType', values);
    nextStep();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 4. Theme Integration

Use the comprehensive Mantine theme system with 40+ color variants:

```typescript
// CRITICAL: Theme property access in Mantine v8
import { useMantineTheme } from "@mantine/core";
import { useTheme } from "@/providers/theme-provider";

// For Mantine built-in properties (radius, spacing, etc.)
const mantineTheme = useMantineTheme();
const borderRadius = mantineTheme.radius.md; // ✅ Correct
const spacing = mantineTheme.spacing.md; // ✅ Correct

// For custom theme properties (colors, shadows, etc.)
const { theme } = useTheme();
const shadow = theme.other.shadows.md; // ✅ Correct
const regionColor = theme.other.regionPalette[index]; // ✅ Correct

// ❌ WRONG - This will cause "Cannot read properties of undefined" errors:
// const borderRadius = theme.radius.md;
// const spacing = theme.spacing.md;

// Access theme colors for regions/visualizations
const { theme } = useTheme();
const regionColor =
  theme.other.regionPalette[index % theme.other.regionPalette.length];

// Use theme-aware styling - NEVER hardcode colors
const cardStyle = {
  backgroundColor: isDark ? theme.colors.gray[9] : theme.white,
  borderColor: theme.colors.gray[isDark ? 7 : 2],
};

// Use theme shadows
const boxStyle = {
  boxShadow: theme.other.shadows.sm, // xs, sm, md, lg, xl available
};

// Theme color access patterns:
// - Standard colors: theme.colors.blue[5]
// - UI colors: theme.other.ui.border
// - Backgrounds: theme.other.backgrounds.cardLight
// - Task colors: theme.other.taskTypes.trafficStatistics
// - Region colors: theme.other.regionColors.countLine
```

**IMPORTANT: Theme Property Access Rules**

1. **Mantine built-in properties** (`radius`, `spacing`, `fontSizes`, etc.):

   - Use `useMantineTheme()` hook
   - Access via `mantineTheme.radius.md`, `mantineTheme.spacing.lg`, etc.

2. **Custom theme properties** (defined in `theme.other`):

   - Use `useTheme()` hook from our theme provider
   - Access via `theme.other.shadows.md`, `theme.other.regionPalette`, etc.

3. **Color properties**:
   - Can be accessed from either `mantineTheme` or `theme`
   - Both `mantineTheme.colors.blue[5]` and `theme.colors.blue[5]` work

**IMPORTANT: Color Usage Rules**

1. **NEVER hardcode colors** - Always use theme colors
2. **NEVER use raw rgba/hex values** - Define them in the theme first
3. **For new colors**: Add to theme structure in `/src/themes/index.ts`
4. **Theme structure**:
   - Base colors in `colors` object (blue, red, green, etc.)
   - Custom colors in `other` object (ui, backgrounds, shadows, etc.)
   - Light/dark overrides in respective theme objects

### 5. Dark Theme Considerations

When implementing UI components, ALWAYS test with both light and dark themes:

```typescript
// Use theme-aware colors for backgrounds
backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[0]

// Use theme-aware colors for borders
borderColor: isDark ? theme.colors.dark[4] : theme.colors.gray[2]

// Use theme-aware colors for text
color: isDark ? theme.colors.gray[5] : theme.colors.gray[6]

// Example component with proper dark theme support
<Paper
  style={{
    backgroundColor: isDark ? theme.colors.dark[8] : theme.white,
    borderBottom: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
  }}
>
  <Text c={isDark ? "white" : "black"}>Content</Text>
</Paper>
```

**Dark Theme Best Practices**:

1. Always check `isDark` from `useTheme()` hook
2. Use semantic color values (dark[6-9] for dark backgrounds)
3. Ensure sufficient contrast for text readability
4. Test all interactive states (hover, active, disabled)
5. Use theme.colors.dark for dark mode backgrounds:
   - dark[9]: Darkest (main background)
   - dark[8]: Slightly lighter (cards)
   - dark[7]: Lighter (hover states)
   - dark[6]: Even lighter (active states)
   - dark[5]: Borders and dividers
   - dark[4]: Subtle borders

**CRITICAL: Dark Theme Color Access Pattern**

Due to potential theme configuration variations, ALWAYS use optional chaining when accessing `theme.colors.dark` array:

```typescript
// ❌ WRONG - This will cause "Cannot read properties of undefined" errors:
backgroundColor: isDark ? theme.colors.dark[7] : theme.white

// ✅ CORRECT - Use optional chaining with fallback:
backgroundColor: isDark ? theme.colors.dark?.[7] || theme.colors.gray[8] : theme.white

// Recommended fallback mapping:
// dark[9] → gray[9]
// dark[8] → gray[9]
// dark[7] → gray[8]
// dark[6] → gray[7]
// dark[5] → gray[6]
// dark[4] → gray[6]
// dark[3] → gray[6]
```

This pattern prevents runtime errors when the theme doesn't have the `dark` color array defined.

### 6. Canvas-Based Region Configuration

For traffic region setup, use React-Konva with the theme system:

```typescript
import { Stage, Layer, Rect, Circle } from 'react-konva';

function RegionCanvas({ regions, onRegionUpdate }) {
  const { theme } = useTheme();

  return (
    <Stage width={800} height={600}>
      <Layer>
        {regions.map((region, index) => (
          <Rect
            key={region.id}
            x={region.x}
            y={region.y}
            width={region.width}
            height={region.height}
            fill={theme.other.regionPalette[index]}
            opacity={theme.other.transparency.regionFill}
            stroke={theme.other.regionPalette[index]}
            strokeWidth={2}
            draggable
            onDragEnd={(e) => onRegionUpdate(region.id, {
              x: e.target.x(),
              y: e.target.y(),
            })}
          />
        ))}
      </Layer>
    </Stage>
  );
}
```

## UI/UX Guidelines

### Design Principles

- **Consistent Spacing**: Use Mantine's spacing system (`xs`, `sm`, `md`, `lg`, `xl`)
- **Visual Hierarchy**: Clear typography hierarchy with consistent font weights
- **Color Consistency**: Leverage the 40-color region palette for visualizations
- **Responsive Design**: Mobile-first approach with Mantine's responsive utilities
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### Component Patterns

```typescript
// Standard layout pattern
<PageLayout>
  <PageHeader title="Page Title" />
  <Stack gap="lg">
    <Paper p="lg" radius="md" withBorder>
      {/* Main content */}
    </Paper>
  </Stack>
</PageLayout>

// Loading states with skeletons
{isLoading ? (
  <TableSkeleton />
) : (
  <TaskTable data={tasks} />
)}

// Error boundaries with user-friendly messages
{error && (
  <Alert variant="light" color="red" title="Error">
    {error.message}
  </Alert>
)}
```

### Interactive Elements

- **Hover Effects**: Subtle transforms (`translateY(-2px)`) on cards and buttons
- **Visual Feedback**: Loading states, progress indicators, and status badges
- **Smooth Transitions**: 200ms ease transitions for interactive elements

## Multi-Step Workflow Pattern

The WinEdge Traffic system implements a comprehensive multi-step workflow pattern for complex form processes, exemplified by the Recipe Creation workflow. This pattern should be used as a template for any multi-step process in the application.

### Architecture Overview

```typescript
// Complete multi-step workflow consists of:
pages/feature-creation-page/           # Page wrapper
  ├── feature-creation-page.tsx        # Main page with navigation guard
components/feature-creation/           # Workflow components
  ├── stepper.tsx                      # Main stepper orchestrator
  ├── navigation-guard.tsx             # Navigation protection
  └── steps/                          # Individual step components
      ├── step-1.tsx
      ├── step-2.tsx
      └── step-3.tsx
lib/store/feature-store.ts            # Zustand state management
lib/queries/feature.ts               # React Query integration
```

### 1. Page Level Implementation

```typescript
// Pattern: Main page handles browser navigation and cleanup
export function FeatureCreationPage() {
  const { resetForm, isDirty } = useFeatureStore();

  // Prevent accidental browser navigation loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Cleanup on unmount - only if navigation was confirmed
  useEffect(() => {
    return () => {
      const isConfirmed = sessionStorage.getItem("feature-navigation-confirmed");
      if (isConfirmed === "true") {
        resetForm();
        sessionStorage.removeItem("feature-navigation-confirmed");
      }
    };
  }, [resetForm]);

  return (
    <>
      <FeatureNavigationGuard />
      <FeatureStepper />
    </>
  );
}
```

### 2. Navigation Guard Component

```typescript
// Pattern: Protects against navigation loss with React Router useBlocker
export function FeatureNavigationGuard() {
  const { isDirty, resetForm } = useFeatureStore();
  const [showModal, setShowModal] = useState(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (isDirty && currentLocation.pathname !== nextLocation.pathname) {
      const isConfirmed = sessionStorage.getItem("feature-navigation-confirmed");
      return !isConfirmed; // Block if not confirmed
    }
    return false;
  });

  // Handle modal confirmation
  const handleConfirm = () => {
    sessionStorage.setItem("feature-navigation-confirmed", "true");
    resetForm();
    if (blocker.state === "blocked") blocker.proceed();
  };

  return (
    <Modal opened={showModal} title="Leave Creation Process?">
      <Text>You have unsaved changes. Leave without saving?</Text>
      <Group>
        <Button variant="outline" onClick={() => setShowModal(false)}>
          Continue Editing
        </Button>
        <Button color="red" onClick={handleConfirm}>
          Leave Without Saving
        </Button>
      </Group>
    </Modal>
  );
}
```

### 3. Main Stepper Orchestrator

```typescript
// Pattern: Handles step progression, validation, and UI layout
export function FeatureStepper() {
  const { activeStep, formValues, nextStep, previousStep, resetForm } = useFeatureStore();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Step-specific validation functions
  const validateStep = (stepIndex: number): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    switch (stepIndex) {
      case 0:
        if (!formValues.requiredField) {
          errors.requiredField = "Detailed user-friendly error message explaining what's needed and why";
        }
        break;
      case 1:
        // Additional validation logic...
        break;
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Handle next button with validation
  const handleNext = () => {
    const { isValid, errors } = validateStep(activeStep);

    if (!isValid) {
      const errorCount = Object.keys(errors).length;
      const errorMessage = errorCount === 1
        ? Object.values(errors)[0]
        : `Please fix the following ${errorCount} issues:\n${Object.values(errors).map((err, idx) => `${idx + 1}. ${err}`).join('\n')}`;

      notifications.show({
        title: errorCount === 1 ? "Action Required" : "Actions Required",
        message: errorMessage,
        color: "red",
        autoClose: errorCount > 1 ? 10000 : 5000,
      });
      return;
    }

    if (activeStep === finalStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  // Layout: Header + Content + Footer pattern
  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 70px)" }}>
      {/* Fixed Header with Progress */}
      <Box style={{ backgroundColor: theme.colors.dark[8], borderBottom: "1px solid" }}>
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Group gap="xl">
              <Title order={2}>Create Feature</Title>
              {/* Step indicators with icons and completion status */}
              <Group gap="lg">
                {steps.map((step, index) => (
                  <StepIndicator
                    key={step.id}
                    step={step}
                    isActive={index === activeStep}
                    isCompleted={index < activeStep}
                  />
                ))}
              </Group>
            </Group>
            <Button color="red" onClick={handleCancel}>Exit</Button>
          </Group>
        </Container>
      </Box>

      {/* Scrollable Content Area */}
      <Box style={{ flex: 1, overflowY: "auto" }}>
        <Container size="lg" py="xl">
          {/* Validation Errors Alert */}
          {Object.keys(validationErrors).length > 0 && (
            <ValidationErrorsAlert errors={validationErrors} />
          )}

          {/* Current Step Component */}
          {stepComponents[activeStep]}
        </Container>
      </Box>

      {/* Fixed Footer Navigation */}
      <Box style={{ backgroundColor: theme.colors.dark[8], borderTop: "1px solid" }}>
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<Icons.ChevronLeft />}
              onClick={handlePrevious}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button
              rightSection={isLastStep ? <Icons.Check /> : <Icons.ChevronRight />}
              onClick={handleNext}
              loading={isSubmitting}
            >
              {isLastStep ? "Create Feature" : "Next"}
            </Button>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
```

### 4. Zustand Store Pattern

```typescript
// Pattern: Comprehensive state management with step tracking and data persistence
interface FeatureStoreState {
  // Navigation state
  activeStep: number;
  isDirty: boolean;
  stepCompleted: Record<string, boolean>;

  // Form data
  formValues: FeatureFormValues;

  // Actions
  nextStep: () => void;
  previousStep: () => void;
  updateForm: (values: Partial<FeatureFormValues>) => void;
  resetForm: () => void;

  // Step-specific clear functions (for back navigation)
  clearStep1Data: () => void;
  clearStep2Data: () => void;

  // API payload generation
  generateAPIPayload: () => APIPayload | null;
}

export const useFeatureStore = create<FeatureStoreState>((set, get) => ({
  activeStep: 0,
  isDirty: false,
  stepCompleted: {
    step0: false,
    step1: false,
    step2: false,
  },
  formValues: initialFormState,

  nextStep: () =>
    set((state) => ({
      activeStep: Math.min(state.activeStep + 1, maxSteps - 1),
    })),

  updateForm: (values) =>
    set((state) => ({
      formValues: { ...state.formValues, ...values },
      isDirty: true,
    })),

  // Generate API-ready payload based on form data
  generateAPIPayload: () => {
    const state = get();
    const { formValues } = state;

    // Validate required fields
    if (!formValues.requiredField || !formValues.anotherField) {
      return null;
    }

    // Transform form data to API format
    return {
      ...formValues,
      // API-specific transformations
      transformed_field: formValues.uiField.map(transformFunction),
    };
  },
}));
```

### 5. Individual Step Components

```typescript
// Pattern: Focused, single-responsibility step components
export function Step1Component() {
  const { formValues, updateForm } = useFeatureStore();
  const { theme } = useTheme();

  return (
    <Stack gap="xl">
      {/* Step title and description */}
      <Box>
        <Title order={3} mb="xs">Step Title</Title>
        <Text c="dimmed">Clear description of what this step accomplishes</Text>
      </Box>

      {/* Main content area */}
      <Paper p="xl" radius="md" withBorder>
        {/* Form fields, file uploads, canvas components, etc. */}
        <Stack gap="md">
          {/* Component-specific UI */}
        </Stack>
      </Paper>

      {/* Optional: Step-specific actions or info panels */}
      <Card variant="light" bg={theme.other.backgrounds.cardLight}>
        <Text size="sm">Helpful tips or additional information</Text>
      </Card>
    </Stack>
  );
}
```

### 6. React Query Integration

```typescript
// Pattern: Mutation handles API payload generation from store
export function useCreateFeature() {
  const queryClient = useQueryClient();
  const generateAPIPayload = useFeatureStore(
    (state) => state.generateAPIPayload
  );
  const formValues = useFeatureStore((state) => state.formValues);

  return useMutation({
    mutationFn: async () => {
      const payload = generateAPIPayload();

      if (!payload) {
        throw new Error(
          "Failed to generate API payload. Please ensure all required fields are filled."
        );
      }

      return await featureService.createFeature(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
    },
  });
}
```

### Key Design Principles

1. **Separation of Concerns**: Page handles navigation, stepper handles orchestration, steps handle specific UI
2. **State Persistence**: Zustand store maintains form state across navigation
3. **Validation Strategy**: Step-specific validation with detailed, actionable error messages
4. **Navigation Protection**: Prevent accidental data loss with confirmation modals
5. **Progressive Disclosure**: Show only relevant information for current step
6. **API Abstraction**: Store generates API payloads, keeping UI components clean
7. **Responsive Layout**: Fixed header/footer with scrollable content area
8. **Theme Integration**: Consistent styling using theme system
9. **Error Handling**: User-friendly validation messages with clear next steps
10. **Performance**: Lazy loading of step components and efficient re-rendering

### Visual Design Standards

- **Header**: Fixed header with title, step indicators, and exit button
- **Progress**: Visual step indicators with icons, completion states, and active highlighting
- **Content**: Scrollable main area with validation alerts and step content
- **Footer**: Fixed navigation with back/next buttons and loading states
- **Spacing**: Consistent `xl` gaps between major sections, `md` for related elements
- **Colors**: Theme-aware colors for all states (active, completed, error, disabled)
- **Typography**: Clear hierarchy with titles, descriptions, and helper text

## File Organization Conventions

### Component Structure

```typescript
// components/feature-name/
├── index.ts                 # Barrel exports
├── feature-component.tsx    # Main component
├── sub-component.tsx        # Sub-components
└── types.ts                # Component-specific types
```

### API Organization

```typescript
// lib/api/
├── index.ts                # Main API client configuration
├── feature-service.ts      # Feature-specific API calls
└── types.ts               # API response types

// lib/queries/
├── feature.ts             # React Query hooks for feature
└── index.ts              # Query key factories
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## State Management Strategy

### When to Use Zustand

- Cross-component state sharing
- Multi-step workflow persistence
- Complex application state
- WebSocket data management

### When to Use React Query

- Server state management
- API request caching
- Background refetching
- Optimistic updates

### When to Use Mantine Form

- Form validation and submission
- Field-level error handling
- Performance-optimized form rendering
- Built-in form utilities

## Code Style Standards

- **TypeScript Strict Mode**: All type checking enabled
- **Component Naming**: PascalCase for components, camelCase for functions
- **File Naming**: kebab-case for files, PascalCase for component files
- **Import Organization**: External libraries → internal modules → relative imports
- **Type Imports**: ALWAYS use `import type` for TypeScript type-only imports to avoid runtime errors
- **No Comments**: Code should be self-documenting through clear naming

### TypeScript Import Guidelines

**CRITICAL**: Always use `import type` for importing TypeScript types and interfaces:

```typescript
// ✅ Correct - use import type for types
import type { Recipe, CreateTaskRequest } from "./types/task-creation";
import type { TaskType, RecipeStatus } from "./types/recipe";

// ❌ Incorrect - regular imports for types cause runtime errors
import { Recipe, CreateTaskRequest } from "./types/task-creation";

// ✅ Correct - mixed imports and type imports
import { taskService } from "./services/task-service";
import type { TaskResponse } from "./types/task";
```

This prevents "does not provide an export" runtime errors in Vite/ESM environments.

### TypeScript and Mantine Version Validation Guidelines

**CRITICAL DEVELOPMENT RULE**: Always verify TypeScript compilation and Mantine v8 compatibility when making changes:

#### 1. TypeScript Validation Process
```bash
# Run TypeScript check before committing changes
npm run build
# OR
npx tsc --noEmit
```

#### 2. Mantine v8 Compatibility Checklist
When modifying components, verify these Mantine v8 requirements:

**Deprecated Props to Avoid:**
- ❌ `sx` prop → ✅ Use `style` prop
- ❌ `spacing` prop → ✅ Use `gap` prop  
- ❌ `weight` prop → ✅ Use `fw` prop
- ❌ `position` prop on Group → ✅ Use `justify` prop
- ❌ `transform` prop on Text → ✅ Use `style={{ textTransform }}`
- ❌ `required` prop on form inputs → ✅ Use validation schemas

**React Table Compatibility:**
- ❌ `createColumnHelper()` → ✅ Direct `ColumnDef[]` with `accessorKey`
- ❌ `columnHelper.accessor()` → ✅ `{ accessorKey: "field", ... }`
- ✅ Always add type assertions: `info.getValue() as string`

#### 3. Mandatory Checks After Every Change
```bash
# 1. TypeScript compilation
npm run build

# 2. Component prop validation
# Check console for deprecated prop warnings

# 3. Type safety verification  
# Ensure no 'any' types or unsafe assertions
```

#### 4. Common Fix Patterns
```typescript
// ✅ Mantine v8 compatible styling
<Box style={{ display: "flex", alignItems: "center" }}>
  <Text fw={500} style={{ textTransform: "capitalize" }}>
    {value as React.ReactNode}
  </Text>
</Box>

// ✅ Proper table column definition
const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue() as string,
  }
];
```

#### 5. Error Prevention Protocol
- **Before committing**: Run `npm run build` and fix ALL TypeScript errors
- **Before component changes**: Check Mantine v8 documentation for prop changes
- **Type assertions**: Use specific types instead of `any` or `unknown`
- **Import validation**: Ensure all imports resolve correctly

**Failure to follow this protocol may break the build and prevent deployment.**

## International Support

The application supports English and Traditional Chinese:

- Use `useTranslation` hook for all user-facing text
- Translation files located in `public/locales/`
- Namespace organization: `auth`, `common`, `components`, `models`, `recipes`, `tasks`

```typescript
import { useTranslation } from 'react-i18next';

function ExampleComponent() {
  const { t } = useTranslation('components');

  return <Text>{t('button.save')}</Text>;
}
```

## Layout Guidelines

**Important spacing values**:

- Use `p="md"` for compact padding in cards
- Use `gap="sm"` for tight spacing in stacks
- Reduce icon sizes for compact layouts (64px instead of 72px)
- Keep minimum heights reasonable (200px instead of 300px)

## Notes for Claude Code

### Key Patterns to Follow

1. **Always validate API responses** with Zod schemas before processing
2. **Use TypeScript strict mode** - no implicit any types allowed
3. **Leverage Mantine's design system** - don't create custom UI components unless absolutely necessary
4. **Follow the established folder structure** - keep related files grouped logically
5. **Use React Query for all server interactions** - don't manage server state manually
6. **Implement proper error boundaries** for robust user experience
7. **Use the theme system consistently** for colors, spacing, and styling
8. **Keep components focused and composable** - single responsibility principle
9. **Always implement loading and error states** for better UX
10. **Use internationalization for all user-facing text**

### Common Anti-Patterns to Avoid

- Don't create custom form validation - use Mantine Form + Zod
- Don't manage server state in Zustand - use React Query
- **Don't hardcode colors - ALWAYS use the theme system**
- **Don't use inline color values (rgba, hex) - define in theme first**
- Don't create custom UI components - leverage Mantine's comprehensive library
- Don't bypass TypeScript with `any` types
- Don't forget loading/error states in UI components

### Performance Considerations

- Use React Query's caching for expensive operations
- Implement proper list virtualization for large datasets
- Lazy load heavy components and pages
- Optimize Canvas rendering for region visualizations
- Use Mantine's built-in optimizations (memoization, etc.)

### Implementation Order for Multiple Instructions

When multiple instructions are provided in a prompt, follow UI/UX best practices to determine implementation order:

1. **User-facing critical functionality first** - Features that directly impact user experience
2. **Data flow and validation** - Ensure data integrity before UI implementation
3. **Visual enhancements** - Styling, animations, and polish come after core functionality
4. **Performance optimizations** - Fine-tune after features are working correctly
5. **Edge cases and error handling** - Complete coverage after main paths work

## Video Processing with FFmpeg.wasm

### Implementation Guide

WinEdge uses FFmpeg.wasm for client-side video processing in traffic analysis tasks. This enables powerful video manipulation directly in the browser without server dependencies.

#### Setup and Configuration

```typescript
// lib/ffmpeg/ffmpeg-service.ts
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  async load() {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    this.loaded = true;
  }

  async extractFrames(videoFile: File, interval: number = 1): Promise<Blob[]> {
    await this.load();
    if (!this.ffmpeg) throw new Error('FFmpeg not loaded');

    // Write video file to FFmpeg's virtual file system
    const videoData = await videoFile.arrayBuffer();
    await this.ffmpeg.writeFile('input.mp4', new Uint8Array(videoData));

    // Extract frames at specified interval
    await this.ffmpeg.exec([
      '-i', 'input.mp4',
      '-vf', `fps=1/${interval}`,
      'frame_%04d.png'
    ]);

    // Read extracted frames
    const frames: Blob[] = [];
    let frameIndex = 1;
    
    while (true) {
      try {
        const frameData = await this.ffmpeg.readFile(`frame_${String(frameIndex).padStart(4, '0')}.png`);
        frames.push(new Blob([frameData], { type: 'image/png' }));
        frameIndex++;
      } catch {
        break;
      }
    }

    return frames;
  }

  async convertVideo(videoFile: File, outputFormat: string): Promise<Blob> {
    await this.load();
    if (!this.ffmpeg) throw new Error('FFmpeg not loaded');

    const videoData = await videoFile.arrayBuffer();
    await this.ffmpeg.writeFile('input.mp4', new Uint8Array(videoData));

    await this.ffmpeg.exec([
      '-i', 'input.mp4',
      `output.${outputFormat}`
    ]);

    const outputData = await this.ffmpeg.readFile(`output.${outputFormat}`);
    return new Blob([outputData], { type: `video/${outputFormat}` });
  }
}

export const ffmpegService = new FFmpegService();
```

#### Integration with Video Components

```typescript
// components/video-player/ffmpeg-video-player.tsx
import { useState, useCallback } from 'react';
import { ffmpegService } from '@/lib/ffmpeg/ffmpeg-service';
import { Progress, Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function FFmpegVideoPlayer({ file }: { file: File }) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<Blob[]>([]);

  const handleExtractFrames = useCallback(async () => {
    setProcessing(true);
    try {
      const extractedFrames = await ffmpegService.extractFrames(file, 5); // Extract frame every 5 seconds
      setFrames(extractedFrames);
      notifications.show({
        title: 'Frames Extracted',
        message: `Successfully extracted ${extractedFrames.length} frames`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Extraction Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setProcessing(false);
    }
  }, [file]);

  return (
    <Stack>
      <Button 
        onClick={handleExtractFrames} 
        loading={processing}
        disabled={processing}
      >
        Extract Frames for Analysis
      </Button>
      
      {processing && (
        <Progress value={progress} animated />
      )}
      
      {frames.length > 0 && (
        <Text size="sm">
          Extracted {frames.length} frames ready for object detection
        </Text>
      )}
    </Stack>
  );
}
```

#### Use Cases in WinEdge

1. **Pre-processing Traffic Videos**
   - Convert various video formats to standardized MP4
   - Extract key frames for object detection
   - Resize videos for optimal processing

2. **Frame Extraction for Analysis**
   - Extract frames at specific intervals for traffic counting
   - Generate thumbnails for task previews
   - Create frame sequences for region configuration

3. **Video Optimization**
   - Compress large videos before uploading
   - Adjust video quality based on network conditions
   - Trim videos to specific time ranges

#### Best Practices

1. **Memory Management**
   - Clean up FFmpeg file system after operations
   - Process videos in chunks for large files
   - Monitor memory usage and provide user feedback

2. **Performance Optimization**
   - Load FFmpeg.wasm lazily when first needed
   - Cache processed results when possible
   - Use Web Workers for heavy processing

3. **Error Handling**
   - Provide clear error messages for unsupported formats
   - Handle browser compatibility issues gracefully
   - Implement fallback options for older browsers

4. **User Experience**
   - Show progress indicators for long operations
   - Allow cancellation of processing tasks
   - Provide estimates for processing time

#### Browser Compatibility

FFmpeg.wasm requires:
- Modern browsers with WebAssembly support
- SharedArrayBuffer support (may require specific headers)
- Sufficient memory for video processing

For production deployment, ensure proper CORS headers:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```
