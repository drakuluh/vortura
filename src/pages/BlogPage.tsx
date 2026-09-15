import React, { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHeaderAnim, useRevealAnim } from "@/hooks/use-anim";
import { BLOG_POSTS } from "@/data/blog-posts";
import { BlogSubscribe } from "@/components/landing/BlogSubscribe";

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/* ── Generative geometric art ──────────────────────────────────────── */

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

const GEO_PALETTES = [
  ["#7c3aed", "#a855f7", "#6d28d9", "#4f46e5", "#8b5cf6"],
  ["#ef4444", "#f97316", "#dc2626", "#ea580c", "#fb923c"],
  ["#22c55e", "#6d28d9", "#10b981", "#8b5cf6", "#059669"],
  ["#3b82f6", "#8b5cf6", "#2563eb", "#7c3aed", "#60a5fa"],
];

const BlogArt = ({ slug }: { slug: string }) => {
  const W = 400;
  const H = 280;
  const seed = hashStr(slug);
  const rand = seededRandom(seed);
  const paletteIdx = Math.floor(rand() * GEO_PALETTES.length);
  const palette = GEO_PALETTES[paletteIdx];
  const pick = () => palette[Math.floor(rand() * palette.length)];
  const id = slug.replace(/[^a-z0-9]/g, "");

  const shapes: React.ReactNode[] = [];
  const count = 6 + Math.floor(rand() * 4);

  for (let i = 0; i < count; i++) {
    const type = Math.floor(rand() * 6);
    const color = pick();
    const opacity = 0.5 + rand() * 0.5;
    const x = rand() * W;
    const y = rand() * H;

    if (type === 0) {
      // Large solid circle
      const r = 40 + rand() * 80;
      shapes.push(
        <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={opacity} />
      );
    } else if (type === 1) {
      // Outlined circle
      const r = 50 + rand() * 70;
      shapes.push(
        <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={4 + rand() * 8} opacity={opacity} />
      );
    } else if (type === 2) {
      // Rectangle
      const w = 60 + rand() * 120;
      const h = 60 + rand() * 120;
      const rx = rand() > 0.5 ? 8 : 0;
      shapes.push(
        <rect key={i} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={rx} fill={color} opacity={opacity * 0.7} />
      );
    } else if (type === 3) {
      // Semi-circle / arc
      const r = 50 + rand() * 70;
      const startAngle = rand() * Math.PI * 2;
      const sweep = Math.PI * (0.5 + rand() * 0.5);
      const x1 = x + Math.cos(startAngle) * r;
      const y1 = y + Math.sin(startAngle) * r;
      const x2 = x + Math.cos(startAngle + sweep) * r;
      const y2 = y + Math.sin(startAngle + sweep) * r;
      const largeArc = sweep > Math.PI ? 1 : 0;
      shapes.push(
        <path
          key={i}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={6 + rand() * 10}
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    } else if (type === 4) {
      // Quarter circle fill
      const r = 60 + rand() * 80;
      const quadrant = Math.floor(rand() * 4);
      const dx = quadrant % 2 === 0 ? r : -r;
      const dy = quadrant < 2 ? -r : r;
      shapes.push(
        <path
          key={i}
          d={`M ${x} ${y} L ${x + dx} ${y} A ${r} ${r} 0 0 ${quadrant % 2 === 0 ? 1 : 0} ${x} ${y + dy} Z`}
          fill={color}
          opacity={opacity * 0.6}
        />
      );
    } else {
      // Concentric circles
      const r = 30 + rand() * 50;
      shapes.push(
        <g key={i} opacity={opacity}>
          <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={3} />
          <circle cx={x} cy={y} r={r * 0.65} fill="none" stroke={color} strokeWidth={3} />
          <circle cx={x} cy={y} r={r * 0.3} fill={color} />
        </g>
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`vig${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#111118" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#18181b" />
      {shapes}
      <rect width={W} height={H} fill={`url(#vig${id})`} />
    </svg>
  );
};

/* ── Blog page ───────────────────────────────────────────────────── */

const CATEGORIES = [
  "All",
  ...Array.from(new Set(BLOG_POSTS.map((p) => p.category))),
];

// Nine is three full rows at the 3-across desktop layout.
const POSTS_PER_PAGE = 9;

// The data file isn't in date order, and once posts span pages order matters.
const POSTS_NEWEST_FIRST = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

const BlogPage = () => {
  const [active, setActive] = useState("All");
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const gridTopRef = useRef<HTMLDivElement>(null);

  const filtered =
    active === "All"
      ? POSTS_NEWEST_FIRST
      : POSTS_NEWEST_FIRST.filter((p) => p.category === active);

  const pageCount = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  // Page lives in the URL so back/forward and shared links land on the same page.
  const requested = Number(searchParams.get("page")) || 1;
  const page = Math.min(Math.max(1, requested), pageCount);
  const visible = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const goToPage = (next: number) => {
    setSearchParams(next === 1 ? {} : { page: String(next) });
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCategory = (cat: string) => {
    setActive(cat);
    setSearchParams({});
  };

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
                <span className="text-gradient">ideas.</span>
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
                  onClick={() => selectCategory(cat)}
                  className={`px-3.5 py-3 sm:py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                    active === cat
                      ? "bg-primary/15 border border-primary/40 text-primary shadow-glow-blue"
                      : "border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* ── Post grid ─────────────────────────────────── */}
            {/* Flex-wrap rather than grid so an incomplete last row centres
                instead of hugging the left. Widths subtract the gaps so full
                rows still fit exactly 2 or 3 across. */}
            <div ref={gridTopRef} className="scroll-mt-28 flex flex-wrap justify-center gap-4 lg:gap-5">
              {visible.map((post, i) => (
                <motion.article
                  key={post.slug}
                  className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                  {...reveal(i)}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex flex-col glass-strong border-gradient rounded-2xl overflow-hidden group hover:border-primary/20 transition-colors h-full"
                  >
                    {/* Art */}
                    <div className="aspect-[16/10] overflow-hidden relative shrink-0">
                      <div className="absolute inset-0 group-hover:scale-[1.04] transition-transform duration-700 ease-out">
                        <BlogArt slug={post.slug} />
                      </div>
                    </div>

                    {/* Content. Title and excerpt reserve a fixed number of
                        lines (min-h in `lh` units tracks the responsive font
                        size) so every card is the same height and overflow is
                        clipped with an ellipsis rather than pushing the card. */}
                    <div className="p-5 md:p-6 flex flex-col flex-1">
                      <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground mb-2.5 leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2lh]">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[3lh]">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto pt-5">
                        {/* Date + read time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-4">
                          <span>{formatDate(post.date)}</span>
                          <span className="text-muted-foreground/30">|</span>
                          <span>{post.readTime}</span>
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-2.5">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-foreground/80">
                            {post.author.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>

            {/* ── Pagination ────────────────────────────────── */}
            {pageCount > 1 && (
              <nav
                aria-label="Blog pages"
                className="mt-10 md:mt-12 flex items-center justify-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goToPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    className={`inline-flex items-center justify-center min-w-11 h-11 px-3 rounded-lg text-xs font-mono tracking-widest transition-all ${
                      n === page
                        ? "bg-primary/15 border border-primary/40 text-primary shadow-glow-blue"
                        : "border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pageCount}
                  aria-label="Next page"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}

            {/* ── Subscribe ───────────────────────────────── */}
            <motion.div className="mt-10 md:mt-14" {...reveal(visible.length)}>
              <BlogSubscribe />
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
