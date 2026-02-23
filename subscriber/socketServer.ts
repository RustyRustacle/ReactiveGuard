import { Server, Socket } from 'socket.io';
import http from 'http';
import { AlertData } from './eventDecoder';

const PORT = parseInt(process.env.SUBSCRIBER_PORT || '3001');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let io: Server;

// In-memory alert history (last 100 alerts)
const alertHistory: AlertData[] = [];
const MAX_HISTORY = 100;

/**
 * Initialize the Socket.io WebSocket server
 */
export function createSocketServer(): Server {
    const httpServer = http.createServer((req, res) => {
        // Health check endpoint
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                connectedClients: io?.engine?.clientsCount || 0,
                alertsProcessed: alertHistory.length,
            }));
            return;
        }

        // Alert history endpoint
        if (req.url === '/api/alerts') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': FRONTEND_URL,
            });
            res.end(JSON.stringify(alertHistory));
            return;
        }

        res.writeHead(404);
        res.end();
    });

    io = new Server(httpServer, {
        cors: {
            origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Send recent alert history on connect
        socket.emit('alert-history', alertHistory.slice(-20));

        // Allow clients to join room by their wallet address
        socket.on('subscribe-user', (userAddress: string) => {
            const room = userAddress.toLowerCase();
            socket.join(room);
            console.log(`📡 ${socket.id} subscribed to alerts for ${room}`);

            // Send user-specific history
            const userAlerts = alertHistory.filter(
                (a) => a.user.toLowerCase() === room
            );
            socket.emit('user-alert-history', userAlerts);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    httpServer.listen(PORT, () => {
        console.log(`🌐 WebSocket server listening on port ${PORT}`);
        console.log(`   Frontend URL: ${FRONTEND_URL}`);
    });

    return io;
}

/**
 * Broadcast alert to all connected clients and user-specific room
 */
export function broadcastAlert(alert: AlertData): void {
    if (!io) {
        console.error('Socket server not initialized');
        return;
    }

    // Store in history
    alertHistory.push(alert);
    if (alertHistory.length > MAX_HISTORY) {
        alertHistory.shift();
    }

    // Broadcast to all clients
    io.emit('reactive-alert', alert);

    // Also emit to user-specific room
    const userRoom = alert.user.toLowerCase();
    io.to(userRoom).emit('user-alert', alert);

    // Log with severity indicator
    const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🟢';
    console.log(`${icon} Alert [${alert.type.toUpperCase()}] | User: ${alert.user} | HF: ${alert.healthFactor}`);
}

export { io };
