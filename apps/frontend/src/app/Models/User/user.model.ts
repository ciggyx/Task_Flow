export interface UserDTO {
  id: number;
  name: string;
  description: string;
  email: string;
  role?: {id: number, name: string}; 
}

export class UserModel {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public description: string,
    public role?: {id: number, name: string},
  ) {}

  static fromDTO(dto: UserDTO | any): UserModel {
    return new UserModel(
      Number(dto.id),
      String(dto.name ?? ''),
      String(dto.email ?? ''),
      String(dto.description ?? ''),
      dto.role !== undefined && dto.role !== null 
        ? dto.role as {id: number, name: string}
        : undefined
    );
  }

  toDTO(): UserDTO {
    const dto: UserDTO = { 
      id: this.id, 
      name: this.name, 
      email: this.email, 
      description: this.description,
    };

    if (this.role !== undefined) {
      dto.role = this.role;
    }

    return dto;
  }
}