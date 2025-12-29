/**
 * Shared authentication types for Altaviapp
 */

export type UserRole = 'super_admin' | 'admin' | 'monitor' | 'driver' | 'parent';

// Role hierarchy levels (higher = more permissions)
export const ROLE_LEVELS: Record<UserRole, number> = {
  super_admin: 1000,
  admin: 500,
  monitor: 150,
  driver: 100,
  parent: 10,
};

// UI-friendly role names (Spanish)
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Coordinador',
  monitor: 'Auxiliar',
  driver: 'Conductor',
  parent: 'Padre/Tutor',
};

/**
 * Check if user role meets minimum required role
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role];
}

/**
 * Check if user is a crew member (driver or monitor)
 */
export function isCrewMember(role: UserRole): boolean {
  return role === 'driver' || role === 'monitor';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  institutionId?: string;
  clientId?: string;
  emailVerified: boolean;
  createdAt: number;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface InvitationInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  institutionName: string;
}

export interface RegisterInstitutionData {
  // Admin user info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Institution info
  institutionName: string;
  institutionType: 'school' | 'corporate';
  institutionAddress: string;
  institutionCity: string;
  institutionCountry?: string; // 'EC' | 'CO' - default 'EC'
  institutionDepartment?: string; // Province/Department code
  // Subscription plan
  plan: 'basic' | 'professional' | 'enterprise';
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  userId?: string;
  institutionId?: string;
  clientId?: string;
  requiresEmailVerification?: boolean;
}

export interface AuthContextType {
  // State
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;

  // Password management
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Email verification
  verifyEmail: (verificationCode: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;

  // Invitation flow
  verifyInvitationCode: (code: string) => Promise<{
    success: boolean;
    valid?: boolean;
    invitation?: InvitationInfo;
    error?: string;
  }>;
  acceptInvitation: (invitationCode: string, password: string) => Promise<LoginResult>;

  // Institution registration (signup flow)
  registerInstitution: (data: RegisterInstitutionData) => Promise<RegisterResult>;

  // Role helpers
  isDriver: boolean;
  isMonitor: boolean;
  isCrewMember: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
}
