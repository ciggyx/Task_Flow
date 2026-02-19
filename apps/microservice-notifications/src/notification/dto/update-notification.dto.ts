import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from '@shared/dtos';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
