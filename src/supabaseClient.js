import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzgznfknmlsrbkoprmej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Z3puZmtubWxzcmJrb3BybWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzU4NDEsImV4cCI6MjA2MzUxMTg0MX0.MAhtur0sIa5Q_U6fIl-AG-38M7DeRL4EgqM2xsAhbhQ'; // paste your anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
