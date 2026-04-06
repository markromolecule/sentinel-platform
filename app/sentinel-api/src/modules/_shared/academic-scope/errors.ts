import { HTTPException } from 'hono/http-exception';

export function forbidden(message: string): never {
    throw new HTTPException(403, { message });
}

export function badRequest(message: string): never {
    throw new HTTPException(400, { message });
}

export function notFound(message: string): never {
    throw new HTTPException(404, { message });
}
