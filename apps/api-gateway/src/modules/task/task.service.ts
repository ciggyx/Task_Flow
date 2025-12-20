import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateTaskDto, UpdateDashboardDto } from "@shared/dtos";
import { TaskResponseDto } from "@shared/dtos";
import { firstValueFrom } from "rxjs";
import { normalizeRemoteError } from "../auth/error/normalize-remote-error";

@Injectable()
export class TaskService {
    constructor(
        @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
    ) { }

    async create(createTaskDto: CreateTaskDto) {
        try {
            const task: TaskResponseDto = await firstValueFrom(
                this.dashboardClient.send({ cmd: 'create_task' }, { createTaskDto }),
            );
            return task;
        } catch (err: unknown) {
            const payload = normalizeRemoteError(err);
            throw new HttpException(
                { error: payload },
                typeof payload.status === 'number' ? payload.status : 500,
            );
        }
    }

    async update(id: number, updateTaskDto: UpdateDashboardDto) {
        try {
            const task: TaskResponseDto = await firstValueFrom(
                this.dashboardClient.send({ cmd: 'update_task' }, { id, updateTaskDto }),
            );
            return task;
        } catch (err: unknown) {
            const payload = normalizeRemoteError(err);
            throw new HttpException(
                { error: payload },
                typeof payload.status === 'number' ? payload.status : 500,
            );
        }
    }
}