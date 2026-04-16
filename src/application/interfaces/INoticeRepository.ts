import { Notice } from "../../adapters/models/Notice";

export interface INoticeRepository {
  create(notice: Partial<Notice>): Promise<Notice>;
  findById(id: string): Promise<Notice | null>;
  findAllActive(currentDate: string): Promise<Notice[]>;
  update(id: string, noticeData: Partial<Notice>): Promise<void>;
  delete(id: string): Promise<void>;
  findByDepartment(department: string, currentDate: string): Promise<Notice[]>;
  findByAcademicProfile(department: string, semester: string, currentDate: string): Promise<Notice[]>;
  findByAuthor(authorId: string): Promise<Notice[]>;
}
