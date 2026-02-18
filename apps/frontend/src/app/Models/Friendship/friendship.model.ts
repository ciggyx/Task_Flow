export interface FriendshipDTO {
  friendshipId: number;
  status: string;
  friendshipDate: Date;
  sentByMe: boolean;
  friend: {id: number, name: string, email: string}; 
}

export class FriendshipModel {
  constructor(
    public friendshipId: number,
    public status: string,
    public friendshipDate: Date,
    public sentByMe: boolean,
    public friend: {id: number, name: string, email: string},
  ) {}

  static fromDTO(dto: FriendshipDTO | any): FriendshipModel {
    return new FriendshipModel(
      Number(dto.friendshipId),
      String(dto.status ?? ''),
      new Date(dto.friendshipDate ?? new Date()),
      Boolean(dto.sentByMe ?? false),
      dto.friend ?? undefined
    );
  }

  toDTO(): FriendshipDTO {
    const dto: FriendshipDTO = { 
      friendshipId: this.friendshipId, 
      status: this.status, 
      friendshipDate: this.friendshipDate,
      sentByMe: this.sentByMe,
      friend: this.friend,
    };
    return dto;
  }
}