import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Extract message from standard Nest error response
    if (typeof message === "object" && (message as any).message) {
      message = (message as any).message;
    }

    // Standard JSON response structure
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      status,
      message,
    };

    // Log server-side error for debugging
    if (status >= 500) {
      console.error("[GlobalHttpExceptionFilter]", exception);
    }

    response.status(status).json(errorResponse);
  }
}
