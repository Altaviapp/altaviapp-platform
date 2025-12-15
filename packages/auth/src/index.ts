/**
 * @altaviapp/auth
 *
 * Shared authentication package for Altaviapp PWA applications.
 * Provides AuthProvider, useAuth hook, and role-based utilities.
 */

// Provider and Hook
export { AuthProvider, useAuth } from './AuthProvider';

// Types
export type {
  UserRole,
  AuthUser,
  AuthContextType,
  LoginResult,
  InvitationInfo,
  RegisterInstitutionData,
  RegisterResult,
} from './types';

// Role utilities
export {
  ROLE_LEVELS,
  ROLE_DISPLAY_NAMES,
  hasMinimumRole,
  getRoleDisplayName,
  isCrewMember,
} from './types';
