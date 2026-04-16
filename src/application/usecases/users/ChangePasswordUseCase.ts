import bcrypt from "bcryptjs";
import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError, BadRequestError } from "../../../shared/error";

export class ChangePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestError("Incorrect current password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: "Password updated successfully" };
  }
}
