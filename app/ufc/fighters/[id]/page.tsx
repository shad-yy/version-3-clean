import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Trophy, User, MapPin, Ruler, Target, Calendar, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { getApiBaseUrl } from "@/lib/utils/url"

async function fetchUfcFighter(id: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/ufc/fighters/${id}`, { cache: "no-store" })
  const json = await res.json()
  return json?.data ?? null
}

interface UFCFighterPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: UFCFighterPageProps): Promise<Metadata> {
  const { id } = params
  const fighter = await fetchUfcFighter(id)

  if (!fighter) {
    return {
      title: "Fighter Not Found | UFC",
      description: "The requested UFC fighter could not be found.",
    }
  }

  return {
    title: `${fighter.name} ${fighter.nickname ? `"${fighter.nickname}"` : ""} | UFC Fighter Profile`,
    description: `Complete profile of UFC ${fighter.weightClass || 'Fighter'} ${fighter.name}. Record: ${fighter.record || 'N/A'}. ${fighter.bio || ''}`,
    keywords: [`UFC`, `MMA`, fighter.name, fighter.nickname, fighter.weightClass, `Fighter Profile`].filter((k): k is string => typeof k === 'string'),
    openGraph: {
      title: `${fighter.name} - UFC Fighter`,
      description: `${fighter.weightClass || 'Fighter'} fighter with record ${fighter.record || 'N/A'}`,
      images: [{ url: fighter.photo || '/ufc-fighter-default.jpg' }],
      type: "profile",
    },
  }
}

export default async function UFCFighterPage({ params }: UFCFighterPageProps) {
  const { id } = params
  const fighter = await fetchUfcFighter(id)

  if (!fighter) {
    notFound()
  }

  const winPercentage = fighter.stats ? Math.round((fighter.stats.wins / (fighter.stats.wins + fighter.stats.losses + fighter.stats.draws)) * 100) : 0
  const finishRate = fighter.stats ? Math.round(((fighter.stats.koTko + fighter.stats.submissions) / fighter.stats.wins) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 bg-sl-ground min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-sl-mute">
        <Link href="/ufc" className="hover:text-white transition-colors">UFC</Link>
        <span>/</span>
        <Link href="/ufc" className="hover:text-white transition-colors">Fighters</Link>
        <span>/</span>
        <span className="text-white">{fighter.name}</span>
      </nav>

      {/* Fighter Header */}
      <div className="relative">
        <Card className="bg-gradient-to-r from-red-900/20 via-gray-900/50 to-red-900/20 border-red-500/30">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Fighter Photo */}
              <div className="relative">
                <OptimizedImage
                  src={fighter.photo || '/ufc-fighter-default.jpg'}
                  alt={fighter.name}
                  width={200}
                  height={200}
                  className="w-48 h-48 rounded-full object-cover border-4 border-red-500"
                />
                {fighter.ranking === "Champion" && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-sl-line">
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                )}
              </div>

              {/* Fighter Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {fighter.name}
                  </h1>
                  {fighter.nickname && (
                    <p className="text-xl text-red-400 italic mb-4">"{fighter.nickname}"</p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <Badge
                      className={
                        fighter.ranking === "Champion"
                          ? "bg-yellow-500 text-black text-lg px-4 py-2"
                          : "bg-red-500 text-white text-lg px-4 py-2"
                      }
                    >
                      {fighter.ranking === "Champion" ? "Champion" : `#${fighter.ranking}`}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2 border-sl-line">
                      {fighter.weightClass}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{fighter.record}</div>
                    <div className="text-sm text-sl-mute">Record</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sl-amber">{winPercentage}%</div>
                    <div className="text-sm text-sl-mute">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{finishRate}%</div>
                    <div className="text-sm text-sl-mute">Finish Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{fighter.age}</div>
                    <div className="text-sm text-sl-mute">Age</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Biography */}
          <Card className="bg-sl-surface/50 border-sl-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Biography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sl-mid leading-relaxed">
                {fighter.bio || "No biography available for this fighter."}
              </p>
            </CardContent>
          </Card>

          {/* Fight Statistics */}
          {fighter.stats && (
            <Card className="bg-sl-surface/50 border-sl-line">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Fight Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-sl-amber mb-1">{fighter.stats.wins}</div>
                    <div className="text-sm text-sl-mute">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-1">{fighter.stats.losses}</div>
                    <div className="text-sm text-sl-mute">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{fighter.stats.draws}</div>
                    <div className="text-sm text-sl-mute">Draws</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">{fighter.stats.koTko}</div>
                    <div className="text-sm text-sl-mute">KO/TKO</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{fighter.stats.submissions}</div>
                    <div className="text-sm text-sl-mute">Submissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{fighter.stats.decisions}</div>
                    <div className="text-sm text-sl-mute">Decisions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fight History */}
          <Card className="bg-sl-surface/50 border-sl-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Fight History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(fighter.fightHistory) && fighter.fightHistory.length > 0 ? (
                <div className="space-y-4">
                  {fighter.fightHistory.slice(0, 5).map((fight: { opponent: string; event: string; date: string; result: string; method: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-sl-line">
                      <div>
                        <div className="font-semibold text-white">{fight.opponent}</div>
                        <div className="text-sm text-sl-mute">{fight.event} • {fight.date}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            fight.result?.includes('Win') || fight.result?.includes('W')
                              ? "bg-sl-amber text-black"
                              : fight.result?.includes('Loss') || fight.result?.includes('L')
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-black"
                          }
                        >
                          {fight.result}
                        </Badge>
                        <div className="text-sm text-sl-mute mt-1">{fight.method}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-sl-dim mx-auto mb-4" />
                  <p className="text-sl-mute">No fight history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Physical Stats */}
          <Card className="bg-sl-surface/50 border-sl-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Physical Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sl-mute">Height:</span>
                <span className="text-white font-semibold">{fighter.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sl-mute">Reach:</span>
                <span className="text-white font-semibold">{fighter.reach}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sl-mute">Age:</span>
                <span className="text-white font-semibold">{fighter.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sl-mute">Country:</span>
                <span className="text-white font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {fighter.country}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-sl-surface/50 border-sl-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fighter.ranking === "Champion" && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-white">Current UFC {fighter.weightClass} Champion</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-white">UFC {fighter.weightClass} Fighter</span>
                </div>
                {winPercentage >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-sl-amber/10 rounded-lg border border-sl-amber/30">
                    <TrendingUp className="w-5 h-5 text-sl-amber" />
                    <span className="text-white">High Win Percentage ({winPercentage}%)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-sl-surface/50 border-sl-line">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/ufc"
                className="block w-full text-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Back to UFC
              </Link>
              <Link
                href="/ufc#rankings"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                View Rankings
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
