import 'multer';
import { Body, Controller, Delete, HttpCode, Param, Patch, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FilesInterceptor } from '@nestjs/platform-express';
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
import { BodyInterceptor } from './pipes/body-interceptor.pipe';
import { User } from '@api-gateway/common/decorators/user.decorator';

@ApiTags('Task')
@ApiBearerAuth('access-token')
@Controller('task')
@UseGuards(JwtRs256Guard, PermissionsGuard)
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    @Permissions('task.create')
    @CreateTaskDoc()
    @UseInterceptors(FilesInterceptor('files', 20, {
        fileFilter: fileFilter,
        storage: diskStorage({
            destination: './static/tasks',
            filename: fileNamer
        })
    }), BodyInterceptor)
    create(
        @Body() createTaskDto: CreateTaskDto,
        @User('sub') userId: number,
        @UploadedFiles() files?: Array<Express.Multer.File>,
    ) {
        createTaskDto.assignedToUserId =  userId;
        return this.taskService.create(createTaskDto, files);
    }

    @Patch(':id')
    @Permissions('task.update')
    @UpdateTaskDoc()
    update(
        @Param('id') id: number, 
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.taskService.update(id, updateTaskDto);
    }

    @Delete(':id')
    @Permissions('task.delete')
    @HttpCode(204)
    @DeleteTaskDoc()
    delete(@Param('id') id: number) {
        return this.taskService.delete(id);
    }
}