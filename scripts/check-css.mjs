const res = await fetch("http://localhost:3000/")
const html = await res.text()
const match = html.match(/\/_next\/static\/css\/[^\s]+\.css/)
console.log("cssPath:", match ? match[0] : "NONE")
if (match) {
  const cssRes = await fetch("http://localhost:3000" + match[0])
  const css = await cssRes.text()
  console.log("cssStatus:", cssRes.status)
  console.log("cssLength:", css.length)
  console.log(css.slice(0, 200))
}

