// FA Full-Time location for Streatham & Balham Foxes Colts' division.
// These come from the URL the club gave us:
// https://fulltime.thefa.com/index.html?selectedSeason=474917553&selectedFixtureGroupAgeGroup=0&selectedDivision=929004628&selectedCompetition=0
export const FA = {
  BASE: 'https://fulltime.thefa.com',
  SEASON: '474917553',
  AGE_GROUP: '0',
  DIVISION: '929004628',
  COMPETITION: '0',
  // Used to detect which rows are "our" team for highlighting / W-L-D badges.
  TEAM_MATCH: /foxes|streatham|balham/i,
}

export function faUrl() {
  const p = `selectedSeason=${FA.SEASON}&selectedFixtureGroupAgeGroup=${FA.AGE_GROUP}&selectedDivision=${FA.DIVISION}&selectedCompetition=${FA.COMPETITION}`
  return `${FA.BASE}/index.html?${p}`
}
