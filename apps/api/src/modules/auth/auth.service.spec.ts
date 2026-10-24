import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;
  let mockConfig: any;

  const mockPasswordHash = bcrypt.hashSync('StrongPassword123', 10);
  const mockUser = {
    id: 'user-uuid-123',
    email: 'admin@shortfactory.ai',
    name: 'Admin User',
    role: 'ADMIN',
    passwordHash: mockPasswordHash,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      },
    };

    mockJwt = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'ADMIN_EMAIL') return 'admin@shortfactory.ai';
        if (key === 'ADMIN_PASSWORD') return 'Admin@123456';
        if (key === 'ADMIN_NAME') return 'System Administrator';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('bootstrapAdminUser', () => {
    it('should create initial admin user if non-existent', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await service.bootstrapAdminUser();

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@shortfactory.ai' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'admin@shortfactory.ai',
            name: 'System Administrator',
            role: 'ADMIN',
            isActive: true,
          }),
        }),
      );
    });

    it('should skip creation if admin user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.bootstrapAdminUser();

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@shortfactory.ai' },
      });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  it('should authenticate valid user and issue JWT token with sanitized profile', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'admin@shortfactory.ai',
      password: 'StrongPassword123',
    });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('mock.jwt.token');
    expect(result.user.email).toBe('admin@shortfactory.ai');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(mockJwt.sign).toHaveBeenCalledWith({
      sub: 'user-uuid-123',
      email: 'admin@shortfactory.ai',
      role: 'ADMIN',
    });
  });

  it('should reject login if password does not match', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      service.login({
        email: 'admin@shortfactory.ai',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login if user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@shortfactory.ai',
        password: 'AnyPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login if account is deactivated', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(
      service.login({
        email: 'admin@shortfactory.ai',
        password: 'StrongPassword123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
