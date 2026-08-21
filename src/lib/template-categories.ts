/**
 * 模板分类元数据 —— 共享给 /theme/[name]、/grade/[level] 动态路由和 sitemap.ts
 *
 * 提取到独立文件的原因：
 * 1. 让动态路由的 generateStaticParams / generateMetadata 与 sitemap 共享同一数据源
 * 2. 避免在多个 server component 中重复定义
 */

export interface ThemeCategory {
  name: string
  slug: string
  emoji: string
  title: string
  subtitle: string
  description: string // 用于 metadata.description 和页面 H1
  keywords: string[]
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    name: "Animals",
    slug: "animals",
    emoji: "🐾",
    title: "Animal Word Search Puzzles for Kids",
    subtitle: "From farmyard friends to fierce dinosaurs — perfect for young animal lovers.",
    description:
      "Free printable animal word search puzzles for kids. Farm animals, zoo animals, dinosaurs, birds, insects, and pets — fun vocabulary activities for classrooms and home.",
    keywords: [
      "animal word search",
      "animals word puzzle",
      "farm animals word search",
      "zoo animals puzzle",
      "dinosaurs word search",
      "birds word search",
      "insects word search",
      "pets word search",
      "printable animal puzzle",
    ],
  },
  {
    name: "Food",
    slug: "food",
    emoji: "🍎",
    title: "Food & Snack Word Search Puzzles",
    subtitle: "Breakfast, vegetables, desserts and more — tasty vocabulary for every meal.",
    description:
      "Free printable food word search puzzles for kids. Snacks, vegetables, fruits, desserts, and breakfast foods — delicious vocabulary activities for classrooms.",
    keywords: [
      "food word search",
      "snacks word puzzle",
      "vegetables word search",
      "fruit word search",
      "breakfast word search",
      "dessert word search",
      "printable food puzzle",
    ],
  },
  {
    name: "Nature",
    slug: "nature",
    emoji: "🌿",
    title: "Nature Word Search Puzzles",
    subtitle: "Weather, trees, flowers, mountains — explore the natural world through words.",
    description:
      "Free printable nature word search puzzles for kids. Weather, trees, flowers, mountains, and seasons — explore the natural world through vocabulary activities.",
    keywords: [
      "nature word search",
      "weather word puzzle",
      "trees word search",
      "flowers word search",
      "seasons word search",
      "mountains word search",
      "printable nature puzzle",
    ],
  },
  {
    name: "Science",
    slug: "science",
    emoji: "🔬",
    title: "Science Word Search Puzzles for Students",
    subtitle: "Space, chemistry, the human body and weather science for curious minds.",
    description:
      "Free printable science word search puzzles for students. Space, chemistry, human body, weather, and biology — vocabulary activities for science classrooms.",
    keywords: [
      "science word search",
      "space word puzzle",
      "chemistry word search",
      "human body word search",
      "biology word search",
      "weather science word search",
      "printable science puzzle",
    ],
  },
  {
    name: "Geography",
    slug: "geography",
    emoji: "🌍",
    title: "Geography Word Search Puzzles",
    subtitle: "Continents, landforms, US states and world capitals for young explorers.",
    description:
      "Free printable geography word search puzzles for kids. Continents, US states, world capitals, landforms, and maps — vocabulary activities for geography classrooms.",
    keywords: [
      "geography word search",
      "continents word puzzle",
      "US states word search",
      "world capitals word search",
      "landforms word search",
      "maps word search",
      "printable geography puzzle",
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    emoji: "⚽",
    title: "Sports Word Search Puzzles",
    subtitle: "Basketball, soccer, Olympics and more — active vocabulary for sports fans.",
    description:
      "Free printable sports word search puzzles for kids. Basketball, soccer, Olympics, football, and baseball — active vocabulary activities for sports-loving students.",
    keywords: [
      "sports word search",
      "basketball word puzzle",
      "soccer word search",
      "Olympics word search",
      "football word search",
      "baseball word search",
      "printable sports puzzle",
    ],
  },
  {
    name: "Art",
    slug: "art",
    emoji: "🎨",
    title: "Art & Creativity Word Search Puzzles",
    subtitle: "Drawing, painting, colors and sculpture — vocabulary for budding young artists.",
    description:
      "Free printable art word search puzzles for kids. Colors, painting, drawing, sculpture, and music — creative vocabulary activities for art classrooms.",
    keywords: [
      "art word search",
      "colors word puzzle",
      "painting word search",
      "drawing word search",
      "sculpture word search",
      "music word search",
      "printable art puzzle",
    ],
  },
  {
    name: "Shopping",
    slug: "shopping",
    emoji: "🛒",
    title: "Shopping Word Search Puzzles",
    subtitle: "Supermarket, checkout, coupons and more — everyday shopping vocabulary for kids.",
    description:
      "Free printable shopping word search puzzles for kids. Supermarket, checkout, coupons, clothing, and money — everyday vocabulary activities for life skills classrooms.",
    keywords: [
      "shopping word search",
      "supermarket word puzzle",
      "money word search",
      "checkout word search",
      "coupons word search",
      "printable shopping puzzle",
    ],
  },
  {
    name: "Family",
    slug: "family",
    emoji: "👨‍👩‍👧",
    title: "Family Word Search Puzzles",
    subtitle: "Family members, friends, cousins and celebrations — words about the people we love.",
    description:
      "Free printable family word search puzzles for kids. Family members, relatives, friends, celebrations, and holidays — vocabulary activities about the people we love.",
    keywords: [
      "family word search",
      "family members word puzzle",
      "relatives word search",
      "friends word search",
      "celebrations word search",
      "printable family puzzle",
    ],
  },
  {
    name: "Emotions",
    slug: "emotions",
    emoji: "😊",
    title: "Emotions & Feelings Word Search Puzzles",
    subtitle: "Feelings, happiness, confidence and patience — vocabulary for little hearts.",
    description:
      "Free printable emotions and feelings word search puzzles for kids. Happiness, sadness, confidence, patience, and empathy — vocabulary activities for social-emotional learning.",
    keywords: [
      "emotions word search",
      "feelings word puzzle",
      "happiness word search",
      "empathy word search",
      "social emotional learning word search",
      "printable emotions puzzle",
    ],
  },
  {
    name: "Clothes",
    slug: "clothes",
    emoji: "👕",
    title: "Clothes Word Search Puzzles",
    subtitle: "Tops, pants, shoes and accessories — everyday clothing vocabulary for kids.",
    description:
      "Free printable clothes word search puzzles for kids. Tops, pants, shoes, accessories, and seasons — everyday clothing vocabulary activities for ESL and early learners.",
    keywords: [
      "clothes word search",
      "clothing word puzzle",
      "shoes word search",
      "accessories word search",
      "ESL clothing word search",
      "printable clothes puzzle",
    ],
  },
]

export interface GradeCategory {
  name: string
  slug: string
  title: string
  shortName: string
  description: string
  keywords: string[]
  /** 对应 GRADE_TEMPLATES 中 template.slug 的列表 */
  templateSlugs: string[]
}

export const GRADE_CATEGORIES: GradeCategory[] = [
  {
    name: "Pre-K",
    slug: "pre-k",
    title: "Pre-K Sight Word Search Puzzles (Dolch Pre-Primer)",
    shortName: "Pre-K",
    description:
      "Free printable Pre-K sight word search puzzles using Dolch Pre-Primer words. Simple 2-3 letter words in a small grid — perfect for preschoolers learning to read.",
    keywords: [
      "pre-k word search",
      "preschool word search",
      "dolch pre-primer word search",
      "sight words pre-k",
      "preschool sight words",
      "printable pre-k word search",
    ],
    templateSlugs: ["dolch-pre-k"],
  },
  {
    name: "Kindergarten",
    slug: "kindergarten",
    title: "Kindergarten Sight Word Search Puzzles (Dolch Primer)",
    shortName: "Kindergarten",
    description:
      "Free printable kindergarten sight word search puzzles using Dolch Primer words. Simple vocabulary in a friendly grid — perfect for kindergarten reading practice.",
    keywords: [
      "kindergarten word search",
      "dolch primer word search",
      "sight words kindergarten",
      "kindergarten reading activities",
      "printable kindergarten word search",
    ],
    templateSlugs: ["dolch-kindergarten"],
  },
  {
    name: "First Grade",
    slug: "first-grade",
    title: "1st Grade Spelling & Vocabulary Word Search Puzzles",
    shortName: "1st Grade",
    description:
      "Free printable 1st grade word search puzzles with spelling and vocabulary words aligned to Common Core. Perfect for first grade reading practice and spelling review.",
    keywords: [
      "first grade word search",
      "1st grade word search",
      "first grade spelling words",
      "grade 1 vocabulary word search",
      "first grade common core words",
      "printable 1st grade word search",
    ],
    templateSlugs: ["first-grade-basic"],
  },
  {
    name: "Second Grade",
    slug: "second-grade",
    title: "2nd Grade Vocabulary Word Search Puzzles",
    shortName: "2nd Grade",
    description:
      "Free printable 2nd grade word search puzzles with vocabulary words aligned to Common Core. Perfect for second grade spelling practice and vocabulary building.",
    keywords: [
      "second grade word search",
      "2nd grade word search",
      "second grade vocabulary words",
      "grade 2 spelling word search",
      "second grade common core words",
      "printable 2nd grade word search",
    ],
    templateSlugs: ["second-grade-vocab"],
  },
]

/**
 * 工具函数：按 slug 查找主题分类
 */
export function findThemeBySlug(slug: string): ThemeCategory | undefined {
  return THEME_CATEGORIES.find((t) => t.slug === slug)
}

/**
 * 工具函数：按 slug 查找年级分类
 */
export function findGradeBySlug(slug: string): GradeCategory | undefined {
  return GRADE_CATEGORIES.find((g) => g.slug === slug)
}
