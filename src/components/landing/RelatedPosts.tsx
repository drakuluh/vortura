import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/data/blog-posts";
import { cn } from "@/lib/utils";

type Props = {
  posts: BlogPost[];
  heading: string;
  className?: string;
};

/**
 * A short row of post links. Used under blog posts ("Keep reading") and on
 * service and industry pages ("From the blog") so those pages link to each
 * other. Renders nothing when there are no posts.
 */
export const RelatedPosts = ({ posts, heading, className }: Props) => {
  if (posts.length === 0) return null;

  return (
    <section className={cn("relative z-10", className)} aria-labelledby="related-posts-heading">
      <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
        <h2 id="related-posts-heading" className="text-xl md:text-2xl font-bold tracking-tight text-depth">
          {heading}
        </h2>
        <Link
          to="/blog"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          All posts <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex h-full flex-col glass-strong border-gradient rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="self-start px-2 py-0.5 mb-3 rounded-md text-[10px] font-mono uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                {p.category}
              </span>
              <span className="text-[15px] font-semibold leading-snug text-depth line-clamp-2 mb-2 group-hover:text-foreground">
                {p.title}
              </span>
              <span className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                {p.excerpt}
              </span>
              <span className="mt-auto flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/80">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {p.readTime}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
