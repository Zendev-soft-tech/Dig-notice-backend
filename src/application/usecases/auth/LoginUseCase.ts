import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { config } from "../../../config";
import { UnauthorizedError } from "../../../shared/error";

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(username: string, password: string) {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
      },
    };
  }
}
