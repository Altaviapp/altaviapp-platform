import { redirect } from 'next/navigation';

/**
 * Settings Users Page - Redirect
 *
 * This page redirects to the main /users page to avoid duplication.
 * Users management is centralized in /users.
 */
export default function SettingsUsersPage() {
  redirect('/users');
}
