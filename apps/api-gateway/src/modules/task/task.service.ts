import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateTaskDto, UpdateDashboardDto, UpdateTaskDto } from "@shared/dtos";
import { TaskResponseDto } from "@shared/dtos";
import { firstValueFrom } from "rxjs";
import { normalizeRemoteError } from "../auth/error/normalize-remote-error";

@Injectable()
export class TaskService {
    constructor(
        @Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,
    ) { }

    async create(createTaskDto: CreateTaskDto, files?: Array<Express.Multer.File>) {
        try {
            const task: TaskResponseDto = await firstValueFrom(
                this.dashboardClient.send({ cmd: 'create_task' }, { createTaskDto, files }),
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

    async update(id: number, updateTaskDto: UpdateTaskDto, userId: number, files?: Array<Express.Multer.File>) {
        try {
            const task: TaskResponseDto = await firstValueFrom(
                this.dashboardClient.send({ cmd: 'update_task' }, { id, updateTaskDto, userId, files }),
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

    async delete(id: number, userId: number) {
        try {
            await firstValueFrom(
                this.dashboardClient.send({ cmd: 'delete_task' }, { id, userId }), { defaultValue: null },
            );
            return;
        } catch (err: unknown) {
            const payload = normalizeRemoteError(err);
            throw new HttpException(
                { error: payload },
                typeof payload.status === 'number' ? payload.status : 500,
            );
        }
    }
}