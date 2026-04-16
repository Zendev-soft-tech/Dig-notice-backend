import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { User } from "../../../adapters/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeInvite } from "../../../infrastructure/emailService";

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: Partial<User>) {
    // Generate secure temporary password if not provided
    const tempPassword = userData.password || crypto.randomBytes(5).toString("hex"); // 10 chars hex
    
    // Hash the password for storage
    userData.password = await bcrypt.hash(tempPassword, 10);

    const result = await this.userRepository.create(userData);

    // Send welcome email strictly for staff and students
    if (result.role === "staff" || result.role === "student") {
      await sendWelcomeInvite(result.email, result.name, tempPassword);
    }

    return result;
  }
}
