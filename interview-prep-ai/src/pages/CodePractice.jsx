
import { useState } from 'react'
import Layout from '../components/Layout'
import { groqChat } from '../services/groq'
import { useHistorySave } from '../hooks/useHistorySave'
import {
  Code2, Play, Sparkles, RefreshCw, RotateCcw,
  CheckCircle, XCircle, AlertCircle, BookOpen,
  FlaskConical, ChevronRight, ExternalLink, Plus, X, Wand2
} from 'lucide-react'
import styles from './CodePractice.module.css'

// ── Challenge bank ────────────────────────────────────────────────────────────
const CHALLENGES = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Arrays',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
  Input: nums = [2,7,11,15], target = 9
  Output: [0,1]
  Explanation: nums[0] + nums[1] = 2 + 7 = 9`,
    structures: `// Function signature:
function twoSum(nums, target) {
  // nums: number[]
  // target: number
  // return: number[]
}`,
    starterCode: `function twoSum(nums, target) {
  // Your solution here
  
}`,
    language: 'javascript',
    tests: [
      { desc: 'Basic case', input: 'nums=[2,7,11,15], target=9', expected: '[0,1]' },
      { desc: 'Non-adjacent', input: 'nums=[3,2,4], target=6', expected: '[1,2]' },
      { desc: 'Duplicates', input: 'nums=[3,3], target=6', expected: '[0,1]' },
    ],
    hint: 'Use a hash map to store seen values and their indices. O(n) solution.',
    resources: [
      { title: 'LeetCode #1 Two Sum', url: 'https://leetcode.com/problems/two-sum/', tag: 'Practice' },
      { title: 'Hash Map Explained', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map', tag: 'Docs' },
    ],
  },
  {
    id: 2, title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket.

Example:
  Input: s = "()[]{}"
  Output: true
  
  Input: s = "(]"
  Output: false`,
    structures: `// Function signature:
function isValid(s) {
  // s: string
  // return: boolean
}`,
    starterCode: `function isValid(s) {
  // Your solution here
  
}`,
    language: 'javascript',
    tests: [
      { desc: 'Simple valid', input: 's="()"', expected: 'true' },
      { desc: 'Multiple types', input: 's="()[]{}"', expected: 'true' },
      { desc: 'Wrong closing', input: 's="(]"', expected: 'false' },
      { desc: 'Wrong order', input: 's="([)]"', expected: 'false' },
    ],
    hint: 'Use a stack. Push opening brackets, pop and verify when you see closing brackets.',
    resources: [
      { title: 'LeetCode #20 Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', tag: 'Practice' },
      { title: 'Stack Data Structure', url: 'https://www.geeksforgeeks.org/stack-data-structure/', tag: 'Guide' },
    ],
  },
  {
    id: 3, title: 'Employee Data Management', difficulty: 'Beginner', category: 'OOP',
    description: `You are tasked with managing a list of employees with the following details: ID, Name, Age, and Salary. Implement a Manager struct/class that provides the following functionalities:

1. AddEmployee: Add a new employee to the list.
2. RemoveEmployee: Remove an employee based on their ID.
3. GetAverageSalary: Calculate the average salary of all employees.
4. FindEmployeeByID: Retrieve an employee's details by their ID.`,
    structures: `// Structures and Function Signatures:
class Employee {
  constructor(id, name, age, salary) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.salary = salary;
  }
}

class Manager {
  constructor() {
    this.employees = [];
  }
  // Implement the methods below
}`,
    starterCode: `class Employee {
  constructor(id, name, age, salary) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.salary = salary;
  }
}

class Manager {
  constructor() {
    this.employees = [];
  }

  addEmployee(employee) {
    // Your solution here
  }

  removeEmployee(id) {
    // Your solution here
  }

  getAverageSalary() {
    // Your solution here
  }

  findEmployeeByID(id) {
    // Your solution here
  }
}`,
    language: 'javascript',
    tests: [
      { desc: 'Add and find employee', input: 'add(1,"Alice",30,50000), findByID(1)', expected: 'Employee {id:1, name:"Alice"}' },
      { desc: 'Remove employee', input: 'add(1,"Alice"), remove(1), findByID(1)', expected: 'undefined/null' },
      { desc: 'Average salary', input: 'add salaries [50000,60000,70000]', expected: '60000' },
    ],
    hint: 'Use Array.filter() for remove, Array.find() for lookup, Array.reduce() for average.',
    resources: [
      { title: 'go-interview-practice', url: 'https://github.com/RezaSi/go-interview-practice', tag: 'Reference' },
      { title: 'MDN: Array Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array', tag: 'Docs' },
    ],
  },
  {
    id: 4, title: 'Flatten Nested Array', difficulty: 'Easy', category: 'Arrays',
    description: `Write a function flattenArray(arr) that takes a deeply nested array and returns a completely flat array containing all the values.

Example:
  Input: [1, [2, [3, [4]], 5]]
  Output: [1, 2, 3, 4, 5]

  Input: [[1, 2], [3, [4, 5]]]
  Output: [1, 2, 3, 4, 5]`,
    structures: `// Function signature:
function flattenArray(arr) {
  // arr: any[] (nested)
  // return: any[] (flat)
}`,
    starterCode: `function flattenArray(arr) {
  // Your solution here
  
}`,
    language: 'javascript',
    tests: [
      { desc: 'Deeply nested', input: '[1,[2,[3,[4]],5]]', expected: '[1,2,3,4,5]' },
      { desc: 'Already flat', input: '[1,2,3]', expected: '[1,2,3]' },
      { desc: 'Two levels', input: '[[1,2],[3,4]]', expected: '[1,2,3,4]' },
    ],
    hint: 'Use recursion or Array.prototype.flat(Infinity). Check if each element is an array.',
    resources: [
      { title: 'MDN: Array.flat()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat', tag: 'Docs' },
    ],
  },
  {
    id: 5, title: 'Binary Search', difficulty: 'Easy', category: 'Algorithms',
    description: `Given a sorted array of integers nums and a target value, return the index of the target. If the target is not found, return -1.

You must write an algorithm with O(log n) runtime complexity.

Example:
  Input: nums = [-1,0,3,5,9,12], target = 9
  Output: 4

  Input: nums = [-1,0,3,5,9,12], target = 2
  Output: -1`,
    structures: `// Function signature:
function binarySearch(nums, target) {
  // nums: number[] (sorted)
  // target: number
  // return: number (index or -1)
}`,
    starterCode: `function binarySearch(nums, target) {
  // Your solution here
  
}`,
    language: 'javascript',
    tests: [
      { desc: 'Target found', input: 'nums=[-1,0,3,5,9,12], target=9', expected: '4' },
      { desc: 'Target not found', input: 'nums=[-1,0,3,5,9,12], target=2', expected: '-1' },
      { desc: 'Single element', input: 'nums=[5], target=5', expected: '0' },
    ],
    hint: 'Use left=0, right=n-1. Calculate mid = Math.floor((left+right)/2). Adjust pointers based on comparison.',
    resources: [
      { title: 'Tech Interview Handbook: Binary Search', url: 'https://www.techinterviewhandbook.org/algorithms/binary-search/', tag: 'Interview' },
      { title: 'Visualgo: Binary Search', url: 'https://visualgo.net/en/bst', tag: 'Visual' },
    ],
  },
  {
    id: 6, title: 'Debounce Function', difficulty: 'Medium', category: 'JavaScript',
    description: `Implement a debounce(fn, delay) function that delays invoking fn until after delay milliseconds have elapsed since the last time the debounced function was invoked.

This is one of the most common JavaScript interview questions at top tech companies.

Example:
  const debouncedSearch = debounce(search, 300);
  // Calling debouncedSearch rapidly will only invoke search
  // once, 300ms after the last call.`,
    structures: `// Function signature:
function debounce(fn, delay) {
  // fn: Function
  // delay: number (milliseconds)
  // return: Function (debounced version)
}`,
    starterCode: `function debounce(fn, delay) {
  // Your solution here
  
}`,
    language: 'javascript',
    tests: [
      { desc: 'Multiple rapid calls', input: 'called 5 times in 100ms, delay=300ms', expected: 'fn called once after 300ms' },
      { desc: 'Single call', input: 'called once, delay=300ms', expected: 'fn called after 300ms' },
      { desc: 'Cancels previous timer', input: 'called at t=0, t=100, t=200, delay=300ms', expected: 'fn called at t=500' },
    ],
    hint: 'Use setTimeout and clearTimeout. Store the timer ID in a variable in the closure.',
    resources: [
      { title: 'Debounce vs Throttle', url: 'https://css-tricks.com/debouncing-throttling-explained-examples/', tag: 'Guide' },
      { title: 'Tech Interview Handbook: JS', url: 'https://www.techinterviewhandbook.org/front-end-interview-guidebook/javascript', tag: 'Interview' },
    ],
  },
]

const DIFF_COLOR = { Easy: '#22c55e', Beginner: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }
const TAG_COLORS = { Practice: '#6c63ff', Docs: '#0891b2', Guide: '#22c55e', Interview: '#f59e0b', Reference: '#a855f7', Visual: '#06b6d4' }

export default function CodePractice() {
  const [challenges, setChallenges] = useState(CHALLENGES)
  const [selectedId, setSelectedId] = useState(1)
  const [activeTab, setActiveTab] = useState('solution')
  const [codes, setCodes] = useState(() => Object.fromEntries(CHALLENGES.map(c => [c.id, c.starterCode])))
  const [testResults, setTestResults] = useState({})
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState(null)
  const { save } = useHistorySave()

  // Get More Challenges modal
  const [showModal, setShowModal] = useState(false)
  const [genDifficulty, setGenDifficulty] = useState('Medium')
  const [genCategory, setGenCategory] = useState('Arrays')
  const [genLanguage, setGenLanguage] = useState('javascript')
  const [genCount, setGenCount] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('')

  const challenge = challenges.find(c => c.id === selectedId) || challenges[0]
  const code = codes[selectedId] || challenge?.starterCode || ''
  const testResult = testResults[selectedId]
  const analysis = analyses[selectedId]

  const setCode = (val) => setCodes(prev => ({ ...prev, [selectedId]: val }))

  const handleSelect = (id) => {
    setSelectedId(id)
    setActiveTab('solution')
  }

  // ── Generate AI Challenges ──
  const handleGenerateChallenges = async () => {
    setGenerating(true)
    setGenStatus('Groq AI is generating challenges...')

    const prompt = `You are an expert coding interview question creator. Generate exactly ${genCount} unique ${genDifficulty} level coding challenges for ${genCategory} in ${genLanguage}.

For each challenge, output EXACTLY this format (no extra text):

CHALLENGE_START
TITLE: [Challenge title]
DIFFICULTY: ${genDifficulty}
CATEGORY: ${genCategory}
DESCRIPTION:
[Full problem description with examples, 4-8 lines]
SIGNATURE:
[Function/class signature with comments, 3-5 lines]
STARTER:
[Starter code with function signature and comment, 4-8 lines]
TEST_1: [test description] | INPUT: [input] | EXPECTED: [expected output]
TEST_2: [test description] | INPUT: [input] | EXPECTED: [expected output]
TEST_3: [test description] | INPUT: [input] | EXPECTED: [expected output]
HINT: [One sentence hint]
CHALLENGE_END

Generate all ${genCount} challenges now.`

    try {
      let raw = ''
      await groqChat(prompt, (_, full) => { raw = full; setGenStatus(`Generating... ${full.split('CHALLENGE_START').length - 1}/${genCount} done`) })

      const blocks = raw.split('CHALLENGE_START').slice(1).map(b => b.split('CHALLENGE_END')[0].trim())
      const newChallenges = blocks.map((block, idx) => {
        const get = (key) => {
          const m = block.match(new RegExp(key + ':\\s*([^\\n]+)'))
          return m?.[1]?.trim() || ''
        }
        const getMultiline = (key, nextKey) => {
          const m = block.match(new RegExp(key + ':\\n([\\s\\S]*?)(?=' + nextKey + ':|$)'))
          return m?.[1]?.trim() || ''
        }

        const tests = [1, 2, 3].map(n => {
          const m = block.match(new RegExp(`TEST_${n}:\\s*([^|]+)\\|\\s*INPUT:\\s*([^|]+)\\|\\s*EXPECTED:\\s*(.+)`))
          return m ? { desc: m[1].trim(), input: m[2].trim(), expected: m[3].trim() } : null
        }).filter(Boolean)

        const maxId = Math.max(...challenges.map(c => c.id), 100)
        return {
          id: maxId + idx + 1,
          title: get('TITLE') || `AI Challenge ${idx + 1}`,
          difficulty: get('DIFFICULTY') || genDifficulty,
          category: get('CATEGORY') || genCategory,
          description: getMultiline('DESCRIPTION', 'SIGNATURE'),
          structures: getMultiline('SIGNATURE', 'STARTER'),
          starterCode: getMultiline('STARTER', 'TEST_1'),
          language: genLanguage,
          tests: tests.length > 0 ? tests : [{ desc: 'Basic test', input: 'sample input', expected: 'expected output' }],
          hint: get('HINT') || 'Think about the time complexity.',
          resources: [
            { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org', tag: 'Interview' },
            { title: `Search: ${get('TITLE')} algorithm`, url: `https://www.google.com/search?q=${encodeURIComponent((get('TITLE') || '') + ' algorithm solution')}`, tag: 'Search' },
          ],
          isAI: true,
        }
      }).filter(c => c.title && c.description)

      if (newChallenges.length > 0) {
        setChallenges(prev => [...prev, ...newChallenges])
        setCodes(prev => ({ ...prev, ...Object.fromEntries(newChallenges.map(c => [c.id, c.starterCode])) }))
        setGenStatus(`✓ Added ${newChallenges.length} new challenges!`)
        setTimeout(() => { setShowModal(false); setGenStatus(''); setSelectedId(newChallenges[0].id); setActiveTab('solution') }, 1200)
      } else {
        setGenStatus('Could not parse challenges. Try again.')
      }
    } catch (e) {
      setGenStatus(`Error: ${e.message}`)
    }
    setGenerating(false)
  }

  // ── Run Tests via Groq AI ──
  const handleRunTests = async () => {
    setLoading(true)
    setLoadingType('tests')
    setActiveTab('tests')

    const prompt = `You are a code evaluator. Evaluate this ${challenge.language} solution for "${challenge.title}".

Problem: ${challenge.description}

Code:
\`\`\`${challenge.language}
${code}
\`\`\`

Test Cases:
${challenge.tests.map((t, i) => `Test ${i + 1} (${t.desc}): Input: ${t.input} | Expected: ${t.expected}`).join('\n')}

For each test, respond EXACTLY:
TEST_1: PASS|FAIL - reason
TEST_2: PASS|FAIL - reason
TEST_3: PASS|FAIL - reason
TEST_4: PASS|FAIL - reason (if exists)
PASSED: X of ${challenge.tests.length}`

    try {
      let raw = ''
      await groqChat(prompt, (_, full) => { raw = full })
      const results = challenge.tests.map((t, i) => {
        const m = raw.match(new RegExp(`TEST_${i + 1}:\\s*(PASS|FAIL)\\s*-?\\s*(.*)`, 'i'))
        return { ...t, passed: m?.[1]?.toUpperCase() === 'PASS', reason: m?.[2]?.trim() || '' }
      })
      const passed = results.filter(r => r.passed).length
      setTestResults(prev => ({ ...prev, [selectedId]: { results, passed, total: challenge.tests.length } }))
    } catch (e) {
      setTestResults(prev => ({ ...prev, [selectedId]: { error: e.message } }))
    }
    setLoading(false)
    setLoadingType(null)
  }

  // ── Submit Solution via Groq AI ──
  const handleSubmit = async () => {
    setLoading(true)
    setLoadingType('submit')
    setActiveTab('results')

    const prompt = `You are an expert code reviewer for technical interviews. Review this ${challenge.language} solution.

Problem: ${challenge.title} (${challenge.difficulty})
Description: ${challenge.description}

Submitted Code:
\`\`\`${challenge.language}
${code}
\`\`\`

Provide a structured code review:

## Correctness
[Is the solution correct? Any bugs or edge cases missed?]

## Time Complexity
[Big-O analysis with explanation]

## Space Complexity
[Space usage analysis]

## Code Quality
[Readability, naming conventions, structure — 2-3 points]

## Optimized Solution
[Show a cleaner/better version if applicable]

## Interview Score: X/10
[Score with brief justification]

Be specific, educational, and concise. Under 280 words.`

    try {
      let analysisText = ''
      await groqChat(prompt, (_, full) => {
        analysisText = full
        setAnalyses(prev => ({ ...prev, [selectedId]: full }))
      })
      // Auto-save to history
      const scoreM = analysisText.match(/Interview Score:\s*(\d+)\/10/i)
      const codeScore = scoreM ? parseInt(scoreM[1]) : null
      const tr = testResults[selectedId]
      save('code',
        `${challenge.title} — ${challenge.difficulty}`,
        `${challenge.language} · ${tr ? `${tr.passed}/${tr.total} tests` : 'No tests run'} · Score ${codeScore ?? '?'}/10`,
        codeScore,
        {
          challengeTitle: challenge.title,
          difficulty: challenge.difficulty,
          language: challenge.language,
          code,
          analysis: analysisText,
          testsPassed: tr?.passed ?? 0,
          testsTotal: tr?.total ?? challenge.tests.length,
        }
      )
    } catch (e) {
      setAnalyses(prev => ({ ...prev, [selectedId]: `Error: ${e.message}` }))
    }
    setLoading(false)
    setLoadingType(null)
  }

  const renderAnalysis = (text) => text?.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} className={styles.aH3}>{line.slice(3)}</h3>
    if (line.trim() === '') return <div key={i} style={{ height: 5 }} />
    return <p key={i} className={styles.aP}>{line}</p>
  })

  const scoreMatch = analysis?.match(/Interview Score:\s*(\d+)\/10/i)
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null
  const scoreColor = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444'

  return (
    <Layout>
      {/* ── Get More Challenges Modal ── */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}><Wand2 size={18} /> Generate AI Challenges</div>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Difficulty</label>
                  <div className={styles.modalChips}>
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button key={d} className={`${styles.modalChip} ${genDifficulty === d ? styles.modalChipActive : ''}`}
                        onClick={() => setGenDifficulty(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Language</label>
                  <div className={styles.modalChips}>
                    {['javascript', 'python', 'typescript'].map(l => (
                      <button key={l} className={`${styles.modalChip} ${genLanguage === l ? styles.modalChipActive : ''}`}
                        onClick={() => setGenLanguage(l)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Category</label>
                <div className={styles.modalChips}>
                  {['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting', 'Hash Maps', 'Stack/Queue', 'OOP', 'Recursion', 'Math'].map(c => (
                    <button key={c} className={`${styles.modalChip} ${genCategory === c ? styles.modalChipActive : ''}`}
                      onClick={() => setGenCategory(c)}>{c}</button>
                  ))}
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Number of Challenges</label>
                <div className={styles.modalChips}>
                  {[1, 2, 3, 5].map(n => (
                    <button key={n} className={`${styles.modalChip} ${genCount === n ? styles.modalChipActive : ''}`}
                      onClick={() => setGenCount(n)}>{n}</button>
                  ))}
                </div>
              </div>

              {genStatus && (
                <div className={`${styles.genStatus} ${genStatus.startsWith('✓') ? styles.genStatusOk : genStatus.startsWith('Error') ? styles.genStatusErr : styles.genStatusInfo}`}>
                  {generating && <RefreshCw size={13} className={styles.spin} />}
                  {genStatus}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.modalGenBtn} onClick={handleGenerateChallenges} disabled={generating}>
                {generating
                  ? <><RefreshCw size={14} className={styles.spin} /> Generating...</>
                  : <><Sparkles size={14} /> Generate {genCount} Challenge{genCount > 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.page}>
        {/* ── Page Header ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderIcon}><Code2 size={22} /></div>
          <div>
            <h1 className={styles.pageTitle}>Code & Test</h1>
            <p className={styles.pageSub}>Solve coding challenges · AI analyses your solution · Get interview-ready</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* ── LEFT: Problem panel ── */}
          <div className={styles.leftPanel}>
            {/* Challenge breadcrumb */}
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbLink}>Challenges</span>
              <ChevronRight size={12} className={styles.breadcrumbSep} />
              <span>Challenge {challenge.id}</span>
            </div>

            {/* Challenge header */}
            <div className={styles.challengeHeader}>
              <span className={styles.challengeTitle}>Challenge {challenge.id}: {challenge.title}</span>
              <span className={styles.diffBadge} style={{ background: `${DIFF_COLOR[challenge.difficulty]}18`, color: DIFF_COLOR[challenge.difficulty], borderColor: `${DIFF_COLOR[challenge.difficulty]}44` }}>
                {challenge.difficulty}
              </span>
            </div>

            {/* Challenge list */}
            <div className={styles.challengeList}>
              {challenges.map(c => (
                <button
                  key={c.id}
                  className={`${styles.challengeItem} ${selectedId === c.id ? styles.challengeItemActive : ''}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <span className={styles.challengeNum}>{c.id}</span>
                  <span className={styles.challengeName}>{c.title}</span>
                  <div className={styles.challengeRight}>
                    {c.isAI && <span className={styles.aiTag}><Sparkles size={9} /></span>}
                    <span className={styles.challengeDiff} style={{ color: DIFF_COLOR[c.difficulty] }}>{c.difficulty}</span>
                  </div>
                </button>
              ))}
              {/* Get More Challenges button */}
              <button className={styles.getMoreBtn} onClick={() => setShowModal(true)}>
                <Plus size={14} /> Get More Challenges
              </button>
            </div>

            {/* Problem statement */}
            <div className={styles.problemSection}>
              <h2 className={styles.problemTitle}>Challenge {challenge.id}: {challenge.title}</h2>

              <h3 className={styles.problemSectionTitle}>Problem Statement</h3>
              <pre className={styles.problemDesc}>{challenge.description}</pre>

              <h3 className={styles.problemSectionTitle}>Structures and Function Signatures</h3>
              <pre className={styles.codeBlock}>{challenge.structures}</pre>
            </div>
          </div>

          {/* ── RIGHT: Editor panel ── */}
          <div className={styles.rightPanel}>
            {/* Tab bar — matches screenshot exactly */}
            <div className={styles.tabBar}>
              {[
                { id: 'solution', label: 'Solution' },
                { id: 'tests',    label: 'Tests' },
                { id: 'results',  label: 'Results' },
                { id: 'learning', label: 'Learning Materials' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── SOLUTION TAB ── */}
            {activeTab === 'solution' && (
              <div className={styles.editorWrap}>
                <div className={styles.editorToolbar}>
                  <span className={styles.langTag}>{challenge.language}</span>
                  <button className={styles.resetBtn} onClick={() => setCode(challenge.starterCode)}>
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
                <div className={styles.editorBody}>
                  <div className={styles.lineNums}>
                    {code.split('\n').map((_, i) => (
                      <div key={i} className={styles.lineNum}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    className={styles.codeArea}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
              </div>
            )}

            {/* ── TESTS TAB ── */}
            {activeTab === 'tests' && (
              <div className={styles.testsWrap}>
                {!testResult && !loading && (
                  <div className={styles.tabEmpty}>
                    <FlaskConical size={28} className={styles.tabEmptyIcon} />
                    <p>Click "Run Tests" to evaluate your solution against all test cases</p>
                  </div>
                )}
                {loading && loadingType === 'tests' && (
                  <div className={styles.tabLoading}>
                    <RefreshCw size={18} className={styles.spin} />
                    <span>AI is running your tests...</span>
                  </div>
                )}
                {testResult && !testResult.error && (
                  <>
                    <div className={styles.testSummaryBar} style={{ background: testResult.passed === testResult.total ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)', borderColor: testResult.passed === testResult.total ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)' }}>
                      <span style={{ color: testResult.passed === testResult.total ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                        {testResult.passed}/{testResult.total} tests passed
                      </span>
                    </div>
                    {testResult.results.map((r, i) => (
                      <div key={i} className={`${styles.testCase} ${r.passed ? styles.testPass : styles.testFail}`}>
                        <div className={styles.testCaseHeader}>
                          {r.passed ? <CheckCircle size={15} className={styles.passIcon} /> : <XCircle size={15} className={styles.failIcon} />}
                          <span className={styles.testCaseTitle}>Test {i + 1}: {r.desc}</span>
                        </div>
                        <div className={styles.testCaseBody}>
                          <div className={styles.testRow}><span className={styles.testLabel}>Input:</span><code className={styles.testCode}>{r.input}</code></div>
                          <div className={styles.testRow}><span className={styles.testLabel}>Expected:</span><code className={styles.testCode}>{r.expected}</code></div>
                          {r.reason && <div className={styles.testRow}><span className={styles.testLabel}>AI:</span><span className={styles.testReason}>{r.reason}</span></div>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── RESULTS TAB ── */}
            {activeTab === 'results' && (
              <div className={styles.resultsWrap}>
                {!analysis && !loading && (
                  <div className={styles.tabEmpty}>
                    <Sparkles size={28} className={styles.tabEmptyIcon} />
                    <p>Click "Submit Solution" to get a full AI code review with score</p>
                  </div>
                )}
                {loading && loadingType === 'submit' && (
                  <div className={styles.tabLoading}>
                    <RefreshCw size={18} className={styles.spin} />
                    <span>Groq AI is reviewing your code...</span>
                  </div>
                )}
                {analysis && (
                  <div className={styles.analysisWrap}>
                    {score !== null && (
                      <div className={styles.scoreCard}>
                        <div className={styles.scoreBig} style={{ color: scoreColor }}>{score}/10</div>
                        <div>
                          <div className={styles.scoreTitle}>Interview Score</div>
                          <div className={styles.scoreDesc}>{score >= 8 ? 'Excellent solution!' : score >= 6 ? 'Good, with room to improve' : 'Needs more work'}</div>
                        </div>
                      </div>
                    )}
                    <div className={styles.analysisBody}>{renderAnalysis(analysis)}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── LEARNING MATERIALS TAB ── */}
            {activeTab === 'learning' && (
              <div className={styles.learningWrap}>
                <div className={styles.learningTitle}>Resources for: {challenge.title}</div>
                <div className={styles.learningHint}>
                  <AlertCircle size={13} /> Study these resources to understand the concepts behind this challenge
                </div>
                <div className={styles.learningList}>
                  {challenge.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer" className={styles.learningItem}>
                      <span className={styles.learningTag} style={{ background: `${TAG_COLORS[r.tag] || '#888'}18`, color: TAG_COLORS[r.tag] || '#888', borderColor: `${TAG_COLORS[r.tag] || '#888'}44` }}>
                        {r.tag}
                      </span>
                      <span className={styles.learningName}>{r.title}</span>
                      <ExternalLink size={13} className={styles.learningArrow} />
                    </a>
                  ))}
                  <a href="https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/" target="_blank" rel="noreferrer" className={styles.learningItem}>
                    <span className={styles.learningTag} style={{ background: '#f59e0b18', color: '#f59e0b', borderColor: '#f59e0b44' }}>Interview</span>
                    <span className={styles.learningName}>Tech Interview Handbook — Algorithm Cheatsheet</span>
                    <ExternalLink size={13} className={styles.learningArrow} />
                  </a>
                  <a href="https://visualgo.net" target="_blank" rel="noreferrer" className={styles.learningItem}>
                    <span className={styles.learningTag} style={{ background: '#06b6d418', color: '#06b6d4', borderColor: '#06b6d444' }}>Visual</span>
                    <span className={styles.learningName}>VisuAlgo — Algorithm Visualizations</span>
                    <ExternalLink size={13} className={styles.learningArrow} />
                  </a>
                  <a href="https://neetcode.io" target="_blank" rel="noreferrer" className={styles.learningItem}>
                    <span className={styles.learningTag} style={{ background: '#6c63ff18', color: '#6c63ff', borderColor: '#6c63ff44' }}>Practice</span>
                    <span className={styles.learningName}>NeetCode — Curated Problem List with Solutions</span>
                    <ExternalLink size={13} className={styles.learningArrow} />
                  </a>
                </div>

                {/* Hint */}
                <div className={styles.hintBox}>
                  <div className={styles.hintTitle}>💡 Hint for this challenge</div>
                  <p className={styles.hintText}>{challenge.hint}</p>
                </div>
              </div>
            )}

            {/* ── Action buttons — matches screenshot ── */}
            <div className={styles.actionBar}>
              <button className={styles.runBtn} onClick={handleRunTests} disabled={loading}>
                {loading && loadingType === 'tests'
                  ? <><RefreshCw size={14} className={styles.spin} /> Running...</>
                  : <><Play size={14} /> Run Tests</>}
              </button>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
                {loading && loadingType === 'submit'
                  ? <><RefreshCw size={14} className={styles.spin} /> Analyzing...</>
                  : <><Sparkles size={14} /> Submit Solution</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
