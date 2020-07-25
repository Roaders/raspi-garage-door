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

export function createAxiosConfig(token?: string) {
    if (token == null) {
        return {};
    }

    return {
        headers: {
            Authorization: 'Bearer ' + token,
        },
    };
}
