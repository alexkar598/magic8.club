declare namespace Express {
  export interface Request {
    user_id: string;
    user: Reference<DbUser>;
    sid: string;
  }
}

declare module "http" {
  export interface IncomingMessage {
    user_token: string;
    user_id: string;
    user: Reference<DbUser>;
    sid: string;
  }
}
