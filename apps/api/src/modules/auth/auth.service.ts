import { Injectable, UnauthorizedException, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { LoginDto } from './dto/login.dto';

export interface SanitizedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
}

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.bootstrapAdminUser();
  }

  async bootstrapAdminUser(): Promise<void> {
    const adminEmail = (
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@shortfactory.ai'
    )
      .toLowerCase()
      .trim();
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') || 'Admin@123456';
    const adminName =
      this.configService.get<string>('ADMIN_NAME') || 'System Administrator';

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (existingUser) {
        this.logger.log(
          `🛡️  Admin user [${adminEmail}] already exists. Skipping startup creation.`,
        );
        return;
      }

      const passwordHash = bcrypt.hashSync(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          passwordHash,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      this.logger.log(
        `🚀 Initial Admin user [${adminEmail}] bootstrapped successfully from environment.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to bootstrap admin user: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async validateUser(email: string, pass: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      this.logger.warn(`Failed login attempt for non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      this.logger.warn(`Login attempt for disabled account: ${email}`);
      throw new UnauthorizedException('Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = bcrypt.compareSync(pass, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Invalid credentials provided for user: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update lastLoginAt asynchronously
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User ${user.email} (${user.role}) successfully authenticated`);

    return {
      success: true,
      accessToken,
      user,
    };
  }

  async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User session is invalid or account inactive');
    }

    return user;
  }
}
