import { AuthOutlet } from '@/components/auth-wrapper';
import { Layout } from '@/components/layout/layout';
import { LoginLayout } from '@/components/layout/login-layout';
import { ErrorPage } from '@/pages/error-page/error-page';
import { UsersPage } from '@/pages/users-page/users-page';
import { LicensePage } from '@/pages/license-page/license-page';
import { ModelsPage } from '@/pages/models-page';
import { RecipesPage } from '@/pages/recipes-page';
import { RecipeCreationPage } from '@/pages/recipe-creation-page';
import { TasksPage, TaskDetailsPage, TaskVideoPage } from '@/pages/tasks-page';
import { Center, Loader } from '@mantine/core';
import { Suspense } from 'react';
import {
  RouterProvider as RRDRouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

const LoadingFallback = () => (
  <Center className="fixed inset-0">
    <Loader size="xl" />
  </Center>
);

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
      };
    },
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Layout>
          <AuthOutlet />
        </Layout>
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        async lazy() {
          const { HomePage } = await import('../pages/home-page/home-page');

          return {
            Component: HomePage,
          };
        },
      },
      // Users page
      {
        path: 'users',
        element: <UsersPage />
      },
      // License page
      {
        path: 'license',
        element: <LicensePage />
      },
      // Tasks routes
      {
        path: 'tasks',
        element: <TasksPage />
      },
      {
        path: 'tasks/video',
        element: <TaskVideoPage />
      },
      {
        path: 'tasks/:taskId',
        element: <TaskDetailsPage />
      },
      {
        path: 'recipes',
        element: <RecipesPage />
      },
      {
        path: 'recipes/create',
        element: <RecipeCreationPage />
      },
      {
        path: 'models',
        element: <ModelsPage />
      },
      {
        path: 'models/:modelId',
        async lazy() {
          const { ModelDetailsPage } = await import('../pages/models-page/model-details-page');
          return {
            Component: ModelDetailsPage,
          };
        },
      },
      {
        path: 'models/:modelId/edit',
        async lazy() {
          const { ModelEditPage } = await import('../pages/models-page/model-edit-page');
          return {
            Component: ModelEditPage,
          };
        },
      },
      {
        path: 'profile',
        element: <div className="p-4">Profile Page</div>
      }
    ],
  },
  {
    path: '*',
    element: <ErrorPage defaultCode="404" defaultMessage="Page not found" />,
  },
]);

export function RouterProvider() {
  return <RRDRouterProvider router={router} />;
}