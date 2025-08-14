// Test different positioning approaches

// Current approach: center on position 7 of 13 total positions
const currentCentering = (wordLength) => {
  const centerPosition = 7;
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  return positions;
};

// Try centering on position 8 instead
const centerOn8 = (wordLength) => {
  const centerPosition = 8;
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  return positions;
};

// Try offsetting all positions up by 1
const offsetUp = (wordLength) => {
  const centerPosition = 7;
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2) - 1;
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  return positions;
};

console.log('=== Testing different centering approaches ===');
console.log('Current (center on 7):');
console.log('3 chars:', currentCentering(3), '← should be higher on bracelet?');
console.log('5 chars:', currentCentering(5));
console.log('7 chars:', currentCentering(7));

console.log('\nCenter on position 8:');
console.log('3 chars:', centerOn8(3));
console.log('5 chars:', centerOn8(5));
console.log('7 chars:', centerOn8(7));

console.log('\nOffset up by 1:');
console.log('3 chars:', offsetUp(3));
console.log('5 chars:', offsetUp(5));
console.log('7 chars:', offsetUp(7));