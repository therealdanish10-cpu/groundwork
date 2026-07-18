import type { Metadata } from 'next';
import Image from 'next/image';
import Reveal from '../components/Reveal';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet the Groundwork Technologies team — the people helping local trade businesses get online, get found, and grow.',
};

/* ── Team data ────────────────────────────────────────────────────────────
   Set photoUrl to a path string once a real photo is available.
   For now, null = render an initials avatar using avatarBg / avatarColor.
─────────────────────────────────────────────────────────────────────── */
interface TeamMember {
  name:        string;
  role:        string;
  photoUrl:    string | null;
  initials:    string;
  avatarBg:    string;
  avatarColor: string;
}

const TEAM: TeamMember[] = [
  {
    name:        'James Haungs',
    role:        'Founder',
    photoUrl:    null,
    initials:    'JH',
    avatarBg:    '#7c5cd6',   // violet
    avatarColor: '#ffffff',
  },
  {
    name:        'Allah Ditta',
    role:        'Co-founder & CEO',
    photoUrl:    '/allah-ditta.jpg',
    initials:    'AD',
    avatarBg:    '#0d0d0d',
    avatarColor: '#ffffff',
  },
  {
    name:        'Danish Awan',
    role:        'CTO & Lead Developer',
    photoUrl:    null,
    initials:    'DA',
    avatarBg:    '#c6f24e',   // lime
    avatarColor: '#0d0d0d',
  },
  {
    name:        'Awais Tahir',
    role:        'COO',
    photoUrl:    null,
    initials:    'AT',
    avatarBg:    '#1c1c1c',   // dark ink
    avatarColor: '#f7f7f5',
  },
  {
    name:        'Alishba Zaheer',
    role:        'Social Media Manager',
    photoUrl:    null,
    initials:    'AZ',
    avatarBg:    '#5f42b3',   // violet-dim
    avatarColor: '#ffffff',
  },
];

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <header className="page-head">
        <div className="container">
          <div className="section-eyebrow">THE TEAM</div>
          <h1>The people behind Groundwork</h1>
          <p>
            We&apos;re a small, focused team that believes local trades deserve
            great websites and real results — not agency runaround.
          </p>
        </div>
      </header>

      {/* ── TEAM GRID ───────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="team-grid">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 70}>
                <div className="team-card">
                  {/* Avatar — real photo or initials circle */}
                  <div className="team-avatar" style={
                    member.photoUrl
                      ? undefined
                      : { background: member.avatarBg, color: member.avatarColor }
                  }>
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        width={96}
                        height={96}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{member.initials}</span>
                    )}
                  </div>

                  <div>
                    <p className="team-member-name">{member.name}</p>
                    <p className="team-member-role">{member.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANY BLURB ───────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <Reveal>
            <div className="about-blurb">
              <p>
                Groundwork Technologies helps electricians, plumbers, roofers,
                and other local trade businesses across the US get online, get
                found, and keep growing — combining web design, hosting, and
                lead generation into one straightforward service with no
                agency overhead and no long-term contracts.
              </p>
              <p>
                We only charge for results. The $50-per-booked-job fee on the
                Grow plan means our incentives are exactly aligned with yours:
                the more work your site wins you, the better we&apos;re doing
                our job.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
