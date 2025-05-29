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
        element: <UsersPage />
      },
      {
        path: 'users/:userId',
        async lazy() {
          const { UserDetailView } = await import('../components/user/UserDetailView');
          return {
            Component: UserDetailView,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'users/:userId/edit',
        async lazy() {
          const { UserEdit } = await import('../components/user/UserEdit');
          return {
            Component: UserEdit,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      // License page
      {
        path: 'licenses',
        element: <LicensesPage />
      },
      {
        path: 'licenses/:licenseId',
        async lazy() {
          const { LicenseDetailView } = await import('../components/license/LicenseDetailView');
          return {
            Component: LicenseDetailView,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      {
        path: 'licenses/:licenseId/edit',
        async lazy() {
          const { LicenseEdit } = await import('../components/license/LicenseEdit');
          return {
            Component: LicenseEdit,
            HydrateFallback: LoadingFallback,
          };
        },
      },
      // Tasks routes
      {
        path: 'tasks',
        element: <TasksPage />
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
        element: <TaskDetailsPage />
      },
      {
        path: 'tasks/create-demo',
        async lazy() {
          const { TaskCreationDemoPage } = await import('../pages/task-creation-demo-page');
          return {
            Component: TaskCreationDemoPage,
            HydrateFallback: LoadingFallback,
          };
        },
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