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
    const stage = index > 14 ? "group" : "ko"
    const round = null
    const odds = [data[data.length-4], data[data.length-3], data[data.length-2]].map(Number)
    const probabilitySpan = Math.abs(1/odds[0] - 1/odds[2])
 all.push({home, away, total, diff, normalizedResult, swapped, stage, round, odds, probabilitySpan, oddIsCorrect: false})
})