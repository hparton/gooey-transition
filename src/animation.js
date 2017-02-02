/*
  Simple Animation object with chainable functions
  set up like so:

  var anim = new Animation()
  anim.duration(200)
      .easing(function(time){ return easingFunc(time) })
      .play();

  TODO:
  - Add pause/resume function

  Version 1.0 Created by Harry Parton on 02/02/2017
*/

var Animation = function () {
  this._duration = 1200
  this._startTime
  this._handlers = []
  this._easingFunc = null
  this._rafID = null

  // .duration(duration) - Define a duration for the animation
  this.duration = function (duration) {
    this._duration = duration
    return this
  }

  // .easing(easingFunc) - Define an easing function here for use in the .on('tick')
  this.easing = function (easingFunc) {
    this._easingFunc = easingFunc
    return this
  }

  // .play() - Play the animation forwards
  this.play = function (reversed) {
    if (!this._startTime) {
      this._setStartTime(() => {
        this._run(this._startTime, reversed)
      })
    }
    return this
  }

  // .reverse() - Play the animation backwards
  this.reverse = function () {
    this.play(true)
    return this
  }

  // .stop() - Stop the animation, cannot be restarted
  this.stop = function () {
    window.cancelAnimationFrame(this._rafID)
    return this
  }

  // .bounce(delay) - Play the animation forwards then backwards with optional delay in ms
  this.bounce = function (delay) {
    let i = 0
    this.play()
    this.on('finish', () => {
      setTimeout(() => {
        (i % 2 === 0) ? this.reverse() : this.play()
        i++
      }, delay)
    })

    return this
  }

  // Main animation loop handler.
  this._run = function (timestamp, reversed) {
    timestamp = timestamp || new Date().getTime()
    var runtime = timestamp - this._startTime
    var progress = runtime / this._duration

    progress = Math.min(progress, 1)

    if (reversed) {
      progress = 1 - progress
    }

    if (this._easingFunc !== null) {
      progress = this._easingFunc(progress)
    }

    this.trigger('tick', progress)

    if (runtime <= this._duration) { // if duration not met yet
      this._rafID = window.requestAnimationFrame((timestamp) => { // call requestAnimationFrame again with parameters
        this._run(timestamp, reversed)
      })
    } else {
      this._startTime = undefined
      this.trigger('finish')
    }

    return this
  }

  // .trigger('tick'/'finish') - Trigger any callbacks assigned to the event
  this.trigger = function (event, params) {
    for (var i = 0; i < this._handlers.length; i++) {
      if (this._handlers[i].event === event) {
        this._handlers[i].cb(params)
      }
    }
  }

  // .on('tick'/'finish') - Assign a callback to the event
  this.on = function (event, cb) {
    this._handlers.push({event, cb})
    return this
  }

  // Does what it says on the tin.
  this._setStartTime = function (cb) {
    window.requestAnimationFrame((timestamp) => {
      // if browser doesn't support requestAnimationFrame, generate our own timestamp using Date
      this._startTime = timestamp || new Date().getTime()
      cb(timestamp)
    })
  }

  // .log() - Log the animation object
  this.log = function () {
    console.log(this)
    return this
  }
}

export default Animation
