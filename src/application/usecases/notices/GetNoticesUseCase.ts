import { INoticeRepository } from "../../../application/interfaces/INoticeRepository";

export class GetNoticesUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(department?: string, semester?: string) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (department && department !== 'All' && semester && semester !== 'All') {
      return this.noticeRepository.findByAcademicProfile(department, semester, currentDate);
    }
    
    if (department && department !== 'All') {
      return this.noticeRepository.findByDepartment(department, currentDate);
    }
    
    return this.noticeRepository.findAllActive(currentDate);
  }
}
