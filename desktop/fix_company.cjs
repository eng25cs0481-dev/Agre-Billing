const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://odhvrjmateakyrgjpdyp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kaHZyam1hdGVha3lyZ2pwZHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTg4MDIsImV4cCI6MjEwMjczNDgwMn0.F2MWCpSo9ZnNpdA_t7YdHy0oj09WtRKgv9Ysf9ogFEI');
async function fix() {
  const { data: cData } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
  if (cData && cData.length > 0) {
    const compId = cData[0].id;
    console.log('Fixing orphaned data to company:', compId);
    
    // We can't run UPDATE without RLS, but since RLS is permissive (or using anon key), let's try
    await supabase.from('products').update({ company_id: compId }).is('company_id', null);
    await supabase.from('customers').update({ company_id: compId }).is('company_id', null);
    await supabase.from('suppliers').update({ company_id: compId }).is('company_id', null);
    await supabase.from('vouchers').update({ company_id: compId }).is('company_id', null);
    await supabase.from('ledgers').update({ company_id: compId }).is('company_id', null);
    console.log('Done!');
  }
}
fix();
