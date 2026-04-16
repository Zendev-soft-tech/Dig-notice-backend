import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return this.userRepository.delete(id);
  }
}
