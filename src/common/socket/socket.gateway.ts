import type { Server as ServerType } from 'node:http';
import { FRONTEND_URL } from '../../config/index.js';
import { Server } from 'socket.io';
import { auth } from '../../middlewares/authentication.js';
import { TokenTypeEnum } from '../types/auth.type.js';
import type { AppServer } from '../types/socket.type.js';
import { registerChatHandlers } from '../../modules/conversation/realtime/conversation.gateway.js';

class SocketGateway {
  private _instance: AppServer | null = null;

  createSocketServer = (server: ServerType) => {
    if (this._instance !== null)
      throw new Error('Already created an instance.');

    this._instance = new Server(server, { cors: { origin: FRONTEND_URL } });

    this._instance.use(async (socket, next) => {
      try {
        const authHeader = String(socket.handshake.auth['accessToken']);
        socket.data = await auth(authHeader, TokenTypeEnum.Access);
        next();
      } catch (err) {
        next(err instanceof Error ? err : new Error('Authentication failed'));
      }
    });

    this._instance.on('connection', (socket) => {
      if (this._instance) {
        registerChatHandlers(socket, this._instance);
      }
    });
  };

  getSocketServer = () => {
    if (this._instance === null) throw new Error('No created instance.');

    return this._instance;
  };
}

const socketGateway = new SocketGateway();
export default socketGateway;
