import { IUserRepository } from "../../../application/interfaces/IUserRepository";

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    return this.userRepository.findAll();
  }
}
