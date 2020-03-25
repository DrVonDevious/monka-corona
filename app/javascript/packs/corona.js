
const SIMULATIONS_URL = "http://localhost:3000/simulations"
const MAPS_URL = "http://localhost:3000/maps"
const NODE_URL = "http://localhost:3000/nodes"

const MAP_WIDTH = 800
const MAP_HEIGHT = 600

const ACTIVE_SIMULATIONS = []

const scroll = document.querySelector("#scrollbox")


let nodes_array = []

function getSimulation(){
  fetch(SIMULATIONS_URL)
  .then(res => res.json())
  .then(sims => {
    sims.forEach(sim => {
      showSimulations(sim)
    })
  })
}

function showSimulations(simulation){
  // const scroll = document.querySelector("#scrollbox")
  const sim = document.createElement("div")
  const name = document.createElement("h1")
  name.innerText = `Name: ${simulation.name}`
  const time = document.createElement("p")
  time.innerText = `Time: ${simulation.time_running}`
  const initial = document.createElement("p")
  initial.innerText = `initial_infected: ${simulation.initial_infected}`

  

  sim.append(name,time,initial)
  scroll.append(sim)

}

  let sim_btn = document.querySelector("#sims")
  sim_btn.addEventListener("click", () => {
    scroll.style.display = "block"
    hideMap()
    showForm()
    getSimulation()
  })


  function hideSim() {
    scroll.style.display = "none"
  }


function createSimulation() {
  const form_submit = document.querySelector("#form-submit")

  form_submit.addEventListener("click", () => {
    event.preventDefault()
    postSimulation.call(form_submit)
    hideForm()
  })
}

function postSimulation() {
  console.log("Posting object to: " + SIMULATIONS_URL)
  fetch(SIMULATIONS_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: this.parentNode[0].value,
      initial_infected: parseInt(this.parentNode[1].value),
      time_running: 0,
      is_running: true
    })
  })
    .then(res => res.json())
    .then(simulation => {
      createMap.call(simulation)
    })
}

function createMap() {
  console.log("generating map...")
  fetch(MAPS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      width: 0,
      height: 0,
      simulation_id: this.id
    })
  })
    .then(res => res.json())
    .then(map => {
      createNodes.call(map, this)
      hideSim()
      showMap()
    })
}

function hideForm() {
  const form_container = document.querySelector("#simulation-form-container")
  form_container.style.display = "none"
}

function showForm(){
  const form_container = document.querySelector("#simulation-form-container")
  form_container.style.display = "block"
}

function hideMap() {
  const map = document.querySelector("#map-container")

  nodes_array = []
  map.style.display = "none"
}

function showMap() {
  const map_container = document.querySelector("#map-container")
  const run_btn = document.querySelector("#run-btn")

  map_container.style.display = "block"

  run_btn.addEventListener("click", () => {
    runSimulation()
  })
}

function spreadInfection(nodes) {
  nodes.forEach(node => {
    if ((this.xpos >= node.xpos -10 && this.xpos <= node.xpos +10) &&
       (this.ypos >= node.ypos -10 && this.ypos <= node.ypos +10)) {
      if (node.state == "healthy") {
        node.state = "infected" 
      }
    }
  })
}

function createNodes(simulation) {
  console.log("generating infected nodes...")
  for (let i = 0; i < simulation.initial_infected; i++) {
    let rand_x = Math.floor(Math.random() * MAP_WIDTH)
    let rand_y = Math.floor(Math.random() * MAP_HEIGHT)
    let rand_age = Math.floor(Math.random() * 85)
    fetch(NODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Node",
        age: rand_age,
        state: "infected",
        xpos: rand_x,
        ypos: rand_y,
        map_id: this.id
      })
    })
      .then(res => res.json())
      .then(node => {
        node["last_angle"] = 0
        nodes_array.push(node)
        renderNodes.call(nodes_array)
      })
  }

  console.log("generating healthy nodes..")
  for (let i = 0; i < 100 - simulation.initial_infected; i++) {
    let rand_x = Math.floor(Math.random() * MAP_WIDTH)
    let rand_y = Math.floor(Math.random() * MAP_HEIGHT)
    let rand_age = Math.floor(Math.random() * 85)
    fetch(NODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Node",
        age: rand_age,
        state: "healthy",
        xpos: rand_x,
        ypos: rand_y,
        map_id: this.id
      })
    })
      .then(res => res.json())
      .then(node => {
        node["last_angle"] = 0
        nodes_array.push(node)
        renderNodes.call(nodes_array)
      })
  }
}

function renderNodes() {
  const map = document.querySelector("#map").getContext("2d")


  const infected_nodes = this.filter(node => node.state == "infected")
  const healthy_nodes = this.filter(node => node.state == "healthy")

  map.beginPath()
  infected_nodes.forEach(node => {
    map.moveTo(node.xpos, node.ypos)
    map.arc(node.xpos, node.ypos, 4, 0, Math.PI * 2, true)
    map.fillStyle = "#ff2626"
  })
  map.fill()

  map.beginPath()
  healthy_nodes.forEach(node => {
    map.moveTo(node.xpos, node.ypos)
    map.arc(node.xpos, node.ypos, 4, 0, Math.PI * 2, true)
    map.fillStyle = "#57f542"
  })
  map.fill()
}

function refreshScreen() {
  let context = this.getContext("2d")
  context.clearRect(0, 0, this.width, this.height)
  renderScreen(nodes_array)
}

function renderScreen(nodes) {
  renderNodes.call(nodes)
}

function killNode() {
  this.state = "dead"
}

function checkNodeCollide(nx, ny) {
  if (nx >= MAP_WIDTH -5 || nx <= 5) {
    return true
  } else if (ny >= MAP_HEIGHT -5 || ny <= 5) {
    return true
  } else {
    return false
  }
}

function moveNode() {
  if (Math.floor(Math.random() * 8) == 0) {
    this.last_angle = Math.floor(Math.random() * 360)
  }

  const radians = this.last_angle * Math.PI / 180

  let nx = Math.floor(this.xpos + Math.cos(radians) * 4)
  let ny = Math.floor(this.ypos + Math.sin(radians) * 4)

  if (!checkNodeCollide(nx, ny)) {
    this.xpos = nx
    this.ypos = ny
  } else {
    let nx = this.xpos + -Math.cos(radians) * 2
    let ny = this.ypos + -Math.sin(radians) * 2
    this.xpos = nx
    this.ypos = ny
  }
}

function updateNode() {
  moveNode.call(this)
  if (this.state == "infected") {
    if (Math.floor(Math.random() * 400) == 0) {
      killNode.call(this)
    }
    spreadInfection.call(this, nodes_array)
  }
  refreshScreen.call(map)
}

function stepSimulation() {
  const map = document.querySelector("#map")
  nodes_array.map(node => {
    updateNode.call(node)
    refreshScreen.call(map)
  })
}

function runSimulation() {
  setInterval(() => {stepSimulation()}, 10)
}

createSimulation()
