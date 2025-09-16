export interface  UserDTO {
  id: number;
  name: string;
  email: string;
}

export class UserModel {
  constructor(public id: number, public name: string, public email: string) {}

  static fromDTO(dto: UserDTO | any): UserModel {
    return new UserModel(Number(dto.id), String(dto.name ?? ''), String(dto.email ?? ''));
  }

  toDTO(): UserDTO {
    return { id: this.id, name: this.name, email: this.email };
  }
}
