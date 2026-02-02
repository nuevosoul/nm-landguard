const SUPABASE_URL = 'https://blljytcfahrgtksbzkuh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbGp5dGNmYWhyZ3Rrc2J6a3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTYwOTcsImV4cCI6MjA4NTQ5MjA5N30.OsQOymsWbWrVVGz8BHl_mwJk_qBGQZwqFYI6BYGgIcM';

export async function invokeFunction(functionName: string, body: any) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Function ${functionName} failed: ${response.status}`);
  }
  return response.json();
}
