# 🎰 Roulette Strategy Dashboard

A professional web application for analyzing and tracking a hybrid roulette strategy that combines **Transversale Simple** (Six Lines) with **Fibonacci Progression** and **Racetrack Sectors** (Zero Game & Orphans).

> **🇩🇪 Deutsche Version:** [README_DE.md](README_DE.md)

---

## ⚠️ IMPORTANT DISCLAIMER

**This software is ONLY for educational and analysis purposes.**

- ❌ There is **NO guarantee of winning**
- ❌ The mathematical house edge of the casino remains in effect  
- ❌ Fibonacci progressions can become very expensive during losing streaks
- ✅ Use this app **only for simulation and learning**
- ✅ Never bet more money than you can afford to lose

**Gambling can be addictive. Play responsibly.**

---

## 🚀 Quick Start

\`\`\`bash
cd roulette-strategy
npm install
npm run dev
\`\`\`

Open **http://localhost:3000**

---

## 🎯 Strategy Overview

### The Hybrid Strategy Combines 3 Elements:

1. **Transversale Simple (Six Lines)** → 6 bets covering 1-6, 7-12, 13-18, 19-24, 25-30, 31-36
2. **Fibonacci Progression** → Independent progression PER line (not global!)
3. **Racetrack Coverage** → Zero Game (Jeu 0) + optional Orphans

### Key Features:
- ✅ **Individual Fibonacci tracking** per Transversale
- ✅ **Overlap detection** (numbers in BOTH Transversale AND coverage)
- ✅ **Worst-case calculator** (shows max loss for X consecutive losses)
- ✅ **Random button** (🎲 simulate spins)
- ✅ **Export** (CSV/JSON)
- ✅ **Heatmap** visualization
- ✅ **100% TypeScript** with full type safety

---

## 🧮 How It Works - Detailed Explanation

### 1. Individual Fibonacci Progression per Transversale

**THIS IS THE MOST IMPORTANT CONCEPT!**

Each of the 6 six-line bets has its **OWN independent** Fibonacci progression.

\`\`\`
Example:

Initial State (all at Fibonacci index 0):
- Line 1-6:   €1
- Line 7-12:  €1  
- Line 13-18: €1
- Line 19-24: €1
- Line 25-30: €1
- Line 31-36: €1
Total: €6

Round 1: Number 17 falls (in Line 13-18)
✅ Line 13-18 WINS → Payout €6 (5:1) → Reset to index 0
❌ Other 5 lines LOSE → Increment to index 1

Next Round:
- Line 13-18: €1 (index 0)
- Other 5: €1 each (index 1, fibonacci[1]=1)

Round 2: Number 8 falls (in Line 7-12)
✅ Line 7-12 WINS → Reset to index 0
❌ Other 5 lines LOSE → Increment further

Next Round:
- Line 7-12: €1 (index 0)
- Line 13-18: €1 (index 1)
- Other 4: €2 each (index 2, fibonacci[2]=2)
Total: €10
\`\`\`

**Why this matters:**
- You're NOT doubling your ENTIRE bet (like Martingale)
- You're only increasing stakes on LOSING lines
- A line that keeps losing: €1 → €1 → €2 → €3 → €5 → €8 → €13 → €21...

---

### 2. The Overlap Mechanic (Double Wins)

Some numbers exist in BOTH a Transversale AND Coverage:

**Overlap Numbers:**
- **3** (Line 1-6 + Zero Game)
- **12** (Line 7-12 + Zero Game)
- **15** (Line 13-18 + Zero Game)
- **26** (Line 25-30 + Zero Game)
- **32** (Line 31-36 + Zero Game) ⭐
- **35** (Line 31-36 + Zero Game) ⭐

**Example: Number 32 falls**

\`\`\`
Bets Placed:
- Transversale 31-36: €3
- Zero Game: €0.50

What Happens:
✅ Transversale 31-36 HIT → Payout €18 (5:1 on €3)
✅ Zero Game HIT → Payout €9 (simplified)

Total Won: €27
Total Bet: €3.50
Net Profit: +€23.50 🎉🎉

This is the "jackpot" of the strategy!
\`\`\`

**Probability:** Only 7/37 numbers (18.9%) have overlaps, but they pay BIG!

---

### 3. Worst-Case Scenario Analysis

**Critical Question:** *"What if I lose X times in a row?"*

**Example: 10 consecutive losses on ONE line**

\`\`\`
Fibonacci: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...]
Base: €1

Loss 1: €1
Loss 2: €1
Loss 3: €2
Loss 4: €3
Loss 5: €5
Loss 6: €8
Loss 7: €13
Loss 8: €21
Loss 9: €34
Loss 10: €55

Total Loss: €143
Final Bet Required: €55

If ALL 6 lines progress:
Total Loss = €143 × 6 = €858 😱
\`\`\`

**The Calculator Shows:**
- Total loss
- Highest single bet
- Fibonacci level reached
- ⛔ Table limit warnings
- 💸 Bankroll warnings
- 📊 Statistical probability

---

## 📱 Features

### Main Functions

1. **Number Input**
   - Click numbers manually OR
   - 🎲 **Random button** for automatic simulation

2. **Live Dashboard**
   - Next bet recommendations
   - Fibonacci levels per line
   - Coverage percentage
   - Overlap indicators (purple highlighting)

3. **Statistics**
   - Balance & ROI
   - Longest losing streak
   - Performance per Transversale

4. **Visual Roulette Table**
   - Yellow = Active bet
   - Purple = Overlap zone
   - Blue = Last number

### Advanced Features

| Tab | Function |
|-----|----------|
| 🔥 **Heatmap** | Frequency visualization (Red=rare, Green=frequent) |
| ⚠️ **Worst-Case** | Risk calculator for consecutive losses |
| ⚙️ **Settings** | Configure stakes, limits, coverage |
| 📥 **Export** | CSV for Excel, JSON for analysis |

---

## 🎓 Understanding the Mathematics

### Why Fibonacci vs. Martingale?

**Martingale** (aggressive doubling):
\`\`\`
€1 → €2 → €4 → €8 → €16 → €32...
After 5 losses: €31 total, next bet €32
\`\`\`

**Fibonacci** (slower addition):
\`\`\`
€1 → €1 → €2 → €3 → €5 → €8...
After 5 losses: €12 total, next bet €8
\`\`\`

**Fibonacci is less aggressive BUT STILL RISKY!**

---

### Expected Value (EV)

\`\`\`
European Roulette: 37 numbers (0-36)
House Edge: 2.7% (due to zero)

Transversale Bet:
- Covers: 6 numbers
- Win probability: 6/37 = 16.22%
- Payout: 5:1
- True odds should be: 5.17:1
- Difference = House Edge

Expected Value per €1:
EV = (6/37 × €6) - (31/37 × €1)
EV = €0.973 - €0.838  
EV = -€0.027 (-2.7%)

Meaning: You lose 2.7 cents per euro bet on average.
\`\`\`

**No strategy can overcome this mathematical edge!**

---

### Probability of Losing Streaks

\`\`\`
Single Transversale losing: 31/37 = 83.78%

Consecutive losses:
5 in a row:  42.1%  ← Happens often!
10 in a row: 17.7%  ← Occasionally  
15 in a row: 7.5%   ← Rarely
20 in a row: 3.1%   ← Very rarely
\`\`\`

---

## 🛠️ Technology Stack

- **Nuxt 3** (Vue 3)
- **TypeScript** (100% typed, 0 errors)
- **Pinia** (State Management)
- **Tailwind CSS** (Casino theme)
- **Vite** (Build tool)

### Project Structure

\`\`\`
roulette-strategy/
├── app.vue                      # Main app
├── components/                  # 8 UI components
│   ├── NumberKeypad.vue         # Input + Random button
│   ├── BetDisplay.vue
│   ├── StatsDashboard.vue
│   ├── HeatmapView.vue
│   ├── WorstCaseCalculator.vue
│   └── ...
├── stores/game.ts               # Complete game logic (450+ lines)
├── types/index.ts               # TypeScript definitions
└── utils/roulette-constants.ts  # Math & mappings
\`\`\`

---

## 🧪 Usage Guide

### 1. Enter Numbers

**Option A: Manual**
- Click the fallen number on the keypad

**Option B: Random** ⭐
- Click "🎲 Random" to simulate a spin
- Great for testing and learning!

### 2. View Next Bets

The dashboard shows:
\`\`\`
Transversales:
  1-6:   €2 (Fibonacci Level 2)
  7-12:  €1 (Level 0)
  ...

Coverage:
  Zero Game: €0.50

TOTAL: €6.50
\`\`\`

### 3. Check Worst-Case ⚠️

**ALWAYS do this before playing!**

1. Tab "⚠️ Worst-Case"
2. Slide to e.g., 10 rounds
3. See total loss, warnings, probability

### 4. Export Data

1. Tab "📥 Export"
2. CSV (Excel) or JSON (developers)

---

## 📊 Example Session

**Round 1: Random → 17**
- Bet: €6 on 6 lines + €0.50 Zero = €6.50
- ✅ Line 13-18 wins €6
- ❌ Others lose €5
- Net: +€0.50

**Round 2: Random → 32** ⭐ OVERLAP!
- Bet: €12 on 6 lines + €0.50 Zero = €12.50
- ✅ Line 31-36 wins €12
- ✅ Zero Game wins €9
- ❌ Others lose €10
- Net: +€8.50 (Double win!)

---

## 🤔 FAQ

**Q: Can I make money with this?**  
A: No. House edge (-2.7%) is mathematically constant.

**Q: What's the Random button for?**  
A: Simulates spins for testing. Great for learning without manual input!

**Q: Are overlaps good?**  
A: Yes! 7 numbers give double wins. But only 18.9% of the wheel.

**Q: Is this safer than Martingale?**  
A: Fibonacci is slower, but STILL RISKY. Check Worst-Case!

---

## ⚠️ Safety Features

1. **Max Fibonacci Level** → Prevents runaway progression
2. **Table Limit Warnings** → Shows when too high
3. **Bankroll Warnings** → Alerts on low balance
4. **Undo Function** → Correct mistakes
5. **Random Button** → Safe testing

---

## 🎯 Key Takeaways

1. ✅ **Fibonacci is per-line** (not global)
2. ✅ **Overlaps = double wins** (7/37 numbers)
3. ❌ **House edge persists** (-2.7% EV)
4. ⚠️ **Use Worst-Case** (check max loss!)
5. 🎲 **Random button** (great for learning)
6. 📥 **Export data** (analyze in Excel)
7. 🎓 **Educational only** (NOT a money system)

---

## 📄 License

MIT - For educational purposes only.

---

## 🙏 Support

**For software questions:**
- Check browser console (F12)
- Read code comments (extensive!)
- Review DEVELOPMENT.md

**For responsible gaming:**
- [National Council on Problem Gambling](https://www.ncpgambling.org/)

---

**Good luck learning! 🎓**

*This is an educational tool, not a gambling system. Play responsibly.*
