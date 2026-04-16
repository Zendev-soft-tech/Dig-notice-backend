import { INoticeRepository } from "../../../application/interfaces/INoticeRepository";
import { NotFoundError } from "../../../shared/error";

export class DeleteNoticeUseCase {
  constructor(private noticeRepository: INoticeRepository) {}

  async execute(id: string) {
    const existing = await this.noticeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Notice not found");
    }
    return this.noticeRepository.delete(id);
  }
}
