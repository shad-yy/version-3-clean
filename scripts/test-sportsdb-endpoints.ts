// TheSportsDB endpoints diagnostic script
// Run with: ts-node scripts/test-sportsdb-endpoints.ts

// Polyfill fetch if needed
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY || '123'}/`

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

async function request(endpoint: string) {
	const url = `${BASE_URL}${endpoint}`
	const started = Date.now()
	try {
		const res = await fetch(url)
		const status = res.status
		let bodySample: any = null
		try {
			const json = await res.json()
			const firstKey = json && typeof json === 'object' ? Object.keys(json)[0] : undefined
			const value = firstKey ? json[firstKey] : json
			if (Array.isArray(value)) {
				bodySample = value[0] ? Object.fromEntries(Object.entries(value[0]).slice(0, 3)) : null
			} else if (value && typeof value === 'object') {
				bodySample = Object.fromEntries(Object.entries(value).slice(0, 3))
			} else {
				bodySample = value
			}
		} catch (e) {
			bodySample = null
		}
		return { url, status, ms: Date.now() - started, sample: bodySample }
	} catch (err: any) {
		return { url, status: 0, ms: Date.now() - started, error: err?.message || String(err) }
	}
}

async function main() {
	ensureDir(path.join(process.cwd(), 'logs'))
	ensureDir(path.join(process.cwd(), 'reports'))

	// Known good sample ids/names (SportsDB): EPL 4328, Arsenal 133604
	const today = new Date().toISOString().split('T')[0]
	const endpoints = [
		// Lists / global
		{ name: 'all_sports', url: 'all_sports.php' },
		{ name: 'all_countries', url: 'all_countries.php' },
		{ name: 'all_leagues', url: 'all_leagues.php' },
		{ name: 'search_all_seasons', url: 'search_all_seasons.php?id=4328' },
		{ name: 'search_all_teams_by_name', url: 'search_all_teams.php?l=English%20Premier%20League' },
		{ name: 'lookup_all_players', url: 'lookup_all_players.php?id=133604' },

		// Search
		{ name: 'searchteams', url: 'searchteams.php?t=Arsenal' },
		{ name: 'searchplayers', url: 'searchplayers.php?p=Cristiano%20Ronaldo' },
		{ name: 'searchevents', url: `searchevents.php?e=Arsenal&s=2023-2024` },
		{ name: 'searchvenues', url: 'searchvenues.php?v=Emirates%20Stadium' },
		{ name: 'searchleagues', url: 'searchleagues.php?l=English%20Premier%20League' },
		{ name: 'search_all_leagues', url: 'search_all_leagues.php?c=England&s=Soccer' },

		// Lookup / ID
		{ name: 'lookupleague', url: 'lookupleague.php?id=4328' },
		{ name: 'lookuptable', url: 'lookuptable.php?l=4328&s=2023-2024' },
		{ name: 'lookupteam', url: 'lookupteam.php?id=133604' },
		{ name: 'lookupequipment', url: 'lookupequipment.php?id=133604' },
		{ name: 'lookupplayer', url: 'lookupplayer.php?id=34146370' }, // sample id may vary
		{ name: 'lookuphonours', url: 'lookuphonours.php?id=34146370' },
		{ name: 'lookupformerteams', url: 'lookupformerteams.php?id=34146370' },
		{ name: 'lookupmilestones', url: 'lookupmilestones.php?id=34146370' },
		{ name: 'lookupcontracts', url: 'lookupcontracts.php?id=34146370' },
		{ name: 'playerresults', url: 'playerresults.php?id=34146370' },
		{ name: 'lookupevent', url: 'lookupevent.php?id=1032862' }, // sample
		{ name: 'eventresults', url: 'eventresults.php?id=1032862' },
		{ name: 'lookuplineup', url: 'lookuplineup.php?id=1032862' },
		{ name: 'lookuptimeline', url: 'lookuptimeline.php?id=1032862' },
		{ name: 'lookupeventstats', url: 'lookupeventstats.php?id=1032862' },
		{ name: 'lookuptv', url: 'lookuptv.php?id=1032862' },
		{ name: 'lookupvenue', url: 'lookupvenue.php?id=2147483653' }, // sample venue id

		// Events & schedules
		{ name: 'eventsnext', url: 'eventsnext.php?id=133604' },
		{ name: 'eventslast', url: 'eventslast.php?id=133604' },
		{ name: 'eventsnextleague', url: 'eventsnextleague.php?id=4328' },
		{ name: 'eventspastleague', url: 'eventspastleague.php?id=4328' },
		{ name: 'eventsday', url: `eventsday.php?d=${today}&s=Soccer` },
		{ name: 'eventsseason', url: 'eventsseason.php?id=4328&s=2023-2024' },
		{ name: 'eventstv', url: `eventstv.php?d=${today}&s=Soccer&a=UK` },
		{ name: 'eventshighlights', url: `eventshighlights.php?d=${today}&s=Soccer` },
		// REMOVED: livescore.php doesn't exist (documentation line 32)
		// Use eventsday.php instead for today's events
		{ name: 'eventsday_today', url: `eventsday.php?d=${today}&s=Soccer` },

		// Misc / media
		{ name: 'eventhighlights', url: 'eventhighlights.php?id=1032862' },
		{ name: 'eventimages', url: 'eventimages.php?id=1032862' },
		{ name: 'team_badge', url: 'team_badge.php?t=Arsenal' },
		{ name: 'venues', url: 'venues.php' },
		{ name: 'sports_alias', url: 'all_sports.php' },
		{ name: 'countries_alias', url: 'all_countries.php' },
		{ name: 'seasons_alias', url: 'seasons.php?id=4328' },
	]

	const results: any[] = []

	for (const ep of endpoints) {
		// 1 second spacing to be mindful of rate limits
		// eslint-disable-next-line no-await-in-loop
		const out = await request(ep.url)
		const entry = {
			name: ep.name,
			url: out.url,
			status: out.status,
			timeMs: out.ms,
			sample: out.sample ?? null,
			message:
				out.status === 404
					? `[TheSportsDB] ${ep.url} => 404 (No data found)`
					: out.status === 200
					? 'OK'
					: out.error || 'Unknown',
		}
		results.push(entry)
		console.log(`[CHECK] ${ep.name} -> ${entry.status} in ${entry.timeMs}ms`)
		if (out.status === 404) console.warn(entry.message)
		await new Promise((r) => setTimeout(r, 1000))
	}

	const reportPath = path.join(process.cwd(), 'logs', 'sportsdb_test_report.json')
	fs.writeFileSync(reportPath, JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), results }, null, 2))

	// Build validation summary
	const summary = results.map((r) => ({
		endpoint: r.name,
		status: r.status,
		ok: r.status === 200,
		sampleKeys: r.sample ? Object.keys(r.sample) : [],
		correctUsage:
			r.name === 'search_all_teams_by_name'
				? 'search_all_teams.php?l=English%20Premier%20League (league NAME, not ID)'
				: r.url.replace(BASE_URL, ''),
		fixStatus: r.status === 200 ? 'valid' : 'check-params-or-empty-day',
	}))

	const validationPath = path.join(process.cwd(), 'reports', 'sportsdb_validation_results.json')
	fs.writeFileSync(validationPath, JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), summary }, null, 2))

	console.log(`\nWrote ${results.length} endpoint checks to:`)
	console.log(` - ${reportPath}`)
	console.log(` - ${validationPath}`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
