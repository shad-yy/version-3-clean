"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Bell, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for casual sports fans",
    features: ["Live scores and results", "Basic news articles", "Limited team stats", "Standard notifications"],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "month",
    description: "For dedicated sports enthusiasts",
    features: [
      "Everything in Free",
      "Advanced statistics & analytics",
      "Premium news & analysis",
      "Real-time push notifications",
      "Player performance insights",
      "Historical data access",
      "Ad-free experience",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Elite",
    price: "$99.99",
    period: "year",
    description: "Ultimate sports experience",
    features: [
      "Everything in Pro",
      "Exclusive expert analysis",
      "Early access to breaking news",
      "Custom dashboard & alerts",
      "Direct expert Q&A sessions",
      "Premium video content",
      "Priority customer support",
      "Save 17% vs monthly",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default" as const,
    popular: false,
  },
]

const benefits = [
  {
    icon: Zap,
    title: "Lightning Fast Updates",
    description: "Get scores and news the moment they happen with our real-time system.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Customizable alerts for your favorite teams, players, and leagues.",
  },
  {
    icon: Trophy,
    title: "Expert Analysis",
    description: "In-depth insights from professional sports analysts and former players.",
  },
  {
    icon: TrendingUp,
    title: "Advanced Stats",
    description: "Comprehensive statistics and performance metrics for deeper understanding.",
  },
]

export default function SubscribeClient() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Elevate Your Sports Experience</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Join thousands of sports fans who trust Smart Live TV for the most comprehensive, real-time sports coverage
          available anywhere.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-500" />
            <span>50K+ Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span>Real-time Updates</span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {benefits.map((benefit) => {
          const Icon = benefit.icon
          return (
            <Card key={benefit.title} className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.buttonVariant}
                disabled={plan.name === "Free"}
                onClick={() => {
                  if (plan.name !== "Free") {
                    window.location.href = "https://store-coming-soon.com"
                  }
                }}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter Signup */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
        <CardContent className="pt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Stay in the Loop</h2>
            <p className="text-muted-foreground">
              Get weekly sports insights, breaking news, and exclusive content delivered to your inbox.
            </p>
          </div>
          <form action="/api/buy" method="POST" className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter subscription
              </label>
              <Input
                id="newsletter-email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="flex-1"
                required
              />
            </div>
            <Button type="submit">Subscribe Free</Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Questions?</h2>
        <p className="text-muted-foreground mb-6">Check out our FAQ or contact our support team for help with your subscription.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/info/faq">View FAQ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/info/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
