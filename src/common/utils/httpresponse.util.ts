import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface HttpResponseData<T = any> {
  status: 'success' | 'failed';
  code: number;
  message?: string;
  data?: T | null;
  field_errors?: Record<string, string> | null;
}

export interface HttpResponseSuccessParams<T>
  extends Omit<HttpResponseData<T>, 'status' | 'code' | 'field_errors'> {}

export interface HttpResponseFailedParams<T>
  extends Omit<HttpResponseData<T>, 'status' | 'code'> {}

export class HttpResponseUtil {
  static success<T>(params: HttpResponseSuccessParams<T> = {}) {
    return {
      status: 'success',
      code: HttpStatus.OK,
      message: params?.message ?? 'success',
      data: params?.data ?? null,
    };
  }

  static successCreated<T>(params: HttpResponseSuccessParams<T> = {}) {
    return {
      status: 'success',
      code: HttpStatus.CREATED,
      message: params?.message ?? 'ok',
      data: params?.data ?? null,
    };
  }

  static badRequest<T>(params: HttpResponseFailedParams<T> = {}) {
    return new BadRequestException({
      status: 'failed',
      code: HttpStatus.BAD_REQUEST,
      message: params?.message ?? 'bad request',
      data: params?.data ?? null,
      field_errors: params?.field_errors ?? null,
    });
  }

  static unauthorized<T>(params: HttpResponseFailedParams<T> = {}) {
    return new UnauthorizedException({
      status: 'failed',
      code: HttpStatus.UNAUTHORIZED,
      message: params?.message ?? 'unauthorized',
      data: params?.data ?? null,
    });
  }

  static forbidden<T>(params: HttpResponseFailedParams<T> = {}) {
    return new ForbiddenException({
      status: 'failed',
      code: HttpStatus.FORBIDDEN,
      message: params?.message ?? 'forbidden',
      data: params?.data ?? null,
    });
  }

  static notFound<T>(params: HttpResponseFailedParams<T> = {}) {
    return new NotFoundException({
      status: 'failed',
      code: HttpStatus.NOT_FOUND,
      message: params?.message ?? 'not found',
      data: params?.data ?? null,
    });
  }

  static serverError<T>(params: HttpResponseFailedParams<T> = {}) {
    return new InternalServerErrorException({
      status: 'failed',
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: params?.message ?? 'something went wrong',
      data: params?.data ?? null,
    });
  }
}
