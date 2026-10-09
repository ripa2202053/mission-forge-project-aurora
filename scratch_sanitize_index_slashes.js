const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace all visible '//' in HTML text and attributes
const replacements = [
  ['CLASS IV // ASTROBIOLOGY', 'CLASS IV • ASTROBIOLOGY'],
  ['CLASS II // LUNAR BASE', 'CLASS II • LUNAR BASE'],
  ['CLASS V // CRYO-OCEAN', 'CLASS V • CRYO-OCEAN'],
  ['Artemis Base // Lunar South Pole', 'Artemis Base • Lunar South Pole'],
  ['Aurora Prime // Deep Astrobiology', 'Aurora Prime • Deep Astrobiology'],
  ['Jovian System // Subsurface Ocean', 'Jovian System • Subsurface Ocean'],
  ['SPACECRAFT SUBSYSTEMS // ORBITAL BAY', 'SPACECRAFT SUBSYSTEMS • ORBITAL BAY'],
  ['STAGE 01 // EARTH DEPARTURE', 'STAGE 01 • EARTH DEPARTURE'],
  ['ARES V // HOHMANN TRANSFER TO MARS', 'ARES V • HOHMANN TRANSFER TO MARS'],
  ['// TRANSLUNAR INJECTION BURN COMPLETE', '• TRANSLUNAR INJECTION BURN COMPLETE'],
  ['MISSION FORGE • PROJECT AURORA // CELESTIAL TARGET SELECTOR', 'MISSION FORGE • PROJECT AURORA • CELESTIAL TARGET SELECTOR'],
  ['DESIGN YOUR OWN MISSION // CELESTIAL TARGET SELECTOR', 'DESIGN YOUR OWN MISSION • CELESTIAL TARGET SELECTOR'],
  [' // ', ' • '],
  [' //', ' •'],
  ['// ', '• ']
];

let replaced = 0;
// We only want to replace double slashes that are NOT JS comments (e.g. not lines starting with //) and not URLs (http:// or https://)
// Let's replace line by line
const lines = html.split('\n');
const newLines = lines.map(line => {
  let trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return line;
  }
  // If line contains https:// or http://, protect it
  let protectedLine = line.replace(/https?:\/\/[^\s"'<>]+/g, (url) => {
    return url.replace(/\/\//g, '__DOUBLE_SLASH__');
  });

  // Replace '//' with '•'
  if (protectedLine.includes('//')) {
    replaced++;
    protectedLine = protectedLine.replace(/\s*\/\/\s*/g, ' • ');
    protectedLine = protectedLine.replace(/\/\//g, ' • ');
  }

  // Restore URLs
  protectedLine = protectedLine.replace(/__DOUBLE_SLASH__/g, '//');
  return protectedLine;
});

html = newLines.join('\n');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully sanitized lines in index.html, total modified lines:', replaced);
