/**
 * Login Page Frontend Tests
 *
 * Tests the login page component behavior and form validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock auth context
const mockLogin = vi.fn();
vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    user: null,
  }),
}));

// Import after mocks
import LoginPage from '../apps/admin/src/app/(auth)/login/page';

describe('Login Page - Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
    mockPush.mockReset();
  });

  describe('Initial Render', () => {
    it('should render login form with all elements', () => {
      render(<LoginPage />);

      // Check title and branding
      expect(screen.getByText('Altaviapp')).toBeInTheDocument();
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();

      // Check form fields
      expect(screen.getByLabelText(/Email o Usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mantener sesión iniciada/i)).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: /INICIAR SESIÓN/i })).toBeInTheDocument();
      expect(screen.getByText(/¿Olvidaste tu contraseña\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Ingresar código/i)).toBeInTheDocument();
    });

    it('should have correct input attributes for browser autocomplete', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should have password input initially hidden', () => {
      render(<LoginPage />);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error for password less than 6 characters', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, '12345');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Mínimo 6 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not show errors for valid inputs', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Email inválido/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Mínimo 6 caracteres/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login with correct credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@demo.com', 'demo123');
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect to verify-email if requiresEmailVerification', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true, requiresEmailVerification: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/verify-email');
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: false, error: 'Email o contraseña incorrectos' });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      // Create a promise we can control
      let resolveLogin: (value: { success: boolean }) => void;
      mockLogin.mockImplementation(() => new Promise((resolve) => {
        resolveLogin = resolve;
      }));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/Email o Usuario/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);
      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });

      await user.type(emailInput, 'admin@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText(/Iniciando sesión\.\.\./i)).toBeInTheDocument();
      });

      // Resolve the login
      resolveLogin!({ success: true });

      // Loading state should be gone
      await waitFor(() => {
        expect(screen.queryByText(/Iniciando sesión\.\.\./i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find the toggle button (eye icon button)
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      expect(toggleButton).toBeInTheDocument();

      // Click to show password
      await user.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password
      await user.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to forgot-password page', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const forgotPasswordLink = screen.getByText(/¿Olvidaste tu contraseña\?/i);
      await user.click(forgotPasswordLink);

      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });

    it('should navigate to signup-invitation page', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const invitationLink = screen.getByText(/Ingresar código/i);
      await user.click(invitationLink);

      expect(mockPush).toHaveBeenCalledWith('/signup-invitation');
    });
  });

  describe('Remember Me Checkbox', () => {
    it('should be unchecked by default', () => {
      render(<LoginPage />);
      const checkbox = screen.getByLabelText(/Mantener sesión iniciada/i);
      expect(checkbox).not.toBeChecked();
    });

    it('should be toggleable', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const checkbox = screen.getByLabelText(/Mantener sesión iniciada/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(<LoginPage />);

      // All inputs should be labeled
      expect(screen.getByLabelText(/Email o Usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mantener sesión iniciada/i)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<LoginPage />);

      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have submit button with proper type', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /INICIAR SESIÓN/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
