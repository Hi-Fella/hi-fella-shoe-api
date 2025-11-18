import { Response } from 'express';

export interface HttpResponseData<T = any> {
  status: 'success' | 'failed';
  code: number;
  message?: string;
  data?: T | null;
  field_error?: Record<string, string> | null;
}

export interface HttpResponseSuccessParams<T>
  extends Omit<HttpResponseData<T>, 'status' | 'code' | 'field_error'> {
  res?: Response;
}

interface HttpResponseFailedParams<T>
  extends Omit<HttpResponseData<T>, 'status' | 'code'> {
  res?: Response;
}

export class HttpResponseUtil {
  static success<T>(
    params: HttpResponseSuccessParams<T> = {},
  ): HttpResponseData<T> {
    return {
      status: 'success',
      code: 200,
      message: params?.message ?? 'success',
      data: params?.data ?? null,
    };
  }

  static successCreated<T>(
    params: HttpResponseSuccessParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'success',
          code: 201,
          message: params?.message ?? 'success',
          data: params?.data ?? null,
        })
        .status(201) as any;
    }

    return {
      status: 'success',
      code: 201,
      message: params?.message ?? 'ok',
      data: params?.data ?? null,
    };
  }

  static badRequest<T>(
    params: HttpResponseFailedParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'failed',
          code: 400,
          message: params?.message ?? 'bad request',
          data: params?.data ?? null,
          field_error: params?.field_error ?? null,
        })
        .status(400) as any;
    }

    return {
      status: 'failed',
      code: 400,
      message: params?.message ?? 'bad request',
      data: params?.data ?? null,
      field_error: params?.field_error ?? null,
    };
  }

  static unauthorized<T>(
    params: HttpResponseFailedParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'failed',
          code: 401,
          message: params?.message ?? 'unauthorized',
          data: params?.data ?? null,
        })
        .status(401) as any;
    }

    return {
      status: 'failed',
      code: 401,
      message: params?.message ?? 'unauthorized',
      data: params?.data ?? null,
    };
  }

  static forbidden<T>(
    params: HttpResponseFailedParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'failed',
          code: 403,
          message: params?.message ?? 'forbidden',
          data: params?.data ?? null,
        })
        .status(403) as any;
    }

    return {
      status: 'failed',
      code: 403,
      message: params?.message ?? 'forbidden',
      data: params?.data ?? null,
    };
  }

  static notFound<T>(
    params: HttpResponseFailedParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'failed',
          code: 404,
          message: params?.message ?? 'not found',
          data: params?.data ?? null,
        })
        .status(404) as any;
    }

    return {
      status: 'failed',
      code: 404,
      message: params?.message ?? 'not found',
      data: params?.data ?? null,
    };
  }

  static serverError<T>(
    params: HttpResponseFailedParams<T> = {},
  ): HttpResponseData<T> {
    if (!!params?.res) {
      return params.res
        .json({
          status: 'failed',
          code: 500,
          message: params?.message ?? 'something went wrong',
          data: params?.data ?? null,
        })
        .status(500) as any;
    }

    return {
      status: 'failed',
      code: 500,
      message: params?.message ?? 'something went wrong',
      data: params?.data ?? null,
    };
  }
}
