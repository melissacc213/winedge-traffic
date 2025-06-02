import { AuthOutlet } from '@/components/auth-wrapper';
import { Layout } from '@/components/layout/layout';
import { LoginLayout } from '@/components/layout/login-layout';
import { ErrorPage } from '@/pages/error-page/error-page';
import { UsersPage } from '@/pages/users-page/users-page';
import { LicensesPage } from '@/pages/licenses-page/licenses-page';
import { ModelsPage } from '@/pages/models-page';
import { RecipesPage } from '@/pages/recipes-page';
import { RecipeCreationPage } from '@/pages/recipe-creation-page';
import { TasksPage, TaskDetailsPage } from '@/pages/tasks-page';
import { AppLoader } from '@/components/ui/app-loader';
import { Suspense } from 'react';
import {
  RouterProvider as RRDRouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

const LoadingFallback = () => <AppLoader />;

const router = createBrowserRouter([
  {
    path: '/login',
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
  },
  {
    path: '/',
    element: (
      <Layout>
        <AuthOutlet />
      </Layout>
    ),
    errorElement: <ErrorPage />,
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
        path: 'users',
        async lazy() {
          return {
            Component: UsersPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      // License page
      {
        path: 'licenses',
        async lazy() {
          return {
            Component: LicensesPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      // Tasks routes
      {
        path: 'tasks',
        async lazy() {
          return {
            Component: TasksPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'tasks/create',
        async lazy() {
          const { TaskCreationPage } = await import('../pages/tasks-page/task-creation-page');
          return {
            Component: TaskCreationPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'tasks/:taskId',
        async lazy() {
          return {
            Component: TaskDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'recipes',
        async lazy() {
          return {
            Component: RecipesPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'recipes/create',
        async lazy() {
          return {
            Component: RecipeCreationPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'recipes/:recipeId',
        async lazy() {
          const { RecipeDetailsPage } = await import('../pages/recipes-page/recipe-details-page');
          return {
            Component: RecipeDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'recipes/:recipeId/edit',
        async lazy() {
          const { RecipeEditPage } = await import('../pages/recipes-page/recipe-edit-page');
          return {
            Component: RecipeEditPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'models',
        async lazy() {
          return {
            Component: ModelsPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'models/:modelId',
        async lazy() {
          const { ModelDetailsPage } = await import('../pages/models-page/model-details-page');
          return {
            Component: ModelDetailsPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'models/:modelId/edit',
        async lazy() {
          const { ModelEditPage } = await import('../pages/models-page/model-edit-page');
          return {
            Component: ModelEditPage,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'profile',
        async lazy() {
          const { ProfilePage } = await import('../pages/profile-page');
          return {
            Component: ProfilePage,
            HydrateFallback: LoadingFallback,
          };
        },
      }
    ],
  },
  {
    path: '*',
    async lazy() {
      return {
        Component: () => <ErrorPage defaultCode="404" defaultMessage="Page not found" />,
        HydrateFallback: LoadingFallback,
      };
    },
  },
]);

export function RouterProvider() {
  return <RRDRouterProvider router={router} />;
}