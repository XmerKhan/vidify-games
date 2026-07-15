import { useState, useRef, useCallback, useEffect } from 'react';
import { Type } from 'lucide-react';
import type { GameMeta } from '../data/games';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import GameHUD from '../components/GameHUD';
import DifficultySelector, { type Difficulty } from '../components/DifficultySelector';
import AnimatedBackground from '../components/AnimatedBackground';
import PlayCover from '../components/PlayCover';
import InGameMascot from '../components/InGameMascot';
import { useCanvasGame } from '../lib/useCanvasGame';
import { playSound } from '../lib/sound';
import { unlockAchievement, hasAchievement } from '../lib/storage';

const W = 360;
const H = 480;
const COLS = 8;
const ROWS = 10;
const CELL = W / COLS;

const START_WORDS = ['planet', 'dragon', 'forest', 'castle', 'guitar', 'silver', 'rocket', 'window', 'pencil', 'bridge'];

const VALID_WORDS = new Set([
  'apple','able','about','above','across','act','active','add','after','again','age','agent','air','all','allow','also','always','and','animal','another','answer','any','apart','apple','area','arm','army','art','ask','at','atom','away','back','bad','bag','ball','band','bank','bar','base','bat','battle','be','bear','beat','bed','before','begin','being','bell','best','better','between','big','bird','bit','black','block','blood','blue','board','boat','body','bone','book','born','both','bottom','box','boy','brain','branch','brave','bread','break','bridge','bright','bring','broad','broken','brother','brown','build','burn','but','buy','by','cake','call','can','cap','car','card','care','carry','case','cash','castle','cat','catch','cell','chain','chair','chance','change','chart','check','child','choice','choose','city','civil','claim','class','clean','clear','climb','clock','close','cloud','club','coach','coal','coast','coat','code','cold','collect','color','come','common','cook','cool','copy','corner','cost','could','count','course','court','cover','cow','create','cross','crowd','crown','cry','cup','current','cut','dance','danger','dark','date','day','dead','deal','dear','death','deep','develop','die','differ','difficult','dig','dinner','direct','dirty','do','doctor','dog','dollar','door','down','draw','dream','dress','drink','drive','drop','drug','dry','duck','during','dust','duty','each','ear','early','earth','easy','eat','edge','effect','egg','eight','either','electric','elephant','end','enemy','enjoy','enough','enter','equal','error','even','event','ever','every','exact','example','except','exist','expect','eye','face','fact','fair','fall','family','far','farm','fast','father','fear','feed','feel','feet','fell','felt','few','field','fight','fill','final','find','fine','fire','first','fish','fit','five','fix','flag','flat','floor','flower','fly','focus','fold','follow','food','foot','for','force','forest','form','former','forward','found','four','free','fresh','friend','from','front','fruit','full','fun','game','garden','gas','gate','gave','gear','get','girl','give','glass','globe','go','goal','gold','gone','good','got','grand','grass','great','green','grew','ground','group','grow','guitar','gun','guy','hair','half','hall','hand','hang','happen','happy','hard','hat','have','he','head','hear','heart','heat','heavy','held','hell','help','her','here','hero','high','hill','him','his','hit','hold','hole','home','hope','horse','hot','hotel','hour','house','how','huge','human','hunt','ice','idea','if','imagine','in','inch','include','indeed','inside','iron','is','island','it','item','its','job','join','joy','jump','just','keep','kept','key','kick','kid','kill','kind','king','knee','knew','knife','know','land','language','large','last','late','later','laugh','law','lay','lead','learn','least','leave','left','leg','legal','less','let','letter','level','lie','life','lift','light','like','line','lion','list','listen','little','live','long','look','lord','lose','loss','lost','lot','love','low','luck','made','main','make','man','manage','many','map','mark','market','mass','match','matter','may','me','mean','meat','meet','member','men','might','mile','milk','mind','mine','minute','miss','model','modern','moment','money','month','moon','more','morning','most','mother','motion','mount','mouse','mouth','move','much','music','must','my','name','nation','nature','near','need','never','new','news','next','nice','night','nine','no','noise','none','nor','north','nose','not','note','nothing','notice','now','number','object','occur','of','off','offer','office','often','oil','old','on','once','one','only','open','or','order','other','our','out','over','own','page','pain','paint','pair','palace','pan','paper','parent','park','part','party','pass','past','pay','peace','pen','pencil','people','per','perhaps','person','pick','picture','piece','place','plain','plan','plane','planet','plant','play','please','point','poor','possible','post','power','press','pretty','price','prince','prison','problem','produce','program','promise','proper','protect','proud','prove','public','pull','push','put','queen','question','quick','quiet','quite','race','radio','rain','raise','range','rate','reach','read','ready','real','reason','receive','record','red','remember','repeat','reply','report','rest','result','return','rich','ride','right','ring','rise','river','road','rock','rocket','role','roll','room','root','rose','round','rule','run','safe','said','sail','same','sand','save','say','school','science','score','sea','seat','second','see','seem','self','send','sense','serve','set','seven','several','shake','shall','shape','share','sharp','she','sheep','ship','short','shot','should','shoulder','shout','show','shut','sick','side','sign','silent','silver','simple','since','sing','sister','sit','six','size','sky','sleep','slow','small','smell','smile','snow','so','soft','soil','soldier','some','son','song','soon','sort','sound','source','south','space','speak','special','speed','spend','spoke','sport','spring','square','staff','stage','stair','stand','star','start','state','station','stay','step','stick','still','stone','stop','store','story','storm','street','strong','student','study','such','sugar','suit','summer','sun','sure','surface','table','tail','take','talk','tall','teach','team','tell','ten','test','than','that','the','their','them','then','there','these','they','thick','thin','thing','think','third','this','those','though','thought','thousand','three','through','throw','tie','time','tiny','tip','tired','to','today','together','told','tomorrow','tone','too','top','total','touch','toward','town','track','trade','train','travel','tree','trial','trip','trouble','true','trust','try','turn','twelve','two','type','under','unit','until','up','upon','us','use','usual','valley','value','very','view','village','voice','wait','walk','wall','want','war','warm','was','wash','watch','water','wave','way','we','weak','wear','weather','week','well','went','were','west','what','wheel','when','where','which','while','white','who','whole','whom','whose','why','wide','wife','wild','will','win','wind','window','wine','wing','winter','wire','wise','wish','with','without','woman','wonder','wood','word','work','world','worry','worse','would','write','wrong','yard','year','yes','yet','you','young','your','zero','zoo',
]);

const DIFFICULTY_CONFIG: Record<Difficulty, { timePerWord: number; minWordLen: number; moveSpeed: number }> = {
  basic: { timePerWord: 20, minWordLen: 2, moveSpeed: 3 },
  tough: { timePerWord: 12, minWordLen: 3, moveSpeed: 4 },
  high: { timePerWord: 8, minWordLen: 4, moveSpeed: 5 },
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  basic: '20s per word, 2+ letters',
  tough: '12s per word, 3+ letters',
  high: '8s per word, 4+ letters',
};

interface LetterTile { id: number; col: number; row: number; letter: string; }

let tileId = 0;

function randomLetter(exclude?: string): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let l: string;
  do { l = letters[Math.floor(Math.random() * 26)]; } while (exclude && l === exclude);
  return l;
}

export default function WordChainChallenge({ game, onAchievement }: { game: GameMeta; onAchievement?: () => void }) {
  const [phase, setPhase] = useState<'cover' | 'difficulty' | 'playing' | 'gameover'>('cover');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [chain, setChain] = useState<string[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [mascotTrigger, setMascotTrigger] = useState(0);
  const [mascotWrong, setMascotWrong] = useState(false);

  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.tough;

  const stateRef = useRef({
    playerCol: Math.floor(COLS / 2),
    playerRow: Math.floor(ROWS / 2),
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    tiles: [] as LetterTile[],
    targetLetter: '',
    currentWord: '',
    chain: [] as string[],
    moveTimer: 0,
    timeLeft: 20,
    lastSecond: 0,
    score: 0,
    streak: 0,
    correct: 0,
    wrong: 0,
    elapsed: 0,
  });

  const spawnTiles = useCallback(() => {
    const s = stateRef.current;
    const tiles: LetterTile[] = [];
    const used = new Set<string>();
    // Always include the target letter
    tiles.push({ id: tileId++, col: Math.floor(Math.random() * COLS), row: Math.floor(Math.random() * ROWS), letter: s.targetLetter });
    used.add(`${tiles[0].col},${tiles[0].row}`);
    // Fill with random letters
    for (let i = 0; i < 7; i++) {
      let col: number, row: number;
      do {
        col = Math.floor(Math.random() * COLS);
        row = Math.floor(Math.random() * ROWS);
      } while (used.has(`${col},${row}`));
      used.add(`${col},${row}`);
      tiles.push({ id: tileId++, col, row, letter: randomLetter(s.targetLetter) });
    }
    s.tiles = tiles;
  }, []);

  const startGame = useCallback(() => {
    const start = START_WORDS[Math.floor(Math.random() * START_WORDS.length)];
    stateRef.current = {
      playerCol: Math.floor(COLS / 2),
      playerRow: Math.floor(ROWS / 2),
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      tiles: [],
      targetLetter: start[start.length - 1],
      currentWord: start,
      chain: [start],
      moveTimer: 0,
      timeLeft: config.timePerWord,
      lastSecond: 0,
      score: 0,
      streak: 0,
      correct: 0,
      wrong: 0,
      elapsed: 0,
    };
    setScore(0); setStreak(0); setCorrect(0); setWrong(0); setTimeLeft(config.timePerWord);
    setChain([start]);
    spawnTiles();
    setPhase('playing');
  }, [config, spawnTiles]);

  const setDir = useCallback((x: number, y: number) => {
    if (phase !== 'playing') return;
    const s = stateRef.current;
    if (s.dir.x === -x && s.dir.y === -y) return; // No 180
    s.nextDir = { x, y };
  }, [phase]);

  const handleCollect = useCallback((tile: LetterTile) => {
    const s = stateRef.current;
    const newWord = s.currentWord + tile.letter;
    if (newWord.length >= config.minWordLen && VALID_WORDS.has(newWord)) {
      // Word complete!
      s.chain.push(newWord);
      s.score += newWord.length * 10;
      s.streak += 1;
      s.correct += 1;
      s.timeLeft = config.timePerWord;
      s.currentWord = newWord;
      s.targetLetter = newWord[newWord.length - 1];
      playSound('level-up');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
      setChain([...s.chain]);
      spawnTiles();
    } else if (tile.letter === s.targetLetter) {
      // Correct letter, keep building
      s.currentWord = newWord;
      s.targetLetter = '';
      s.score += 5;
      s.streak += 1;
      playSound('correct');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(false);
      // Respawn tiles with new target being any letter
      s.targetLetter = randomLetter();
      spawnTiles();
    } else {
      // Wrong letter
      s.streak = 0;
      s.wrong += 1;
      s.timeLeft = Math.max(0, s.timeLeft - 3);
      playSound('wrong');
      setMascotTrigger((t) => t + 1);
      setMascotWrong(true);
    }
    setScore(s.score); setStreak(s.streak); setCorrect(s.correct); setWrong(s.wrong);
  }, [config, spawnTiles]);

  const onTick = useCallback((ctx: CanvasRenderingContext2D, dt: number) => {
    const s = stateRef.current;
    s.elapsed += dt;

    // Timer
    s.lastSecond += dt;
    if (s.lastSecond >= 1) {
      s.timeLeft -= 1;
      s.lastSecond = 0;
      setTimeLeft(s.timeLeft);
      if (s.timeLeft <= 0) {
        setPhase('gameover');
        playSound('game-over');
        if (s.score >= 200) setConfettiTrigger((t) => t + 1);
        if (!hasAchievement(game.slug, 'first-word')) unlockAchievement(game.slug, { id: 'first-word', title: 'Word Smith', description: 'Built your first chain link' });
        if (s.correct >= 5 && !hasAchievement(game.slug, 'chain-5')) unlockAchievement(game.slug, { id: 'chain-5', title: 'Wordsmith', description: '5-word chain' });
        if (s.correct >= 10 && !hasAchievement(game.slug, 'chain-10')) unlockAchievement(game.slug, { id: 'chain-10', title: 'Word Master', description: '10-word chain' });
        if (s.score >= 200 && !hasAchievement(game.slug, 'score-200')) unlockAchievement(game.slug, { id: 'score-200', title: 'Vocabulary Hero', description: 'Scored 200+ points' });
        if (s.score >= 500 && !hasAchievement(game.slug, 'score-500')) unlockAchievement(game.slug, { id: 'score-500', title: 'Lexicon Legend', description: 'Scored 500+ points' });
        onAchievement?.();
      }
    }

    // Move player
    s.moveTimer += dt;
    const moveInterval = 1 / config.moveSpeed;
    if (s.moveTimer >= moveInterval) {
      s.moveTimer = 0;
      s.dir = s.nextDir;
      s.playerCol = (s.playerCol + s.dir.x + COLS) % COLS;
      s.playerRow = (s.playerRow + s.dir.y + ROWS) % ROWS;
      // Check tile collision
      const hit = s.tiles.find((t) => t.col === s.playerCol && t.row === s.playerRow);
      if (hit) handleCollect(hit);
    }

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }

    // Tiles
    s.tiles.forEach((t) => {
      const x = t.col * CELL;
      const y = t.row * CELL;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, CELL - 6, CELL - 6, 6);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.letter.toUpperCase(), x + CELL / 2, y + CELL / 2);
    });

    // Player
    const px = s.playerCol * CELL;
    const py = s.playerRow * CELL;
    const grad = ctx.createRadialGradient(px + CELL / 2, py + CELL / 2, 2, px + CELL / 2, py + CELL / 2, CELL / 2);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + CELL / 2 - 4, py + CELL / 2 - 3, 2, 0, Math.PI * 2);
    ctx.arc(px + CELL / 2 + 4, py + CELL / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Current word display
    ctx.fillStyle = 'rgba(30, 58, 95, 0.9)';
    ctx.beginPath();
    ctx.roundRect(8, 8, W - 16, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Chain: ${s.currentWord} | Next: "${s.targetLetter.toUpperCase() || '?'}"`, W / 2, 23);
  }, [config, game.slug, handleCollect, onAchievement]);

  const { canvasRef, handleTouchStart, handleTouchEnd } = useCanvasGame({
    onTick,
    onKeyLeft: () => setDir(-1, 0),
    onKeyRight: () => setDir(1, 0),
    onKeyUp: () => setDir(0, -1),
    onSwipeLeft: () => setDir(-1, 0),
    onSwipeRight: () => setDir(1, 0),
    onSwipeUp: () => setDir(0, -1),
    width: W,
    height: H,
    running: phase === 'playing',
  });

  // Also support down
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setDir(0, 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setDir]);

  const startWithDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame();
  };

  const reset = () => startGame();
  const changeDifficulty = () => setPhase('difficulty');
  const resetAll = () => { setPhase('cover'); setDifficulty(null); };

  if (phase === 'cover') {
    return <PlayCover title={game.title} tagline={game.tagline} category={game.category} slug={game.slug} onPlay={() => setPhase('difficulty')} />;
  }

  if (phase === 'difficulty') {
    return (
      <div className="relative">
        <AnimatedBackground category="educational" />
        <DifficultySelector
          title="Word Chain Challenge"
          description="Steer the glowing character to collect letters and build word chains. Each word must start with the last letter of the previous one."
          icon={<Type className="h-14 w-14 text-purple-600" />}
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
          <div className="text-center">
            <h3 className="font-display font-bold text-xl text-ink-900 mb-2">Chain Broken!</h3>
            <div className="font-display font-extrabold text-5xl text-ink-900 mb-2 animate-pop-in">{score}</div>
            <p className="text-sm text-ink-500 mb-4">You built a chain of {chain.length} {chain.length === 1 ? 'word' : 'words'}!</p>
            <div className="max-h-32 overflow-y-auto rounded-lg bg-ink-50 p-3 mb-4">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {chain.map((w, i) => <span key={i} className="text-xs font-medium text-ink-600 bg-white rounded px-2 py-1 border border-ink-200">{w}</span>)}
              </div>
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
      <AnimatedBackground category="educational" />
      <InGameMascot slug={game.slug} category={game.category} trigger={mascotTrigger} wrong={mascotWrong} />
      <div className="relative">
        <GameHUD level={Math.floor(correct / 5) + 1} streak={streak} score={score} timeLeft={timeLeft} />
        <div className="mb-4 h-2 rounded-full bg-ink-100 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400 animate-pulse' : 'bg-purple-500'}`} style={{ width: `${(timeLeft / config.timePerWord) * 100}%` }} />
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="rounded-xl border-2 border-purple-200 bg-purple-950/95 touch-none max-w-full"
          />
        </div>
        <p className="text-xs text-ink-400 mt-3 text-center">
          Use arrow keys or swipe to steer. Collect letters to build words. Each new word must start with the last letter of the previous one.
        </p>
      </div>
    </div>
  );
}
