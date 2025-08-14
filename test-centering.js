// Test current centering calculation

const getCenteredBraceletPositions = (wordLength) => {
  // Total bracelet positions: 13 (positions 01-13)
  const centerPosition = 7; // Middle position of 13
  
  // Calculate starting position to center the word
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  
  return positions;
};

console.log('Current centering calculation:');
console.log('3 chars (NAN):', getCenteredBraceletPositions(3)); 
console.log('4 chars (NAND):', getCenteredBraceletPositions(4)); 
console.log('5 chars:', getCenteredBraceletPositions(5)); 
console.log('6 chars:', getCenteredBraceletPositions(6)); 
console.log('7 chars:', getCenteredBraceletPositions(7)); 

// Let me try a better centering approach
const getBetterCenteredPositions = (wordLength) => {
  const totalPositions = 13;
  const centerPosition = 7; // Middle of 13 positions
  
  // For even word lengths: center between positions 7 and 8
  // For odd word lengths: center exactly on position 7
  let startPosition;
  
  if (wordLength % 2 === 1) {
    // Odd length: center exactly on middle position
    startPosition = centerPosition - Math.floor(wordLength / 2);
  } else {
    // Even length: center between middle positions
    startPosition = centerPosition - (wordLength / 2) + 0.5;
  }
  
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(Math.round(startPosition + i));
  }
  
  return positions;
};

console.log('\nBetter centering calculation:');
console.log('3 chars (NAN):', getBetterCenteredPositions(3)); 
console.log('4 chars (NAND):', getBetterCenteredPositions(4)); 
console.log('5 chars:', getBetterCenteredPositions(5)); 
console.log('6 chars:', getBetterCenteredPositions(6)); 
console.log('7 chars:', getBetterCenteredPositions(7));