/* ==========================================================================
   AI Word Bank Generator
   - Given a user scene (natural language) + difficulty level, produce a list
     of 5–15 English vocabulary words plus a suggested puzzle title.
   - Two execution paths:
     1) REAL LLM (OpenAI-compatible chat completion): used when env vars set.
     2) RULE FALLBACK: keyword-to-word-bank matching for instant offline use.
   ========================================================================== */

export type Difficulty = "easy" | "medium" | "hard"

export interface GenerateWordsResult {
  title: string
  words: string[]
  difficulty: Difficulty
  /** Which backend was used — helpful for the UI to show a hint */
  engine: "llm" | "rule"
}

export interface GenerateWordsOptions {
  scene: string
  difficulty: Difficulty
  /** Optional override — usually from process.env inside the Route handler */
  apiKey?: string
  baseUrl?: string
  model?: string
}

/* ------------------------------------------------------------------
   1.  Difficulty → word-count + word-length constraints
   ------------------------------------------------------------------ */
const DIFFICULTY_META: Record<
  Difficulty,
  { minLen: number; maxLen: number; minCount: number; maxCount: number; label: string }
> = {
  easy: {
    minLen: 2,
    maxLen: 6,
    minCount: 5,
    maxCount: 8,
    label: "simple, short words for ages 3–5 (preschool)",
  },
  medium: {
    minLen: 3,
    maxLen: 9,
    minCount: 8,
    maxCount: 12,
    label: "everyday words for ages 5–7 (early elementary)",
  },
  hard: {
    minLen: 4,
    maxLen: 14,
    minCount: 10,
    maxCount: 15,
    label: "rich vocabulary words for ages 7–9 (elementary)",
  },
}

/* ------------------------------------------------------------------
   2.  RULE FALLBACK — massive keyword → word bank map
       Covers the 9 theme categories on the site + many free-form scenes.
   ------------------------------------------------------------------ */
type WordBank = {
  keywords: string[]
  title: (scene: string) => string
  easy: string[]
  medium: string[]
  hard: string[]
}

const BANKS: WordBank[] = [
  /* --- Animals --- */
  {
    keywords: ["animal", "pet", "zoo", "wild", "safari", "farm", "forest", "jungle"],
    title: () => "Animal Kingdom",
    easy: ["cat", "dog", "fish", "bird", "fox", "pig", "cow", "hen"],
    medium: ["rabbit", "tiger", "horse", "sheep", "monkey", "panda", "zebra", "koala", "eagle", "snake"],
    hard: ["elephant", "giraffe", "cheetah", "kangaroo", "penguin", "dolphin", "leopard", "crocodile", "butterfly", "squirrel", "hedgehog", "flamingo"],
  },
  {
    keywords: ["ocean", "sea", "beach", "underwater", "marine", "fish"],
    title: () => "Ocean Friends",
    easy: ["fish", "crab", "whale", "seal", "coral", "wave"],
    medium: ["dolphin", "shark", "turtle", "octopus", "jellyfish", "starfish", "squid", "lobster", "shell", "reef"],
    hard: ["swordfish", "seahorse", "barracuda", "stingray", "manatee", "pufferfish", "anemone", "plankton", "moray", "barnacle"],
  },
  {
    keywords: ["bird", "wing", "feather", "aviary", "nest"],
    title: () => "Birds & Feathers",
    easy: ["bird", "duck", "hen", "owl", "nest", "egg"],
    medium: ["eagle", "parrot", "sparrow", "pigeon", "pelican", "flamingo", "peacock", "swallow", "stork", "crane"],
    hard: ["kingfisher", "woodpecker", "hummingbird", "albatross", "ostrich", "penguin", "toucan", "macaw", "heron", "falcon"],
  },
  {
    keywords: ["insect", "bug", "butterfly", "bee", "ant"],
    title: () => "Busy Bugs & Insects",
    easy: ["bee", "ant", "fly", "bug", "worm", "moth"],
    medium: ["wasp", "beetle", "spider", "cricket", "snail", "dragonfly", "ladybug", "caterpillar", "locust", "gnat"],
    hard: ["butterfly", "centipede", "millipede", "grasshopper", "mosquito", "firefly", "scorpion", "earwig", "termite", "silkworm"],
  },
  /* --- Food & Fruit --- */
  {
    keywords: ["fruit", "apple", "banana", "berry", "tropical"],
    title: () => "Fruit Party",
    easy: ["apple", "grape", "peach", "lemon", "mango", "plum", "pear"],
    medium: ["banana", "melon", "berry", "cherry", "papaya", "kiwi", "guava", "nectarine", "apricot"],
    hard: ["strawberry", "pineapple", "watermelon", "blueberry", "coconut", "blackberry", "pomegranate", "raspberry", "cantaloupe", "grapefruit", "passionfruit"],
  },
  {
    keywords: ["vegetable", "veggie", "salad", "carrot", "garden"],
    title: () => "Garden Vegetables",
    easy: ["pea", "corn", "carrot", "bean", "onion", "beet"],
    medium: ["potato", "tomato", "lettuce", "cabbage", "spinach", "celery", "pepper", "radish", "garlic"],
    hard: ["broccoli", "cucumber", "pumpkin", "zucchini", "asparagus", "cauliflower", "mushroom", "artichoke", "brussels", "eggplant"],
  },
  {
    keywords: ["food", "meal", "dinner", "lunch", "breakfast", "snack", "cooking", "kitchen"],
    title: () => "Yummy Foods",
    easy: ["egg", "milk", "rice", "cake", "soup", "bread", "jam"],
    medium: ["pizza", "pasta", "burger", "salad", "tacos", "pancake", "cheese", "yogurt", "cookie"],
    hard: ["sandwich", "spaghetti", "dumpling", "waffle", "croissant", "casserole", "macaroni", "lasagna", "bruschetta", "strawberry"],
  },
  {
    keywords: ["sweet", "candy", "dessert", "chocolate", "ice cream", "cake"],
    title: () => "Sweet Treats",
    easy: ["cake", "pie", "candy", "coke", "sugar", "lollipop"],
    medium: ["cookie", "donut", "fudge", "caramel", "pudding", "brownie", "muffin", "cupcake", "gingerbread"],
    hard: ["chocolate", "cheesecake", "icecream", "marshmallow", "macaroon", "tiramisu", "truffle", "shortbread", "sorbet", "popsicle"],
  },
  /* --- Nature & Space --- */
  {
    keywords: ["space", "planet", "rocket", "nasa", "galaxy", "astronaut", "star", "moon", "mars"],
    title: () => "Space Adventure",
    easy: ["star", "moon", "mars", "comet", "orbit", "nasa"],
    medium: ["planet", "rocket", "galaxy", "comet", "alien", "orbit", "meteor", "venus", "saturn", "earth"],
    hard: ["telescope", "astronaut", "nebula", "satellite", "universe", "blackhole", "supernova", "eclipse", "asteroid", "constellation"],
  },
  {
    keywords: ["weather", "rain", "snow", "sun", "cloud", "storm", "wind"],
    title: () => "Weather Wonders",
    easy: ["sun", "rain", "snow", "wind", "fog", "ice"],
    medium: ["cloud", "storm", "thunder", "rainbow", "frost", "breeze", "hail", "humid"],
    hard: ["tornado", "hurricane", "blizzard", "drizzle", "heatwave", "dewdrop", "lightning", "atmosphere", "barometer", "monsoon"],
  },
  {
    keywords: ["plant", "flower", "tree", "leaf", "garden", "forest", "wood"],
    title: () => "Plants & Flowers",
    easy: ["rose", "leaf", "tree", "bush", "grass", "seed"],
    medium: ["tulip", "daisy", "lily", "oak", "pine", "palm", "fern", "moss", "petal", "ivy"],
    hard: ["sunflower", "orchid", "lavender", "dandelion", "carnation", "redwood", "magnolia", "bluebell", "hydrangea", "chrysanthemum"],
  },
  {
    keywords: ["season", "spring", "summer", "autumn", "winter", "fall"],
    title: () => "Four Seasons",
    easy: ["sun", "rain", "snow", "leaf", "kite", "coat"],
    medium: ["bloom", "picnic", "harvest", "pumpkin", "costume", "firework", "holiday", "blanket"],
    hard: ["sunshine", "butterfly", "sandcastle", "snowflake", "fireplace", "jackolantern", "thunderstorm", "chrysanthemum"],
  },
  /* --- School, Family, Home --- */
  {
    keywords: ["school", "classroom", "teacher", "student", "book", "class", "lesson", "education"],
    title: () => "Back to School",
    easy: ["pen", "book", "desk", "bag", "map", "ruler"],
    medium: ["pencil", "eraser", "crayon", "notebook", "teacher", "pupil", "globe", "scissors", "glue", "chalk"],
    hard: ["textbook", "backpack", "blackboard", "cafeteria", "playground", "schedule", "cursive", "geometry", "attendance", "kindergarten"],
  },
  {
    keywords: ["family", "mom", "dad", "parent", "brother", "sister", "sibling", "home"],
    title: () => "My Family",
    easy: ["mom", "dad", "son", "aunt", "uncle", "baby"],
    medium: ["brother", "sister", "parent", "cousin", "grandma", "grandpa", "nephew", "niece"],
    hard: ["daughter", "husband", "wife", "sibling", "grandson", "granddaughter", "stepmother", "godfather", "generation", "household"],
  },
  {
    keywords: ["home", "house", "room", "kitchen", "bedroom", "furniture"],
    title: () => "Around the House",
    easy: ["bed", "lamp", "door", "sofa", "chair", "table"],
    medium: ["kitchen", "pillow", "blanket", "mirror", "shelf", "toilet", "sink", "stove", "couch", "carpet"],
    hard: ["bookshelf", "wardrobe", "dishwasher", "chandelier", "refrigerator", "fireplace", "curtain", "doorknob", "throwpillow", "armchair"],
  },
  /* --- Jobs, Clothes, Sports --- */
  {
    keywords: ["job", "work", "career", "worker", "profession", "doctor", "police", "firefighter"],
    title: () => "Community Helpers",
    easy: ["nurse", "chef", "farmer", "pilot", "clown", "driver"],
    medium: ["doctor", "teacher", "police", "lawyer", "banker", "baker", "writer", "painter", "singer", "actor"],
    hard: ["firefighter", "scientist", "engineer", "astronaut", "librarian", "veterinarian", "journalist", "electrician", "carpenter", "detective"],
  },
  {
    keywords: ["clothe", "shirt", "pant", "wear", "fashion", "outfit", "dress", "shoe"],
    title: () => "Clothes & Outfits",
    easy: ["hat", "cap", "tie", "sock", "vest", "coat"],
    medium: ["shirt", "pants", "dress", "skirt", "jeans", "scarf", "glove", "sweater", "jacket", "boots"],
    hard: ["sandals", "raincoat", "sneakers", "trousers", "cardigan", "necklace", "earrings", "sunglasses", "underwear", "handkerchief"],
  },
  {
    keywords: ["sport", "ball", "game", "soccer", "basketball", "tennis", "olympic", "team"],
    title: () => "Sports & Games",
    easy: ["ball", "run", "jump", "swim", "bat", "net"],
    medium: ["soccer", "tennis", "hockey", "rugby", "golf", "cycling", "diving", "rowing", "skiing", "surfing"],
    hard: ["basketball", "volleyball", "badminton", "skateboard", "taekwondo", "gymnastics", "waterpolo", "pentathlon", "cheerleader", "snowboard"],
  },
  /* --- Transport, Travel, Places --- */
  {
    keywords: ["car", "truck", "transport", "vehicle", "plane", "train", "boat", "traffic"],
    title: () => "Things That Go",
    easy: ["car", "bus", "van", "ship", "bike", "jet"],
    medium: ["train", "plane", "truck", "taxi", "ferry", "canoe", "scooter", "tractor", "subway", "rocket"],
    hard: ["helicopter", "motorcycle", "sailboat", "submarine", "ambulance", "skateboard", "cruiseship", "fireengine", "spaceshuttle", "tramway"],
  },
  {
    keywords: ["travel", "vacation", "trip", "holiday", "beach", "hotel", "airport"],
    title: () => "Happy Holidays",
    easy: ["bag", "map", "sun", "hat", "sand", "sea"],
    medium: ["ticket", "hotel", "airport", "camera", "suitcase", "passport", "souvenir", "luggage", "beach"],
    hard: ["sightseeing", "lighthouse", "postcard", "boardwalk", "headphones", "itinerary", "snorkeling", "tourguide", "shipyard", "embarkation"],
  },
  {
    keywords: ["city", "town", "building", "street", "bridge", "park", "landmark"],
    title: () => "City Buildings",
    easy: ["park", "shop", "bank", "cafe", "zoo", "library"],
    medium: ["museum", "theater", "church", "market", "bridge", "tower", "station", "hospital", "school"],
    hard: ["skyscraper", "restaurant", "university", "playground", "cathedral", "aquarium", "observatory", "courthouse", "embassy", "monument"],
  },
  /* --- Art, Music, Emotions, Shopping --- */
  {
    keywords: ["art", "paint", "draw", "color", "craft", "drawing", "sketch"],
    title: () => "Art & Drawing",
    easy: ["pen", "ink", "line", "draw", "paper", "paint"],
    medium: ["pencil", "eraser", "crayon", "marker", "sketch", "drawing", "outline", "canvas", "brush"],
    hard: ["watercolor", "charcoal", "perspective", "hatching", "stippling", "acrylic", "collage", "calligraphy", "sculpture", "silhouette"],
  },
  {
    keywords: ["music", "song", "sing", "instrument", "piano", "guitar", "dance", "concert"],
    title: () => "Music & Dance",
    easy: ["song", "drum", "flute", "harp", "sing", "bell"],
    medium: ["piano", "guitar", "violin", "trumpet", "cello", "banjo", "maraca", "dance", "rhythm", "chorus"],
    hard: ["saxophone", "accordion", "symphony", "keyboard", "microphone", "percussion", "tambourine", "choreography", "clarinet", "xylophone"],
  },
  {
    keywords: ["emotion", "feeling", "happy", "sad", "love", "mood", "angry"],
    title: () => "Feelings & Emotions",
    easy: ["happy", "sad", "mad", "shy", "calm", "joy"],
    medium: ["angry", "proud", "brave", "tired", "bored", "excited", "silly", "worried", "grumpy"],
    hard: ["surprised", "confused", "frustrated", "embarrassed", "jealous", "delighted", "curious", "disappointed", "homesick", "overjoyed"],
  },
  {
    keywords: ["shop", "shopping", "mall", "store", "buy", "cart", "money", "supermarket"],
    title: () => "Shopping Day",
    easy: ["toy", "candy", "bag", "cart", "cash", "sale"],
    medium: ["basket", "coupon", "market", "receipt", "change", "budget", "aisle", "shelf", "sticker"],
    hard: ["supermarket", "creditcard", "department", "checkout", "promotion", "membership", "giftwrapping", "shopper", "refund", "clearance"],
  },
  /* --- Holidays, Science, Numbers, Body --- */
  {
    keywords: ["christmas", "xmas", "santa", "gift", "holiday"],
    title: () => "Christmas Time",
    easy: ["gift", "tree", "star", "bell", "snow", "elf"],
    medium: ["santa", "reindeer", "sleigh", "stocking", "candle", "cookie", "wreath", "carol"],
    hard: ["gingerbread", "mistletoe", "ornament", "snowflake", "poinsettia", "nutcracker", "tinsel", "eggnog", "chimney", "northpole"],
  },
  {
    keywords: ["halloween", "pumpkin", "ghost", "witch", "costume", "spooky"],
    title: () => "Spooky Halloween",
    easy: ["bat", "cat", "hat", "ghost", "witch", "web"],
    medium: ["pumpkin", "costume", "candy", "spider", "cauldron", "vampire", "mummy", "zombie"],
    hard: ["jackolantern", "moonlight", "skull", "tombstone", "graveyard", "haunted", "blackcat", "cobweb", "trickortreat", "skeleton"],
  },
  {
    keywords: ["science", "lab", "experiment", "chemistry", "physics", "biology", "robot"],
    title: () => "Science Lab",
    easy: ["lab", "test", "atom", "cell", "data", "beam"],
    medium: ["beaker", "flask", "robot", "magnet", "battery", "microbe", "planet", "volume", "gravity"],
    hard: ["microscope", "telescope", "chemical", "electron", "molecule", "hypothesis", "photosynthesis", "thermometer", "electricity", "laboratory"],
  },
  {
    keywords: ["number", "math", "count", "digit", "arithmetic", "geometry"],
    title: () => "Math & Numbers",
    easy: ["one", "two", "six", "ten", "add", "sum"],
    medium: ["seven", "eleven", "twenty", "minus", "times", "divide", "equal", "fraction"],
    hard: ["multiply", "geometry", "triangle", "equation", "percentage", "algebra", "square", "decimal", "rectangle", "mathematics"],
  },
  {
    keywords: ["body", "face", "head", "eye", "hand", "health", "doctor", "anatomy"],
    title: () => "My Body",
    easy: ["eye", "ear", "lip", "toe", "arm", "leg"],
    medium: ["hand", "foot", "knee", "cheek", "chin", "elbow", "wrist", "ankle", "tooth"],
    hard: ["shoulder", "forehead", "eyebrow", "eyelash", "fingernail", "bellybutton", "backbone", "muscle", "skeleton", "cartilage"],
  },
  /* --- Colors, Shapes, Time --- */
  {
    keywords: ["color", "colour", "rainbow", "paint", "hue"],
    title: () => "Rainbow Colors",
    easy: ["red", "blue", "pink", "black", "white", "gold"],
    medium: ["orange", "yellow", "green", "purple", "violet", "brown", "silver"],
    hard: ["turquoise", "crimson", "magenta", "indigo", "scarlet", "lavender", "mustard", "maroon", "charcoal", "turquoise"],
  },
  {
    keywords: ["shape", "circle", "square", "triangle", "geometry", "form"],
    title: () => "Shapes & Forms",
    easy: ["dot", "line", "oval", "star", "ring", "cube"],
    medium: ["circle", "square", "rectangle", "triangle", "diamond", "sphere", "pyramid"],
    hard: ["pentagon", "hexagon", "octagon", "parallelogram", "trapezoid", "cylinder", "crescent", "rhombus", "semicircle", "quadrilateral"],
  },
  {
    keywords: ["time", "clock", "day", "week", "month", "hour", "minute", "calendar"],
    title: () => "Time & Dates",
    easy: ["day", "hour", "week", "noon", "dawn", "dusk"],
    medium: ["monday", "january", "spring", "minute", "second", "winter", "autumn", "calendar"],
    hard: ["wednesday", "september", "quarter", "midnight", "fortnight", "timezone", "leapyear", "centuries", "stopwatch", "sundial"],
  },
]

/** Clean and normalise a user scene for matching */
function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

function pickByDifficulty<T>(bank: WordBank, diff: Difficulty): T[] {
  return (diff === "easy" ? bank.easy : diff === "medium" ? bank.medium : bank.hard) as unknown as T[]
}

/**
 * Rule-based engine. Returns a title + word list for the given scene.
 * Never throws — worst case falls back to a generic "Everyday Words" bank.
 */
export function generateWordsByRule(scene: string, difficulty: Difficulty): GenerateWordsResult {
  const norm = normalise(scene) || "everyday"
  let bestBank: WordBank | null = null
  let bestScore = 0

  for (const bank of BANKS) {
    let score = 0
    for (const kw of bank.keywords) {
      if (norm.includes(kw)) score += kw.length
    }
    if (score > bestScore) {
      bestScore = score
      bestBank = bank
    }
  }

  const meta = DIFFICULTY_META[difficulty]
  const fallback = BANKS[0] // animals as last resort
  const bank = bestBank ?? fallback

  const pool: string[] = pickByDifficulty<string>(bank, difficulty)
    .filter((w) => w.length >= meta.minLen && w.length <= meta.maxLen)

  // if pool is empty (difficulty mismatch), fall back to medium
  const finalPool: string[] =
    pool.length >= meta.minCount
      ? pool
      : pickByDifficulty<string>(bank, "medium").filter(
          (w) => w.length >= meta.minLen && w.length <= meta.maxLen
        )

  // shuffle (deterministic-ish via scene length) and clamp to count
  const shuffled = [...finalPool].sort(() => Math.sin(scene.length + Math.random()) - 0.5)
  const desired = Math.min(
    meta.maxCount,
    Math.max(meta.minCount, Math.min(shuffled.length, meta.maxCount))
  )
  const words = shuffled.slice(0, Math.min(desired, shuffled.length))

  // Build title from scene when possible
  const sceneTitle = scene
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")

  const title =
    bestBank && bestScore > 0
      ? bank.title(scene)
      : sceneTitle && sceneTitle.length >= 3
        ? `${sceneTitle} Word Search`
        : "Everyday Words"

  return { title, words, difficulty, engine: "rule" }
}

/* ------------------------------------------------------------------
   3.  LLM ENGINE — OpenAI-compatible /chat/completions
       Configured by env:
         AI_API_KEY   (required to enable)
         AI_API_BASE  (optional, default https://api.openai.com/v1)
         AI_MODEL     (optional, default gpt-4o-mini)
   ------------------------------------------------------------------ */
export async function generateWordsByLLM(
  opts: GenerateWordsOptions
): Promise<GenerateWordsResult> {
  const apiKey = opts.apiKey ?? process.env.AI_API_KEY
  if (!apiKey) throw new Error("AI_API_KEY not configured")

  const baseUrl = (
    opts.baseUrl ??
    process.env.AI_API_BASE ??
    "https://api.openai.com/v1"
  ).replace(/\/$/, "")
  const model = opts.model ?? process.env.AI_MODEL ?? "gpt-4o-mini"

  const meta = DIFFICULTY_META[opts.difficulty]
  const systemPrompt = [
    "You are an expert vocabulary designer for K–3 children's word search puzzles.",
    "Given a natural-language scene and a difficulty level, respond ONLY with a JSON object matching:",
    '  {"title": "short kid-friendly puzzle title 3-7 words", "words": ["apple", ...]}',
    `Rules for ${opts.difficulty} (${meta.label}):`,
    `  • word length: ${meta.minLen}–${meta.maxLen} letters;`,
    `  • word count: ${meta.minCount}–${meta.maxCount} words;`,
    "  • every word MUST be a single English word (no spaces, no hyphens, no numbers);",
    "  • no proper nouns unless they are well-known to young kids (e.g. Nasa);",
    "  • all words relevant to the user's scene; no duplicates; lowercase.",
  ].join("\n")

  const userPrompt = `Scene: "${opts.scene.trim()}"\nDifficulty: ${opts.difficulty}`

  let bodyText = ""
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 240)}`)
    }
    const parsed = JSON.parse(text)
    bodyText =
      (parsed?.choices?.[0]?.message?.content as string) ||
      (parsed?.choices?.[0]?.delta?.content as string) ||
      ""
  } catch (err) {
    throw new Error(`LLM call failed: ${(err as Error).message}`)
  }

  if (!bodyText) throw new Error("LLM returned empty content")

  let parsed: { title?: unknown; words?: unknown } = {}
  try {
    parsed = JSON.parse(bodyText)
  } catch {
    // sometimes the model wraps JSON in ```json fences
    const m = bodyText.match(/\{[\s\S]*\}/)
    if (m) {
      try {
        parsed = JSON.parse(m[0])
      } catch {
        throw new Error("LLM response was not valid JSON")
      }
    } else {
      throw new Error("LLM response missing JSON object")
    }
  }

  const rawTitle = typeof parsed.title === "string" ? parsed.title : ""
  const rawWords = Array.isArray(parsed.words) ? parsed.words : []
  if (!rawWords.length) throw new Error("LLM returned empty word list")

  const cleanedWords = rawWords
    .map((w) => (typeof w === "string" ? w.trim().toLowerCase() : ""))
    .filter((w) => /^[a-z]{2,20}$/.test(w))

  // de-duplicate while preserving order
  const seen = new Set<string>()
  const words: string[] = []
  for (const w of cleanedWords) {
    if (!seen.has(w)) {
      seen.add(w)
      words.push(w)
    }
  }

  // clamp to difficulty count
  const trimmed = words.slice(0, meta.maxCount)
  if (trimmed.length < meta.minCount) {
    throw new Error(`LLM only produced ${trimmed.length} words (need ${meta.minCount}+)`)
  }

  const title =
    rawTitle
      .replace(/[^a-zA-Z0-9\s'\-&]/g, "")
      .trim()
      .slice(0, 60) || `${opts.scene.slice(0, 40)} Word Search`

  return { title, words: trimmed, difficulty: opts.difficulty, engine: "llm" }
}

/* ------------------------------------------------------------------
   4.  Unified entry point — LLM if configured, otherwise rules
   ------------------------------------------------------------------ */
export async function generateWords(
  opts: GenerateWordsOptions
): Promise<GenerateWordsResult> {
  const scene = (opts.scene ?? "").trim()
  if (!scene) {
    throw new Error("Scene description is required")
  }
  if (scene.length > 600) {
    throw new Error("Scene is too long (max 600 characters)")
  }

  const apiKey = opts.apiKey ?? process.env.AI_API_KEY
  if (apiKey) {
    try {
      return await generateWordsByLLM(opts)
    } catch (err) {
      // fall through silently to rule engine — log for server-side debug
      console.warn("[ai-word-generator] LLM unavailable, falling back to rules:", (err as Error).message)
    }
  }
  return generateWordsByRule(scene, opts.difficulty)
}

export { DIFFICULTY_META }
