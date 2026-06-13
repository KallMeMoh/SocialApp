import type { Types } from 'mongoose';
import type { Server, Socket } from 'socket.io';

export interface ClientToServerEvents {
  event: (packet: string, ack: (response: string) => void) => void;
}

export interface ServerToClientEvents {
  notification: (message: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: Types.ObjectId;
  jti: string;
  role: string;
}

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
