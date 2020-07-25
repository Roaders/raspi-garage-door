export function printError(error: any): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error.message === 'string') {
        return error.message;
    } else if (typeof error.error === 'string') {
        return error.message;
    } else if (typeof error.toString === 'function') {
        return error.toString();
    } else {
        return String(error);
    }
}
