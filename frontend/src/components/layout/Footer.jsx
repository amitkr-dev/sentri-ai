import { Zap, Github } from 'lucide-react'

const LINKS = [
  { label: 'Features',   href: '#features' },
  { label: 'How It Works', href: '#how'   },
  { label: 'Risk Engine', href: '#risk'   },
  { label: 'Rescue Mode', href: '#rescue' },
  { label: 'GitHub',     href: '#'        },
  { label: 'Privacy',    href: '#'        },
]

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center" style={{ boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-base font-black">Sentri<span className="text-primary">.</span></span>
          </div>
          <div className="text-xs text-zinc-700">Predict. Rescue. Finish.</div>
          <div className="text-xs text-zinc-800 mt-1">Built for Google × Coding Ninjas Vibe2Ship 2026</div>
        </div>

        <div className="flex gap-6 flex-wrap justify-center">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors duration-200">
              {l.label}
            </a>
          ))}
        </div>

        <div className="text-xs text-zinc-800">© 2026 Sentri</div>
      </div>
    </footer>
  )
}
