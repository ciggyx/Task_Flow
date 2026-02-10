export interface participantTypeDTO {
  id: number;
  name: string;
}

export class participantTypeModel {
  constructor(
    public id: number,
    public name: string,
  ) {}

  static fromDTO(dto: participantTypeDTO | any): participantTypeModel {
    return new participantTypeModel(Number(dto.id), String(dto.name ?? ''));
  }

  toDTO(): participantTypeDTO {
    return { id: this.id, name: this.name };
  }
}
