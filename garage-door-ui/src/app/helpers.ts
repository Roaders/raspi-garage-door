import { DOOR_STATUS } from '../../../shared';
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

export function getStatusStyle(status?: DOOR_STATUS): string {
    switch (status) {
        case 'CLOSED':
            return `container-closed`;
        case 'OPEN':
            return `container-open`;

        default:
            return 'container-unknown';
    }
}

export function getLockIcon(status?: DOOR_STATUS) {
    return status == 'CLOSED' ? faLock : faLockOpen;
}

export function stringifyError(error: any) {
    if (typeof error.message === 'string') {
        return error.message;
    }

    return JSON.stringify(error);
}
