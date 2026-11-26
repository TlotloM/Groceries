/** Base class for errors that map to a clean HTTP response. */
export class AppError extends Error {
    constructor(message, { status = 500, code = 'INTERNAL', fields } = {}) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields; // optional { fieldName: message }
    }
}

export class ValidationError extends AppError {
    constructor(message, fields) {
        super(message, { status: 400, code: 'VALIDATION_ERROR', fields });
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not found.') {
        super(message, { status: 404, code: 'NOT_FOUND' });
    }
}