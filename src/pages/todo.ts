import type { APIRoute } from 'astro';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Enable server-side rendering for API routes
export const prerender = false;

const HERE = dirname(fileURLToPath(import.meta.url)); // .../src/pages
const DB = resolve(HERE, '../../lists.json');         // lists.json in project root

interface ListItem {
  text: string;
  completed: boolean;
}

interface List {
  id: string;
  name: string;
  items: ListItem[];
}

interface Database {
  lists: List[];
}

async function readDatabase(): Promise<Database> {
  try {
    const data = await readFile(DB, 'utf8');
    return JSON.parse(data);
  } catch {
    // Return empty database if file doesn't exist
    return { lists: [] };
  }
}

async function writeDatabase(data: Database): Promise<void> {
  await mkdir(dirname(DB), { recursive: true });
  await writeFile(DB, JSON.stringify(data, null, 2), 'utf8');
}

export const GET: APIRoute = async () => {
  try {
    const data = await readDatabase();
    return new Response(JSON.stringify(data), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read database' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    await writeDatabase(data);
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to write database' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
