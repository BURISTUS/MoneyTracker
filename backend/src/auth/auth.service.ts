import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AppException } from '../common/app-exception';

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

      const token = await this.generateToken(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : null,
          monthlyHours: user.monthlyHours,
        },
        token,
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

    const token = await this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : null,
        monthlyHours: user.monthlyHours,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new AppException('errors.accountNotFound', 401);
    }
    return user;
  }

  async logout(_userId: string) {
    return { success: true };
  }

  private async generateToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
