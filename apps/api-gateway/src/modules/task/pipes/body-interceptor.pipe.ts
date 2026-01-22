import { Observable } from 'rxjs';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';

@Injectable()
export class BodyInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (request.body?.body) {
            try {
                // Parsea el campo "body" que deberia venir en el form-data
                // que contiene todo el JSON adentro.
                request.body = JSON.parse(request.body.body);
            } catch (err) {
                throw new BadRequestException('Invalid JSON in "body" field');
            }
        }
        return next.handle();
    }
}