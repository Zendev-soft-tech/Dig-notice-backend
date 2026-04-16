export interface SuccessResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface FailureResponse {
  ok: false;
  error: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}
