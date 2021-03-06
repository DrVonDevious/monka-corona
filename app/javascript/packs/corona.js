
const SIMULATIONS_URL = "http://localhost:3000/simulations"
const MAPS_URL = "http://localhost:3000/maps"
const NODE_URL = "http://localhost:3000/nodes"

const MAP_WIDTH = 1090
const MAP_HEIGHT = 800

const ACTIVE_SIMULATIONS = []
let CURRENT_SIMULATION = 0

document.addEventListener("DOMContentLoaded", () => {

  let loop = 0

  const scroll = document.querySelector("#scrollbox")
  const stats = document.querySelector("#stats")

  let nodes_array = []

  function deleteSimulation() {
    fetch(SIMULATIONS_URL + "/" + this.id, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        stopSimulation()
        console.log("Simulation deleted!")
        removeSimulationListing.call(this)
        hideMap()
        showForm()
        hideControls()
        scroll.style.display = "block"
        nodes_array = []
      })
  }

  function getSimulation(){
    fetch(SIMULATIONS_URL)
    .then(res => res.json())
    .then(sims => {
      sims.forEach(sim => {
        showSimulations(sim)
      })
    })
  }

  function removeSimulationListing() {
    const div = document.querySelector(`#simulation-${this.id}`)
    if (div) {
      div.remove()
    }
  }

  function getNodes() {
    fetch(NODE_URL)
      .then(res => res.json())
      .then(nodes => {
        let map_nodes = nodes.filter(node => node.map_id == this.id)
        map_nodes.forEach(node => node["last_angle"] = 1)
        nodes_array = []
        nodes_array.push(...map_nodes)
        const map = document.querySelector("#map")
        hideSim()
        showMap()
        showStats.call(this)
        refreshScreen.call(map)
      })
  }

  function saveNode() {
    fetch(NODE_URL + "/" + this.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: this.state,
        name: this.name,
        xpos: this.xpos,
        ypos: this.ypos,
        age: this.age
      })
    })
  }

  function showSimulations(simulation) {
    const sim = document.createElement("div")
    const name = document.createElement("h1")
    const time = document.createElement("p")
    const initial = document.createElement("p")
    const pop = document.createElement("p")
    const line = document.createElement("hr")

    sim.id = "simulation-" + simulation.id

    name.className = "name"
    time.className = "time"
    initial.className = "initial"
    pop.className = "population"
    line.className = "line-divider"

    name.innerText = `${simulation.name}`
    name.innerText = ` ${simulation.name}`
    time.innerText = `Time: ${simulation.time_running}`
    initial.innerText = `initial_infected: ${simulation.initial_infected}`
    pop.innerText = `Population: ${simulation.initial_population}`

    sim.addEventListener("click", () => {
      CURRENT_SIMULATION = simulation
      getNodes.call(simulation)
    })

    sim.append(name,time,initial,pop, line)
    scroll.append(sim)
  }

  function updateStats() {
    let current_pop = nodes_array.filter(node => node.state == "healthy" || node.state == "infected").length
    let current_healthy = nodes_array.filter(node => node.state == "healthy").length
    let current_infected = nodes_array.filter(node => node.state == "infected").length
    let current_time = setInterval(this.time_running + 1, 1000) / 100
    
    const time = document.querySelector("#time-stat")
    const pop = document.querySelector("#pop-stat")
    const healthy = document.querySelector("#healthy-stat")
    const infected = document.querySelector("#infected-stat")

    time.innerText = "Time: " + Math.floor(current_time)
    pop.innerText = "Population: " + current_pop
    healthy.innerText = "Healthy: " + current_healthy
    infected.innerText = "Infected: " + current_infected
  }

  function showStats() {
    stats.innerHTML = ""

    const div = document.createElement("div")
    const name = document.createElement('h1')
    const time = document.createElement("p")
    const pop = document.createElement("p")
    const healthy = document.createElement("p")
    const infected = document.createElement("p")
    const line = document.createElement("hr")

    pop.id = "pop-stat"
    healthy.id = "healthy-stat"
    infected.id = "infected-stat"
    time.id = "time-stat"

    name.className = "stat-name"
    time.className = "stat-time"
    pop.className = "stat-population"
    healthy.className = "stat-healthy"
    infected.className = "stat-infected"
    line.className = "stat-line"

    name.innerText = this.name
    pop.innerText = "Population: " + this.initial_population
    time.innerText = "Time: " + 0
    healthy.innerText = "Healthy: " + (this.initial_population - this.initial_infected)
    infected.innerText = "Infected: " + this.initial_infected

    div.append(name, time, pop, healthy, infected, line)
    stats.append(div)

    showControls()
  }

  function hideControls() {
    const controls = document.querySelector("#control-panel")
    controls.style.display = "none"
  }

  function showControls() {
    const controls = document.querySelector("#control-panel")
    controls.style.display = "block"
  }

  function createSimulationsButton() {
    let sim_btn = document.querySelector("#sims")
    sim_btn.addEventListener("click", () => {
      scroll.style.display = "block"
      stopSimulation()
      showForm()
      scroll.innerHTML = ""
      getSimulation()
    })
  }

  function newSimulationButton() {
    let new_btn = document.querySelector("#new")
    new_btn.addEventListener("click", () => {
      stopSimulation()
      hideMap()
      showForm()
      scroll.innerHTML = ""
      scroll.style.display = "block"
      hideControls()
      getSimulation()
    })
  }

  function hideSim() {
    scroll.style.display = "none"
  }

  function createSimulation() {
    const form_submit = document.querySelector("#form-submit")

    form_submit.addEventListener("click", () => {
      nodes_array = []
      event.preventDefault()
      postSimulation.call(form_submit)
      hideForm()
    })
  }

  function postSimulation() {
    fetch(SIMULATIONS_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: this.parentNode.parentNode[0].value,
        initial_infected: parseInt(this.parentNode.parentNode[1].value),
        time_running: 0,
        is_running: true,
        initial_population: parseInt(this.parentNode.parentNode[2].value),
        infection_rate: parseInt(this.parentNode.parentNode[3].value)
      })
    })
      .then(res => res.json())
      .then(simulation => {
        CURRENT_SIMULATION = simulation
        createMap.call(simulation)
      })
  }

  function createMapButtons() {
    const stop_button = document.querySelector("#stop-btn")
    const run_btn = document.querySelector("#run-btn")
    const delete_btn = document.querySelector("#delete-btn")

    stop_button.addEventListener("click", () => {
      stopSimulation()
    })

    run_btn.addEventListener("click", () => {
      runSimulation()
    })

    delete_btn.addEventListener("click", () => {
      deleteSimulation.call(CURRENT_SIMULATION)
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
        showStats.call(this)
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
    map_container.style.display = "block"
  }

  function spreadInfection(nodes) {
    nodes.forEach(node => {
      let infect_chance = Math.floor(Math.random() * 99)
      if ((this.xpos >= node.xpos -10 && this.xpos <= node.xpos +10) &&
         (this.ypos >= node.ypos -10 && this.ypos <= node.ypos +10)) {
        if ((node.state == "healthy") && (infect_chance < CURRENT_SIMULATION.infection_rate)) {
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
          name: "Test node",
          age: rand_age,
          state: "infected",
          xpos: rand_x,
          ypos: rand_y,
          map_id: this.id
        })
      })
        .then(res => res.json())
        .then(node => {
          node["last_angle"] = Math.floor(Math.random() * (Math.PI * 2))
          nodes_array.push(node)
          refreshScreen.call(map)
        })
    }

    console.log("generating healthy nodes..")
    for (let i = 0; i < simulation.initial_population - simulation.initial_infected; i++) {
      let rand_x = Math.floor(Math.random() * MAP_WIDTH)
      let rand_y = Math.floor(Math.random() * MAP_HEIGHT)
      let rand_age = Math.floor(Math.random() * 85)
      fetch(NODE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test name",
          age: rand_age,
          state: "healthy",
          xpos: rand_x,
          ypos: rand_y,
          map_id: this.id
        })
      })
        .then(res => res.json())
        .then(node => {
          const map = document.querySelector("#map")
          node["last_angle"] = 0
          nodes_array.push(node)
          refreshScreen.call(map)
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
    renderNodes.call(nodes_array)
  }

  function killNode() {
    this.state = "dead"
  }

  function checkNodeCollide(nx, ny) {
    if (nx >= MAP_WIDTH -5 || nx <= 5) {
      return true
    } else if (ny >= MAP_HEIGHT -30 || ny <= 5) {
      return true
    } else {
      return false
    }
  }

  function moveNode() {
    if (Math.floor(Math.random() * 8) == 0) {
      this.last_angle = Math.floor(Math.random() * (Math.PI * 2))
    }

    let nx = (this.xpos + (3 * Math.cos(this.last_angle)))
    let ny = (this.ypos + (3 * Math.sin(this.last_angle)))

    if (!checkNodeCollide(nx, ny)) {
      this.xpos = nx
      this.ypos = ny
    } else {
      this.xpos = (this.xpos + (3 * -Math.cos(this.last_angle)))
      this.ypos = (this.ypos + (3 * -Math.sin(this.last_angle)))

      if (this.xpos < 5) { this.xpos = 5 }
      if (this.ypos < 5) { this.ypos = 5 }
      if (this.xpos > MAP_WIDTH -5) { this.ypos = MAP_WIDTH -5 }
      if (this.ypos > MAP_HEIGHT -30) { this.ypos = MAP_HEIGHT -30 }
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
  }

  function stepSimulation() {
    const map = document.querySelector("#map")
    updateStats.call(CURRENT_SIMULATION)
    nodes_array.map(node => {
      updateNode.call(node)
    })
    refreshScreen.call(map)
  }

  function stopSimulation() {
    console.log("Stopping simulation...")

    nodes_array.map(node => {
      saveNode.call(node)
    })

    clearInterval(loop)
  }

  function runSimulation() {
    clearInterval(loop)
    loop = setInterval(() => {stepSimulation()}, 10)
  }

  createSimulation()
  getSimulation()
  createSimulationsButton()
  newSimulationButton()
  createMapButtons()

})
