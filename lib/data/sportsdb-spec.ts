// Loader for TheSportsDB v1 JSON spec provided in the repo root
// Reads "Sportsdb API documentation.json" and exports a normalized spec map

import * as fs from 'fs'
import * as path from 'path'

export type SportsDbEndpointSpec = {
	id: string
	path: string
	method: string
	params?: Array<{ name: string; type: string; required?: boolean; description?: string }>
	example?: string
	description?: string
}

export type SportsDbSpec = {
	base_url_template: string
	endpoints: SportsDbEndpointSpec[]
}

function loadSpecFile(): any | null {
	try {
		const filePath = path.join(process.cwd(), 'Sportsdb API documentation.json')
		const raw = fs.readFileSync(filePath, 'utf-8')
		return JSON.parse(raw)
	} catch (e) {
		console.warn('[SportsDB Spec] Failed to read spec file:', e instanceof Error ? e.message : String(e))
		return null
	}
}

const rawSpec = loadSpecFile()

export const SPORTSDB_SPEC: SportsDbSpec = {
	base_url_template: rawSpec?.base?.base_url_template || 'https://www.thesportsdb.com/api/v1/json/{API_KEY}/',
	endpoints: Array.isArray(rawSpec?.endpoints)
		? rawSpec.endpoints.map((e: any) => ({
			id: e.id,
			path: e.path?.replace(/^\//, '') || '',
			method: e.method || 'GET',
			params: e.params || [],
			example: e.example,
			description: e.description,
		}))
		: [],
}

export default SPORTSDB_SPEC
