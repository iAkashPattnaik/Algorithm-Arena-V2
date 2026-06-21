const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const { env } = require('./env');
const User = require('../src/features/users/User.model');

let io;

const extractBearerToken = (socket) => {
  const handshakeToken = socket.handshake?.auth?.token;
  if (typeof handshakeToken === 'string' && handshakeToken.trim()) {
    return handshakeToken.trim();
  }

  const headerAuth = socket.handshake?.headers?.authorization;
  if (typeof headerAuth === 'string' && headerAuth.startsWith('Bearer ')) {
    return headerAuth.split(' ')[1];
  }

  return null;
};

const resolveSocketUserId = async (socket) => {
  const token = extractBearerToken(socket);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // No in-memory caching: always resolve via MongoDB.
    const user = await User.findById(decoded.id).select('_id status').lean();
    if (!user || user.status === 'Banned') return null;

    return user._id.toString();
  } catch {
    return null;
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Reduce worst-case payload abuse. (Socket.IO has other internal limits; this helps too.)
    maxHttpBufferSize: 1e6, // 1 MB
  });

  io.on('connection', (socket) => {
    logger.info('New client connected', { socketId: socket.id });

    // Resolve user id once per socket.
    socket.data.userId = null;

    resolveSocketUserId(socket)
      .then((userId) => {
        socket.data.userId = userId;

        if (!userId) {
          socket.emit('auth', { ok: false });
        }
      })
      .catch(() => {
        socket.data.userId = null;
        socket.emit('auth', { ok: false });
      });

    // Basic connection-rate protection: drop sockets that reconnect too quickly.
    const now = Date.now();
    const last = socket.handshake?.auth?.lastConnectTs;
    if (typeof last === 'number' && now - last < 2000) {
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
    logger.info('Socket event emitted', { event, data });
  }
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    logger.info(`Socket event emitted to room ${room}`, { event, data });
  }
};

module.exports = { initSocket, getIO, emitEvent, emitToRoom };

