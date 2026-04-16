import { DataSource, Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Notice } from "../models/Notice";
import { INoticeRepository } from "../../application/interfaces/INoticeRepository";

export class NoticeImpl implements INoticeRepository {
  private repository: Repository<Notice>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Notice);
  }

  async create(notice: Partial<Notice>): Promise<Notice> {
    const newNotice = this.repository.create(notice);
    return this.repository.save(newNotice);
  }

  async findById(id: string): Promise<Notice | null> {
    return this.repository.findOne({ where: { id }, relations: ["author"] });
  }

  async findAllActive(currentDate: string): Promise<Notice[]> {
    return this.repository.find({
      where: {
        expiryDate: MoreThanOrEqual(currentDate),
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["author"],
    });
  }

  async update(id: string, noticeData: Partial<Notice>): Promise<void> {
    await this.repository.update(id, noticeData);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByDepartment(department: string, currentDate: string): Promise<Notice[]> {
    return this.repository.find({
      where: [
        { department, expiryDate: MoreThanOrEqual(currentDate) },
        { department: "All", expiryDate: MoreThanOrEqual(currentDate) },
      ],
      order: {
        createdAt: "DESC",
      },
      relations: ["author"],
    });
  }

  async findByAcademicProfile(department: string, semester: string, currentDate: string): Promise<Notice[]> {
    return this.repository.find({
      where: [
        { department, semester, expiryDate: MoreThanOrEqual(currentDate) },
        { department, semester: "All", expiryDate: MoreThanOrEqual(currentDate) },
        { department: "All", semester, expiryDate: MoreThanOrEqual(currentDate) },
        { department: "All", semester: "All", expiryDate: MoreThanOrEqual(currentDate) },
      ],
      order: {
        createdAt: "DESC",
      },
      relations: ["author"],
    });
  }

  async findByAuthor(authorId: string): Promise<Notice[]> {
    return this.repository.find({
      where: { createdBy: authorId },
      order: { createdAt: "DESC" },
    });
  }
}
