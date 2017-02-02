import GooeyLine from './gooeyLine'
import Animation from './animation'

const top = document.getElementById('top')
const overlay = new GooeyLine({el: 'canvas', yOffset: 0, maxRange: 0})

const swipeDown = new Animation()
.duration(1200)
.easing(function (time) { return easeInOutExpo(time) })
.on('tick', function (time) {
  let height = map(time, 0, 1, 0, window.innerHeight)

  overlay.config.yOffset = height
  top.style.height = height - (overlay.config.maxRange / 8) + 'px'

  if (time < 0.5) {
    overlay.config.maxRange = map(time, 0, 0.5, 0, 200)
  }

  if (time > 0.65) {
    overlay.config.maxRange = map(time, 0.65, 1, 200, 0)
  }
})

window.onload = function () {
  overlay.init()
  swipeDown.bounce(200)
}

window.addEventListener('resize', function (e) {
  overlay.resize(window.innerWidth, window.innerHeight)
})

function easeInOutExpo (pos) {
  if (pos === 0) return 0
  if (pos === 1) return 1
  if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1))
  return 0.5 * (-Math.pow(2, -10 * --pos) + 2)
}

function map (value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
}
