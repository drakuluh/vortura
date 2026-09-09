import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { SparklesText } from "@/components/ui/sparkles-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";
import { BLOG_POSTS } from "@/data/blog-posts";
import { BlogSubscribe } from "@/components/landing/BlogSubscribe";

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ── Generative abstract art per blog post (amber/gold palette) ───── */

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const AMBER_PALETTE = ["#f59e0b", "#d97706", "#fbbf24", "#b45309", "#fcd34d", "#e8a317", "#ca8a04"];
const ACCENT_PALETTE = ["#6d28d9", "#3b82f6", "#8b5cf6"];

const BlogArt = ({ slug }: { slug: string; title?: string }) => {
  const W = 400;
  const H = 225;
  const seed = hashStr(slug);
  const rand = seededRandom(seed);
  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];
  const id = slug.replace(/[^a-z0-9]/g, "");

  const blobs: React.ReactNode[] = [];
  for (let i = 0; i < 3; i++) {
    const cx = rand() * W;
    const cy = rand() * H;
    const r = 80 + rand() * 160;
    blobs.push(
      <circle key={`b${i}`} cx={cx} cy={cy} r={r} fill={`url(#blob${id}${i})`} />
    );
  }

  const accentCx = rand() * W;
  const accentCy = rand() * H;
  const accentR = 100 + rand() * 100;

  const shapes: React.ReactNode[] = [];
  const shapeCount = 5 + Math.floor(rand() * 4);
  for (let i = 0; i < shapeCount; i++) {
    const type = Math.floor(rand() * 5);
    const color = pick(AMBER_PALETTE);
    const opacity = 0.15 + rand() * 0.35;
    const x = rand() * W;
    const y = rand() * H;

    if (type === 0) {
      const r = 20 + rand() * 60;
      shapes.push(<circle key={`s${i}`} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={0.8 + rand() * 1.2} opacity={opacity} />);
    } else if (type === 1) {
      const r = 3 + rand() * 10;
      shapes.push(<circle key={`s${i}`} cx={x} cy={y} r={r} fill={color} opacity={opacity + 0.1} />);
    } else if (type === 2) {
      const r = 30 + rand() * 50;
      const sa = rand() * Math.PI * 2;
      const ea = sa + Math.PI * (0.5 + rand());
      const x1 = x + Math.cos(sa) * r;
      const y1 = y + Math.sin(sa) * r;
      const x2 = x + Math.cos(ea) * r;
      const y2 = y + Math.sin(ea) * r;
      shapes.push(<path key={`s${i}`} d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={0.8 + rand() * 1.5} strokeLinecap="round" opacity={opacity} />);
    } else if (type === 3) {
      const len = 40 + rand() * 120;
      const angle = rand() * Math.PI * 2;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      shapes.push(<line key={`s${i}`} x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeWidth="0.8" strokeDasharray={`${3 + rand() * 4} ${4 + rand() * 6}`} opacity={opacity} strokeLinecap="round" />);
    } else {
      const sz = 6 + rand() * 10;
      shapes.push(
        <g key={`s${i}`} opacity={opacity}>
          <line x1={x - sz} y1={y} x2={x + sz} y2={y} stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1={x} y1={y - sz} x2={x} y2={y + sz} stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    }
  }

  const dots: { x: number; y: number }[] = [];
  const dotCount = 6 + Math.floor(rand() * 5);
  for (let i = 0; i < dotCount; i++) {
    dots.push({ x: rand() * W, y: rand() * H });
  }

  const lines: React.ReactNode[] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (dist < 140) {
        lines.push(<line key={`l${i}-${j}`} x1={dots[i].x} y1={dots[i].y} x2={dots[j].x} y2={dots[j].y} stroke={pick(AMBER_PALETTE)} strokeWidth="0.5" opacity={0.15 + rand() * 0.15} />);
      }
    }
  }

  const dotNodes = dots.map((d, i) => {
    const color = pick(AMBER_PALETTE);
    const r = 2 + rand() * 3;
    return (
      <g key={`d${i}`}>
        <circle cx={d.x} cy={d.y} r={r} fill={color} opacity={0.4 + rand() * 0.35} />
        <circle cx={d.x} cy={d.y} r={r + 3} fill="none" stroke={color} strokeWidth="0.5" opacity={0.15} />
      </g>
    );
  });

  const diamonds: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const sz = 2 + rand() * 4;
    const color = pick(AMBER_PALETTE);
    diamonds.push(<rect key={`dm${i}`} x={x - sz} y={y - sz} width={sz * 2} height={sz * 2} rx="1" fill={color} opacity={0.2 + rand() * 0.25} transform={`rotate(45 ${x} ${y})`} />);
  }

  const blobDefs = Array.from({ length: 3 }, (_, i) => {
    const color = pick(AMBER_PALETTE);
    return (
      <radialGradient key={`bg${i}`} id={`blob${id}${i}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity={0.2 + rand() * 0.2} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    );
  });

  const accentColor = pick(ACCENT_PALETTE);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {blobDefs}
        <radialGradient id={`acc${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity={0.12} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`vig${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </radialGradient>
        <pattern id={`grid${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(245,158,11,0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#0a0a1a" />
      <rect width={W} height={H} fill={`url(#grid${id})`} />
      {blobs}
      <circle cx={accentCx} cy={accentCy} r={accentR} fill={`url(#acc${id})`} />
      {shapes}
      {lines}
      {dotNodes}
      {diamonds}
      <rect width={W} height={H} fill={`url(#vig${id})`} opacity={0.5} />
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

  const headerAnim = useHeaderAnim();
  const reveal = useRevealAnim();

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
