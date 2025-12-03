/**
 * @altaviapp/convex-client
 *
 * Shared Convex client utilities for Altaviapp PWA applications.
 * Provides ConvexClientProvider and re-exports useful Convex hooks.
 */

// Provider
export { ConvexClientProvider } from './ConvexClientProvider';

// Re-export commonly used Convex hooks and utilities
export {
  useQuery,
  useMutation,
  useAction,
  useConvex,
  usePaginatedQuery,
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from 'convex/react';

// Note: App-specific types like Id and Doc should be imported from
// the app's generated types: import { Id, Doc } from '@/convex/_generated/dataModel';
