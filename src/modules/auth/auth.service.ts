import { createHash, randomUUID } from 'node:crypto';
import { and, eq, gte } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../db/drizzle.ts';
import { refreshTokens, users } from '../../db/schema.ts';
import type { LoginDto, RefreshDto, RegisterDto } from './auth.dto.ts';
import { comparePassword, hashPassword } from './auth.utils.ts';

const JWT_SECRET = process.env.JWT_SECRET as string;

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

class AuthService {
  async register({ name, email, password }: RegisterDto) {
    const existingUser = await db.query.users.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User already exists');
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
    return userData;
  }

  async login({ email, password }: LoginDto) {
    const user = await db.query.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid Credentials');
    }

    const isPasswordMatch = await comparePassword(password, user.password_hash);

    if (!isPasswordMatch) {
      throw new Error('Invalid Credentials');
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    const { password_hash, ...userData } = user;
    return { user: userData, accessToken, refreshToken };
  }

  async refresh({ refreshToken }: RefreshDto) {
    const hash = this.hashToken(refreshToken);

    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token_hash, hash),
          gte(refreshTokens.expires_at, new Date()),
        ),
      )
      .limit(1);

    if (!stored) {
      throw new Error('Invalid or expired refresh token');
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));

    const accessToken = this.generateAccessToken(stored.user_id);
    const newRefreshToken = await this.createRefreshToken(stored.user_id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout({ refreshToken }: RefreshDto) {
    const hash = this.hashToken(refreshToken);
    await db.delete(refreshTokens).where(eq(refreshTokens.token_hash, hash));
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
