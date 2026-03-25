import { Response } from "express";

export const successResponse = (
  res: Response,
  message: String,
  statusCode: number = 200,
  data: any = null,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const ErrorResponse = (
  res: Response,
  message: String,
  statusCode: number = 404,
  error: any = null,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error,
  });
};
