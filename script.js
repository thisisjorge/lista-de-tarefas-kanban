document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const taskInput = document.getElementById("task-input")
  const addTaskBtn = document.getElementById("add-task-btn")
  const columns = document.querySelectorAll(".tasks-container")

  // Estado da aplicação
  let tasks = []

  // Carregar tarefas do localStorage
  function loadTasks() {
    const savedTasks = localStorage.getItem("kanbanTasks")
    if (savedTasks) {
      tasks = JSON.parse(savedTasks)
      renderTasks()
    }
  }

  // Salvar tarefas no localStorage
  function saveTasks() {
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks))
  }

  // Renderizar todas as tarefas
  function renderTasks() {
    // Limpar todas as colunas
    columns.forEach((column) => {
      column.innerHTML = ""
    })

    // Renderizar cada tarefa na coluna apropriada
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task)
      document.getElementById(task.column).appendChild(taskElement)
    })
  }

  // Criar elemento HTML para uma tarefa
  function createTaskElement(task) {
    const taskElement = document.createElement("div")
    taskElement.className = `task-card ${task.column}`
    taskElement.setAttribute("draggable", "true")
    taskElement.setAttribute("data-id", task.id)

    // Conteúdo da tarefa
    const contentElement = document.createElement("div")
    contentElement.className = "task-content"
    contentElement.textContent = task.content

    // Rodapé da tarefa
    const footerElement = document.createElement("div")
    footerElement.className = "task-footer"

    // Tag da coluna
    const tagElement = document.createElement("span")
    tagElement.className = `task-tag ${task.column}`
    tagElement.textContent = getColumnLabel(task.column)

    // Botão de excluir
    const deleteBtn = document.createElement("button")
    deleteBtn.className = "delete-btn"
    deleteBtn.innerHTML = "&times;"
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      deleteTask(task.id)
    })

    // Montar o elemento da tarefa
    taskElement.appendChild(contentElement)
    taskElement.appendChild(footerElement)
    footerElement.appendChild(tagElement)
    taskElement.appendChild(deleteBtn)

    // Eventos de arrastar e soltar
    taskElement.addEventListener("dragstart", handleDragStart)
    taskElement.addEventListener("dragend", handleDragEnd)

    return taskElement
  }

  // Obter o rótulo da coluna
  function getColumnLabel(column) {
    switch (column) {
      case "em-aberto":
        return "Aberto"
      case "bid":
        return "Bid"
      case "em-andamento":
        return "Andamento"
      case "entregue":
        return "Entregue"
      default:
        return ""
    }
  }

  // Adicionar nova tarefa
  function addTask() {
    const content = taskInput.value.trim()
    if (content === "") return

    const newTask = {
      id: Date.now().toString(),
      content: content,
      column: "em-aberto",
      createdAt: new Date().toISOString(),
    }

    tasks.push(newTask)
    saveTasks()
    renderTasks()

    // Limpar o input
    taskInput.value = ""
    taskInput.focus()
  }

  // Excluir tarefa
  function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId)
    saveTasks()
    renderTasks()
  }

  // Mover tarefa para outra coluna
  function moveTask(taskId, targetColumn) {
    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, column: targetColumn }
      }
      return task
    })

    saveTasks()
    renderTasks()
  }

  // Manipuladores de eventos de arrastar e soltar
  let draggedTask = null

  function handleDragStart(e) {
    draggedTask = e.target
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-id"))
    setTimeout(() => {
      e.target.classList.add("dragging")
    }, 0)
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging")
    draggedTask = null
  }

  // Configurar eventos de arrastar e soltar para as colunas
  columns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
    })

    column.addEventListener("dragenter", function (e) {
      e.preventDefault()
      this.classList.add("drag-over")
    })

    column.addEventListener("dragleave", function () {
      this.classList.remove("drag-over")
    })

    column.addEventListener("drop", function (e) {
      e.preventDefault()
      this.classList.remove("drag-over")

      const taskId = e.dataTransfer.getData("text/plain")
      const targetColumn = this.id

      if (taskId && targetColumn) {
        moveTask(taskId, targetColumn)
      }
    })
  })

  // Evento de clique no botão de adicionar tarefa
  addTaskBtn.addEventListener("click", addTask)

  // Evento de pressionar Enter no input
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask()
    }
  })

  // Inicializar a aplicação
  loadTasks()
})
