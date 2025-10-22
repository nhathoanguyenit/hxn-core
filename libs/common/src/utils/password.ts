import bcrypt from 'bcrypt';

export class PasswordUtils {

  private static readonly SALT_ROUNDS = 10;

  static async encode(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password cannot be empty');
    }
    const salt = await bcrypt.genSalt(PasswordUtils.SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  static async compare(password: string, encodedPassword: string): Promise<boolean> {
    if (!password || !encodedPassword) {
      return false;
    }
    return bcrypt.compare(password, encodedPassword);
  }
}
