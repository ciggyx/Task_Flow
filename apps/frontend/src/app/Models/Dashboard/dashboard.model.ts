export interface DashboardDTO {
  id: number;
  name: string;
  description: string;
  requiresReview: boolean;
}

export interface DashboardDTOWithoutID {
  name: string;
  description: string;
  requiresReview: boolean;
}

export class DashboardModel {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public requiresReview: boolean,
  ) {}

  static fromDTO(dto: DashboardDTO | any): DashboardModel {
    return new DashboardModel(Number(dto.id), String(dto.name), String(dto.description), Boolean(dto.requiresReview));
  }

  toDTO(): DashboardDTO {
    return { id: this.id, name: this.name, description: this.description, requiresReview:this.requiresReview };
  }

  toDTOWithoutID(): DashboardDTOWithoutID {
    return { name: this.name, description: this.description, requiresReview:this.requiresReview };
  }
}
