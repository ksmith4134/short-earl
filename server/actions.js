'use server';

import { UrlFormSchema } from './validation';
import { query } from '@/database/db';
import { createSlug, createNewHash } from './utils';

export async function createSlugAction(_state, formData) {
  const validatedFields = UrlFormSchema.safeParse({
    url: formData.get('url'),
    email: formData.get('email') || undefined,
  });


  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { url, email } = validatedFields.data;
  let finalSlug;

  try {
    if (email) {
      // EMAIL PROVIDED
      const user = await query(`SELECT user_id from users WHERE email = $1;`, [email]);

      if (user.rowCount === 0) {
        // NEW EMAIL
        const user = await query(`INSERT INTO users (email) VALUES ($1) RETURNING user_id`, [email]);
        if (user.rowCount === 0) {
          throw new Error('User could not be created.')
        }
        finalSlug = await createNewHash(url, user.rows[0].user_id);
      } else {
        // EMAIL EXISTS
        const userId = user?.rows[0]?.user_id;
        finalSlug = await createSlug(url, userId);
      }
    } else {
      // ANONYMOUS
      finalSlug = await createSlug(url, null);
    }
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'An error occurred while creating your shortened URL.',
    }
  }

  return {
    success: true,
    message: `
      Success! Click to copy your new url:<br />
      <a href="${process.env.BASE_URL}/${finalSlug}" target="_blank" style="color: #007bff; text-decoration: underline; cursor: pointer; overflow-wrap: break-word;">${process.env.BASE_URL}/${finalSlug}</a>
    `,
    body: {
      link: `${process.env.BASE_URL}/${finalSlug}`,
    },
  }

}