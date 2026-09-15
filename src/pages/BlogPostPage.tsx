import { useState, useEffect, useRef, Fragment } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  ChevronDown,
  Link2,
  List,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { BlogSubscribe } from "@/components/landing/BlogSubscribe";
import { BLOG_POSTS, type ContentBlock, type BarChartBlock } from "@/data/blog-posts";
import { BLOG_LINKS, relatedPosts } from "@/data/blog-links";
import { services } from "@/data/services";
import { INDUSTRIES } from "@/data/industries";
import { RelatedPosts } from "@/components/landing/RelatedPosts";
import { ORGANIZATION_REF, SITE_ORIGIN, breadcrumbJsonLd } from "@/lib/structured-data";
import { ReadingProgress } from "@/components/landing/ReadingProgress";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

/* ── helpers ──────────────────────────────────────────────────── */

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const renderMarkdownLinks = (text: string) => {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60 transition-colors"
        >
          {match[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
};

/* ── InlineBarChart ───────────────────────────────────────────── */

const InlineBarChart = ({ block }: { block: BarChartBlock }) => {
  const maxVal = Math.max(...block.bars.map((b) => b.value));

  const formatValue = (v: number, unit: string) => {
    if (unit === "$") {
      return v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;
    }
    return `${v}${unit}`;
  };

  return (
    <div className="my-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
      <p className="text-xs font-semibold text-depth mb-4 tracking-tight">
        {block.title}
      </p>
      <div className="space-y-3">
        {block.bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">
                {bar.label}
              </span>
              <span className="text-xs font-semibold font-mono text-depth">
                {formatValue(bar.value, block.unit)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                initial={{ width: 0 }}
                whileInView={{ width: `${(bar.value / maxVal) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      {block.source && (
        <p className="mt-3 text-[10px] text-muted-foreground/60 leading-relaxed">
          {block.sourceUrl ? (
            <a
              href={block.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Source: {block.source}
            </a>
          ) : (
            <>Source: {block.source}</>
          )}
        </p>
      )}
    </div>
  );
};

const renderContentBlock = (block: ContentBlock, i: number) => {
  if (typeof block === "string") {
    return (
      <p
        key={i}
        className="text-sm md:text-[15px] text-muted-foreground leading-relaxed"
      >
        {renderMarkdownLinks(block)}
      </p>
    );
  }
  if (block.type === "bar-chart") {
    return <InlineBarChart key={i} block={block} />;
  }
  return null;
};

/* ── Sidebar TOC (desktop) ────────────────────────────────────── */

const SidebarTOC = ({
  chapters,
  activeId,
}: {
  chapters: { id: string; heading: string }[];
  activeId: string;
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="space-y-0.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3 px-2">
        Contents
      </p>
      {chapters.map((ch, i) => (
        <button
          key={ch.id}
          type="button"
          onClick={() => scrollTo(ch.id)}
          className={`w-full text-left flex items-start gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${
            activeId === ch.id
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.03]"
          }`}
        >
          <span className="font-mono text-[10px] pt-0.5 shrink-0 w-4 text-right opacity-50">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[12px] leading-snug">{ch.heading}</span>
        </button>
      ))}
    </nav>
  );
};

/* ── Collapsible TOC (mobile) ─────────────────────────────────── */

const MobileTOC = ({
  chapters,
}: {
  chapters: { id: string; heading: string }[];
}) => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden mb-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <List className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-depth">
            Table of contents
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {chapters.length} chapters
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <nav className="px-5 pb-4 space-y-0.5">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollTo(ch.id)}
                className="w-full text-left flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <span className="font-mono text-[11px] text-muted-foreground/60 pt-0.5 shrink-0 w-5 text-right">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                  {ch.heading}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

/* ── Copy link ─────────────────────────────────────────────────── */

const CopyLinkButton = ({ url }: { url: string }) => {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      type="button"
      onClick={() => void copy(url)}
      className="print:hidden inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> : <Link2 className="w-3.5 h-3.5" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
};

/* ── Page ──────────────────────────────────────────────────────── */

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const [activeId, setActiveId] = useState("");
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!post) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    post.chapters.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  const currentIndex = BLOG_POSTS.indexOf(post);
  const nextPost = BLOG_POSTS[currentIndex + 1];
  const prevPost = BLOG_POSTS[currentIndex - 1];

  const subscribeAfterChapter = Math.min(2, post.chapters.length - 1);

  const links = BLOG_LINKS[post.slug];
  const relatedService = services.find((s) => s.slug === links?.services[0]);
  const relatedIndustry = INDUSTRIES.find((i) => i.slug === links?.industry);

  const postUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  // Generated by scripts/og-images.py; the prerender falls back to the
  // site image if a post's file is missing.
  const shareImage = `/og/blog/${post.slug}.png`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      articleSection: post.category,
      image: `${SITE_ORIGIN}${shareImage}`,
      url: postUrl,
      mainEntityOfPage: postUrl,
      author: { "@type": "Person", name: post.author.name, url: `${SITE_ORIGIN}/about` },
      publisher: ORGANIZATION_REF,
    },
    breadcrumbJsonLd([
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <PageLayout>
      <Seo
        title={post.title}
        description={post.excerpt}
        image={shareImage}
        type="article"
        publishedTime={post.date}
        jsonLd={jsonLd}
      />

      {/* Hero bg area — overflow-hidden scoped here only */}
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-12 md:pt-14 lg:pt-24">
          <div className="container max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-8 mt-12 md:mt-10 lg:mt-8 print:hidden">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-white/[0.05]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All posts
              </Link>
            </nav>
          </div>

          <div className="container max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-10 md:mb-12 max-w-3xl lg:mx-auto lg:text-center"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4 lg:justify-center">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold tracking-tight text-depth mb-4 leading-[1.15]">
                {post.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl lg:mx-auto">
                {post.excerpt}
              </p>
              <div className="flex lg:inline-flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-depth text-[13px] leading-none mb-0.5">
                      Sean Hutchinson
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      {post.updated && (
                        <>
                          {" · Updated "}
                          <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <span aria-hidden="true" className="h-6 w-px bg-white/10 print:hidden" />
                <CopyLinkButton url={postUrl} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 3-column layout — outside overflow-hidden so sticky works */}
      <section className="relative pb-16 md:pb-20 lg:pb-28">
        <div className="container max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="lg:grid lg:grid-cols-[240px_1fr_240px] lg:gap-8 lg:items-start"
            >
              {/* ── Left sidebar: TOC (desktop) ──────────── */}
              <aside className="hidden lg:block print:!hidden sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
                <SidebarTOC chapters={post.chapters} activeId={activeId} />
              </aside>

              {/* ── Center: article ──────────────────────── */}
              <div className="min-w-0">
                {/* Mobile TOC */}
                <div className="lg:hidden print:hidden">
                  <MobileTOC chapters={post.chapters} />
                </div>

                {/* Article body */}
                <ReadingProgress target={articleRef} />
                <div ref={articleRef} className="glass-strong border-gradient rounded-3xl p-6 md:p-10 lg:p-12">
                  {/* Intro */}
                  <div className="space-y-5 mb-10">
                    {post.intro.map((p, i) => (
                      <p
                        key={i}
                        className="text-sm md:text-[15px] text-muted-foreground leading-relaxed"
                      >
                        {renderMarkdownLinks(p)}
                      </p>
                    ))}
                  </div>

                  {/* Chapters */}
                  {post.chapters.map((chapter, ci) => (
                    <div key={chapter.id}>
                      <div
                        className="mb-10"
                        id={chapter.id}
                        style={{ scrollMarginTop: "5rem" }}
                      >
                        <h2 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-depth mb-5 leading-tight">
                          {chapter.heading}
                        </h2>
                        <div className="space-y-5">
                          {chapter.content.map((block, pi) =>
                            renderContentBlock(block, pi)
                          )}
                        </div>
                      </div>

                      {/* Mid-article subscribe CTA (mobile only) */}
                      {ci === subscribeAfterChapter && (
                        <div className="my-10 lg:hidden print:hidden">
                          <BlogSubscribe compact />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Post navigation ─────────────────────── */}
                <div className="mt-8 md:mt-10 flex items-center justify-between gap-4 print:hidden">
                  {prevPost ? (
                    <Link
                      to={`/blog/${prevPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextPost ? (
                    <Link
                      to={`/blog/${nextPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>

                {/* ── Bottom subscribe (mobile) ──────────── */}
                <div className="mt-10 md:mt-12 lg:hidden print:hidden">
                  <BlogSubscribe />
                </div>

                {/* ── CTA ──────────────────────────────────── */}
                <motion.div
                  className="mt-12 md:mt-16 text-center print:hidden"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-depth mb-3 leading-tight">
                    Put this to work in your business
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Book a free discovery call and we'll map out what automation
                    can do for your business.
                  </p>
                  <Link
                    to="/contact"
                    className="btn-hero-glass inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold"
                  >
                    Book a call <ArrowRight className="w-4 h-4" />
                  </Link>
                  {(relatedService || relatedIndustry) && (
                    <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      {relatedService && (
                        <Link
                          to={`/services/${relatedService.slug}`}
                          className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40 hover:text-foreground transition-colors"
                        >
                          See how {relatedService.title} works
                        </Link>
                      )}
                      {relatedIndustry && (
                        <Link
                          to={`/industries/${relatedIndustry.slug}`}
                          className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40 hover:text-foreground transition-colors"
                        >
                          What we do for {relatedIndustry.name.toLowerCase()}
                        </Link>
                      )}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* ── Right sidebar: subscribe (desktop) ──── */}
              <aside className="hidden lg:block print:!hidden sticky top-20">
                <BlogSubscribe sidebar />
              </aside>
            </motion.div>

            <RelatedPosts
              heading="Keep reading"
              posts={relatedPosts(post)}
              className="mt-16 md:mt-20 print:hidden"
            />
          </div>
        </section>
      </PageLayout>
    );
};

export default BlogPostPage;
