import NeuralWaveformWidget from '../components/neural/NeuralWaveformWidget'

const mono = "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace"
const sans = "'Inter', 'SF Pro Display', system-ui, sans-serif"

/* ─── Glass panel with 3D perspective tilt ─── */
const glass = {
  background: 'rgba(8, 14, 35, 0.5)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(80, 160, 255, 0.12)',
  borderRadius: 8,
  padding: '14px 16px',
  color: '#c0d8f8',
  fontSize: 11,
  fontFamily: mono,
  lineHeight: 1.6,
  boxShadow: '0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
}

const glassAccent = {
  ...glass,
  border: '1px solid rgba(80, 180, 255, 0.25)',
  boxShadow: '0 4px 30px rgba(0,0,0,0.4), 0 0 20px rgba(80,160,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
}

/* 3D tilted card — CSS perspective transform */
function TiltCard({ children, tiltX = 0, tiltY = 0, style = {} }) {
  return (
    <div style={{
      transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      transformStyle: 'preserve-3d',
      transition: 'transform 0.5s ease',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* Section label */
function Label({ children }) {
  return (
    <div style={{
      fontSize: 9, fontFamily: sans, fontWeight: 700,
      letterSpacing: '0.14em', color: 'rgba(130,180,255,0.45)',
      textTransform: 'uppercase', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

export default function Dashboard3D() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#04080f', position: 'relative',
      overflow: 'hidden', fontFamily: sans,
      perspective: '1200px',
    }}>
      {/* ━━━ 3D WAVEFORM BACKGROUND ━━━ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <NeuralWaveformWidget
          showSpeedControl={false}
          bloomIntensity={3.5}
          backgroundNodes={80}
          bgColor="#04080f"
        />
      </div>

      {/* ━━━ OVERLAY — all panels with 3D perspective ━━━ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        pointerEvents: 'none',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── TOP BAR — Holographic header ── */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', padding: '18px 32px',
        }}>
          <TiltCard tiltX={8} tiltY={0}>
            <div style={{
              ...glassAccent,
              padding: '10px 36px',
              fontSize: 14, fontFamily: sans,
              fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#e0ecff',
              display: 'flex', gap: 20, alignItems: 'center',
              background: 'rgba(8, 14, 35, 0.6)',
            }}>
              <span style={{ color: '#4fc3f7', textShadow: '0 0 12px rgba(79,195,247,0.4)' }}>AETHER</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ color: '#ffb74d', textShadow: '0 0 12px rgba(255,183,77,0.3)' }}>ACTIVE COMMUNICATION</span>
              <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 8px' }}>|</span>
              <span style={{ color: '#ffffff', fontFamily: mono, fontWeight: 700, fontSize: 16 }}>23:41:09</span>
            </div>
          </TiltCard>
        </div>

        {/* ── MAIN — Left cards, center open, right cards ── */}
        <div style={{
          flex: 1, display: 'flex',
          padding: '0 28px', gap: 20,
          alignItems: 'center',
        }}>

          {/* LEFT COLUMN — System Status cards with 3D tilt */}
          <div style={{
            width: 230, display: 'flex',
            flexDirection: 'column', gap: 14,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(200,220,255,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
              SYSTEM STATUS:
            </div>

            {/* Core card */}
            <TiltCard tiltX={2} tiltY={8}>
              <div style={glassAccent}>
                <Label>Core</Label>
                <svg width="100%" height="45" viewBox="0 0 200 45" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="coreGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#e1bee7" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,35 20,28 40,32 60,15 80,22 100,8 120,18 140,12 160,20 180,10 200,16"
                    fill="none" stroke="url(#coreGrad)" strokeWidth="2" />
                  <polyline points="0,38 20,34 40,36 60,28 80,30 100,20 120,26 140,22 160,28 180,18 200,24"
                    fill="none" stroke="#7e57c2" strokeWidth="1" opacity="0.5" />
                </svg>
              </div>
            </TiltCard>

            {/* Network card */}
            <TiltCard tiltX={2} tiltY={6}>
              <div style={glassAccent}>
                <Label>Network</Label>
                <svg width="100%" height="45" viewBox="0 0 200 45" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#81c784" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <polyline points="0,30 25,22 50,28 75,14 100,20 125,10 150,22 175,16 200,12"
                    fill="none" stroke="url(#netGrad)" strokeWidth="2" />
                </svg>
              </div>
            </TiltCard>

            {/* Processing card */}
            <TiltCard tiltX={2} tiltY={5}>
              <div style={glassAccent}>
                <Label>Processing</Label>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50 }}>
                  {[65, 80, 45, 90, 55, 85, 70, 95, 60, 75, 50, 88].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, borderRadius: 2, opacity: 0.8,
                      background: i % 3 === 0 ? '#ffb74d' : i % 3 === 1 ? '#4fc3f7' : '#7e57c2',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8, color: 'rgba(180,200,230,0.35)' }}>
                  <span>0000</span><span>0600</span><span>1200</span><span>1800</span>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* CENTER — waveform shows through */}
          <div style={{ flex: 1 }} />

          {/* RIGHT COLUMN — Data streams + code */}
          <div style={{
            width: 240, display: 'flex',
            flexDirection: 'column', gap: 14,
            flexShrink: 0,
          }}>
            {/* Data Streams */}
            <TiltCard tiltX={2} tiltY={-7}>
              <div style={glassAccent}>
                <Label>Data Streams:</Label>
                <div style={{ fontSize: 10.5, lineHeight: 1.8 }}>
                  <div><span style={{ color: '#81c784' }}>Query Log:</span> <span style={{ color: '#c0d8f8' }}>Processing</span></div>
                  <div style={{ color: 'rgba(160,190,230,0.4)', fontSize: 9 }}>(Stream 7. Session ID: AETHER UI_A7)</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: '#ffb74d' }}>User Input:</span> <span style={{ color: '#c0d8f8' }}>Active</span>
                  </div>
                  <div style={{ color: 'rgba(160,190,230,0.4)', fontSize: 9 }}>(Neural Core Sync)</div>
                </div>
              </div>
            </TiltCard>

            {/* Code stream */}
            <TiltCard tiltX={2} tiltY={-5}>
              <div style={{ ...glass, fontSize: 9.5, lineHeight: 1.7, maxHeight: 180, overflow: 'hidden' }}>
                <Label>Process Stream</Label>
                {[
                  { t: 'CORE_FUNC: initStream(', c: '#4fc3f7' },
                  { t: '  data_buffer,', c: 'rgba(180,200,230,0.5)' },
                  { t: '  model.weights', c: '#ffb74d' },
                  { t: ');', c: '#c0d8f8' },
                  { t: '', c: '' },
                  { t: 'SYNC_PROTOCOL {', c: '#ce93d8' },
                  { t: '  handshake: true,', c: 'rgba(180,200,230,0.5)' },
                  { t: '  latency: 0.3ms,', c: '#81c784' },
                  { t: '  bandwidth: optimal', c: '#81c784' },
                  { t: '}', c: '#ce93d8' },
                  { t: '', c: '' },
                  { t: '// Neural pathway active', c: 'rgba(140,160,200,0.3)' },
                  { t: 'TRANSMIT_RESULT(', c: '#4fc3f7' },
                  { t: '  accuracy: 98.6%', c: '#ffb74d' },
                  { t: ');', c: '#c0d8f8' },
                ].map((line, i) => (
                  <div key={i} style={{ color: line.c, whiteSpace: 'pre' }}>{line.t || '\u00A0'}</div>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>

        {/* ── BOTTOM — AI message with 3D float ── */}
        <div style={{
          padding: '0 32px 22px',
          display: 'flex', flexDirection: 'column',
          gap: 12, alignItems: 'center',
        }}>
          <TiltCard tiltX={-4} tiltY={0} style={{ width: '100%', maxWidth: 900 }}>
            <div style={{
              ...glassAccent,
              padding: '20px 28px',
              fontSize: 17, fontFamily: sans,
              lineHeight: 1.7, color: '#e8f0ff',
              textAlign: 'center',
              background: 'rgba(8, 14, 35, 0.6)',
            }}>
              &quot;Greetings, Human. I have completed the analysis of the requested data set.
              The current output shows a optimization curve of{' '}
              <span style={{ fontWeight: 700, color: '#ffb74d', fontSize: 20, textShadow: '0 0 14px rgba(255,183,77,0.4)' }}>98.6%</span>
              . Please provide your next instruction.&quot;
            </div>
          </TiltCard>

          {/* Footer status */}
          <div style={{
            display: 'flex', gap: 32,
            fontSize: 9, color: 'rgba(140,170,220,0.35)',
            fontFamily: mono, letterSpacing: '0.06em',
          }}>
            <span>CORE: <span style={{ color: '#4fc3f7' }}>Active</span></span>
            <span>NETWORK: <span style={{ color: '#81c784' }}>Optimal</span></span>
            <span>PROCESSING: <span style={{ color: '#ffb74d' }}>Peak</span></span>
            <span style={{ marginLeft: 24 }}>SESSION ID: AETHER-UI_X7</span>
            <span>TIMESTAMP: 23:41:09</span>
          </div>
        </div>
      </div>
    </div>
  )
}
