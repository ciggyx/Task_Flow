import { ILeaderboardRepository } from "@microservice-tasks/core/ports/leaderboard.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Leaderboard } from "@microservice-tasks/leaderboard/entities/leaderboard.entity";
import { CreateLeaderboardDto } from "@microservice-tasks/leaderboard/dto/create-leaderboard.dto";
import { Repository } from "typeorm";
import { UpdateLeaderboardDto } from "@microservice-tasks/leaderboard/dto/update-leaderboard.dto";
import { NotFoundException } from "@nestjs/common";
import { DeepPartial } from "typeorm";

export class LeaderboardRepository implements ILeaderboardRepository {
  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
  ) {}

  async saveArray(data: DeepPartial<Leaderboard>[]): Promise<Leaderboard[]> {
  const entities = this.leaderboardRepository.create(data); 
  return await this.leaderboardRepository.save(entities);
}

  async create(createLeaderboard: CreateLeaderboardDto): Promise<Leaderboard> {
    const newEntry = this.leaderboardRepository.create(createLeaderboard);
    return await this.leaderboardRepository.save(newEntry);
  }

  findAll(): Promise<Leaderboard[]> {
    return this.leaderboardRepository.find({
      order: { totalPoints: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Leaderboard> {
    const entry = await this.leaderboardRepository.findOneBy({ id });
    if (!entry) {
      throw new NotFoundException(`Leaderboard entry with id: ${id} not found`);
    }
    return entry;
  }

  async update(updateLeaderboard: UpdateLeaderboardDto, id: number): Promise<Leaderboard> {
    const entry = await this.leaderboardRepository.preload({
      id,
      ...updateLeaderboard,
    });

    if (!entry) {
      throw new NotFoundException(`Cannot update: entry with id: ${id} not found`);
    }

    return await this.leaderboardRepository.save(entry);
  }

  async remove(id: number): Promise<void> {
    const result = await this.leaderboardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cannot delete: entry with id: ${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.leaderboardRepository.count();
  }
  
  async findByUserAndDashboard(userId: number, dashboardId: number): Promise<Leaderboard | null> {
    return await this.leaderboardRepository.findOne({
      where: { 
        userId: userId , 
        dashboard: { id: dashboardId } 
      }
    });
  }
  async findByDashboard(dashboardId: number, limit?: number): Promise<Leaderboard[]> {
  return await this.leaderboardRepository.find({
    where: { 
      dashboard: { id: dashboardId } 
    },
    order: { 
      totalPoints: 'DESC' 
    },
    take: limit, 
  });
}
}