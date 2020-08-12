function errorMsg(msg) {
  return `
    <div class="d-flex h-100 justify-content-center align-items-center text-danger">
      ${msg}
    </div>
  `
}

function loadingSpinner() {
  return `
    <div class="d-flex h-100 justify-content-center align-items-center">
        <div class="spinner-grow text-primary" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
  `
}

let timeTrendData = null
let timeTrendDataReq = null

let timeFrequenciesData = null
let timeFrequenciesDataReq = null

async function fetchTimeTrendData() {
  try {
    const req = fetch('/times/metrics/time-trend')
    timeTrendDataReq = req
    const resp = await req
    timeTrendData = await resp.json()
    timeTrendDataReq = null
  } catch {
    timeTrendDataReq = null
  }
}
async function fetchTimeFrequenciesData() {
  try {
    const req = fetch('/times/metrics/time-frequencies')
    timeFrequenciesDataReq = req
    const resp = await req
    timeFrequenciesData = await resp.json()
    timeFrequenciesDataReq = null
  } catch {
    timeFrequenciesDataReq = null
  }
}

async function renderTimeTrend() {
  const tab = document.querySelector('#nav-time-trend')
  if (!tab) {
    return
  }

  if (timeTrendDataReq) {
    await timeTrendDataReq
  }
  if (!timeTrendData) {
    await fetchTimeTrendData()
  }

  try {
    const chartContainerId = 'time-trend-container'
    tab.innerHTML = `<div id="${chartContainerId}" class="h-100 w-100"></div>`
    const opts = {
      axisX: {
        labelInterpolationFnc: function(date) {
          return date.toLocaleString('default', { month: 'short', day: 'numeric' })
        }
      }
    }
    timeTrendData.labels = timeTrendData.labels.map(d => new Date(d))
    // eslint-disable-next-line
    new Chartist.Line(`#${chartContainerId}`, timeTrendData, opts)
  } catch {
    tab.innerHTML = errorMsg('An Error Occured')
  }
}

async function renderTimeFrequencies() {
  const tab = document.querySelector('#nav-time-frequencies')
  if (!tab) {
    return
  }

  if (timeFrequenciesDataReq) {
    await timeFrequenciesDataReq
  }
  if (!timeFrequenciesData) {
    await fetchTimeFrequenciesData()
  }

  try {
    const chartContainerId = 'time-frequencies-container'
    tab.innerHTML = `<div id="${chartContainerId}" class="h-100 w-100"></div>`
    // eslint-disable-next-line
    new Chartist.Bar(`#${chartContainerId}`, timeFrequenciesData)
  } catch {
    tab.innerHTML = errorMsg('An Error Occured')
  }
}

function setLoadingSpinners() {
  Array.from(document.querySelectorAll('.tab-pane')).forEach(pane => {
    pane.innerHTML = loadingSpinner()
  })
}

function renderCharts() {
  renderTimeTrend()
  renderTimeFrequencies()
}

renderCharts()

Array.from(document.querySelectorAll('.nav-tabs a')).forEach(tab => {
  tab.addEventListener('click', () => {
    setLoadingSpinners()
    setTimeout(renderCharts, 1000)
  })
})
