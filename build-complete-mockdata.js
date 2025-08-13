// Script to build complete mockData.json with fixed letterImages structure
const fs = require('fs');

// Read current mockData
const mockData = JSON.parse(fs.readFileSync('./src/data/mockData.json', 'utf8'));

// Read the corrected letterImages structure
const letterImages = JSON.parse(fs.readFileSync('./letter-images-fixed.json', 'utf8'));

// Replace the placeholder with the actual structure
mockData.letterImages = letterImages;

// Write the complete file
fs.writeFileSync('./src/data/mockData.json', JSON.stringify(mockData, null, 2));

console.log('✓ Successfully updated mockData.json with complete A-Z letterImages structure');
console.log(`✓ Contains ${Object.keys(letterImages.white).length} letters`);
console.log(`✓ Each letter has position data for 2-13 character words`);