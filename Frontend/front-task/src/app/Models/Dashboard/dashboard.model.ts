export interface  DashboardDTO {
  id: number;
  name: string;
  description: string;
}

export class DashboardModel {
  constructor(public id: number, public name: string, public description: string) {}

  static fromDTO(dto: DashboardDTO | any): DashboardModel {
    return new DashboardModel(Number(dto.id), String(dto.name), String(dto.description));
  }

  toDTO(): DashboardDTO {
    return { id: this.id, name: this.name, description: this.description };
  }
}
