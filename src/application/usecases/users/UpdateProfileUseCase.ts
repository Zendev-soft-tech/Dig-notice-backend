import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, email: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (email && email !== user.email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing) throw new BadRequestError("Email already in use");
      await this.userRepository.update(userId, { email });
    }

    return { message: "Profile updated successfully" };
  }
}
