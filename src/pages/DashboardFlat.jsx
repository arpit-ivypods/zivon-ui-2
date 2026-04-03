import NeuralWaveformWidget from '../components/neural/NeuralWaveformWidget'

const mono = "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace"
const sans = "'Inter', 'SF Pro Display', system-ui, sans-serif"

const codeLines = [
  'CORE_PROCESS: SYNCED',
  'NLP_STATUS: ACTIVE',
  'NLP_INPUT_STREAM',
  '',
  'ANALYSIS_STREAM {',
  '  ...',
  '}',
  '',
  'NCP_PROCES_STREAM {',
  '  name;',
  '}',
  '',
  'ANALYSIS_STREAM {',
  '  [User Input: {',
  '    memory.long_store];',
  '  }',
  '  obj;',
  '}',
]

const statusItems = [
  { label: 'Core', value: 'Active', color: '#4fc3f7' },
  { label: 'Network', value: 'Optimal', color: '#81c784' },
  { label: 'Processing', value: 'Peak', color: '#ffb74d' },
]

const dataStreams = [
  '[Query Log: Processing].',
  '[User Input: Active].',
  '[Memory: Indexed].',
]

const glassPanel = {
  background: 'rgba(10, 18, 40, 0.55)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(100, 160, 255, 0.15)',
  borderRadius: 6,
  padding: '12px 14px',
  color: '#c0d8f8',
  fontSize: 11,
  fontFamily: mono,
  lineHeight: 1.6,
}

const accentBorder = {
  borderColor: 'rgba(100, 180, 255, 0.3)',
}

export default function DashboardFlat() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#060a14',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: sans,
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <NeuralWaveformWidget
          showSpeedControl={false}
          bloomIntensity={3.0}
          backgroundNodes={70}
          bgColor="#060a14"
        />
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
        }}>
          <div style={{
            ...glassPanel, ...accentBorder,
            padding: '8px 20px', fontSize: 13, fontFamily: sans,
            fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#e0ecff', display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <span style={{ color: '#4fc3f7' }}>AETHER</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
            <span style={{ color: '#ffb74d' }}>ACTIVE COMMUNICATION</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ ...glassPanel, padding: '6px 14px', fontSize: 10, color: 'rgba(200,220,255,0.6)', letterSpacing: '0.08em' }}>
              SESSION ID: AETHER-UI_X7
            </div>
            <div style={{ ...glassPanel, ...accentBorder, padding: '8px 16px', fontSize: 18, fontWeight: 700, color: '#ffffff', fontFamily: mono, letterSpacing: '0.06em' }}>
              23:41:09
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', padding: '0 24px 20px', gap: 16 }}>
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <div style={{ ...glassPanel, flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 9, fontFamily: sans, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(150,190,255,0.5)', marginBottom: 10, textTransform: 'uppercase' }}>
                Core Process Stream
              </div>
              {codeLines.map((line, i) => (
                <div key={i} style={{
                  color: line.includes(':') ? '#4fc3f7' : line.includes('{') || line.includes('}') ? '#c0d8f8' : line.includes('[') ? '#ffb74d' : 'rgba(180,200,230,0.5)',
                  fontSize: 10.5, whiteSpace: 'pre',
                }}>{line || '\u00A0'}</div>
              ))}
            </div>
            <div style={{ ...glassPanel, padding: '10px 14px' }}>
              <div style={{ fontSize: 9, fontFamily: sans, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(150,190,255,0.5)', marginBottom: 8, textTransform: 'uppercase' }}>
                Core&apos;s Process Visualization
              </div>
              <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} style={{ flex: 1, background: `rgba(79, 195, 247, ${0.3 + Math.random() * 0.5})`, height: `${15 + Math.random() * 85}%`, borderRadius: 1 }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <div style={{ ...glassPanel }}>
              <div style={{ fontSize: 9, fontFamily: sans, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(150,190,255,0.5)', marginBottom: 10, textTransform: 'uppercase' }}>Computation Status</div>
              <svg width="100%" height="40" viewBox="0 0 170 40" style={{ display: 'block', marginBottom: 10 }}>
                <polyline points="0,30 15,20 30,25 45,10 60,18 75,8 90,22 105,15 120,12 135,20 150,5 170,15" fill="none" stroke="#4fc3f7" strokeWidth="1.5" opacity="0.7" />
                <polyline points="0,35 15,28 30,32 45,22 60,30 75,18 90,28 105,25 120,20 135,28 150,18 170,22" fill="none" stroke="#ffb74d" strokeWidth="1.5" opacity="0.5" />
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 9 }}>
                <span><span style={{ color: '#4fc3f7' }}>●</span> Core Efficiency</span>
                <span><span style={{ color: '#ffb74d' }}>●</span> Bandwidth</span>
              </div>
            </div>
            <div style={{ ...glassPanel }}>
              <div style={{ fontSize: 9, fontFamily: sans, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(150,190,255,0.5)', marginBottom: 10, textTransform: 'uppercase' }}>User Modulation</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 50 }}>
                {[85, 60, 90, 45, 75, 95, 70].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i < 3 ? '#7e57c2' : i < 5 ? '#ffb74d' : '#4fc3f7', borderRadius: 2, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(180,200,230,0.4)', marginTop: 4 }}>
                <span>Mon</span><span>Thu</span><span>Sun</span>
              </div>
            </div>
            <div style={{ ...glassPanel }}>
              <div style={{ fontSize: 9, fontFamily: sans, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(150,190,255,0.5)', marginBottom: 8, textTransform: 'uppercase' }}>Live Metrics</div>
              {[
                { label: 'Throughput', val: '2.4 TB/s', color: '#4fc3f7' },
                { label: 'Latency', val: '0.3 ms', color: '#81c784' },
                { label: 'Accuracy', val: '98.6%', color: '#ffb74d' },
                { label: 'Uptime', val: '99.97%', color: '#ce93d8' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: '1px solid rgba(100,160,255,0.06)' }}>
                  <span style={{ color: 'rgba(180,200,230,0.6)' }}>{m.label}</span>
                  <span style={{ color: m.color, fontWeight: 600 }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...glassPanel, ...accentBorder, padding: '18px 24px', fontSize: 16, fontFamily: sans, lineHeight: 1.7, color: '#e8f0ff', maxWidth: 780 }}>
            <span style={{ fontWeight: 700, color: '#4fc3f7', fontSize: 17 }}>AETHER: </span>
            <span style={{ color: 'rgba(230,240,255,0.9)' }}>
              &quot;Greetings, Human. I have completed the analysis of the requested data set. The current output shows a optimization curve of{' '}
            </span>
            <span style={{ fontWeight: 700, color: '#ffb74d', fontSize: 18 }}>98.6%</span>
            <span style={{ color: 'rgba(230,240,255,0.9)' }}>. Please provide your next instruction.&quot;</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ ...glassPanel, padding: '8px 16px', display: 'flex', gap: 20, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ffb74d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>System Status:</span>
              {statusItems.map((s, i) => (
                <span key={i} style={{ fontSize: 10 }}>
                  <span style={{ color: 'rgba(180,200,230,0.5)' }}>{s.label}: </span>
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>
                </span>
              ))}
            </div>
            <div style={{ ...glassPanel, padding: '8px 16px', display: 'flex', gap: 6, flexDirection: 'column' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ffb74d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Data Streams:</span>
              {dataStreams.map((d, i) => (
                <span key={i} style={{ fontSize: 10, color: 'rgba(180,200,230,0.6)' }}>{d}</span>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 9, color: 'rgba(150,180,220,0.4)', fontFamily: mono, letterSpacing: '0.06em' }}>SESSION ID: AETHER-UI_X7</span>
              <span style={{ fontSize: 9, color: 'rgba(150,180,220,0.4)', fontFamily: mono, letterSpacing: '0.06em' }}>TIMESTAMP: 23:41:09</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
