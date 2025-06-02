import { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider as RRDRouterProvider,
} from 'react-router-dom';

import { AuthOutlet } from '@/components/auth-wrapper';
import { Layout } from '@/components/layout/layout';
import { LoginLayout } from '@/components/layout/login-layout';
import { AppLoader } from '@/components/ui/app-loader';
import { ErrorPage } from '@/pages/error-page/error-page';
import { LicensesPage } from '@/pages/licenses-page/licenses-page';
import { ModelsPage } from '@/pages/models-page';
import { RecipeCreationPage } from '@/pages/recipe-creation-page';
import { RecipesPage } from '@/pages/recipes-page';
import { TaskDetailsPage,TasksPage } from '@/pages/tasks-page';
import { UsersPage } from '@/pages/users-page/users-page';

const LoadingFallback = () => <AppLoader />;

const router = createBrowserRouter([
  {
    async lazy() {
      const { LoginPage } = await import('../pages/login-page/login-page');

      return {
        Component: () => (
          <Suspense fallback={<LoadingFallback />}>
            <LoginLayout>
              <LoginPage />
            </LoginLayout>
          </Suspense>
        ),
        HydrateFallback: LoadingFallback,
      };
    },
    path: '/login',
  },
  {
    HydrateFallback: LoadingFallback,
    children: [
      {
        index: true,
        async lazy() {
          const { HomePage } = await import('../pages/home-page/home-page');

          return {
            Component: HomePage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      // Users page
      {
        async lazy() {
          return {
            Component: UsersPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'users',
      },
      // License page
      {
        async lazy() {
          return {
            Component: LicensesPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'licenses',
      },
      // Tasks routes
      {
        async lazy() {
          return {
            Component: TasksPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'tasks',
      },
      {
        async lazy() {
          const { TaskCreationPage } = await import('../pages/tasks-page/task-creation-page');
          return {
            Component: TaskCreationPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'tasks/create',
      },
      {
        async lazy() {
          return {
            Component: TaskDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'tasks/:taskId',
      },
      {
        async lazy() {
          const { TaskEditPage } = await import('../pages/tasks-page/task-edit-page');
          return {
            Component: TaskEditPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'tasks/:taskId/edit',
      },
      {
        async lazy() {
          return {
            Component: RecipesPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'recipes',
      },
      {
        async lazy() {
          return {
            Component: RecipeCreationPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'recipes/create',
      },
      {
        async lazy() {
          const { RecipeDetailsPage } = await import('../pages/recipes-page/recipe-details-page');
          return {
            Component: RecipeDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'recipes/:recipeId',
      },
      {
        async lazy() {
          const { RecipeEditPage } = await import('../pages/recipes-page/recipe-edit-page');
          return {
            Component: RecipeEditPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'recipes/:recipeId/edit',
      },
      {
        async lazy() {
          return {
            Component: ModelsPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'models',
      },
      {
        async lazy() {
          const { ModelDetailsPage } = await import('../pages/models-page/model-details-page');
          return {
            Component: ModelDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'models/:modelId',
      },
      {
        async lazy() {
          const { ModelEditPage } = await import('../pages/models-page/model-edit-page');
          return {
            Component: ModelEditPage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'models/:modelId/edit',
      },
      {
        async lazy() {
          const { ProfilePage } = await import('../pages/profile-page');
          return {
            Component: ProfilePage,
            HydrateFallback: LoadingFallback,
          };
        },
        path: 'profile',
      }
    ],
    element: (
      <Layout>
        <AuthOutlet />
      </Layout>
    ),
    errorElement: <ErrorPage />,
    path: '/',
  },
  {
    async lazy() {
      return {
        Component: () => <ErrorPage defaultCode="404" defaultMessage="Page not found" />,
        HydrateFallback: LoadingFallback,
      };
    },
    path: '*',
  },
]);

export function RouterProvider() {
  return <RRDRouterProvider router={router} />;
}