export class ApiError extends Error {
    public status: number;
    public codigo?: string;

    constructor(status: number, message: string, codigo?: string) {
        super(message);
        this.status = status;
        this.codigo = codigo;
        this.name = 'ApiError';
    }
}
