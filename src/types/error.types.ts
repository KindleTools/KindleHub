/**
 * Application Error Types
 */

export type ErrorCode =
  | 'DB_READ_ERROR' |
  'DB_WRITE_ERROR' |
  'PARSE_ERROR' |
  'EXPORT_ERROR' |
  'NETWORK_ERROR' |
  'UNKNOWN_ERROR'

export class AppError extends Error {
  public code: ErrorCode
  public context: Record<string, unknown> | undefined

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN_ERROR',
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
