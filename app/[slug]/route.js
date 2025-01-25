import { query } from '@/database/db';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request, { params }) {

  const slug = (await params).slug;

  const getUrl = await query(
    `SELECT url, slug_id, user_id FROM slugs WHERE slug_hash = $1`,
    [slug]
  );

  if (getUrl.rowCount === 0) {
    return new Response('Link not found', {
      status: 404,
    })
  }

  const { url, slug_id, user_id } = getUrl.rows[0];
  const { browser, os, device, cpu } = userAgent(request);

  const requestHeaders = await headers();
  const user_agent = requestHeaders.get('user-agent');

  const newLog = await query(
    `INSERT INTO logging (slug_id, user_id, browser, device, os, cpu, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    [slug_id, user_id, browser.name, device.type, os.name, cpu.architecture, user_agent]
  );

  if (newLog.rowCount === 0) {
    console.error('Logging record could not be created.');
  }

  redirect(url);
}
