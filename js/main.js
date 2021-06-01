let user_permission = false
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft, fill: '#000000', stroke: 'cyan'})

// not currently in use, will be made random later
const tempo = 140
const beat = 60 / tempo

// onClick
function start () {
  user_permission = !user_permission
  const button = document.getElementById("onOff")

  if (user_permission) {
    button.innerText = "p a u s e"
    play() 
    tones = setInterval (play, 250) // will change interval to beat value
  }

  else {
    button.innerText = "p l a y"
    clearInterval(tones)
  }
}

function play() {

  // will probably rewrite these as an array

  const delay = Math.random() * 0.5 // change later probably
  const time = ctx.currentTime + delay
  const pitch = step(110, Math.floor(Math.random() * 25))
  
  const delay2 = Math.random() * 0.5 // change later probably
  const time2 = ctx.currentTime + delay2
  const pitch2 = step(440, Math.floor(Math.random() * 25))

  // the 5 is duration
  // hardcoded for the moment to fit the whole adsr envelope
  // i will probably turn it into a variable later
  
  // lower voice
  if (Math.random() > 0.5) {
    tone(pitch, time, 5)
  }
  // high voice
  if (Math.random() > 0.85) {
    tone(pitch2, time2, 5)
  }

  // harmony (sometimes)
  if (Math.random() > 0.95) {
    tone(step(pitch2, Math.floor(2+Math.random()*4)), time2, 5)
  }
  
}

function tone (pitch, time, duration, attack, decay, sustain, release) {
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

// functions from the web audio api notes
// thank you Nick!
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
