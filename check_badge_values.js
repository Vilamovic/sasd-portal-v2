/**
 * Skrypt sprawdzający aktualne wartości badge w bazie
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBadgeValues() {
  console.log('🔍 Sprawdzanie wartości badge w bazie...\n');

  // Pobierz wszystkie unikalne wartości badge
  const { data: badges, error } = await supabase
    .from('users')
    .select('badge')
    .not('badge', 'is', null);

  if (error) {
    console.error('❌ Błąd:', error);
    return;
  }

  // Zlicz unikalne wartości
  const uniqueBadges = [...new Set(badges.map(b => b.badge))];

  console.log(`📊 Znaleziono ${uniqueBadges.length} unikalnych wartości badge:\n`);
  uniqueBadges.forEach((badge, index) => {
    console.log(`${index + 1}. "${badge}"`);
  });

  console.log('\n📋 Oczekiwane wartości rank_type ENUM:');
  const expectedBadges = [
    'Trainee',
    'Deputy Sheriff I',
    'Deputy Sheriff II',
    'Deputy Sheriff III',
    'Senior Deputy Sheriff',
    'Sergeant I',
    'Sergeant II',
    'Detective I',
    'Detective II',
    'Detective III',
    'Lieutenant',
    'Captain I',
    'Captain II',
    'Captain III',
    'Area Commander',
    'Division Chief',
    'Assistant Sheriff',
    'Undersheriff',
    'Sheriff'
  ];

  console.log(expectedBadges.map((b, i) => `${i + 1}. "${b}"`).join('\n'));

  console.log('\n⚠️  Niezgodne wartości:');
  const invalid = uniqueBadges.filter(b => !expectedBadges.includes(b));
  if (invalid.length === 0) {
    console.log('✅ Brak - wszystkie wartości są poprawne!');
  } else {
    invalid.forEach(b => console.log(`   - "${b}"`));
  }
}

checkBadgeValues().catch(console.error);
