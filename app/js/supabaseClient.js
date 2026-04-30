/**
 * Supabase Public Client
 * Read-only public access — anon key only
 */
const SUPABASE_URL = 'https://yuhynggpicuvqejbitmi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aHluZ2dwaWN1dnFlamJpdG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzIzOTksImV4cCI6MjA5MzE0ODM5OX0.7_WbdBkQ0Z3lHcuMUarBSHBqmFTE1g8jrN-U0K7yGvg';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
