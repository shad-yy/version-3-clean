"use client"

import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { NewsArticle } from "@/lib/api/types"

interface NewsCardProps {
  article: NewsArticle
  featured?: boolean
  compact?: boolean
}

export function NewsCard({ article, featured = false, compact = false }: NewsCardProps) {
  if (compact) {
    return (
      <Link href={`/news/${article.id}`} className="group flex gap-4 items-start p-4 rounded-xl hover:bg-muted/30 transition-colors">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <OptimizedImage
            src={article.urlToImage || "/images/placeholder-news.jpg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/20 text-primary">
              {article.category || "News"}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </div>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        featured ? "md:col-span-2 md:row-span-2 min-h-[400px]" : "min-h-[300px]"
      )}
    >
      <Link href={`/news/${article.id}`} className="flex-1 flex flex-col h-full">
        <div className={cn("relative overflow-hidden", featured ? "h-2/3" : "h-48")}>
          <OptimizedImage
            src={article.urlToImage || "/images/placeholder-news.jpg"}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background border-none shadow-sm">
              {article.category || "Sports"}
            </Badge>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{article.source.name}</span>
              <span>•</span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className={cn(
              "font-bold leading-tight mb-2 group-hover:text-primary transition-colors",
              featured ? "text-2xl md:text-3xl" : "text-lg"
            )}>
              {article.title}
            </h3>
            {featured && (
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {article.description}
              </p>
            )}
          </div>

          <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Read Article <span className="ml-1">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
