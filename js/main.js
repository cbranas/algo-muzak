let user_permission = false
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft, fill: '#000000', stroke: 'cyan'})

// onClick
function start () {
  user_permission = !user_permission
  const button = document.getElementById("onOff")

  if (user_permission) {
    button.innerText = "p a u s e"
    play()
    tones = setInterval (play, 250)
  }

  else {
    button.innerText = "p l a y"
    clearInterval(tones)
  }
}

function play() {
  // generates notes for three voices
  const duration = 5
  const probabilities = [0.5, 0.85, 0.9]

  const times = [
    ctx.currentTime + Math.random() * 0.5, 
    ctx.currentTime + Math.random() * 0.5,
  ]
  times.push(times[1]) // 3rd voice in sync with 2nd

  const pitches = [
    step(110, Math.floor(Math.random() * 25)),
    step(440, Math.floor(Math.random() * 25))
  ]
  // 3rd voice at intervals with 2nd
  pitches.push(step(pitches[1], Math.floor(2 + Math.random() * 4)))
  
  for (let i = 0; i < 3; i++) {
    if (Math.random() > probabilities[i]) {
      tone(pitches[i], times[i], duration)
    }
  }
}

function tone (pitch, time, duration, attack, decay, sustain, release) {
  // not currently in use--might randomize envelope vals in the future, though
  const a = attack || 0.01
  const d = decay || 0.1
  const s = sustain || 0.1
  const r = release || 3
  
  const osc = new OscillatorNode(ctx)
  const lvl = new GainNode(ctx, { gain: 0.001 })

  osc.frequency.value = pitch

  osc.connect(lvl)
  lvl.connect(ctx.destination)
  lvl.connect(fft)

  osc.start(time)
  osc.stop(time + duration)

  adsr(lvl.gain, 0.5, 0.1, time, a, d, s, r)
}

// functions from Nick's web audio api notes
// (thank you!)
function adsr (param, peak, val, time, a, d, s, r) {
  /*
                peak
                /\   val  val
               /| \__|____|
              / |    |    |\
             /  |    |    | \
       init /a  |d   |s   |r \ init

       <----------time------------>
  */
  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(val, time+a+d)
  param.linearRampToValueAtTime(val, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

function step( root, steps ){
  // formula: http://pages.mtu.edu/~suits/NoteFreqCalcs.html
  var tr2 = Math.pow(2, 1/12) 
  rnd = root * Math.pow(tr2,steps)
  return Math.round(rnd*100)/100
}
