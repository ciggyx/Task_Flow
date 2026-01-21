import { DASHBOARD_REPO, LEADERBOARD_REPO, PARTICIPANT_TYPE_REPO, PRIORITY_REPO, ROL_DASHBOARD_REPO, STATUS_REPO, TASK_REPO, TASK_IMAGE_REPO } from '@microservice-tasks/core/ports/tokens';
import { Dashboard } from '@microservice-tasks/dashboard/entities/dashboard.entity';
import { ParticipantType } from '@microservice-tasks/participant-type/entities/participant-type.entity';
import { Priority } from '@microservice-tasks/priority/entities/priority.entity';
import { RolDashboard } from '@microservice-tasks/rol-dashboard/entities/rol-dashboard.entity';
import { Status } from '@microservice-tasks/status/entities/status.entity';
import { Task } from '@microservice-tasks/task/entities/task.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardRepository } from './typeorm/dashboard.repository';
import { ParticipantTypeRepository } from './typeorm/participant-type.repository';
import { PriorityRepository } from './typeorm/priority.repository';
import { RolDashboardRepository } from './typeorm/rol-dashboard.repository';
import { StatusRepository } from './typeorm/status.repository';
import { TaskRepository } from './typeorm/task.repository';
import { LeaderboardRepository } from './typeorm/leaderboard.repository';
import { Leaderboard } from '@microservice-tasks/leaderboard/entities/leaderboard.entity';
import { TaskImage } from '@microservice-tasks/task/entities/task-image.entity';
import { TaskImageRepository } from './typeorm/task-image.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Dashboard, ParticipantType, Priority, RolDashboard, Status, Task, Leaderboard, TaskImage])],
    providers: [
        { provide: DASHBOARD_REPO, useClass: DashboardRepository },
        { provide: PARTICIPANT_TYPE_REPO, useClass: ParticipantTypeRepository },
        { provide: PRIORITY_REPO, useClass: PriorityRepository },
        { provide: ROL_DASHBOARD_REPO, useClass: RolDashboardRepository },
        { provide: STATUS_REPO, useClass: StatusRepository },
        { provide: TASK_REPO, useClass: TaskRepository },
        { provide: LEADERBOARD_REPO, useClass: LeaderboardRepository },
        { provide: TASK_IMAGE_REPO, useClass: TaskImageRepository },
    ],
    exports: [DASHBOARD_REPO, PARTICIPANT_TYPE_REPO, PRIORITY_REPO, ROL_DASHBOARD_REPO, STATUS_REPO, TASK_REPO, LEADERBOARD_REPO, TASK_IMAGE_REPO],
})
export class InfraModule { }

