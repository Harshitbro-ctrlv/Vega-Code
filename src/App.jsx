import { useMemo, useState } from 'react'
import {
  ArrowRight, Braces, Check, ChevronDown, CircleAlert, Clock3,
  Code2, Copy, Gauge, Info, Layers3, LoaderCircle, RotateCcw,
  ShieldAlert, Sparkles, WandSparkles, Zap,
} from 'lucide-react'

const EXAMPLES = {
  javascript: `const groupBy = (items, keyFn) => {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
};

const orders = [
  { id: 1, status: "shipped" },
  { id: 2, status: "pending" },
  { id: 3, status: "shipped" },
];

console.log(groupBy(orders, order => order.status));`,
  python: `def merge_intervals(intervals):
    intervals.sort(key=lambda pair: pair[0])
    merged = []

    for start, end in intervals:
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)

    return merged`,
  sql: `SELECT
  c.name,
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS lifetime_value
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE c.created_at >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 3
ORDER BY lifetime_value DESC;`,
}

const LANGUAGES = ['Auto-detect', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'SQL', 'PHP']

function Logo() {
  return <div className="brand"><span className="brand-mark"><Braces size={19} /></span><span>Vega</span><b>AI</b></div>
}

function CodeInput({ code, setCode, language, setLanguage, depth, setDepth, onExplain, loading }) {
  const lines = useMemo(() => code.split('\n').length, [code])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return <section className="input-panel">
    <div className="panel-top">
      <div className="file-tab"><span className="js-icon">JS</span> snippet.js</div>
      <div className="panel-actions">
        <button className="icon-button" title="Copy code" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
        <button className="icon-button" title="Clear" onClick={() => setCode('')}><RotateCcw size={16} /></button>
      </div>
    </div>
    <div className="editor-shell">
      <div className="line-numbers" aria-hidden="true">{Array.from({ length: lines }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Paste your code here..."
        spellCheck="false"
        aria-label="Code to explain"
      />
    </div>
    <div className="input-footer">
      <label className="select-wrap">
        <Code2 size={15} />
        <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Programming language">
          {LANGUAGES.map(item => <option key={item}>{item}</option>)}
        </select>
        <ChevronDown size={14} />
      </label>
      <div className="depth-picker" aria-label="Explanation depth">
        {['quick', 'balanced', 'deep'].map(item => <button key={item} className={depth === item ? 'active' : ''} onClick={() => setDepth(item)}>{item}</button>)}
      </div>
      <button className="explain-button" onClick={onExplain} disabled={loading || !code.trim()}>
        {loading ? <LoaderCircle className="spin" size={18} /> : <WandSparkles size={18} />}
        {loading ? 'Tracing code…' : 'Explain code'}
        {!loading && <ArrowRight size={17} />}
      </button>
    </div>
  </section>
}

function EmptyResult() {
  return <div className="empty-result">
    <div className="orbit"><Sparkles size={27} /></div>
    <h2>Your explanation will appear here</h2>
    <p>Paste a snippet, choose how deep you want to go, and let Vega untangle it.</p>
    <div className="empty-pills"><span><Zap size={14} /> Fast</span><span><Layers3 size={14} /> Structured</span><span><Gauge size={14} /> Practical</span></div>
  </div>
}

function Result({ result }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const text = `${result.title}\n\n${result.summary}\n\n${result.steps?.map((s, i) => `${i + 1}. ${s.title}: ${s.explanation}`).join('\n') || ''}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return <article className="result-panel">
    <div className="result-header">
      <div><span className="eyebrow"><Sparkles size={13} /> AI explanation</span><h2>{result.title}</h2></div>
      <button className="copy-result" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}</button>
    </div>
    <div className="summary-card"><p>{result.summary}</p><span>{result.language}</span></div>

    {result.steps?.length > 0 && <section className="result-section">
      <h3><Layers3 size={17} /> How it works</h3>
      <div className="steps">{result.steps.map((step, i) => <div className="step" key={`${step.title}-${i}`}>
        <div className="step-number">{String(i + 1).padStart(2, '0')}</div>
        <div><div className="step-title">{step.title}{step.lines && <span>{step.lines}</span>}</div><p>{step.explanation}</p></div>
      </div>)}</div>
    </section>}

    {result.concepts?.length > 0 && <section className="result-section">
      <h3><Braces size={17} /> Key concepts</h3>
      <div className="concept-grid">{result.concepts.map((concept, i) => <div className="concept" key={`${concept.name}-${i}`}><b>{concept.name}</b><p>{concept.description}</p></div>)}</div>
    </section>}

    {result.complexity && <section className="result-section">
      <h3><Clock3 size={17} /> Complexity</h3>
      <div className="complexity-row"><div><span>TIME</span><b>{result.complexity.time}</b></div><div><span>SPACE</span><b>{result.complexity.space}</b></div><p>{result.complexity.note}</p></div>
    </section>}

    {result.issues?.length > 0 && <section className="result-section">
      <h3><ShieldAlert size={17} /> Things to notice</h3>
      <div className="issues">{result.issues.map((issue, i) => <div className={`issue ${issue.severity}`} key={`${issue.title}-${i}`}>
        {issue.severity === 'danger' ? <CircleAlert size={17} /> : <Info size={17} />}
        <div><b>{issue.title}</b><p>{issue.description}</p></div>
      </div>)}</div>
    </section>}
  </article>
}

export default function App() {
  const [code, setCode] = useState(EXAMPLES.javascript)
  const [language, setLanguage] = useState('Auto-detect')
  const [depth, setDepth] = useState('balanced')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const explain = async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, depth }),
      })
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error(
          response.status === 404
            ? 'The API is not deployed. Run Vega as a Render Web Service, not a Static Site.'
            : 'The server returned an unexpected response. Please try again.',
        )
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong.')
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const loadExample = (type) => {
    setCode(EXAMPLES[type]); setLanguage(type === 'sql' ? 'SQL' : type === 'python' ? 'Python' : 'JavaScript'); setResult(null); setError('')
  }

  return <div className="app">
    <header><Logo /><nav><a href="#workspace">Workspace</a><a href="#how">How it works</a></nav><div className="groq-badge"><span /> Powered by Groq</div></header>
    <main>
      <div className="hero">
        <div className="hero-kicker"><Sparkles size={14} /> Understand code. Not just syntax.</div>
        <h1>Turn confusing code into<br/><em>clear thinking.</em></h1>
        <p>Paste any snippet and get a thoughtful, structured explanation in seconds.</p>
        <div className="examples"><span>Try an example</span><button onClick={() => loadExample('javascript')}>JavaScript</button><button onClick={() => loadExample('python')}>Python</button><button onClick={() => loadExample('sql')}>SQL</button></div>
      </div>
      {error && <div className="error-banner"><CircleAlert size={17} /><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
      <div className="workspace" id="workspace">
        <CodeInput {...{ code, setCode, language, setLanguage, depth, setDepth, onExplain: explain, loading }} />
        <div className={`output-panel ${result ? 'has-result' : ''}`}>{result ? <Result result={result} /> : <EmptyResult />}</div>
      </div>
      <div className="trust-row" id="how"><span><b>01</b> Paste your code</span><i /><span><b>02</b> Pick your depth</span><i /><span><b>03</b> Get clarity</span></div>
    </main>
    <footer><Logo /><span>Built for curious developers.</span><span>Groq-powered · Your code is never stored</span></footer>
  </div>
}
