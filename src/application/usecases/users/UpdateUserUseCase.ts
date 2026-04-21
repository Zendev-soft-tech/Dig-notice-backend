import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { User } from "../../../adapters/models/User";
import { NotFoundError, BadRequestError } from "../../../shared/error";
import bcrypt from "bcryptjs";

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, userData: Partial<User>) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    // Prevent role changes
    if (userData.role && userData.role !== user.role) {
      throw new BadRequestError("Role cannot be changed. Please delete and recreate the user if a role change is necessary.");
    }

    // Ensure role is not updated even if it matches (optional but safer)
    delete userData.role;

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.userRepository.update(id, userData);
  }
}
