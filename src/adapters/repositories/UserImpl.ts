import { DataSource, Repository } from "typeorm";
import { User } from "../models/User";
import { IUserRepository } from "../../application/interfaces/IUserRepository";

export class UserImpl implements IUserRepository {
  private repository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async update(id: string, userData: Partial<User>): Promise<void> {
    await this.repository.update(id, userData);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async updateOTP(userId: string, otp: string, expires: Date): Promise<void> {
    await this.repository.update(userId, { otp, otpExpires: expires });
  }

  async clearOTP(userId: string): Promise<void> {
    await this.repository.update(userId, { otp: undefined, otpExpires: undefined });
  }
}
