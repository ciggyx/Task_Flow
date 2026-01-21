import 'multer';
import { BadRequestException, Body, Controller, Delete, HttpCode, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtRs256Guard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../authorization/permission.guard";
import { TaskService } from "./task.service";
import { CreateTaskDto, UpdateTaskDto } from "@shared/dtos";
import { Permissions } from '../authorization/permission.decorator';
import { CreateTaskDoc } from "./docs/create-task.doc";
import { UpdateTaskDoc } from "./docs/update-task.doc";
import { DeleteTaskDoc } from "./docs/delete-dashboard.doc";
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';

@Controller('task')
@ApiBearerAuth('access-token')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    @Permissions('task.create')
    @CreateTaskDoc()
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: fileFilter,
        // limits: { fileSize: 1000 }
        storage: diskStorage({
            destination: './static/tasks',
            filename: fileNamer
        })
    }))
    create(@Body() createTaskDto: CreateTaskDto, @UploadedFile() file?: Express.Multer.File) {
        return this.taskService.create(createTaskDto, file);
    }

    @Patch(':id')
    @Permissions('task.update')
    @UpdateTaskDoc()
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.taskService.update(+id, updateTaskDto);
    }

    @Delete(':id')
    @Permissions('task.delete')
    @HttpCode(204)
    @DeleteTaskDoc()
    delete(@Param('id') id: string) {
        return this.taskService.delete(+id);
    }
}