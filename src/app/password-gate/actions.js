'use server';

import { cookies } from 'next/headers';

export async function validatePassword(formData) {
  const password = formData.get('password');
  const expected = process.env.APP_PASSWORD;

  if (password === expected) {
    cookies().set('access-token', 'granted', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return { success: true };
  }

  return { success: false };
}
