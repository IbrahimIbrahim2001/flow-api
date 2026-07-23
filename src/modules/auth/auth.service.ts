import { db } from '../../db/drizzle.ts';
import { users } from '../../db/schema.ts';
import type { RegisterDto } from './auth.dto.ts';
import { hashPassword } from './auth.utils.ts';

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

    return newUser;
  }
}

export default new AuthService();
