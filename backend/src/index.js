/**
 * Rakuten - Multi-Vendor E-commerce Backend
 * Local dev server (Socket.io, cron). For Vercel, use backend/index.js which exports app only.
 */

import 'dotenv/config';

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('[unhandledRejection]', reason);
});

import http from 'http';
import app from './app.js';
import { setupSocket } from './socket.js';
import { expireWholesaleOrders } from './jobs/expireWholesaleOrders.js';

const server = http.createServer(app);
const PORT = parseInt(process.env.PORT, 10) || 5001;

setupSocket(server);

const runExpireJob = async () => {
  try {
    const { expiredCount } = await expireWholesaleOrders();
    if (expiredCount > 0) console.log(`[job] Expired ${expiredCount} wholesale order(s)`);
  } catch (err) {
    console.error('[job] expireWholesaleOrders failed:', err.message);
  }
};
runExpireJob();
setInterval(runExpireJob, 60 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Socket.io: enabled for real-time chat`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} in use. Run: npm run kill-port\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
