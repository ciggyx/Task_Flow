import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtRs256Guard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../authorization/permission.guard";
import { TaskService } from "./task.service";
import { CreateTaskDto, UpdateTaskDto } from "@shared/dtos";
import { Permissions } from '../authorization/permission.decorator';
import { CreateTaskDoc } from "./docs/create-task.doc";
import { UpdateTaskDoc } from "./docs/update-task.doc";

@Controller('task')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    @Permissions('task.create')
    @CreateTaskDoc()
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.taskService.create(createTaskDto);
    }

    @Patch(':id')
    @Permissions('task.update')
    @UpdateTaskDoc()
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(+id, updateTaskDto);
    }
}