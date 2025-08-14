// Test centered positioning logic

// Total bracelet positions: 13 (positions 01-13)
// We want to center words of different lengths

function getCenteredPositions(wordLength) {
  const totalPositions = 13;
  const centerPosition = 7; // Middle position of 13
  
  // Calculate starting position to center the word
  const startPosition = centerPosition - Math.floor((wordLength - 1) / 2);
  
  const positions = [];
  for (let i = 0; i < wordLength; i++) {
    positions.push(startPosition + i);
  }
  
  return positions;
}

// Test different word lengths
console.log('Centered positioning for different word lengths:');
console.log('2 letters:', getCenteredPositions(2)); // Should be around [6, 7]
console.log('3 letters:', getCenteredPositions(3)); // Should be around [6, 7, 8] 
console.log('4 letters:', getCenteredPositions(4)); // Should be around [5, 6, 7, 8]
console.log('5 letters:', getCenteredPositions(5)); // Should be around [5, 6, 7, 8, 9]
console.log('13 letters:', getCenteredPositions(13)); // Should be [1, 2, 3, ..., 13]