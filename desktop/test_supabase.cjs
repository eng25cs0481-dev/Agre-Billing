const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odhvrjmateakyrgjpdyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaHZyam1hdGVha3lyZ2pwZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg4MDIsImV4cCI6MjEwMjczNDgwMn0.F2MWCpSo9ZnNpdA_t7YdHy0oj09WtRKgv9Ysf9ogFEI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: allP } = await supabase.from('products').select('id, name, company_id');
  console.log('Products:', allP);
  
  const { data: allC } = await supabase.from('customers').select('id, name, company_id');
  console.log('Customers:', allC);
}

test();
