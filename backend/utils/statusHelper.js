export const PROJECT_STATUSES = ['recruiting', 'in-progress', 'completed', 'archived'];

export const LEGACY_STATUS_MAP = {
  open: 'recruiting',
  closed: 'archived',
};

export const normalizeStatus = (status) => LEGACY_STATUS_MAP[status] || status;

export const isRecruiting = (status) => normalizeStatus(status) === 'recruiting';

export default { PROJECT_STATUSES, LEGACY_STATUS_MAP, normalizeStatus, isRecruiting };
