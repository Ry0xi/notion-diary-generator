export class DiaryAlreadyExistError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DiaryAlreadyExistError";
  }
}
