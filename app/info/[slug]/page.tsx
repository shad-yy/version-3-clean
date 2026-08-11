import { notFound } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

// This is a mock function. In a real app, you'd fetch this from a CMS.
const getPageContent = async (slug: string) => {
  const pages: { [key: string]: { title: string; content: string } } = {
    "about-us": {
      title: "About Us",
      content:
        "<p><strong>Smart Live TV</strong> is your ultimate hub for everything sports. Founded in 2025, our mission is to provide fans with the most comprehensive, real-time sports data, news, and analysis on the web.</p><p>Our dedicated team of sports enthusiasts and tech experts work around the clock to bring you live scores, detailed statistics, and breaking news from leagues all around the world. We believe in the power of sports to unite and inspire, and we're committed to delivering an unparalleled experience for every fan.</p>",
    },
    "contact-us": {
      title: "Contact Us",
      content:
        "<p>Have a question or feedback? We'd love to hear from you!</p><p><strong>Email:</strong> support@smartlivetv.dev</p><p><strong>Address:</strong> 123 Sports Lane, Fandom City, 54321</p><p>For partnership inquiries, please email partnerships@smartlivetv.dev.</p>",
    },
    "privacy-policy": {
      title: "Privacy Policy",
      content:
        "<p>Your privacy is important to us. This policy explains what information we collect and how we use it.</p><p>We collect information you provide directly to us, such as when you create an account or subscribe to our newsletter. We also collect anonymous data about your visit to help us improve our service. We do not sell your personal information to third parties.</p>",
    },
    "terms-of-service": {
      title: "Terms of Service",
      content:
        "<p>By using our website, you agree to these terms.</p><p>The content on Smart Live TV is for personal, non-commercial use only. You may not reproduce, distribute, or create derivative works from our content without our express permission. We reserve the right to terminate accounts for users who violate these terms.</p>",
    },
  }
  return pages[slug] || null
}

// Statically generate routes for info pages to prevent this route from catching others
export async function generateStaticParams() {
  return [{ slug: "about-us" }, { slug: "contact-us" }, { slug: "privacy-policy" }, { slug: "terms-of-service" }]
}

// Disallow any other dynamic routes for this pattern
export const dynamicParams = false

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageContent(params.slug)
  return {
    title: `${page?.title || "Info"} - Smart Live TV`,
  }
}

export default async function InfoPage({ params }: Props) {
  const page = await getPageContent(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* DOMPurify sanitizes HTML to prevent XSS — safe to render */}
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />
        </CardContent>
      </Card>
    </div>
  )
}
