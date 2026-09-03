import Notification from '../models/Notification.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const NOTIFICATION_TYPES = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  TEAM_ADDED: 'team_added',
  TEAM_REMOVED: 'team_removed',
  PROJECT_UPDATED: 'project_updated',
  OWNERSHIP_TRANSFERRED: 'ownership_transferred',
};

const LEGACY_TYPE_MAP = {
  application: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
  accepted: NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
  rejected: NOTIFICATION_TYPES.APPLICATION_REJECTED,
  team: NOTIFICATION_TYPES.TEAM_ADDED,
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId,
  projectId,
}) => {
  const normalizedType = LEGACY_TYPE_MAP[type] || type;

  const notification = await Notification.create({
    userId,
    type: normalizedType,
    title,
    message,
    relatedId,
    projectId,
  });

  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
  }

  return notification;
};

export default { setSocketIO, createNotification, NOTIFICATION_TYPES };
