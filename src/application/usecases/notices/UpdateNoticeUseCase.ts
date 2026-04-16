import { INoticeRepository } from "../../../application/interfaces/INoticeRepository";
import { Notice } from "../../../adapters/models/Notice";
import { NotFoundError } from "../../../shared/error";

export class UpdateNoticeUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(id: string, noticeData: Partial<Notice>) {
    const existing = await this.noticeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Notice not found");
    }
    return this.noticeRepository.update(id, noticeData);
  }
}
