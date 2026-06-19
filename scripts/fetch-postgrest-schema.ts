const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    return;
  }

  const url = `${supabaseUrl}/rest/v1/`;
  console.log(`Fetching schema from ${url} using service role key...`);

  try {
    const res = await fetch(url, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });

    if (!res.ok) {
      console.error(`HTTP error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(text);
      return;
    }

    const schema = await res.json();
    console.log("PostgREST OpenAPI title:", schema.info?.title);
    
    const definitions = schema.definitions || {};
    const tables = Object.keys(definitions);
    console.log(`Exposed tables/views (${tables.length}):`, tables);
    
    const paths = Object.keys(schema.paths || {});
    console.log(`Exposed paths (${paths.length}):`, paths);
  } catch (err: any) {
    console.error("Error fetching schema:", err.message || err);
  }
}

main();
