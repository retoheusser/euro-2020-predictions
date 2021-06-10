// execute on https://www.oddsportal.com/soccer/europe/euro-2020/

$("tr[xeid]").map(function () {
  const element = $(this)
  const match = element.find("td.name a").text().trim()
  const odds = element.find("td.odds-nowrp a").map(function () { return Number($(this).text()) }).toArray()
  return {match, odds}
}).toArray()