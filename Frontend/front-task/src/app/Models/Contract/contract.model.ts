export interface  ContractsDTO {
  id: number;
  user: { id: number};
  dashboard: { id: number };
  role: { id: number};
}

export class ContractModel {
  constructor(public id: number, public userId: number, public dashboardId: number, public roleId: number) {}

  static fromDTO(dto: ContractsDTO | any): ContractModel {
    return new ContractModel(Number(dto.id), Number(dto.user.id ?? ''), Number(dto.dashboard.id ?? null), Number(dto.role.id ?? null));
  }

  toDTO(): ContractsDTO {
    return { id: this.id, user: { id: this.userId }, dashboard: { id: this.dashboardId }, role: {id: this.roleId} };
  }
}
