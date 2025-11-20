export interface StatusDTO {
  id: number;
  name: string;
}

export class StatusModel {
  constructor(
    public id: number,
    public name: string,
  ) {}

  static fromDTO(dto: StatusDTO | any): StatusModel {
    return new StatusModel(Number(dto.id), String(dto.name ?? ''));
  }

  toDTO(): StatusDTO {
    return { id: this.id, name: this.name };
  }
}
