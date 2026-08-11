// TheSportsDB Type Definitions
// Complete type definitions for TheSportsDB API v1

export interface SportsDbSport {
  idSport: string
  strSport: string
  strFormat: string
  strSportThumb?: string
  strSportIconGreen?: string
  strSportDescription?: string
}

export interface SportsDbCountry {
  name_en: string
  name_es?: string
  name_fr?: string
  name_de?: string
  name_it?: string
  name_pt?: string
  name_ru?: string
}

export interface SportsDbLeague {
  idLeague: string
  strLeague: string
  strSport: string
  strLeagueAlternate?: string
  strCountry?: string
  strDescriptionEN?: string
  intFormedYear?: string | number
  strBadge?: string
  strLogo?: string
  strFanart1?: string
  strFanart2?: string
  strFanart3?: string
  strFanart4?: string
  strBanner?: string
  strNaming?: string
  strLocked?: string
}

export interface SportsDbSeason {
  strSeason: string
}

export interface SportsDbTeam {
  idTeam: string
  strTeam: string
  strTeamShort?: string
  strAlternate?: string
  intFormedYear?: string
  strSport: string
  strLeague: string
  idLeague: string
  strManager?: string
  strStadium?: string
  strKeywords?: string
  strRSS?: string
  strStadiumThumb?: string
  strStadiumDescription?: string
  strStadiumLocation?: string
  intStadiumCapacity?: string
  strWebsite?: string
  strFacebook?: string
  strTwitter?: string
  strInstagram?: string
  strDescriptionEN?: string
  strCountry?: string
  strTeamBadge?: string
  strTeamJersey?: string
  strTeamLogo?: string
  strTeamFanart1?: string
  strTeamFanart2?: string
  strTeamFanart3?: string
  strTeamFanart4?: string
  strTeamBanner?: string
  strYoutube?: string
  strLocked?: string
}

export interface SportsDbPlayer {
  idPlayer: string
  strPlayer: string
  strTeam?: string
  strSport: string
  strDescriptionEN?: string
  strPlayerThumb?: string
  strCutout?: string
  strRender?: string
  strThumb?: string
  strFanart1?: string
  strFanart2?: string
  strFanart3?: string
  strFanart4?: string
  strCreativeCommons?: string
  strLocked?: string
  dateBorn?: string
  strNationality?: string
  strHeight?: string
  strWeight?: string
  intSoccerXMLTeamID?: string
  intLoved?: string
  strPosition?: string
  strCollege?: string
  strFacebook?: string
  strWebsite?: string
  strTwitter?: string
  strInstagram?: string
  strYoutube?: string
  strKit?: string
  strAgent?: string
  strBirthLocation?: string
  strEthnicity?: string
  strStatus?: string
  strSigning?: string
  strWage?: string
  strOutfitter?: string
  strGender?: string
  strSide?: string
}

export interface SportsDbEvent {
  idEvent: string
  strEvent: string
  strEventAlternate?: string
  strFilename?: string
  strSport: string
  idLeague: string
  strLeague: string
  strSeason: string
  strDescriptionEN?: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore?: string
  intAwayScore?: string
  intRound?: string
  strOfficial?: string
  strTimestamp?: string
  dateEvent: string
  strDate?: string
  strTime?: string
  strTimeLocal?: string
  strTVStation?: string
  idHomeTeam: string
  idAwayTeam: string
  strHomeTeamBadge?: string
  strAwayTeamBadge?: string
  strResult?: string
  strVenue?: string
  strCountry?: string
  strCity?: string
  strPoster?: string
  strSquare?: string
  strFanart?: string
  strThumb?: string
  strBanner?: string
  strMap?: string
  strTweet1?: string
  strTweet2?: string
  strTweet3?: string
  strVideo?: string
  strStatus?: string
  strPostponed?: string
  strLocked?: string
  dateEventLocal?: string
  strCapacity?: string
  intSpectators?: number
}

export interface SportsDbEventStat {
  idEvent: string
  strStat: string
  intHome?: number
  intAway?: number
  strTeam: string
  intStat: number
}

export interface SportsDbLineupPlayer {
  idPlayer: string
  idTeam: string
  strTeam: string
  strPlayer: string
  strPosition: string
  intSquadNumber: number
  strCutout?: string
  strThumb?: string
}

export interface SportsDbEventTimeline {
  idTimeline: string
  idEvent: string
  strTimeline?: string
  strTimelineDetail?: string
  strHome?: string
  strEvent: string
  strPlayer?: string
  strAssist?: string
  strTime?: string
  strTeam?: string
  strComment?: string
}

export interface SportsDbTable {
  idStanding?: string
  intRank?: string | number
  idTeam: string
  strTeam: string
  strBadge?: string
  strTeamBadge?: string
  idLeague?: string
  strLeague?: string
  strSeason?: string
  strForm?: string
  strDescription?: string
  intPlayed?: string | number
  intWin?: string | number
  intLoss?: string | number
  intDraw?: string | number
  intGoalsFor?: string | number
  intGoalsAgainst?: string | number
  intGoalDifference?: string | number
  intPoints?: string | number
  dateUpdated?: string
  // Legacy fields for backward compatibility
  name?: string
  rank?: number
  win?: number
  draw?: number
  loss?: number
  goalsFor?: number
  goalsAgainst?: number
  goalDifference?: number
  points?: number
  played?: number
}

export interface SportsDbVenue {
  idVenue: string
  strVenue: string
  strLocation?: string
  strCountry?: string
  strCity?: string
  strDescriptionEN?: string
  strCapacity?: string
  strMap?: string
  strThumb?: string
}

export interface SportsDbTV {
  idEvent: string
  strEvent?: string
  strTVStation?: string
  strCountry?: string
  strLanguage?: string
  dateEvent?: string
  strTime?: string
}

export interface SportsDbHighlight {
  idEvent: string
  strEvent?: string
  strVideo?: string
  strThumb?: string
  strFilename?: string
  dateEvent?: string
}

export interface SportsDbEquipment {
  strType?: string
  strSeason?: string
  strEquipment?: string
}

export interface SportsDbHonour {
  strHonour?: string
  strSeason?: string
  strDescription?: string
}

export interface SportsDbFormerTeam {
  strTeam?: string
  strSport?: string
  strLeague?: string
  strJoined?: string
  strDeparted?: string
}

export interface SportsDbMilestone {
  strMilestone?: string
  strSeason?: string
  strDescription?: string
}

export interface SportsDbContract {
  strTeam?: string
  strSport?: string
  strLeague?: string
  strJoined?: string
  strDeparted?: string
  strSalary?: string
}

export interface SportsDbPlayerResult {
  idEvent?: string
  strEvent?: string
  strSport?: string
  idLeague?: string
  strLeague?: string
  dateEvent?: string
  strTime?: string
  strHomeTeam?: string
  strAwayTeam?: string
  intHomeScore?: string
  intAwayScore?: string
  strResult?: string
}

export interface SportsDbEventResult {
  idEvent?: string
  strEvent?: string
  strSport?: string
  idLeague?: string
  strLeague?: string
  dateEvent?: string
  strTime?: string
  strHomeTeam?: string
  strAwayTeam?: string
  intHomeScore?: string
  intAwayScore?: string
  strResult?: string
}
