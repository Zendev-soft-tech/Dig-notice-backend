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
    await this.repository.softDelete(id);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findMaxId(role: string): Promise<string | null> {
    const prefix = role === 'admin' ? 'ADMIN' : role === 'staff' ? 'STAFF' : 'STUD';
    
    // Query including soft-deleted users to find the true max ID
    const latestUser = await this.repository.findOne({
      where: { role: role as any },
      order: { username: 'DESC' },
      withDeleted: true
    });

    return latestUser ? latestUser.username : null;
  }

  async getDistinctDepartments(): Promise<string[]> {
    const users = await this.repository.find({
      select: ["department"],
      where: {}
    });
    const depts = users.map(u => u.department).filter(Boolean);
    return Array.from(new Set(depts));
  }
}
