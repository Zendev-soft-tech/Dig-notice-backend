import { IUserRepository } from "../../../application/interfaces/IUserRepository";

export class GetNextIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(role: string): Promise<string> {
    const maxId = await this.userRepository.findMaxId(role);
    const prefix = role === 'admin' ? 'ADMIN' : role === 'staff' ? 'STAFF' : 'STUD';

    if (!maxId) {
      return `${prefix}001`;
    }

    const numPart = maxId.replace(prefix, '');
    const num = parseInt(numPart, 10);
    const nextNum = isNaN(num) ? 1 : num + 1;

    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }
}
