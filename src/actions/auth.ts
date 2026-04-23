'use server';

import { cookies } from 'next/headers';

export async function loginAction(data: { accessToken: string; refreshToken: string }) {
    // Cookie management removed as per requirement to use localStorage only
    return { success: true };
}

export async function logoutAction() {
    // Cookie management removed as per requirement to use localStorage only
    return { success: true };
}
