import Link from "next/link"
import { BLOG_POSTS } from "@/lib/blog/posts"
import { ArrowRight, BookOpen, Clock } from "lucide-react"

export function RecentPosts() {
  // Get 3 newest posts based on publishedAt
  const recentPosts = [...BLOG_POSTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  // Map category to readable format and color
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "comparison":
        return { label: "Comparison", color: "from-amber-500 to-orange-600", text: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" }
      case "guides":
        return { label: "Setup Guide", color: "from-emerald-500 to-teal-600", text: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" }
      case "how-to":
        return { label: "How To", color: "from-blue-500 to-indigo-600", text: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" }
      default:
        return { label: "Article", color: "from-purple-500 to-pink-600", text: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" }
    }
  }

  return (
    <section className="py-20 md:py-28 bg-[#050508] border-t border-[#1a1a24] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-900/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-blue-400 mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Latest Updates
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 mb-5">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              From The Sports Blog
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Stay informed with our streaming guides, money-saving tips, and tournament analysis.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {recentPosts.map((post, index) => {
            const badge = getCategoryBadge(post.category)
            const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })

            return (
              <article 
                key={post.slug}
                className="group relative bg-gradient-to-b from-[#0d0d14] to-[#08080d] border border-[#1f1f2e] rounded-2xl overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] flex flex-col"
              >
                {/* Top accent line */}
                <div className={`h-1 w-full bg-gradient-to-r ${badge.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

                {/* Card content */}
                <div className="p-6 lg:p-7 flex flex-col flex-grow">
                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} uppercase tracking-wider`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px] font-medium">{post.readTime} min read</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`} className="block mb-4">
                    <h3 className="text-lg lg:text-xl font-bold text-white leading-snug group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed flex-grow">
                    {post.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-[#1a1a26]/80 flex items-center justify-between">
                    <time className="text-[11px] text-gray-500 font-medium">{formattedDate}</time>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-all duration-300"
                    >
                      Read More 
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
              </article>
            )
          })}
        </div>

        {/* Browse All CTA */}
        <div className="text-center mt-14">
          <Link 
            href="/blog"
            className="group/btn inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#2a2a3a] hover:border-blue-500/40 rounded-xl text-sm font-bold text-gray-300 hover:text-white bg-[#0a0a0f] hover:bg-[#12121a] transition-all duration-300 shadow-lg hover:shadow-blue-500/5"
          >
            Browse All Articles
            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
