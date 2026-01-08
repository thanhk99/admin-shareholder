import { z } from 'zod';

/**
 * Environment variable schema for validation
 */
export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NEXT_PUBLIC_API_URL: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.string().url().default('http://dhcd.vix.local:8085')
    ),
});

export const env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
