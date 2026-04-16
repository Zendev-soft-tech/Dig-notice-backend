import { INoticeRepository } from "../../../application/interfaces/INoticeRepository";
import { Notice } from "../../../adapters/models/Notice";

export class CreateNoticeUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(noticeData: Partial<Notice>) {
    // Basic validation can be added here or in the controller
    return this.noticeRepository.create(noticeData);
  }
}
