import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../AuthContext';

vi.mock('../../../lib/api-client', () => ({
  api: {
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    login: vi.fn().mockResolvedValue({
      success: true,
      accessToken: 'mock-jwt-token',
      user: {
        id: 'user-1',
        email: 'admin@shortfactory.ai',
        name: 'System Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    }),
    getMe: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  it('renders login form elements and quick-fill account options', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/AI SHORTS FACTORY/i)).toBeInTheDocument();
    expect(screen.getByText(/Đăng Nhập Hệ Thống/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@shortfactory.ai/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng Nhập Vào Hệ Thống/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin@shortfactory.ai/i })).toBeInTheDocument();
  });

  it('populates fields when Quick-Fill Admin is clicked', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const adminButton = screen.getByRole('button', { name: /admin@shortfactory.ai/i });
    fireEvent.click(adminButton);

    const emailInput = screen.getByPlaceholderText(/admin@shortfactory.ai/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;

    expect(emailInput.value).toBe('admin@shortfactory.ai');
    expect(passwordInput.value).toBe('Admin@123456');
  });
});
