/**
 * FAQ 数据 —— 同时用于 FAQ 页面渲染和 FAQPage 结构化数据
 * 提取到独立文件是为了让 server component (layout.tsx) 也能访问数据生成 JSON-LD
 */
export interface FaqItem {
  question: string
  answer: string
}

export const FAQS: FaqItem[] = [
  {
    question: "Is the word search generator free to use?",
    answer:
      "Yes! The Free plan lets you create and print word search puzzles at no cost. You get 50 credits per month, up to 40 words per puzzle, and can save up to 100 puzzles in your account. If you need more, upgrade to Basic or Pro for additional credits and features.",
  },
  {
    question: "Do I need to create an account to make a puzzle?",
    answer:
      "No account is required to start. Just go to the Word Search Maker, enter your words, and generate a puzzle. Creating a free account will let you save your puzzles, sync them across devices, and keep track of your remaining credits.",
  },
  {
    question: "How many words can I put in a single puzzle?",
    answer:
      "You can include up to 40 words per puzzle. Each word should be between 2 and 35 letters long. Numbers and symbols are automatically filtered out — only letters are used. Tip: short-to-medium words place more reliably than very long ones.",
  },
  {
    question: "Can I print or download my puzzle?",
    answer:
      "Absolutely. Every puzzle has a Print button that opens your browser's print dialog, formatted for A4 and Letter paper. You can also download the puzzle as an HTML file to print later, or save it directly to your account as a PDF (Basic / Pro plans).",
  },
  {
    question: "How do I see the answer key for a puzzle?",
    answer:
      "After generating a puzzle, click the 'Show Answers' button above the grid. All placed words will be highlighted so you can grade student work or check your own. Click 'Hide Answers' to return to the normal puzzle view.",
  },
  {
    question: "Why are some of my words not placed in the grid?",
    answer:
      "The generator tries its best to place every word, but sometimes the grid runs out of room or there are too many conflicts. Long words especially are harder to fit. You'll see unplaced words listed after you generate. Try enabling diagonals and backward placement, reducing the number of long words, or generating again — the placement is randomized each time.",
  },
  {
    question: "What difficulty options are there?",
    answer:
      "You can switch between UPPERCASE and lowercase letters, restrict words to horizontal and vertical only, add diagonals, or allow backwards words for a harder challenge. Font size (Small / Medium / Large) and paper size (A4 / Letter) are also adjustable in the paid plans.",
  },
  {
    question: "Can I use these puzzles in my classroom or school?",
    answer:
      "Yes. Free, Basic, and Pro plans all include classroom use for individual teachers. If you need a school- or district-wide license with team billing, bulk puzzle generation, or custom branding, please contact us about a team plan.",
  },
]
