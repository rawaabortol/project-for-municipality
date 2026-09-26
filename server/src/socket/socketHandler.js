/**
 * Socket.IO Handler for Real-Time Tripoli Public Health Alerts
 */
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket Connected] Client ID: ${socket.id}`);

    socket.on('join_role_channel', (role) => {
      socket.join(`role_${role}`);
      console.log(`Socket ${socket.id} joined role_${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] Client ID: ${socket.id}`);
    });
  });

  return {
    broadcastAlert: (alert) => {
      io.to('role_HEALTH_OFFICER').to('role_ADMINISTRATOR').emit('NEW_HEALTH_ALERT', alert);
    },
    broadcastStatusChange: (report) => {
      io.emit('REPORT_STATUS_UPDATED', report);
    }
  };
};
