'use server';

import { UrlFormSchema, searchEmailSchema } from './validation';
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

export async function getAllUserUrls(unsafeEmail) {

  if (!unsafeEmail) {
    return [];
  }

  const validatedFields = searchEmailSchema.safeParse({
    email: unsafeEmail,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    const getUserUrls = await query(`
      SELECT slugs.url, slugs.slug_id, slugs.slug_hash
      FROM slugs
      INNER JOIN users ON slugs.user_id = users.user_id
      WHERE users.email = $1;`,
      [email]
    );

    if (getUserUrls.rowCount === 0) {
      return [];
    }

    return getUserUrls?.rows;

  } catch (error) {
    console.error(`An error occurred while retrieving user\'s URLs.`);
    throw new Error(`An error occurred while retrieving user\'s URLs.`);
  }
}

export async function getUrlStats(slugId) {
  try {
    // const result = await query(`SELECT logging_id, browser, os, device, cpu FROM logging WHERE slug_id = $1`, [slugId]);

    const result = await query(
      `SELECT COUNT(*) AS total
      FROM logging
      WHERE slug_id = $1;`, 
      [slugId]
    );


    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;

  } catch (error) {
    console.error('No statistics are currently available for this URL.');
    throw new Error('No statistics are currently available for this URL.');
  }
}

export async function getBrowserTotals(slugId) {
  try {
    const result = await query(
      `SELECT 
      CASE 
        WHEN browser = 'Chrome' THEN 'Chrome'
        WHEN browser = 'Edge' THEN 'Edge'
        WHEN browser = 'Firefox' THEN 'Firefox'
        WHEN browser = 'Safari' THEN 'Safari'
        ELSE 'Other'
      END AS category,
      COUNT(*) AS total
      FROM logging
      WHERE slug_id = $1
      GROUP BY category
      ORDER BY category ASC;`,
      [slugId]
    );

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;

  } catch (error) {
    console.error('No statistics are currently available for this URL.');
    throw new Error('No statistics are currently available for this URL.');
  }
}

export async function getOsTotals(slugId) {
  try {
    const result = await query(
      `SELECT 
      CASE 
        WHEN os = 'Windows' THEN 'Windows'
        WHEN os = 'macOS' THEN 'macOS'
        WHEN os = 'Linux' THEN 'Linux'
        WHEN os = 'iOS' THEN 'iOS'
        WHEN os = 'Android' THEN 'Android'
        WHEN os = 'ChromeOS' THEN 'ChromeOS'
        WHEN os = 'iPadOS' THEN 'iPadOS'
        ELSE 'Other'
      END AS category,
      COUNT(*) AS total
      FROM logging
      WHERE slug_id = $1
      GROUP BY category
      ORDER BY total DESC;`,
      [slugId]
    );

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;

  } catch (error) {
    console.error('No statistics are currently available for this URL.');
    throw new Error('No statistics are currently available for this URL.');
  }
}