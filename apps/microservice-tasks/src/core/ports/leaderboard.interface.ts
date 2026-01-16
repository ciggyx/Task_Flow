import { CreateLeaderboardDto } from "@microservice-tasks/leaderboard/dto/create-leaderboard.dto";
import { UpdateLeaderboardDto } from "@microservice-tasks/leaderboard/dto/update-leaderboard.dto";
import { Leaderboard } from "@microservice-tasks/leaderboard/entities/leaderboard.entity";
import { DeepPartial } from "typeorm";

export interface ILeaderboardRepository{

    create(createLeaderboard: CreateLeaderboardDto): Promise<Leaderboard>;
    
    findAll(): Promise<Leaderboard[]>;

    findOne(id: number): Promise<Leaderboard>;

    update(updateLeaderboard: UpdateLeaderboardDto, id: number,): Promise<Leaderboard | null>;

    remove(id: number): Promise<void>;

    count(): Promise<number>;

    findByUserAndDashboard(userId: number, dashboardId: number): Promise<Leaderboard | null>;

    saveArray(leaderboards: DeepPartial<Leaderboard>[]): Promise<Leaderboard[]>;
    
}