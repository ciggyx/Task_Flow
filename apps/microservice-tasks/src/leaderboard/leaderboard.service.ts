import { Inject, Injectable, Logger } from '@nestjs/common';
import { LEADERBOARD_REPO } from '@microservice-tasks/core/ports/tokens';
import { ILeaderboardRepository } from '@microservice-tasks/core/ports/leaderboard.interface';
import { Leaderboard } from './entities/leaderboard.entity';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { IRankableTask } from '@microservice-tasks/core/ports/rankeable-task.interface';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @Inject(LEADERBOARD_REPO)
    private readonly leaderboardRepository: ILeaderboardRepository,
  ) {}

  async handleTaskCompletion(task: IRankableTask): Promise<Leaderboard | void> {
    const { assignedToUserId, dashboardId, priority, endDate, finishDate } = task;

    if (!assignedToUserId) {
      this.logger.warn(`Tarea ${task.id} completada sin userId. No se asignarán puntos.`);
      return;
    }

    const pointsEarned = this.calculatePoints(priority?.name, endDate, finishDate);

    // 1. Buscamos registro existente
    const existingEntry = await this.leaderboardRepository.findByUserAndDashboard(
      assignedToUserId,
      dashboardId,
    );

    if (existingEntry) {
      // 2. Usamos UpdateLeaderboardDto para actualizar
      const updateData: UpdateLeaderboardDto = {
        totalPoints: existingEntry.totalPoints + pointsEarned,
        tasksCompleted: existingEntry.tasksCompleted + 1,
      };
      return await this.leaderboardRepository.update(updateData, existingEntry.id);
    } else {
      // 3. Usamos CreateLeaderboardDto para crear el primer registro
      const newData: CreateLeaderboardDto = {
        userId: assignedToUserId,
        dashboardId: dashboardId,
        totalPoints: pointsEarned,
        tasksCompleted: 1,
      };
      return await this.leaderboardRepository.create(newData);
    }
  }

  async handleTaskReversal(task: IRankableTask): Promise<void> {
    const { assignedToUserId, dashboardId, priority, endDate, finishDate } = task;
    if (!assignedToUserId) return;

    // Calculamos cuántos puntos valía esa tarea para restarlos
    const pointsToRemove = this.calculatePoints(priority?.name, endDate, finishDate);

    const existingEntry = await this.leaderboardRepository.findByUserAndDashboard(assignedToUserId, dashboardId);

    if (existingEntry) {
      // Evitamos números negativos por seguridad
      const newPoints = Math.max(0, existingEntry.totalPoints - pointsToRemove);
      const newCount = Math.max(0, existingEntry.tasksCompleted - 1);

      await this.leaderboardRepository.update({
        totalPoints: newPoints,
        tasksCompleted: newCount,
      }, existingEntry.id);
      
      this.logger.log(`Puntos revertidos para usuario ${assignedToUserId} en dashboard ${dashboardId}`);
    }
  }

 async getRankingByDashboard(dashboardId: number): Promise<Leaderboard[]> {
  // Ahora ranking ya es un Leaderboard[] gracias a la interfaz corregida
  const ranking = await this.leaderboardRepository.findByDashboard(dashboardId);
  return ranking; 
  }

  async getTopRankings(dashboardId: number, limit?: number): Promise<Leaderboard[]> {
    const topLimit = limit || 5;
    
    // TypeScript ya sabe que esto devuelve un array
    const ranking = await this.leaderboardRepository.findByDashboard(dashboardId, topLimit);
    
    if (ranking.length === 0) {
      this.logger.log(`No se encontraron entradas de ranking para el dashboard ${dashboardId}`);
    }

    return ranking;
  }


  async findAll(): Promise<Leaderboard[]>{
    return await this.leaderboardRepository.findAll();
  }
  async findOne(id: number): Promise<Leaderboard> {
    return await this.leaderboardRepository.findOne(id);
  }

  async remove(id: number): Promise<void> {
    return await this.leaderboardRepository.remove(id);
  }

  /**
   * Algoritmo de puntuación (Privado)
   */
  private calculatePoints(priorityName: string, deadline: Date, completionDate: Date): number {
    const basePoints: Record<string, number> = {
      'Urgent': 70,
      'High': 50,
      'Medium': 20,
      'Low': 10,
      'Undefined': 5
    };

    let score = basePoints[priorityName] || basePoints['Undefined'];

    // Si entregó después del deadline, penalización del 50%
    if (deadline && completionDate > deadline) {
      score = Math.floor(score * 0.5);
    }

    return score;
  }
}