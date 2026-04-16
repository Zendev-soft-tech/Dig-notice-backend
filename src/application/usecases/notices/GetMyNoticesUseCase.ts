import { INoticeRepository } from "../../../application/interfaces/INoticeRepository";

export class GetMyNoticesUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(userId: string) {
    if (!userId) {
      throw new Error("User ID is required to fetch user notices");
    }
    
    return this.noticeRepository.findByAuthor(userId);
  }
}
