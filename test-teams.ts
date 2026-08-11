import { unifiedSportsAPI } from "./lib/api/unified-sports-api"

async function run() {
    console.log("Fetching EPL teams...");
    try {
        const teams = await unifiedSportsAPI.getTeams("4328");
        console.log("Teams found:", teams.length);
        if (teams.length > 0) {
            console.log("First team:", teams[0].name);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
