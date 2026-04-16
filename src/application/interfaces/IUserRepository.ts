import { User } from "../../adapters/models/User";

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  updateOTP(userId: string, otp: string, expires: Date): Promise<void>;
  clearOTP(userId: string): Promise<void>;
}
