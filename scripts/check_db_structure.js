// Script to check database structure
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStructure() {
  console.log('='.repeat(60));
  console.log('SASD Portal - Database Structure Check');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. List all tables
    console.log('1. CHECKING ALL TABLES:');
    console.log('-'.repeat(60));

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    // Alternative: Try to query known tables
    const knownTables = ['users', 'exam_types', 'exam_questions', 'exam_results',
                         'materials', 'exam_access_tokens', 'user_penalties', 'user_notes'];

    console.log('Known tables in the system:');
    for (const table of knownTables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ❌ ${table}: NOT EXISTS (${error.message})`);
      } else {
        console.log(`  ✅ ${table}: EXISTS (${count} rows)`);
      }
    }
    console.log('');

    // 2. Check users table structure
    console.log('2. USERS TABLE STRUCTURE:');
    console.log('-'.repeat(60));

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else if (usersData && usersData.length > 0) {
      const columns = Object.keys(usersData[0]);
      console.log('Columns found in users table:');
      columns.forEach(col => console.log(`  - ${col}`));
      console.log('');

      // Check for specific columns
      const requiredColumns = ['division', 'permissions', 'plus_count', 'minus_count'];
      console.log('Kartoteka system columns:');
      requiredColumns.forEach(col => {
        if (columns.includes(col)) {
          console.log(`  ✅ ${col}: EXISTS`);
        } else {
          console.log(`  ❌ ${col}: NOT FOUND`);
        }
      });
    } else {
      console.log('No users in database yet, trying to get table structure differently...');

      // Try inserting and immediately deleting to see structure
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(0);

      console.log('Query result:', { data, error });
    }
    console.log('');

    // 3. Check ENUM types
    console.log('3. CHECKING ENUM TYPES:');
    console.log('-'.repeat(60));

    const enumTypes = ['division_type', 'permission_type', 'penalty_type', 'rank_type'];

    for (const enumType of enumTypes) {
      // Try to use the RPC or direct query
      const { data, error } = await supabase.rpc('get_enum_values', { enum_name: enumType })
        .catch(() => ({ data: null, error: 'RPC not available' }));

      if (error) {
        console.log(`  ❓ ${enumType}: Cannot verify (${error})`);
      } else {
        console.log(`  ✅ ${enumType}: EXISTS`);
      }
    }
    console.log('');

    // 4. Check specific table structures
    console.log('4. CHECKING user_penalties TABLE:');
    console.log('-'.repeat(60));

    const { data: penaltiesData, error: penaltiesError } = await supabase
      .from('user_penalties')
      .select('*')
      .limit(1);

    if (penaltiesError) {
      console.log(`  ❌ user_penalties: NOT EXISTS (${penaltiesError.message})`);
    } else {
      console.log('  ✅ user_penalties: EXISTS');
      if (penaltiesData && penaltiesData.length > 0) {
        const penaltyColumns = Object.keys(penaltiesData[0]);
        console.log('  Columns:', penaltyColumns.join(', '));
      } else {
        console.log('  No data yet, but table exists');
      }
    }
    console.log('');

    console.log('5. CHECKING user_notes TABLE:');
    console.log('-'.repeat(60));

    const { data: notesData, error: notesError } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);

    if (notesError) {
      console.log(`  ❌ user_notes: NOT EXISTS (${notesError.message})`);
    } else {
      console.log('  ✅ user_notes: EXISTS');
      if (notesData && notesData.length > 0) {
        const notesColumns = Object.keys(notesData[0]);
        console.log('  Columns:', notesColumns.join(', '));
      } else {
        console.log('  No data yet, but table exists');
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DATABASE CHECK COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error during database check:', error);
  }
}

checkDatabaseStructure();
