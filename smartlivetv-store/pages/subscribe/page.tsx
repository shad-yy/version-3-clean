import type { Metadata } from "next"
import SubscribeClient from "./subscribe-client"

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Get premium sports coverage, live scores, and real-time updates.",
}

export default function SubscribePage() {
  return <SubscribeClient />
}
