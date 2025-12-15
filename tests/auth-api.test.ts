/**
 * Auth API Integration Tests
 *
 * Tests the authentication HTTP endpoints against the live Convex backend.
 * Make sure the backend is running (npx convex dev) and seed data is loaded.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = 'https://abundant-mastiff-673.convex.site';

describe('Auth API - Backend Tests', () => {
  describe('POST /auth/login', () => {
    it('should return success with valid credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@demo.com',
          password: 'demo123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.token).toMatch(/^session_/);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@demo.com');
      expect(data.user.role).toBe('admin');
    });

    it('should return error with invalid email', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@demo.com',
          password: 'demo123',
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Email o contraseña incorrectos');
    });

    it('should return error with invalid password', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@demo.com',
          password: 'wrongpassword',
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Email o contraseña incorrectos');
    });

    it('should work with driver credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jperez.driver@demo.com',
          password: 'driver123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe('driver');
    });

    it('should work with monitor credentials', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'atorres.monitor@demo.com',
          password: 'monitor123',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe('monitor');
    });
  });

  describe('GET /auth/me', () => {
    let validToken: string;

    beforeAll(async () => {
      // Login to get a valid token
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@demo.com',
          password: 'demo123',
        }),
      });
      const data = await response.json();
      validToken = data.token;
    });

    it('should return user data with valid token', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me?token=${validToken}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@demo.com');
    });

    it('should return error with invalid token', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me?token=invalid_token`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      expect(data.success).toBe(false);
    });

    it('should work with Authorization header', async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`,
        },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('admin@demo.com');
    });
  });

  describe('POST /auth/logout', () => {
    it('should invalidate session on logout', async () => {
      // First login to get a token
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@demo.com',
          password: 'demo123',
        }),
      });
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Verify token works
      const meResponse = await fetch(`${API_BASE_URL}/auth/me?token=${token}`);
      const meData = await meResponse.json();
      expect(meData.success).toBe(true);

      // Logout
      const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const logoutData = await logoutResponse.json();
      expect(logoutData.success).toBe(true);

      // Verify token no longer works
      const meAfterLogout = await fetch(`${API_BASE_URL}/auth/me?token=${token}`);
      const meAfterData = await meAfterLogout.json();
      expect(meAfterData.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('Altaviapp Convex Backend');
    });
  });
});
