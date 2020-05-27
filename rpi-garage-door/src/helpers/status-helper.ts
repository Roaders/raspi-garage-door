import { DOOR_STATUS } from '../../../shared';

export function getStatus(doorOpen: boolean, doorClosed: boolean, currentStatus?: DOOR_STATUS): DOOR_STATUS {
    if (doorOpen && doorClosed) {
        return 'UNKNOWN';
    } else if (doorOpen) {
        return 'OPEN';
    } else if (doorClosed) {
        return 'CLOSED';
    }

    switch (currentStatus) {
        case 'CLOSING':
        case 'OPENING':
            return currentStatus;
        default:
            return 'UNKNOWN';
    }
}
