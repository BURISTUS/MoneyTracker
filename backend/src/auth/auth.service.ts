import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AppException } from '../common/app-exception';

const SESSION_TTL_DAYS = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new AppException('errors.emailExists', 409);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const user = await this.usersService.create({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        hourlyRate: registerDto.hourlyRate
          ? registerDto.hourlyRate * 100
          : undefined,
        monthlyHours: registerDto.monthlyHours,
      });

      await this.accountsService.createDefaultsForUser(user.id);
      await this.categoriesService.createDefaultsForUser(user.id);

      const { accessToken, refreshToken } = await this.createSession(
        user.id,
        user.email,
      );

      return {
        user: this.serializeUser(user),
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppException('errors.emailExists', 409);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new AppException('errors.invalidCredentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AppException('errors.invalidCredentials', 401);
    }

    const { accessToken, refreshToken } = await this.createSession(
      user.id,
      user.email,
    );

    return {
      user: this.serializeUser(user),
      token: accessToken,
      refreshToken,
    };
  }

  async refreshTokens(oldRefreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: oldRefreshToken },
    });

    if (!session) {
      throw new AppException('errors.invalidRefreshToken', 401);
    }

    if (session.isRevoked) {
      await this.revokeAllUserSessions(session.userId);
      throw new AppException('errors.refreshTokenRevoked', 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppException('errors.refreshTokenExpired', 401);
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const user = await this.usersService.findById(session.userId);
    if (!user) {
      throw new AppException('errors.accountNotFound', 401);
    }

    const { accessToken, refreshToken } = await this.createSession(
      user.id,
      user.email,
    );

    return {
      token: accessToken,
      refreshToken,
      user: this.serializeUser(user),
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new AppException('errors.accountNotFound', 401);
    }
    return user;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session
        .updateMany({
          where: { refreshToken, userId },
          data: { isRevoked: true },
        })
        .catch(() => {});
    }
    return { success: true };
  }

  private async createSession(userId: string, email: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async revokeAllUserSessions(userId: string) {
    await this.prisma.session
      .updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      })
      .catch(() => {});
  }

  private serializeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : null,
      monthlyHours: user.monthlyHours,
    };
  }
}
