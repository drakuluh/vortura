import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { BLOG_POSTS } from "@/data/blog-posts";
import { BlogSubscribe } from "@/components/landing/BlogSubscribe";

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ── Deterministic generative art ────────────────────────────────── */

const hashStr = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
};

const makeRand = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/* ── Workplace illustration art per blog post ─────────────────────── */

const sceneMissedCalls = (id: string) => (
  <>
    {/* Desk with phone */}
    <rect x="60" y="140" width="280" height="8" rx="4" fill={`url(#sh1${id})`} />
    {/* Phone body */}
    <rect x="155" y="52" width="50" height="90" rx="8" fill={`url(#sh1${id})`} />
    <rect x="161" y="60" width="38" height="66" rx="3" fill="#e8eaf0" />
    {/* Missed call X marks on screen */}
    <line x1="172" y1="76" x2="180" y2="84" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="180" y1="76" x2="172" y2="84" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="185" y1="90" x2="193" y2="98" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="193" y1="90" x2="185" y2="98" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    {/* Ring waves */}
    <path d="M220 60 Q235 50 230 35" fill="none" stroke={`url(#sh2${id})`} strokeWidth="3" strokeLinecap="round" />
    <path d="M225 68 Q245 55 240 32" fill="none" stroke={`url(#sh2${id})`} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <path d="M230 76 Q255 60 248 30" fill="none" stroke={`url(#sh2${id})`} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    {/* Dollar signs floating away */}
    <text x="270" y="55" fontSize="18" fontWeight="700" fill={`url(#sh2${id})`} opacity="0.8" fontFamily="system-ui">$</text>
    <text x="290" y="38" fontSize="14" fontWeight="700" fill={`url(#sh2${id})`} opacity="0.5" fontFamily="system-ui">$</text>
    <text x="310" y="60" fontSize="11" fontWeight="700" fill={`url(#sh2${id})`} opacity="0.35" fontFamily="system-ui">$</text>
    {/* Person silhouette (bust) at left */}
    <circle cx="100" cy="80" r="18" fill={`url(#sh1${id})`} />
    <ellipse cx="100" cy="125" rx="25" ry="20" fill={`url(#sh1${id})`} />
    {/* Notification badge */}
    <circle cx="208" cy="56" r="9" fill="#ef4444" />
    <text x="208" y="60" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="system-ui">3</text>
    {/* Decorative dots */}
    <circle cx="330" cy="100" r="4" fill="#8b5cf6" opacity="0.3" />
    <circle cx="345" cy="85" r="3" fill="#3b82f6" opacity="0.25" />
    <circle cx="50" cy="50" r="5" fill="#6d28d9" opacity="0.2" />
  </>
);

const sceneNfcVsQr = (id: string) => (
  <>
    {/* Hand holding phone (right side) */}
    {/* Hand shape */}
    <path d="M280 170 Q275 130 278 100 Q280 85 290 82 Q300 80 302 95 L303 100 Q308 78 318 80 Q325 82 322 100 L320 105 Q328 88 335 92 Q340 96 334 115 L330 125 Q335 115 340 118 Q344 122 338 140 L325 170 Z" fill={`url(#sh2${id})`} />
    {/* Phone in hand */}
    <rect x="282" y="88" width="38" height="72" rx="6" fill={`url(#sh1${id})`} />
    <rect x="287" y="94" width="28" height="52" rx="2" fill="#e8eaf0" />
    {/* WiFi/NFC icon on phone screen */}
    <path d="M295 115 Q301 108 307 115" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
    <path d="M292 120 Q301 110 310 120" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
    <path d="M289 125 Q301 112 313 125" fill="none" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* NFC card (left side) */}
    <rect x="90" y="80" width="120" height="75" rx="8" fill={`url(#sh1${id})`} />
    <rect x="100" y="90" width="40" height="28" rx="4" fill="#8b5cf6" opacity="0.5" />
    {/* NFC waves between card and phone */}
    <path d="M215 117 Q230 112 245 117" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <path d="M222 110 Q235 103 248 110" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M228 104 Q238 98 250 104" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    {/* Stars on the card */}
    {[0, 1, 2, 3, 4].map((i) => (
      <polygon key={`st${i}`} points={starPoints(152 + i * 12, 140, 4)} fill="#f59e0b" opacity="0.8" />
    ))}
    {/* Google "G" on card */}
    <text x="115" y="108" fontSize="16" fontWeight="700" fill="#e8eaf0" fontFamily="system-ui" opacity="0.7">G</text>
    {/* Decorative */}
    <circle cx="60" cy="55" r="5" fill="#6d28d9" opacity="0.2" />
    <circle cx="350" cy="50" r="4" fill="#3b82f6" opacity="0.2" />
  </>
);

const sceneAutomations = (id: string) => (
  <>
    {/* Person silhouette (contractor) */}
    <circle cx="100" cy="65" r="20" fill={`url(#sh1${id})`} />
    <path d="M72 100 Q72 85 100 85 Q128 85 128 100 L130 145 L70 145 Z" fill={`url(#sh1${id})`} />
    {/* Hard hat */}
    <path d="M78 56 Q80 42 100 40 Q120 42 122 56 Z" fill={`url(#sh2${id})`} />
    <rect x="75" y="54" width="50" height="6" rx="3" fill={`url(#sh2${id})`} />
    {/* Gear icons floating right */}
    <circle cx="195" cy="55" r="20" fill="none" stroke={`url(#sh1${id})`} strokeWidth="4" />
    <circle cx="195" cy="55" r="8" fill={`url(#sh1${id})`} />
    {/* Gear teeth */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <rect key={`t${a}`} x="193" y="33" width="4" height="8" rx="1" fill={`url(#sh1${id})`} transform={`rotate(${a} 195 55)`} />
    ))}
    <circle cx="250" cy="95" r="14" fill="none" stroke={`url(#sh2${id})`} strokeWidth="3" />
    <circle cx="250" cy="95" r="5" fill={`url(#sh2${id})`} />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <rect key={`u${a}`} x="248.5" y="79.5" width="3" height="6" rx="1" fill={`url(#sh2${id})`} transform={`rotate(${a} 250 95)`} />
    ))}
    {/* Connecting lines */}
    <line x1="215" y1="55" x2="236" y2="85" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3" />
    {/* Checklist */}
    <rect x="290" y="40" width="70" height="100" rx="6" fill={`url(#sh1${id})`} />
    {[0, 1, 2, 3, 4].map((i) => (
      <React.Fragment key={`ch${i}`}>
        <rect x="300" y={52 + i * 18} width="10" height="10" rx="2" fill="#e8eaf0" opacity="0.7" />
        {i < 3 && <path d={`M302 ${57 + i * 18} l3 3 l5 -5`} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />}
        <rect x="316" y={54 + i * 18} width={i < 3 ? "32" : "24"} height="5" rx="2" fill="#e8eaf0" opacity={i < 3 ? 0.5 : 0.3} />
      </React.Fragment>
    ))}
    {/* "5" badge */}
    <circle cx="285" cy="38" r="14" fill="#8b5cf6" />
    <text x="285" y="43" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" fontFamily="system-ui">5</text>
    {/* Decorative */}
    <circle cx="50" cy="170" r="5" fill="#6d28d9" opacity="0.2" />
    <circle cx="175" cy="150" r="3" fill="#3b82f6" opacity="0.15" />
  </>
);

const sceneDefault = (id: string) => (
  <>
    {/* Laptop */}
    <rect x="120" y="60" width="160" height="100" rx="8" fill={`url(#sh1${id})`} />
    <rect x="130" y="68" width="140" height="78" rx="3" fill="#e8eaf0" />
    {/* Screen content - chart bars */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={`bar${i}`} x={145 + i * 22} y={120 - [30, 45, 35, 55, 40][i]} width="14" height={[30, 45, 35, 55, 40][i]} rx="2" fill={i % 2 === 0 ? "#6d28d9" : "#3b82f6"} opacity="0.7" />
    ))}
    {/* Laptop base */}
    <path d="M100 160 L110 155 L290 155 L300 160 Z" fill={`url(#sh1${id})`} />
    {/* Lightning bolt (automation) */}
    <path d="M310 50 L295 90 L310 90 L290 130 L305 90 L290 90 Z" fill={`url(#sh2${id})`} opacity="0.8" />
    {/* Floating notification dots */}
    <circle cx="80" cy="80" r="8" fill="#8b5cf6" opacity="0.3" />
    <circle cx="90" cy="65" r="5" fill="#3b82f6" opacity="0.25" />
    <circle cx="340" cy="100" r="6" fill="#6d28d9" opacity="0.2" />
    <circle cx="65" cy="140" r="4" fill="#3b82f6" opacity="0.15" />
  </>
);

const starPoints = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerA = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
    const innerA = outerA + Math.PI / 5;
    pts.push(`${cx + r * Math.cos(outerA)},${cy + r * Math.sin(outerA)}`);
    pts.push(`${cx + r * 0.4 * Math.cos(innerA)},${cy + r * 0.4 * Math.sin(innerA)}`);
  }
  return pts.join(" ");
};

const detectScene = (title: string): string => {
  const t = title.toLowerCase();
  if (/call|phone|voice|miss|answer/.test(t)) return "calls";
  if (/nfc|tap|review card/.test(t)) return "nfc";
  if (/automat|contractor|trade/.test(t)) return "automations";
  return "default";
};

const scenes: Record<string, (id: string) => React.ReactNode> = {
  calls: sceneMissedCalls,
  nfc: sceneNfcVsQr,
  automations: sceneAutomations,
  default: sceneDefault,
};

const BlogArt = ({ slug, title }: { slug: string; title: string }) => {
  const id = slug.replace(/[^a-z0-9]/g, "");
  const scene = detectScene(title);
  const render = scenes[scene] ?? scenes.default;

  return (
    <svg viewBox="0 0 400 225" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`sh1${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#0f0520" />
        </linearGradient>
        <linearGradient id={`sh2${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0a1628" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="#eef0f5" rx="0" />
      {render(id)}
    </svg>
  );
};

/* ── Blog page ───────────────────────────────────────────────────── */

const CATEGORIES = [
  "All",
  ...Array.from(new Set(BLOG_POSTS.map((p) => p.category))),
];

const BlogPage = () => {
  const [active, setActive] = useState("All");
  const isMobile = useIsMobile();

  const filtered =
    active === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === active);

  const [featured, ...rest] = filtered;

  const headerAnim = isMobile
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" as const },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };

  const reveal = (i: number) =>
    isMobile
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" as const },
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: 0.05 * i,
          },
        };

  return (
    <PageLayout>
      <Seo
        title="Blog"
        description="Opinionated takes on AI automation, Google reviews, and growth strategies for local businesses."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <section className="relative z-10 pt-12 md:pt-14 lg:pt-24 pb-12 md:pb-16 lg:pb-24">
          <div className="container max-w-5xl">
            {/* ── Header ───────────────────────────────────── */}
            <motion.div
              className="max-w-2xl mx-auto text-center mb-6 md:mb-8 mt-12 md:mt-10 lg:mt-8"
              {...headerAnim}
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5 leading-tight">
                Insights &{" "}
                <SparklesText text="ideas." className="text-gradient" />
              </h1>
              <p className="text-sm text-muted-foreground">
                Practical thinking on AI automation for local businesses.
              </p>
            </motion.div>

            {/* ── Category filter pills ────────────────────── */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-8 md:mb-12 flex-wrap"
              {...(isMobile
                ? { initial: false as const, animate: { opacity: 1 } }
                : {
                    initial: { opacity: 0 },
                    whileInView: { opacity: 1 },
                    viewport: { once: true },
                    transition: { duration: 0.5, delay: 0.15 },
                  })}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                    active === cat
                      ? "bg-primary/15 border border-primary/40 text-primary shadow-glow-blue"
                      : "border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* ── Featured post ─────────────────────────────── */}
            {featured && (
              <motion.article className="mb-5 lg:mb-6" {...reveal(0)}>
                <Link
                  to={`/blog/${featured.slug}`}
                  className="block glass-strong border-gradient rounded-2xl overflow-hidden group hover:border-primary/20 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-[46%] aspect-[16/9] lg:aspect-auto overflow-hidden relative">
                      <div className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-700 ease-out">
                        <BlogArt
                          slug={featured.slug}
                          title={featured.title}
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                          {featured.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {featured.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-depth mb-3 leading-tight group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                          {formatDate(featured.date)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* ── Post grid ─────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
                {rest.map((post, i) => (
                  <motion.article key={post.slug} {...reveal(i + 1)}>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block glass-strong border-gradient rounded-2xl overflow-hidden group hover:border-primary/20 transition-colors h-full flex flex-col"
                    >
                      <div className="aspect-[16/9] overflow-hidden relative shrink-0">
                        <div className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-700 ease-out">
                          <BlogArt slug={post.slug} title={post.title} />
                        </div>
                      </div>
                      <div className="p-5 md:p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold tracking-tight text-depth mb-2 leading-tight group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            {/* ── Subscribe ───────────────────────────────── */}
            <motion.div className="mt-10 md:mt-14" {...reveal(filtered.length)}>
              <BlogSubscribe />
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
