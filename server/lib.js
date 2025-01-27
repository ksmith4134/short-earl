'use server';

import { SearchEmailSchema } from './validation';
import { query } from '@/database/db';


export async function getAllUserUrls(unsafeEmail) {

  if (!unsafeEmail) {
    return [];
  }

  const validatedFields = SearchEmailSchema.safeParse({
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

    const result = await query(
        `SELECT 
            s.url,
            s.slug_hash,
            COUNT(l.logging_id) AS total
        FROM 
            slugs AS s
        LEFT JOIN 
            logging AS l
        ON 
            s.slug_id = l.slug_id
        WHERE 
            s.slug_id = $1
        GROUP BY 
            s.url, s.slug_hash;
        `, 
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