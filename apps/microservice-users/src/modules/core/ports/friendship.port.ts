import { Friendship } from '../../friendship/entities/friendship.entity'; // Ajusta la ruta a tu entidad

export interface IFriendshipRepository {
  create(friendship: Friendship): Promise<Friendship>;
  findAll(): Promise<Friendship[]>;
  findById(id: number): Promise<Friendship | null>;
  findByUsers(userId1: number, userId2: number): Promise<Friendship | null>;
  findAllByUser(userId:number): Promise<Friendship[]|null>;
  findBlockedByUser(userId: number): Promise<Friendship[]|null>;
  update(friendship: Friendship): Promise<Friendship>;
  remove(friendship: Friendship): Promise<void>;
}