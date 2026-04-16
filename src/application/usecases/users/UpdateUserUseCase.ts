import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { User } from "../../../adapters/models/User";
import { NotFoundError } from "../../../shared/error";
import bcrypt from "bcryptjs";

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, userData: Partial<User>) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.userRepository.update(id, userData);
  }
}
