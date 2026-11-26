import 'dotenv/config'

function required(name) {
    if (!process.env[name]) throw new Error('Missing environment variable: ${name}');

    return (process.env[name]);
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    databaseUrl: required('DATABASE_URL'),
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((s) => s.trim()),
    // V1 has no login: every request is treated as coming from this seeded list.
    // In V3 this is replaced by the logged-in user's list (see requestContext).
    defaultListId: process.env.DEFAULT_LIST_ID || '00000000-0000-0000-0000-000000000002',
}