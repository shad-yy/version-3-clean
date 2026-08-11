import { theSportsDB } from "./lib/api/the-sports-db"

async function test() {
  try {
    // 1. Check raw lookupTeam
    const rawTeams = await theSportsDB.searchAllTeams({ league: "English Premier League" })
    console.log("Raw searchAllTeams keys:", Object.keys(rawTeams[0] || {}))
    console.log("Raw searchAllTeams team name & badge:", rawTeams[0]?.strTeam, {
      strTeamBadge: rawTeams[0]?.strTeamBadge,
      strTeamLogo: rawTeams[0]?.strTeamLogo,
      strTeamFanart1: rawTeams[0]?.strTeamFanart1,
    })

    // 2. Direct lookupTeam endpoint
    // We bypass the workaround by calling the API directly or checking another team
    const response = await fetch("https://www.thesportsdb.com/api/v1/json/123/lookupteam.php?id=133604")
    const data = await response.json()
    const directTeam = data.teams?.[0]
    console.log("Direct lookupteam keys:", Object.keys(directTeam || {}))
    console.log("Direct lookupteam name & badge:", directTeam?.strTeam, {
      strTeamBadge: directTeam?.strTeamBadge,
      strTeamLogo: directTeam?.strTeamLogo,
      strTeamFanart1: directTeam?.strTeamFanart1,
    })
  } catch (err) {
    console.error("Error in test:", err)
  }
}
test()
