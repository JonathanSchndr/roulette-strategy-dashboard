# 🛠️ Development Guide

## Architecture Overview

This Roulette Strategy Dashboard is built with a clean, modular architecture:

### State Flow

```
User Input (Number) 
    → NumberKeypad.vue
    → gameStore.addSpin()
    → Calculate wins/losses
    → Update Fibonacci indices
    → Update bankroll
    → Compute new bet suggestions
    → Reactive UI updates
```

### Key Components Explained

#### 1. **Pinia Store (`stores/game.ts`)**

The brain of the application. Contains:

- **State**: Current game data (history, balance, settings, Transversale states)
- **Getters**: Computed values (next bets, statistics, heatmap data)
- **Actions**: Game logic (addSpin, calculateWorstCase, export functions)

**Critical Method: `addSpin()`**

```typescript
// Pseudo-code flow:
1. Get current bets (what we placed BEFORE this spin)
2. Check if number hits any active Transversale
   - If YES: Calculate payout (5:1), reset Fibonacci for that line
   - If NO: Increment Fibonacci index for that line
3. Check coverage bets (Zero Spiel, Orphelins)
   - Independent win/loss calculation
4. Handle OVERLAPS (number in both Transversale AND coverage)
5. Update balance
6. Record SpinResult
```

#### 2. **Roulette Constants (`utils/roulette-constants.ts`)**

Pure functions and mappings:

- `TRANSVERSALE_MAP`: Which numbers each line covers
- `COVERAGE_MAP`: Zero Spiel & Orphelins numbers
- `getTransversaleForNumber()`: Given a number, find its Transversale
- `getCoverageOverlaps()`: Critical function for double-win detection
- `calculateTotalCoverage()`: Shows how much of the wheel is covered

#### 3. **Components**

Each component is self-contained with clear props/emits:

| Component | Responsibility |
|-----------|----------------|
| `NumberKeypad.vue` | Number input, history display |
| `BetDisplay.vue` | Show next recommended bets |
| `StatsDashboard.vue` | Session statistics & Transversale performance |
| `RouletteTable.vue` | Visual table with highlighted active bets |
| `HeatmapView.vue` | Frequency visualization |
| `WorstCaseCalculator.vue` | Risk analysis |
| `SettingsPanel.vue` | User configuration |
| `ExportPanel.vue` | CSV/JSON download |

---

## Code Comments: English vs. German

- **Code & Comments**: English (for international developers)
- **UI Text**: German (as requested)
- **README**: German (end-user documentation)

---

## Understanding the Fibonacci Logic

### Per-Transversale Tracking

**IMPORTANT**: Each of the 6 Transversales has its OWN Fibonacci progression.

```typescript
// State structure:
transversaleStates: {
  LINE_1_6: {
    fibonacciIndex: 2,  // Currently at step 2 (stake = 2x base)
    consecutiveLosses: 2
  },
  LINE_7_12: {
    fibonacciIndex: 0,  // At step 0 (stake = 1x base)
    consecutiveLosses: 0
  },
  // ... etc
}
```

**Scenario Example**:

```
Settings: baseUnitTransversale = €1

Round 1: 
  - Place €1 on all 6 lines (all at Fib index 0)
  - Number 8 falls (in Line 7-12)
  - Line 7-12 WINS → Reset to index 0
  - Other 5 lines LOSE → Increment to index 1

Round 2:
  - Line 7-12: €1 (index 0)
  - Other 5 lines: €1 each (index 1, which is also 1 in Fibonacci)
  - Number 8 falls again
  - Line 7-12 WINS → Stays at index 0
  - Other 5 lines LOSE → Increment to index 2

Round 3:
  - Line 7-12: €1 (index 0)
  - Other 5 lines: €2 each (index 2 → fibonacci[2] = 2)
  - Number 14 falls (in Line 13-18)
  - Line 13-18 WINS → Reset to index 0
  - Other 4 lines LOSE → Increment to index 3
```

This ensures that you're only increasing stake on LOSING lines, not globally.

---

## Overlap Logic Explained

### The Critical Scenario

Some numbers are in BOTH a Transversale AND a coverage bet:

**Example: Number 32**
- In Transversale 31-36
- In Zero Spiel [12, 35, 3, 26, 0, 32, 15]

**When 32 falls**:

```typescript
// What happens in addSpin():

// 1. Check Transversale
const hitTransversale = getTransversaleForNumber(32); 
// → Returns LINE_31_36

// Line 31-36 bet wins:
const payout = stake * (5 + 1); // 5:1 + original stake
totalWon += payout;

// 2. Check Coverage
const coverageOverlaps = getCoverageOverlaps(32, [ZERO_SPIEL]);
// → Returns [ZERO_SPIEL]

// Zero Spiel bet ALSO wins:
const coveragePayout = 0.5 * (17 + 1); // Simplified
totalWon += coveragePayout;

// RESULT: Double win!
```

This is mathematically accurate - in a real casino, if you place chips on both zones and the number hits, both bets pay out.

---

## Testing Strategy

### Manual Testing Checklist

1. **Basic Flow**
   - [ ] Enter a number (e.g., 17)
   - [ ] Check that balance updates
   - [ ] Verify Transversale 13-18 reset to Fib index 0
   - [ ] Verify other Transversales incremented

2. **Overlap Detection**
   - [ ] Enter 32 with Zero Spiel active
   - [ ] Verify BOTH Transversale 31-36 AND Zero Spiel win
   - [ ] Check balance increase is correct

3. **Fibonacci Progression**
   - [ ] Keep betting losing lines
   - [ ] Verify stakes increase: 1, 1, 2, 3, 5, 8...
   - [ ] Check max Fibonacci step limit works

4. **Worst-Case Calculator**
   - [ ] Set to 10 consecutive losses
   - [ ] Verify total loss calculation
   - [ ] Check table limit warning appears when appropriate

5. **Export**
   - [ ] Play 5 rounds
   - [ ] Export as CSV
   - [ ] Open in Excel, verify data

### Unit Testing (Future Enhancement)

```typescript
// Example tests to add (using Vitest):

describe('getTransversaleForNumber', () => {
  it('should return LINE_1_6 for number 3', () => {
    expect(getTransversaleForNumber(3)).toBe(TransversaleId.LINE_1_6);
  });
  
  it('should return null for zero', () => {
    expect(getTransversaleForNumber(0)).toBeNull();
  });
});

describe('Fibonacci Progression', () => {
  it('should increment index on loss', () => {
    // Test that losing increments fibonacciIndex
  });
  
  it('should reset index on win', () => {
    // Test that winning resets fibonacciIndex to 0
  });
});
```

---

## Performance Considerations

### Why Pinia Getters?

```typescript
// BAD: Calculating in component (re-runs every render)
const nextBets = computed(() => {
  // Complex calculation here
});

// GOOD: Pinia getter (cached, only re-runs when dependencies change)
getters: {
  nextBetSuggestions(): BetPlacement[] {
    // Cached until transversaleStates or settings change
  }
}
```

### Reactive Performance

The app uses Vue 3's reactivity system efficiently:
- Large arrays (history) use `ref([])`
- Complex objects (transversaleStates) are reactive
- Computed properties cache results

For 1000+ spins, consider:
- Paginating history display
- Virtual scrolling for large lists

---

## Common Pitfalls & Solutions

### 1. **Forgetting to Clone Settings**

```typescript
// BAD
const localSettings = props.settings; // Reference!

// GOOD
const localSettings = ref({ ...props.settings }); // Clone
```

### 2. **Incorrect Fibonacci Indexing**

```typescript
// Remember: Fibonacci array is 0-indexed
fibonacciSequence[0] = 1  // First step
fibonacciSequence[1] = 1  // Second step
fibonacciSequence[2] = 2  // Third step
```

### 3. **Overlap Calculation Off-By-One**

Always remember:
- Coverage overlaps must check ACTIVE coverage bets only
- A number can be in Transversale OR Coverage OR BOTH OR NEITHER

---

## Extending the App

### Adding a New Coverage Bet (e.g., "Voisins du Zero")

1. **Add to types:**

```typescript
export enum CoverageBetType {
  ZERO_SPIEL = 'ZERO_SPIEL',
  ORPHELINS = 'ORPHELINS',
  VOISINS = 'VOISINS' // NEW
}
```

2. **Add to constants:**

```typescript
export const VOISINS_NUMBERS: RouletteNumber[] = [
  22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25
];

export const COVERAGE_MAP: Record<CoverageBetType, RouletteNumber[]> = {
  [CoverageBetType.ZERO_SPIEL]: ZERO_SPIEL_NUMBERS,
  [CoverageBetType.ORPHELINS]: ORPHELINS_NUMBERS,
  [CoverageBetType.VOISINS]: VOISINS_NUMBERS // NEW
};
```

3. **Add to settings:**

```typescript
activeCoverage: {
  zeroSpiel: boolean;
  orphelins: boolean;
  voisins: boolean; // NEW
}
```

4. **Add UI toggle in SettingsPanel.vue**

### Adding Martingale Instead of Fibonacci

Replace in `addSpin()`:

```typescript
// Fibonacci (current):
state.fibonacciIndex++;

// Martingale (alternative):
state.currentStake = state.currentStake * 2;
```

---

## Build & Deployment

### Local Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
# Creates .output/ directory

npm run preview
# Test production build locally
```

### Deploy to Vercel/Netlify

1. Push to GitHub
2. Connect repo to Vercel
3. Build command: `npm run build`
4. Output directory: `.output/public`

---

## Debugging Tips

### Console Logging

The store already logs useful info:

```typescript
console.log(`
🎰 SPIN RESULT: ${number}
💰 Won: €${totalWon.toFixed(2)} | Lost: €${totalLost.toFixed(2)}
💵 Balance: €${this.balance.toFixed(2)}
`);
```

### Vue Devtools

Install [Vue Devtools](https://devtools.vuejs.org/):
- Inspect Pinia store state
- Time-travel debugging
- Component hierarchy

### Typescript Errors

```bash
# Run type check
npx nuxi typecheck
```

---

## Security & Safety

### No Backend Required

This app runs 100% client-side:
- ✅ No server costs
- ✅ No data sent anywhere
- ⚠️ Data lost on refresh (use Export!)

### Input Validation

All number inputs are type-checked:

```typescript
type RouletteNumber = 0 | 1 | 2 | ... | 36;
// TypeScript prevents invalid numbers
```

---

## License & Attribution

MIT License - Free to modify for educational purposes.

**Remember**: This is a learning tool, not a money-making system!

---

## Questions?

Read the code comments - they're extensive and explain WHY, not just WHAT.

Key files to study:
1. `stores/game.ts` - The core logic
2. `utils/roulette-constants.ts` - The math
3. `app.vue` - How everything connects

**Happy coding! 🎰💻**
