import type { ComponentType, LazyExoticComponent } from 'react';
import {
  Wallet,
  TrendingUp,
  Scale,
  Code2,
  Bug,
  Binary,
  Type,
  Grid3x3,
  Calculator,
  Globe,
  CreditCard,
  Home,
  PiggyBank,
  Shield,
  Umbrella,
  Keyboard,
  Zap,
  Cpu,
  Gauge,
  BookOpen,
  Building2,
  FlaskConical,
  Atom,
  Clock,
  Coins,
  Shapes,
  PawPrint,
  Hash,
  Palette,
  Blocks,
  type LucideIcon,
} from 'lucide-react';

export type Category = 'finance' | 'tech' | 'educational' | 'kids';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface GameMeta {
  slug: string;
  title: string;
  shortTitle: string;
  category: Category;
  icon: LucideIcon;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  accent: string;
  difficulty: Difficulty;
  article: ArticleContent;
}

export interface ArticleContent {
  style: 'A' | 'B' | 'C' | 'D';
  body: string;
}

export const categories: Record<Category, { label: string; description: string; color: string }> = {
  finance: {
    label: 'Finance Games',
    description: 'Build real money skills — budgeting, investing, and smart spending decisions.',
    color: 'brand',
  },
  tech: {
    label: 'Tech & Logic Games',
    description: 'Sharpen your programming intuition, debugging eye, and binary fluency.',
    color: 'info',
  },
  educational: {
    label: 'Educational Games',
    description: 'Expand your knowledge of science, geography, history, and language through interactive play.',
    color: 'purple',
  },
  kids: {
    label: 'Kids Games',
    description: 'Gentle learning games for young minds — counting, shapes, colors, animals, logic, and puzzles.',
    color: 'teal',
  },
};

export const games: GameMeta[] = [
  {
    slug: 'budget-master',
    title: 'Budget Master',
    shortTitle: 'Budget Master',
    category: 'finance',
    icon: Wallet,
    tagline: 'Allocate a monthly salary across life categories and score your financial health.',
    description:
      'Drag sliders to split a monthly paycheck across rent, food, savings, transport, and fun. Your choices produce a financial-health score based on widely recommended budgeting ratios.',
    metaTitle: 'Budget Master — Free Budgeting Game | Vidify Games',
    metaDescription:
      'Play Budget Master, a free interactive budgeting game. Allocate a monthly salary across expense categories and learn real personal finance skills.',
    keywords: ['budgeting game', 'personal finance', 'money management', 'financial literacy game'],
    accent: 'brand',
    difficulty: 'Easy',
    article: {
      style: 'B',
      body: `BUDGET_MASTER_ARTICLE`,
    },
  },
  {
    slug: 'stock-market-simulator',
    title: 'Stock Market Simulator',
    shortTitle: 'Stock Market',
    category: 'finance',
    icon: TrendingUp,
    tagline: 'Buy and sell fake stocks across volatile rounds and track your profit or loss.',
    description:
      'A simplified trading simulator with randomly fluctuating prices across ten rounds. Build a portfolio, react to price swings, and see whether you beat the market.',
    metaTitle: 'Stock Market Simulator — Free Trading Game | Vidify Games',
    metaDescription:
      'Practice trading with a free stock market simulator. Buy and sell fake stocks across volatile rounds and learn investing fundamentals without risking real money.',
    keywords: ['stock market game', 'trading simulator', 'investing game', 'stock simulation'],
    accent: 'brand',
    difficulty: 'Hard',
    article: {
      style: 'B',
      body: `STOCK_MARKET_ARTICLE`,
    },
  },
  {
    slug: 'save-or-spend',
    title: 'Save or Spend',
    shortTitle: 'Save or Spend',
    category: 'finance',
    icon: Scale,
    tagline: 'Face realistic money dilemmas and get scored on the wisdom of your choices.',
    description:
      'Each round drops you into a realistic financial scenario. Pick the smartest option and get instant feedback on whether you saved, splurged, or struck the right balance.',
    metaTitle: 'Save or Spend — Financial Decision Game | Vidify Games',
    metaDescription:
      'Play Save or Spend, a free financial decision game. Face realistic money dilemmas and learn to make smarter spending and saving choices.',
    keywords: ['financial decisions', 'save or spend', 'money choices game', 'financial literacy'],
    accent: 'brand',
    difficulty: 'Medium',
    article: {
      style: 'D',
      body: `SAVE_OR_SPEND_ARTICLE`,
    },
  },
  {
    slug: 'code-breaker',
    title: 'Code Breaker',
    shortTitle: 'Code Breaker',
    category: 'kids',
    icon: Code2,
    tagline: 'Crack a hidden color sequence using logic and feedback hints.',
    description:
      'A Mastermind-style logic puzzle. Guess the secret sequence of colored pegs, read the hint feedback, and deduce the answer before you run out of attempts.',
    metaTitle: 'Code Breaker — Free Logic Puzzle Game | Vidify Games',
    metaDescription:
      'Play Code Breaker, a free Mastermind-style logic puzzle. Guess a hidden color sequence using deduction and feedback hints. Train your logical reasoning.',
    keywords: ['mastermind game', 'logic puzzle', 'code breaker', 'deduction game'],
    accent: 'info',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `CODE_BREAKER_ARTICLE`,
    },
  },
  {
    slug: 'bug-hunter',
    title: 'Bug Hunter',
    shortTitle: 'Bug Hunter',
    category: 'tech',
    icon: Bug,
    tagline: 'Spot the buggy line in a code snippet before the clock runs out.',
    description:
      'Short code snippets appear one at a time, each containing a single bug. Click the line you think is wrong before time expires. Speed and accuracy both count.',
    metaTitle: 'Bug Hunter — Free Code Debugging Game | Vidify Games',
    metaDescription:
      'Play Bug Hunter, a free code debugging game. Spot the buggy line in real code snippets before time runs out. Train your eye for common programming errors.',
    keywords: ['debugging game', 'code bugs', 'programming game', 'find the bug'],
    accent: 'info',
    difficulty: 'Hard',
    article: {
      style: 'D',
      body: `BUG_HUNTER_ARTICLE`,
    },
  },
  {
    slug: 'binary-blitz',
    title: 'Binary Blitz',
    shortTitle: 'Binary Blitz',
    category: 'tech',
    icon: Binary,
    tagline: 'Race the clock converting binary to decimal and back, with rising difficulty.',
    description:
      'A timed quiz that drills binary-to-decimal and decimal-to-binary conversion. Questions start easy and ramp up in bit-length and speed pressure as you progress.',
    metaTitle: 'Binary Blitz — Free Binary Conversion Game | Vidify Games',
    metaDescription:
      'Play Binary Blitz, a free timed game for converting binary to decimal and back. Learn binary number conversion with increasing difficulty levels.',
    keywords: ['binary game', 'binary to decimal', 'number conversion', 'binary quiz'],
    accent: 'info',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `BINARY_BLITZ_ARTICLE`,
    },
  },
  {
    slug: 'word-chain-challenge',
    title: 'Word Chain Challenge',
    shortTitle: 'Word Chain',
    category: 'kids',
    icon: Type,
    tagline: 'Build word chains where each word starts with the last letter of the previous one.',
    description:
      'Keep the chain alive: every new word must begin with the final letter of the word before it. You have limited time per word and no repeats allowed.',
    metaTitle: 'Word Chain Challenge — Free Vocabulary Game | Vidify Games',
    metaDescription:
      'Play Word Chain Challenge, a free vocabulary game. Build chains of words where each starts with the last letter of the previous one. Improve your word recall.',
    keywords: ['word chain game', 'vocabulary game', 'word game', 'letter chain'],
    accent: 'purple',
    difficulty: 'Medium',
    article: {
      style: 'C',
      body: `WORD_CHAIN_ARTICLE`,
    },
  },
  {
    slug: 'memory-grid',
    title: 'Memory Grid',
    shortTitle: 'Memory Grid',
    category: 'kids',
    icon: Grid3x3,
    tagline: 'Match flag pairs from memory across a grid of face-down cards.',
    description:
      'A classic memory-matching game themed around world flags. Flip cards two at a time, find the matching pairs, and clear the board in as few moves as possible.',
    metaTitle: 'Memory Grid — Free Memory Matching Game | Vidify Games',
    metaDescription:
      'Play Memory Grid, a free memory-matching card game themed around world flags. Flip cards, find pairs, and train your visual memory and recall.',
    keywords: ['memory game', 'matching game', 'flag memory', 'card matching game'],
    accent: 'purple',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `MEMORY_GRID_ARTICLE`,
    },
  },
  {
    slug: 'math-sprint',
    title: 'Math Sprint',
    shortTitle: 'Math Sprint',
    category: 'kids',
    icon: Calculator,
    tagline: 'Solve arithmetic problems against the clock with escalating difficulty.',
    description:
      'Answer as many arithmetic problems as you can before time runs out. Each correct answer adds time; each wrong one costs you. Difficulty climbs as your streak grows.',
    metaTitle: 'Math Sprint — Free Timed Arithmetic Game | Vidify Games',
    metaDescription:
      'Play Math Sprint, a free timed arithmetic game with increasing difficulty. Solve math problems against the clock and climb the local leaderboard.',
    keywords: ['math game', 'arithmetic game', 'timed math', 'mental math practice'],
    accent: 'accent',
    difficulty: 'Easy',
    article: {
      style: 'D',
      body: `MATH_SPRINT_ARTICLE`,
    },
  },
  {
    slug: 'geo-quiz',
    title: 'Geo Quiz',
    shortTitle: 'Geo Quiz',
    category: 'educational',
    icon: Globe,
    tagline: 'Identify countries from their flags and outlines across difficulty tiers.',
    description:
      'A geography quiz that shows flags and country outlines. Pick the right country from multiple-choice options across three difficulty tiers from easy to expert.',
    metaTitle: 'Geo Quiz — Free Geography Flag Quiz Game | Vidify Games',
    metaDescription:
      'Play Geo Quiz, a free geography quiz game. Identify countries from flags and outlines across multiple difficulty tiers. Test and build your world geography knowledge.',
    keywords: ['geography quiz', 'country quiz', 'flag game', 'world geography game'],
    accent: 'purple',
    difficulty: 'Medium',
    article: {
      style: 'C',
      body: `GEO_QUIZ_ARTICLE`,
    },
  },
  {
    slug: 'credit-score-climb',
    title: 'Credit Score Climb',
    shortTitle: 'Credit Climb',
    category: 'finance',
    icon: CreditCard,
    tagline: 'Make financial decisions that raise your credit score from poor to excellent.',
    description:
      'Navigate real-world credit scenarios — payments, utilization, credit age, and new applications. Each decision pushes your simulated score up or down. Reach 800 before the game ends.',
    metaTitle: 'Credit Score Climb — Free Credit Score Game | Vidify Games',
    metaDescription:
      'Learn how credit scores work by playing Credit Score Climb. Make smart financial decisions to raise your simulated credit score. Free educational game.',
    keywords: ['credit score', 'credit game', 'finance game', 'financial literacy', 'credit history'],
    accent: 'brand',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `CREDIT_SCORE_CLIMB_ARTICLE`,
    },
  },
  {
    slug: 'rent-vs-buy',
    title: 'Rent vs Buy',
    shortTitle: 'Rent vs Buy',
    category: 'finance',
    icon: Home,
    tagline: 'Compare the true costs of renting versus buying a home across ten years.',
    description:
      'Adjust rent, home price, mortgage rate, and appreciation to see whether renting or buying wins financially. The game reveals hidden costs most people never calculate.',
    metaTitle: 'Rent vs Buy — Free Home Buying Game | Vidify Games',
    metaDescription:
      'Should you rent or buy? Play Rent vs Buy to compare the real financial impact of each option. Free educational game about housing decisions.',
    keywords: ['rent vs buy', 'housing game', 'mortgage game', 'home buying', 'financial decision'],
    accent: 'brand',
    difficulty: 'Hard',
    article: {
      style: 'B',
      body: `RENT_VS_BUY_ARTICLE`,
    },
  },
  {
    slug: 'retirement-countdown',
    title: 'Retirement Countdown',
    shortTitle: 'Retirement',
    category: 'finance',
    icon: PiggyBank,
    tagline: 'Grow a retirement nest egg from your first paycheck to your last.',
    description:
      'Make annual savings and investment decisions over a simulated career. Watch compound interest work its magic — or fail to — based on when you start and how much you save.',
    metaTitle: 'Retirement Countdown — Free Retirement Game | Vidify Games',
    metaDescription:
      'Learn retirement planning through play. Make savings decisions over a simulated career and see how compound interest grows your nest egg. Free educational game.',
    keywords: ['retirement', 'compound interest', 'savings game', 'retirement planning', 'finance game'],
    accent: 'brand',
    difficulty: 'Hard',
    article: {
      style: 'A',
      body: `RETIREMENT_COUNTDOWN_ARTICLE`,
    },
  },
  {
    slug: 'emergency-fund-builder',
    title: 'Emergency Fund Builder',
    shortTitle: 'Emergency Fund',
    category: 'finance',
    icon: Shield,
    tagline: 'Build a financial safety net one month at a time while life throws surprises.',
    description:
      'Save toward a target emergency fund while managing unexpected expenses — car repairs, medical bills, job loss. Learn how much you really need and how to get there.',
    metaTitle: 'Emergency Fund Builder — Free Savings Game | Vidify Games',
    metaDescription:
      'Learn how to build an emergency fund by playing this free educational game. Save money while managing surprise expenses. Financial literacy through play.',
    keywords: ['emergency fund', 'savings game', 'financial safety net', 'emergency savings', 'finance game'],
    accent: 'brand',
    difficulty: 'Easy',
    article: {
      style: 'B',
      body: `EMERGENCY_FUND_BUILDER_ARTICLE`,
    },
  },
  {
    slug: 'insurance-matcher',
    title: 'Insurance Matcher',
    shortTitle: 'Insurance',
    category: 'finance',
    icon: Umbrella,
    tagline: 'Match the right insurance policy to the right life situation.',
    description:
      'Read a brief life scenario and pick the best insurance coverage — auto, home, health, life, or disability. Learn what each type protects and when it matters most.',
    metaTitle: 'Insurance Matcher — Free Insurance Game | Vidify Games',
    metaDescription:
      'Learn about insurance types by matching policies to real-life situations. Free educational game about auto, home, health, life, and disability insurance.',
    keywords: ['insurance', 'insurance game', 'financial literacy', 'coverage', 'finance game'],
    accent: 'brand',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `INSURANCE_MATCHER_ARTICLE`,
    },
  },
  {
    slug: 'typing-speed',
    title: 'Typing Speed Test',
    shortTitle: 'Typing Speed',
    category: 'tech',
    icon: Keyboard,
    tagline: 'Type sentences as fast and accurately as you can against the clock.',
    description:
      'Real-time typing challenge with WPM and accuracy tracking. Type the displayed sentences before time runs out. Difficulty controls text length and time limit.',
    metaTitle: 'Typing Speed Test — Free Typing Game | Vidify Games',
    metaDescription:
      'Test and improve your typing speed and accuracy with this free educational typing game. Measure WPM and accuracy in real time.',
    keywords: ['typing speed', 'typing game', 'WPM', 'typing test', 'keyboard skills'],
    accent: 'info',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `TYPING_SPEED_ARTICLE`,
    },
  },
  {
    slug: 'shortcut-master',
    title: 'Shortcut Master',
    shortTitle: 'Shortcuts',
    category: 'tech',
    icon: Zap,
    tagline: 'Match keyboard shortcuts to their actions before time runs out.',
    description:
      'See an action name and pick the correct keyboard shortcut from four options. Covers Windows, Mac, and browser shortcuts. Build muscle memory for productivity.',
    metaTitle: 'Shortcut Master — Free Shortcut Learning Game | Vidify Games',
    metaDescription:
      'Learn keyboard shortcuts by playing Shortcut Master. Match actions to shortcuts and build productivity muscle memory. Free educational game.',
    keywords: ['keyboard shortcuts', 'shortcut game', 'productivity', 'keyboard skills', 'tech game'],
    accent: 'info',
    difficulty: 'Medium',
    article: {
      style: 'B',
      body: `SHORTCUT_MASTER_ARTICLE`,
    },
  },
  {
    slug: 'logic-gate-sim',
    title: 'Logic Gate Simulator',
    shortTitle: 'Logic Gates',
    category: 'tech',
    icon: Cpu,
    tagline: 'Build circuits with AND, OR, NOT, and XOR gates to match a target truth table.',
    description:
      'Drag logic gates into a circuit and connect inputs to outputs. Your goal is to match the target truth table. Learn how computers make decisions at the lowest level.',
    metaTitle: 'Logic Gate Simulator — Free Logic Gate Game | Vidify Games',
    metaDescription:
      'Learn digital logic by building circuits with AND, OR, NOT, and XOR gates. Match target truth tables in this free educational logic game.',
    keywords: ['logic gates', 'digital logic', 'circuit game', 'AND OR NOT', 'computer science'],
    accent: 'info',
    difficulty: 'Hard',
    article: {
      style: 'D',
      body: `LOGIC_GATE_SIM_ARTICLE`,
    },
  },
  {
    slug: 'website-speed',
    title: 'Website Speed Optimizer',
    shortTitle: 'Web Speed',
    category: 'tech',
    icon: Gauge,
    tagline: 'Optimize a slow website by choosing the right performance techniques.',
    description:
      'A fictional website loads slowly. Pick from optimization options — image compression, caching, minification, CDN — and watch the load time drop. Learn web performance fundamentals.',
    metaTitle: 'Website Speed Optimizer — Free Web Perf Game | Vidify Games',
    metaDescription:
      'Learn website performance optimization by playing this free educational game. Compress images, enable caching, and speed up a slow website.',
    keywords: ['website speed', 'web performance', 'optimization game', 'page speed', 'tech game'],
    accent: 'info',
    difficulty: 'Medium',
    article: {
      style: 'B',
      body: `WEBSITE_SPEED_ARTICLE`,
    },
  },
  {
    slug: 'tech-acronym-decoder',
    title: 'Tech Acronym Decoder',
    shortTitle: 'Acronym Decoder',
    category: 'tech',
    icon: BookOpen,
    tagline: 'Decode tech acronyms like API, CSS, DNS, and SQL before the timer expires.',
    description:
      'A tech acronym appears and you pick the correct expansion from four options. Learn what the jargon actually means. Difficulty controls how obscure the acronyms get.',
    metaTitle: 'Tech Acronym Decoder — Free Tech Acronym Game | Vidify Games',
    metaDescription:
      'Learn what tech acronyms mean by playing Tech Acronym Decoder. Match acronyms to their full names and build your tech vocabulary. Free educational game.',
    keywords: ['tech acronyms', 'API', 'CSS', 'DNS', 'tech vocabulary', 'acronym game'],
    accent: 'info',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `TECH_ACRONYM_DECODER_ARTICLE`,
    },
  },
  {
    slug: 'capital-city',
    title: 'Capital City Challenge',
    shortTitle: 'Capital City',
    category: 'educational',
    icon: Building2,
    tagline: 'Match world countries to their capital cities before the clock runs out.',
    description:
      'A country name appears and you pick its capital from four options. Covers every continent and difficulty tiers control how obscure the capitals get. Build geography fluency.',
    metaTitle: 'Capital City Challenge — Free Capitals Game | Vidify Games',
    metaDescription:
      'Test your knowledge of world capitals with Capital City Challenge. Match countries to their capital cities in this free educational geography game.',
    keywords: ['capital cities', 'world capitals', 'geography game', 'country capitals', 'educational game'],
    accent: 'purple',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `CAPITAL_CITY_ARTICLE`,
    },
  },
  {
    slug: 'science-fact-sprint',
    title: 'Science Fact Sprint',
    shortTitle: 'Science Sprint',
    category: 'educational',
    icon: FlaskConical,
    tagline: 'Answer science trivia across biology, chemistry, physics, and earth science.',
    description:
      'Rapid-fire science trivia across multiple disciplines. Pick the correct answer from four options before the timer expires. Learn fascinating facts about the natural world.',
    metaTitle: 'Science Fact Sprint — Free Science Quiz Game | Vidify Games',
    metaDescription:
      'Test your science knowledge with Science Fact Sprint. Answer trivia across biology, chemistry, physics, and earth science. Free educational game.',
    keywords: ['science trivia', 'science game', 'biology', 'chemistry', 'physics', 'educational game'],
    accent: 'purple',
    difficulty: 'Medium',
    article: {
      style: 'B',
      body: `SCIENCE_FACT_SPRINT_ARTICLE`,
    },
  },
  {
    slug: 'periodic-table-blitz',
    title: 'Periodic Table Blitz',
    shortTitle: 'Periodic Blitz',
    category: 'educational',
    icon: Atom,
    tagline: 'Identify elements by symbol, group, and property before the timer runs out.',
    description:
      'An element symbol appears and you pick its name, or vice versa. Difficulty controls how deep into the periodic table you go. Learn chemistry fundamentals through play.',
    metaTitle: 'Periodic Table Blitz — Free Chemistry Game | Vidify Games',
    metaDescription:
      'Learn the periodic table by playing Periodic Table Blitz. Match element symbols to their names and properties. Free educational chemistry game.',
    keywords: ['periodic table', 'elements', 'chemistry game', 'element symbols', 'educational game'],
    accent: 'purple',
    difficulty: 'Hard',
    article: {
      style: 'D',
      body: `PERIODIC_TABLE_BLITZ_ARTICLE`,
    },
  },
  {
    slug: 'history-timeline',
    title: 'History Timeline',
    shortTitle: 'Timeline',
    category: 'educational',
    icon: Clock,
    tagline: 'Place historical events in the correct chronological order.',
    description:
      'Four historical events appear. Drag them into chronological order from earliest to latest. Difficulty controls the time span and how close the events are.',
    metaTitle: 'History Timeline — Free History Game | Vidify Games',
    metaDescription:
      'Learn history by placing events in chronological order. Play History Timeline, a free educational game about world history and important dates.',
    keywords: ['history timeline', 'historical events', 'chronology', 'history game', 'educational game'],
    accent: 'purple',
    difficulty: 'Medium',
    article: {
      style: 'A',
      body: `HISTORY_TIMELINE_ARTICLE`,
    },
  },
  {
    slug: 'world-currency',
    title: 'World Currency Match',
    shortTitle: 'World Currency',
    category: 'educational',
    icon: Coins,
    tagline: 'Match countries to their official currencies.',
    description:
      'A country flag or name appears and you pick its official currency from four options. Learn the currencies of the world from dollars to yen to pesos to francs.',
    metaTitle: 'World Currency Match — Free Currency Game | Vidify Games',
    metaDescription:
      'Learn world currencies by playing World Currency Match. Match countries to their official currencies in this free educational geography game.',
    keywords: ['world currency', 'currency game', 'money', 'foreign exchange', 'educational game'],
    accent: 'purple',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `WORLD_CURRENCY_ARTICLE`,
    },
  },
  {
    slug: 'shape-sorter',
    title: 'Shape Sorter',
    shortTitle: 'Shapes',
    category: 'kids',
    icon: Shapes,
    tagline: 'Sort colorful shapes into the right baskets — circles, squares, triangles, and stars!',
    description:
      'A gentle game for young learners. Shapes appear one at a time and kids pick the right basket. No timers, no pressure — just cheerful feedback and happy animations.',
    metaTitle: 'Shape Sorter — Free Shape Game for Kids | Vidify Games',
    metaDescription:
      'A gentle, fun shape-sorting game for young children. Sort circles, squares, triangles, and stars with cheerful animations. Free kids learning game.',
    keywords: ['shapes for kids', 'shape sorter', 'kids game', 'toddler game', 'learning shapes'],
    accent: 'teal',
    difficulty: 'Easy',
    article: {
      style: 'B',
      body: `SHAPE_SORTER_ARTICLE`,
    },
  },
  {
    slug: 'animal-habitat',
    title: 'Animal Habitat Match',
    shortTitle: 'Animal Habitat',
    category: 'kids',
    icon: PawPrint,
    tagline: 'Match friendly animals to their natural habitats — forest, ocean, desert, and more!',
    description:
      'Kids match animals to where they live. A friendly animal appears and kids pick the right habitat. Gentle, educational, and full of cheerful animal friends.',
    metaTitle: 'Animal Habitat Match — Free Habitat Game | Vidify Games',
    metaDescription:
      'Match animals to their habitats in this gentle, fun learning game for kids. Forest, ocean, desert, and more. Free educational kids game.',
    keywords: ['animal habitat', 'animals for kids', 'kids game', 'habitat match', 'learning animals'],
    accent: 'teal',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `ANIMAL_HABITAT_ARTICLE`,
    },
  },
  {
    slug: 'counting-critters',
    title: 'Counting Critters',
    shortTitle: 'Counting',
    category: 'kids',
    icon: Hash,
    tagline: 'Count the cute critters and pick the right number — no timer, just fun!',
    description:
      'A gentle counting game for young learners. Friendly critters appear on screen and kids count them, then pick the right number. Cheerful, encouraging, and pressure-free.',
    metaTitle: 'Counting Critters — Free Counting Game | Vidify Games',
    metaDescription:
      'A fun, gentle counting game for young children. Count cute critters and pick the right number. No timer, no pressure. Free kids learning game.',
    keywords: ['counting for kids', 'counting game', 'kids math', 'toddler counting', 'learning numbers'],
    accent: 'teal',
    difficulty: 'Easy',
    article: {
      style: 'A',
      body: `COUNTING_CRITTERS_ARTICLE`,
    },
  },
  {
    slug: 'color-mixing',
    title: 'Color Mixing Magic',
    shortTitle: 'Color Magic',
    category: 'kids',
    icon: Palette,
    tagline: 'Mix primary colors to make new colors — red and blue make purple!',
    description:
      'A gentle color-learning game for young kids. Two primary colors appear and kids pick what color they make when mixed. Cheerful animations and gentle encouragement.',
    metaTitle: 'Color Mixing Magic — Free Color Game for Kids | Vidify Games',
    metaDescription:
      'Learn color mixing by playing this gentle, fun game for kids. Mix primary colors to make new colors. Free educational kids game.',
    keywords: ['color mixing', 'colors for kids', 'primary colors', 'kids game', 'learning colors'],
    accent: 'teal',
    difficulty: 'Easy',
    article: {
      style: 'B',
      body: `COLOR_MIXING_ARTICLE`,
    },
  },
  {
    slug: 'pattern-builder',
    title: 'Pattern Builder',
    shortTitle: 'Patterns',
    category: 'kids',
    icon: Blocks,
    tagline: 'Complete the pattern — what comes next in the colorful sequence?',
    description:
      'A gentle pattern-recognition game for young learners. A sequence of colorful shapes appears with one missing. Kids pick the shape that completes the pattern.',
    metaTitle: 'Pattern Builder — Free Pattern Game for Kids | Vidify Games',
    metaDescription:
      'Build pattern recognition skills with this gentle, fun game for kids. Complete colorful shape sequences. Free educational kids game.',
    keywords: ['patterns for kids', 'pattern game', 'kids learning', 'toddler patterns', 'shape patterns'],
    accent: 'teal',
    difficulty: 'Easy',
    article: {
      style: 'C',
      body: `PATTERN_BUILDER_ARTICLE`,
    },
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return games.find((g) => g.slug === slug);
}

export function getRelatedGames(slug: string, count = 3): GameMeta[] {
  const game = getGame(slug);
  if (!game) return games.slice(0, count);
  const same = games.filter((g) => g.category === game.category && g.slug !== slug);
  const others = games.filter((g) => g.category !== game.category && g.slug !== slug);
  return [...same, ...others].slice(0, count);
}

export function getGamesByCategory(cat: Category): GameMeta[] {
  return games.filter((g) => g.category === cat);
}

export type GameComponent = LazyExoticComponent<ComponentType<{ game: GameMeta; onAchievement?: () => void }>>;
