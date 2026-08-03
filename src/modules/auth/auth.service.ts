import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../db/drizzle.ts';
import { refreshTokens, users } from '../../db/schema.ts';
import type { LoginDto, RefreshDto, RegisterDto } from './auth.dto.ts';
import {
  comparePassword,
  hashPassword,
  isValidPassword,
} from './auth.utils.ts';

const JWT_SECRET = process.env.JWT_SECRET as string;

const USER_NOT_FOUND = 'user_not_found';
const WRONG_PASSWORD = 'wrong_password';
const INVALID_PASSWORD = 'invalid_password';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

class AuthService {
  async register({ name, email, password }: RegisterDto) {
    const existingUser = await db.query.users.findFirst({
      where: { email },
    });
    if (existingUser) {
      return {
        success: false,
        message: 'Email already taken',
      };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name,
        email,
        password_hash: passwordHash,
      })
      .returning();

    const { password_hash, ...userData } = newUser;
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        accessToken: this.generateAccessToken(userData.id),
        refreshToken: await this.createRefreshToken(userData.id),
      },
    };
  }

  async login({ email, password }: LoginDto) {
    // validate the password
    const isPasswordValid = isValidPassword(password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Password does not meet requirements',
        error: INVALID_PASSWORD,
      };
    }

    const user = await db.query.users.findFirst({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid Credentials',
        error: USER_NOT_FOUND,
      };
    }

    const isPasswordMatch = await comparePassword(password, user.password_hash);

    if (!isPasswordMatch) {
      return {
        success: false,
        message: 'Invalid Credentials',
        error: WRONG_PASSWORD,
      };
    }

    const { password_hash, ...userData } = user;
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        accessToken: this.generateAccessToken(userData.id),
        refreshToken: await this.createRefreshToken(userData.id),
      },
    };
  }

  async refresh({ refreshToken }: RefreshDto) {
    const hash = this.hashToken(refreshToken);

    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token_hash, hash))
      .limit(1);

    if (!stored) {
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    // Reuse detection: a revoked token presented again signals theft,
    // so revoke every token belonging to that user.
    if (stored.revoked) {
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.user_id, stored.user_id));

      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    // Expired token -> revoke and reject
    if (stored.expires_at < new Date()) {
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.id, stored.id));

      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    // Ensure the user still exists before issuing new tokens
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, stored.user_id))
      .limit(1);

    if (!user) {
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.user_id, stored.user_id));

      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    // Rotate: revoke the old token and issue a fresh pair
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, stored.id));

    const accessToken = this.generateAccessToken(stored.user_id);
    const newRefreshToken = await this.createRefreshToken(stored.user_id);

    return {
      success: true,
      message: 'Token refreshed',
      data: { accessToken, refreshToken: newRefreshToken },
    };
  }

  async logout({ refreshToken }: RefreshDto) {
    const hash = this.hashToken(refreshToken);

    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token_hash, hash))
      .limit(1);

    if (stored && !stored.revoked) {
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.id, stored.id));
    }
  }

  private generateAccessToken(userId: string) {
    return jwt.sign({ sub: userId }, JWT_SECRET as string, {
      expiresIn: '15m',
    });
  }

  private async createRefreshToken(userId: string) {
    const token = randomUUID() + randomUUID();
    const hash = this.hashToken(token);

    await db.insert(refreshTokens).values({
      id: randomUUID(),
      user_id: userId,
      token_hash: hash,
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    });

    return token;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}

export default new AuthService();
