// execute on https://www.oddsportal.com/football/europe/euro/

const all = []
document.querySelectorAll(".group.flex").forEach(item => {
 const data = item.innerText.split('\n').filter(v => v)
 const match = [data[1], data[2], data[3]].join(" ")
 const odds = [data[4], data[5], data[6]].map(Number)
 all.push({ match, odds })
})
