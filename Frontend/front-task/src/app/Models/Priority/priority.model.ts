export interface PriorityDTO {
  id: number;
  name: string;
}

export class PriorityModel {
  constructor(public id: number, public name: string) {}

  static fromDTO(dto: PriorityDTO | any): PriorityModel {
    return new PriorityModel(Number(dto.id), String(dto.name ?? ''));
  }

  toDTO(): PriorityDTO {
    return { id: this.id, name: this.name };
  }
}
