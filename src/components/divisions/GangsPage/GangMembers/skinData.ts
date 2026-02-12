/**
 * GTA San Andreas skin data for gang member mugshots.
 * Source: https://open.mp/docs/scripting/resources/skins
 * Images: https://assets.open.mp/assets/images/skins/{id}.png
 */

// Uniformed / emergency / law enforcement skins to exclude
const EXCLUDED_SKIN_IDS = new Set([
  61,   // Pilot
  71,   // Security Guard
  253,  // Bus Driver
  265,  // Officer Tenpenny
  266,  // Officer Pulaski
  267,  // Officer Hernandez
  // Paramedics
  274, 275, 276,
  // Firefighters
  277, 278, 279,
  // Police
  280, 281, 282, 283, 284,
  // SWAT, FBI, Army
  285, 286, 287, 288,
  // Additional uniformed (SA-MP 0.3.7)
  300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311,
]);

// Skin 74 doesn't exist in GTA SA
const MISSING_SKIN_IDS = new Set([74]);

export function getSkinUrl(skinId: number): string {
  return `https://assets.open.mp/assets/images/skins/${skinId}.png`;
}

export function getAvailableSkinIds(): number[] {
  const ids: number[] = [];
  for (let i = 0; i <= 311; i++) {
    if (!EXCLUDED_SKIN_IDS.has(i) && !MISSING_SKIN_IDS.has(i)) {
      ids.push(i);
    }
  }
  return ids;
}

export const AVAILABLE_SKINS = getAvailableSkinIds();
