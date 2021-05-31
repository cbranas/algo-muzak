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
    tones = setInterval (play, 1000) // will change interval to beat value
  }

  else {
    button.innerText = "p l a y"
    clearInterval(tones)
  }
}

function play() {
  const delay = Math.random() * 0.25 // change later probably
  const time = ctx.currentTime + delay
  const pitch = step(220, Math.floor(Math.random() * 25))
  
  // the 5 is duration
  // hardcoded for the moment to fit the whole adsr envelope
  // i will turn it into a variable later

  tone(pitch, time, 5)
}

function tone (pitch, time, duration) {
  const t = time
  const dur = duration
  
  const osc = new OscillatorNode(ctx)
  const lvl = new GainNode(ctx, { gain: 0.001 })

  osc.frequency.value = pitch

  osc.connect(lvl)
  lvl.connect(ctx.destination)
  lvl.connect(fft)

  osc.start(t)
  osc.stop(t + dur)

  // hardcoded for testing purposes
  adsr(lvl.gain, 0.5, 0.1, t, 0.01, 0.1, 0.1, 3)
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
  var tr2 = Math.pow(2, 1/24) 
  rnd = root * Math.pow(tr2,steps)
  return Math.round(rnd*100)/100
}
