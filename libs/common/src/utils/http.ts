import { ArgumentMetadata, createParamDecorator, ExecutionContext, HttpException, HttpStatus, INestApplicationContext, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const Authorization = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.auth;
    },
);

export class HttpResp<T> {
    code: number;
    message: string | object;
    data: T; 
    meta?: Record<string, any>;
    error?: Record<string, any>;

    constructor(code: number, message: string, data: T, meta?: Record<string, any>, error?: Record<string, any>) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.meta = meta;
        this.error = error;
    }

    static success<T>(data?: T, meta?: Record<string, any>): HttpResp<T> {
        return new HttpResp<T>(200, "Successfully", (data || null) as any, meta);
    }

    static error<T>(code: number, message: string, error?: Record<string, any>): HttpResp<T> {
        return new HttpResp<T>(code, message, undefined as any, undefined as any, error as any);
    }
}

export class HttpError extends HttpException {
    constructor(response: string | Record<string, any>, status: number, options?: { cause?: unknown; description?: string }) {
        super(response, status, options);
        Object.setPrototypeOf(this, HttpError.prototype);
    }

    public static internal(message: string) {
        return new HttpError(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static badRequest(message: string) {
        return new HttpError(message, HttpStatus.BAD_REQUEST);
    }

    public static unauthorize(message?: string) {
        return new HttpError(message || 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
}

export class PayloadPipe implements PipeTransform {

    transform(value: any, metadata: ArgumentMetadata) {
        const payload = value;

        if (!metadata.metatype || this.isPrimitive(metadata.metatype)) {
            return payload;
        }

        const object = plainToInstance(metadata.metatype, payload);
        const errors = validateSync(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        });

        if (errors.length > 0) {
            throw HttpError.badRequest(errors.join(', '));
        }

        return object;
    }

    private isPrimitive(metatype: any): boolean {
        const primitives = [String, Boolean, Number, Array, Object];
        return primitives.includes(metatype);
    }
}