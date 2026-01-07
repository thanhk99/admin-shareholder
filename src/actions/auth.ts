'use server';

import { cookies } from 'next/headers';

export async function loginAction(data: { accessToken: string; refreshToken: string }) {
    const cookieStore = await cookies();

    // Set refreshToken as HttpOnly cookie
    cookieStore.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // We can also set accessToken in a non-httpOnly cookie if needed for SSR
    // But as per plan, it's primarily in-memory on client
    cookieStore.set('token', data.accessToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 1 * 60 * 60, // 1 hour
    });

    return { success: true };
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('refreshToken');
    cookieStore.delete('token');
    return { success: true };
}
