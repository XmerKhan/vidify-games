import { useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { playSound } from '../lib/sound';
import { unlockAchievement, hasAchievement } from '../lib/storage';

interface Stock { symbol: string; name: string; price: number; prevPrice: number; volatility: number; trend: number; history: number[]; flash?: 'green' | 'red' | null; }

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'NOVA', name: 'Nova Tech', price: 50, prevPrice: 50, volatility: 0.15, trend: 0.02, history: [50] },
  { symbol: 'BLUE', name: 'Blue Energy', price: 30, prevPrice: 30, volatility: 0.08, trend: 0.005, history: [30] },
  { symbol: 'QBIT', name: 'Quantum Bits', price: 75, prevPrice: 75, volatility: 0.25, trend: 0.01, history: [75] },
];

const STARTING_CASH = 10000;
const TOTAL_ROUNDS = 10;

const DIFFICULTY_CONFIG: Record<Difficulty, { volMult: number; startingCash: number }> = {
  basic: { volMult: 0.6, startingCash: 15000 },
  tough: { volMult: 1.0, startingCash: 10000 },
  high: { volMult: 1.8, startingCash: 8000 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '$15K starting cash, low volatility',
  tough: '$10K starting cash, normal volatility',
  high: '$8K starting cash, extreme volatility',
};

function MiniChart({ history, up }: { history: number[]; up: boolean }) {
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history.map((p, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 100;
    const y = 100 - ((p - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  const color = up ? '#10a37f' : '#ef4444';
  const areaPoints = `0,100 ${points} 100,100`;
  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${up ? 'g' : 'r'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${up ? 'g' : 'r'})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {history.length > 1 && history.map((p, i) => {
        const x = (i / Math.max(history.length - 1, 1)) * 100;
        const y = 100 - ((p - min) / range) * 100;
        return <circle key={i} cx={x} cy={y} r="1.5" fill={color} />;
      })}
    </svg>
  );
}

export default function StockMarketSimulator({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS.map((s) => ({ ...s })));
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState<Record<string, number>>({ NOVA: 0, BLUE: 0, QBIT: 0 });
  const [log, setLog] = useState<string[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);
  const [trades, setTrades] = useState(0);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;
  const portfolioValue = stocks.reduce((sum, s) => sum + s.price * (holdings[s.symbol] || 0), 0) + cash;
  const totalValue = portfolioValue;
  const profitLoss = totalValue - config.startingCash;
  const score = Math.max(0, Math.round((totalValue / config.startingCash) * 100 - 100));

  const advanceRound = useCallback(() => {
    setStocks((prev) => prev.map((s) => {
      const change = (Math.random() - 0.5 + s.trend) * s.volatility * config.volMult * 2;
      const newPrice = Math.max(1, Math.round(s.price * (1 + change) * 100) / 100);
      return { ...s, prevPrice: s.price, price: newPrice, history: [...s.history, newPrice].slice(-8), flash: newPrice > s.price ? 'green' : 'red' };
    }));
    playSound('click');
    setRound((r) => {
      const next = r + 1;
      if (next >= TOTAL_ROUNDS) {
        setPhase('gameover');
        if (score > 0) { playSound('level-up'); setConfettiTrigger((t) => t + 1); setMascotTrigger((t) => t + 1); setMascotWrong(false); }
        else { playSound('game-over'); setMascotTrigger((t) => t + 1); setMascotWrong(true); }
        if (!hasAchievement(game.slug, 'first-trade')) unlockAchievement(game.slug, { id: 'first-trade', title: 'First Trade', description: 'Made your first stock trade' });
        if (score >= 10 && !hasAchievement(game.slug, 'profitable')) unlockAchievement(game.slug, { id: 'profitable', title: 'Profitable Trader', description: 'Finished with a 10%+ profit' });
        if (score >= 25 && !hasAchievement(game.slug, 'market-master')) unlockAchievement(game.slug, { id: 'market-master', title: 'Market Master', description: 'Finished with a 25%+ profit' });
        if (score >= 50 && !hasAchievement(game.slug, 'warren-buffett')) unlockAchievement(game.slug, { id: 'warren-buffett', title: 'Warren Buffett', description: 'Finished with a 50%+ profit' });
        if (trades >= 5 && !hasAchievement(game.slug, 'active-trader')) unlockAchievement(game.slug, { id: 'active-trader', title: 'Active Trader', description: 'Made 5+ trades in a game' });
        onAchievement?.();
      }
      return next;
    });
  }, [score, trades, game.slug, onAchievement, config.volMult]);

  const buy = (symbol: string, qty: number) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return;
    const cost = stock.price * qty;
    if (cost > cash) return;
    setCash((c) => Math.round((c - cost) * 100) / 100);
    setHoldings((h) => ({ ...h, [symbol]: (h[symbol] || 0) + qty }));
    setLog((l) => [`Bought ${qty} ${symbol} @ $${stock.price.toFixed(2)}`, ...l].slice(0, 8));
    setTrades((t) => t + 1);
    playSound('click');
  };

  const sell = (symbol: string, qty: number) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return;
    if ((holdings[symbol] || 0) < qty) return;
    const proceeds = stock.price * qty;
    setCash((c) => Math.round((c + proceeds) * 100) / 100);
    setHoldings((h) => ({ ...h, [symbol]: (h[symbol] || 0) - qty }));
    setLog((l) => [`Sold ${qty} ${symbol} @ $${stock.price.toFixed(2)}`, ...l].slice(0, 8));
    setTrades((t) => t + 1);
    playSound('click');
  };

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    const cfg = DIFFICULTY_CONFIG[diff];
    setCash(cfg.startingCash);
    setPhase('playing');
  };

  const reset = () => {
    setRound(0);
    setStocks(INITIAL_STOCKS.map((s) => ({ ...s, history: [s.price] })));
    setCash(config.startingCash);
    setHoldings({ NOVA: 0, BLUE: 0, QBIT: 0 });
    setLog([]);
    setTrades(0);
    setPhase('playing');
  };

  const changeDifficulty = () => {
    setPhase('difficulty');
  };

  const resetAll = () => {
    setPhase('cover');
    setDifficulty(null);
    setRound(0);
    setStocks(INITIAL_STOCKS.map((s) => ({ ...s, history: [s.price] })));
    setCash(STARTING_CASH);
    setHoldings({ NOVA: 0, BLUE: 0, QBIT: 0 });
    setLog([]);
    setTrades(0);
  };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="finance" />
        <DifficultySelector
          title="Stock Market Simulator"
          description="Trade stocks across 10 rounds. Higher volatility means bigger swings — and bigger opportunities."
          icon={<LineChart className="h-14 w-14 text-brand-600" />}
          difficultyDescriptions={DIFFICULTY_DESCRIPTIONS}
          onSelect={startWithDifficulty}
        />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="relative">
        <Confetti trigger={confettiTrigger} />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-center mb-6">
              <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Final Results</h3>
              <div className="font-display font-extrabold text-4xl text-ink-900 animate-pop-in">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <div className={`text-lg font-bold mt-1 animate-fade-in ${profitLoss >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({score > 0 ? '+' : ''}{score}%)
              </div>
              <p className="text-sm text-ink-500 mt-2">{profitLoss >= 0 ? 'You beat your starting capital!' : 'You finished below your starting capital. Try again!'}</p>
            </div>
            <div className="space-y-2 mb-4">
              {stocks.map((s) => {
                const shares = holdings[s.symbol] || 0;
                const value = shares * s.price;
                return (
                  <div key={s.symbol} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm animate-slide-in-right">
                    <span className="font-semibold text-ink-800">{s.symbol}</span>
                    <span className="text-ink-500">{shares} shares</span>
                    <span className="font-bold text-ink-900">${value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={reset} className="btn-secondary w-full">Play Again</button>
            <button onClick={changeDifficulty} className="btn-ghost mt-2 w-full text-sm">Change Difficulty</button>
          </div>
          <div>
            <Leaderboard slug={game.slug} score={score} onPlayAgain={resetAll} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatedBackground category="finance" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={round + 1} streak={trades} score={score} />

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-ink-50 p-3 text-center animate-fade-in">
            <div className="text-xs text-ink-500">Round</div>
            <div className="font-display font-bold text-lg text-ink-900">{round + 1} / {TOTAL_ROUNDS}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3 text-center animate-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="text-xs text-ink-500">Cash</div>
            <div className="font-display font-bold text-lg text-ink-900">${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-lg bg-ink-50 p-3 text-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="text-xs text-ink-500">Portfolio</div>
            <div className={`font-display font-bold text-lg ${profitLoss >= 0 ? 'text-brand-600' : 'text-red-500'}`}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {stocks.map((s, idx) => {
            const change = s.price - s.prevPrice;
            const pctChange = s.prevPrice > 0 ? (change / s.prevPrice) * 100 : 0;
            const shares = holdings[s.symbol] || 0;
            return (
              <div key={s.symbol} className={`rounded-xl border border-ink-200 p-4 animate-slide-in-right transition-colors ${s.flash === 'green' ? 'animate-price-flash-green' : s.flash === 'red' ? 'animate-price-flash-red' : ''}`} style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-display font-bold text-ink-900">{s.symbol}</span>
                    <span className="text-xs text-ink-400 ml-2">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-ink-900">${s.price.toFixed(2)}</div>
                    <div className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${change >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
                      {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="mb-3 h-12 w-full">
                  <MiniChart history={s.history} up={change >= 0} />
                </div>
                <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                  <span>You own: {shares} shares (${(shares * s.price).toFixed(2)})</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => buy(s.symbol, 1)} disabled={s.price > cash} className="btn-primary flex-1 text-xs py-2 hover:scale-105 transition-transform">Buy 1</button>
                  <button onClick={() => buy(s.symbol, 5)} disabled={s.price * 5 > cash} className="btn-primary flex-1 text-xs py-2 hover:scale-105 transition-transform">Buy 5</button>
                  <button onClick={() => sell(s.symbol, 1)} disabled={shares < 1} className="btn-secondary flex-1 text-xs py-2 hover:scale-105 transition-transform">Sell 1</button>
                  <button onClick={() => sell(s.symbol, shares)} disabled={shares < 1} className="btn-secondary flex-1 text-xs py-2 hover:scale-105 transition-transform">Sell All</button>
                </div>
              </div>
            );
          })}
        </div>

        {log.length > 0 && (
          <div className="mb-4 rounded-lg bg-ink-50 p-3">
            <div className="text-xs font-semibold text-ink-500 mb-2">Recent Trades</div>
            <div className="space-y-1">
              {log.map((entry, i) => <div key={i} className="text-xs text-ink-600 animate-fade-in">{entry}</div>)}
            </div>
          </div>
        )}

        <button onClick={advanceRound} className="btn-primary w-full text-base animate-glow-pulse">
          {round === 0 ? 'Start Trading (Round 1)' : `Advance to Round ${round + 2}`}
        </button>
      </div>
    </div>
  );
}
