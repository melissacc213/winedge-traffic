# WinEdge Traffic Management System - CLAUDE.md

This is the development guide for WinEdge Traffic, a sophisticated traffic statistics and object detection system built with modern web technologies.

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
- **Mux Player React v3.4.0** - Video playback functionality
- **Axios v1.9.0** - HTTP client
- **UUID v9.0.1** - Unique identifier generation
- **JSZip v3.10.1** - File compression/decompression
- **TanStack React Table v8.21.3** - Data table functionality
- **Tabler Icons React v3.33.0** - Icon library
- **clsx v2.1.1 + tailwind-merge v3.3.0** - Conditional CSS class utilities
- **use-image v1.1.2** - Image loading hook for Konva

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
  IconVideo,         // Add new icon import
  IconRefresh,       // Add another icon import
  // ... rest of imports
} from "@tabler/icons-react";

// 2. Add to RawIcons object
export const RawIcons = {
  // ... existing icons
  Video: IconVideo,       // Add new icon mapping
  Refresh: IconRefresh,   // Add another icon mapping
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

**IMPORTANT: Color Usage Rules**

1. **NEVER hardcode colors** - Always use theme colors
2. **NEVER use raw rgba/hex values** - Define them in the theme first
3. **For new colors**: Add to theme structure in `/src/themes/index.ts`
4. **Theme structure**:
   - Base colors in `colors` object (blue, red, green, etc.)
   - Custom colors in `other` object (ui, backgrounds, shadows, etc.)
   - Light/dark overrides in respective theme objects

### 5. Canvas-Based Region Configuration

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
- **No Comments**: Code should be self-documenting through clear naming

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
