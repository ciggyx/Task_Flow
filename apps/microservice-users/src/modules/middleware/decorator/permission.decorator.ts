import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Permissions = Reflector.createDecorator<string[]>();

export const Public = () => SetMetadata('isPublic', true);
