import * as crypto from 'crypto';
import { query } from '@/database/db';

const base64Url = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
const totalHashRetries = 5;

export function alterRandomDigit(str) {
  const randomIndex = Math.floor(Math.random() * str.length);
  const randomChar = base64Url[Math.floor(Math.random() * base64Url.length)];
  const newStr = str.slice(0, randomIndex) + randomChar + str.slice(randomIndex + 1);
  return newStr;
}

export function addRandomDigit(str) {
  const randomDigit = base64Url[Math.floor(Math.random() * base64Url.length)];
  return str + randomDigit;
}

// fisher-yates shuffle
export function shuffleString(str) {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr.join('');
}


// Recursively check if a hash is unique and if not, generate a new one
// Limited to n number of retries
export async function verifyHash(hashSlug, index = 0) {
  if (index >= totalHashRetries) {
    throw new Error('Could not verify a unique slug.')
  }

  try {
    const existingHash = await query(
      `SELECT EXISTS (SELECT 1 FROM slugs WHERE slug_hash = $1);`,
      [hashSlug]
    );

    if (existingHash.rows[0].exists) {
      let updatedHash;

      index <= 3 ?
        updatedHash = alterRandomDigit(hashSlug) :
        updatedHash = addRandomDigit(hashSlug);
      
      return await verifyHash(updatedHash, ++index); // Recursive check
    } else {
      return hashSlug;
    }
  } catch (error) {
    throw new Error('Could not verify a unique slug.')
  }
}

// Create a new hash using the Fisher-Yates shuffle algorithm
export async function createNewHash(url, userId = null) {
  try {
    const shuffleUrl = shuffleString(url);

    const hashUrl = crypto
      .createHash('sha256')
      .update(shuffleUrl)
      .digest('base64url');

    const uniqueHash = await verifyHash(hashUrl.slice(0, 8));

    const newUrl = await query(
      'INSERT INTO slugs (slug_hash, url, user_id) VALUES ($1, $2, $3) RETURNING slug_hash',
      [uniqueHash, url, userId],
    );

    if (newUrl.rowCount === 0) {
      throw new Error('There was an error creating the shortened URL.')
    }

    return newUrl.rows[0].slug_hash;
  } catch (error) {
    throw error;
  }
}

// Either grabs a relevant existing slug or creates a new one
export async function createSlug(url, userId = null) {
  try {
    let result;

    if (userId === null) {
      result = await query(
        `SELECT slug_hash FROM slugs WHERE url = $1 AND user_id IS NULL;`,
        [url]
      );
    } else {
      result = await query(
        `SELECT slug_hash FROM slugs WHERE url = $1 AND user_id = $2;`,
        [url, userId]
      );
    }
    if (result.rowCount === 0) {
      return await createNewHash(url, userId)
    }

    return result.rows[0].slug_hash
  } catch (error) {
    throw error;
  }
}