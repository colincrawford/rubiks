const timerBtn = document.querySelector('#timer-startstop-button')
const resetBtn = document.querySelector('#timer-reset-button')
const submitBtn = document.querySelector('#submit-time')
const secondsInput = document.querySelector('#seconds')
const timeDisplay = document.querySelector('#time-display')
const timeDisplayContainer = document.querySelector('#time-display__container')

function formatTimeTime(seconds) {
  if (isNaN(seconds)) return seconds
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds - (minutes * 60))
  const ms = Math.floor((seconds - secs) * 100)
  const minPrefix = minutes > 9 ? '' : '0'
  const secPrefix = secs > 9 ? '' : '0'
  const msPrefix = ms > 9 ? '' : '0'
  return `${minPrefix}${minutes}:${secPrefix}${secs}:${msPrefix}${ms}`
}

let timerUpdateInterval = null
let state = {
  timerSecondsElapsed: null, 
  timerRunning: false,
}

function render() {
  const { timerRunning, timerSecondsElapsed } = state
  timerBtn.classList.remove('btn-success', 'btn-danger')
  if (timerRunning) {
    timerBtn.classList.add('btn-danger')
    timerBtn.textContent = 'Stop'
  } else {
    timerBtn.classList.add('btn-success')
    timerBtn.textContent = 'Start'
  }


  timeDisplayContainer.classList.remove('border-danger', 'border-success')
  if (timerRunning) {
    timeDisplayContainer.classList.add('border-success')
  } else if (timerSecondsElapsed > 0) {
    timeDisplayContainer.classList.add('border-danger')
  }

  if (timerSecondsElapsed) {
    secondsInput.value = timerSecondsElapsed
  } else {
    secondsInput.value = 0
  }
  timeDisplay.textContent = formatTimeTime(secondsInput.value) 
  if (timerRunning || secondsInput.value < .1) {
    submitBtn.disabled = true
  } else {
    submitBtn.disabled = false
  }

  if (timerRunning && !timerUpdateInterval) {
    timerUpdateInterval = setInterval(() => {
      updateState({timerSecondsElapsed: state.timerSecondsElapsed + .01})
    }, 10)
  } else if (!timerRunning && timerUpdateInterval) {
    clearInterval(timerUpdateInterval)
    timerUpdateInterval = null
  }
}

function updateState(updates) {
  state = {...state, ...updates}
  render()
}

timerBtn.addEventListener('click', () => {
  const update = {timerRunning: !state.timerRunning}
  updateState(update)
})

resetBtn.addEventListener('click', () => {
  updateState({timerRunning: false, timerSecondsElapsed: null})
})

document.querySelectorAll('.delete-time-form').forEach(form => {
  form.onsubmit = () => confirm('Are you sure you want to delete this time?')
})
