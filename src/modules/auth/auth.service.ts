import jwt from 'jsonwebtoken';
import { db } from '../../db/drizzle.ts';
import { users } from '../../db/schema.ts';
import { logger } from '../../lib/logger.ts';
import type { LoginDto, RegisterDto } from './auth.dto.ts';
import { comparePassword, hashPassword } from './auth.utils.ts';

class AuthService {
  async register({ name, email, password }: RegisterDto) {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        password_hash: passwordHash,
      })
      .returning();

    // return user data without password
    const { password_hash, ...userData } = newUser;

    return userData;
  }

  async login({ email, password }: LoginDto) {
    // Check if user already exists
    const user = await db.query.users.findFirst({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid Credentials');
    }

    // compare the password
    const isPasswordMatch = await comparePassword(password, user.password_hash);

    logger.info(`Password match:${isPasswordMatch}`);

    if (!isPasswordMatch) {
      throw new Error('Invalid Credentials');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '7d',
      },
    );
    const { password_hash, ...userData } = user;
    return { user: userData, token };
  }
}

export default new AuthService();
