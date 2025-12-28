import { redirect } from 'next/navigation';

/**
 * New User Page - Redirect
 *
 * User creation is handled through the invitation system.
 * This page redirects to /users where the InviteUserModal can be opened.
 *
 * Flow: Admin clicks "Invitar Usuario" in /users -> Opens InviteUserModal
 *       -> Creates invitation code -> User signs up with code
 */
export default function NewUserPage() {
  redirect('/users');
}
