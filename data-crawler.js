// execute on https://www.oddsportal.com/football/europe/euro-2020/results/

let all = []
document.querySelectorAll(".group.flex").forEach((item, index) => {
 const data = item.innerText.split('\n').filter(v => v)
    console.log(data)
    const home = Number(data[2])
    const away = Number(data[4])
    const total = home + away
    const diff = Math.abs(home-away)
    const normalizedResult = [home, away].sort().reverse().join("-")
    const swapped = normalizedResult !== [home, away].join("-")
    const stage = index > 15 ? "group" : "ko"
    let round = null
    if (index > 47) {
      round = 1
    } else if (index > 31) {
      round = 2
    } else if (index > 15) {
      round = 3
    }
    const odds = [data[data.length-3], data[data.length-2], data[data.length-1]].map(Number)
    const probabilitySpan = Math.abs(1/odds[0] - 1/odds[2])
    const year = 2010
    const minOddIndex = odds.indexOf(Math.min(...odds))
    const oddIsCorrect = (minOddIndex === 0 && home > away) || (minOddIndex === 1 && home === away) || (minOddIndex === 2 && away > home)
    all.push({home, away, total, diff, normalizedResult, swapped, stage, round, odds, probabilitySpan, oddIsCorrect, year})
})