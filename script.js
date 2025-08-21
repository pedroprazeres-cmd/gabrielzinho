
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {};
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Close modal when clicking outside
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                closeModal();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const day = document.getElementById('taskDay').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title || !day) {
            alert('Por favor, preencha o título e selecione um dia.');
            return;
        }

        const task = {
            id: this.currentEditingId || this.generateId(),
            title,
            description,
            day,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (!this.tasks[day]) {
            this.tasks[day] = [];
        }

        if (this.currentEditingId) {
            // Editing existing task
            const taskIndex = this.tasks[day].findIndex(t => t.id === this.currentEditingId);
            if (taskIndex !== -1) {
                this.tasks[day][taskIndex] = task;
            }
        } else {
            // Adding new task
            this.tasks[day].push(task);
        }

        this.saveTasks();
        this.loadTasks();
        closeModal();
        this.resetForm();
    }

    loadTasks() {
        const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        
        days.forEach(day => {
            const tasksContainer = document.getElementById(`${day}-tasks`);
            tasksContainer.innerHTML = '';
            
            if (this.tasks[day]) {
                this.tasks[day].forEach(task => {
                    tasksContainer.appendChild(this.createTaskElement(task));
                });
            }
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
        taskDiv.dataset.taskId = task.id;

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="taskManager.toggleComplete('${task.id}', '${task.day}')" title="${task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="edit-btn" onclick="taskManager.editTask('${task.id}', '${task.day}')" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="taskManager.deleteTask('${task.id}', '${task.day}')" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-priority priority-${task.priority}">${this.getPriorityText(task.priority)}</div>
        `;

        return taskDiv;
    }

    getPriorityText(priority) {
        const priorities = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        };
        return priorities[priority] || 'Média';
    }

    editTask(taskId, day) {
        const task = this.tasks[day].find(t => t.id === taskId);
        if (!task) return;

        this.currentEditingId = taskId;
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskDay').value = task.day;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('modal-title').textContent = 'Editar Tarefa';
        
        openModal();
    }

    deleteTask(taskId, day) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks[day] = this.tasks[day].filter(t => t.id !== taskId);
            this.saveTasks();
            this.loadTasks();
        }
    }

    toggleComplete(taskId, day) {
        const task = this.tasks[day].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.loadTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('weeklyTasks', JSON.stringify(this.tasks));
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        this.currentEditingId = null;
        document.getElementById('modal-title').textContent = 'Nova Tarefa';
    }
}

// Modal functions
function openModal() {
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    taskManager.resetForm();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+N to add new task
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openModal();
    }
});

// Initialize the task manager
const taskManager = new TaskManager();

// Add some sample tasks for demonstration (only if no tasks exist)
if (Object.keys(taskManager.tasks).length === 0) {
    const sampleTasks = {
        'segunda': [
            {
                id: 'sample1',
                title: 'Reunião de equipe',
                description: 'Reunião semanal com a equipe de desenvolvimento',
                day: 'segunda',
                priority: 'alta',
                completed: false,
                createdAt: new Date().toISOString()
            }
        ],
        'quarta': [
            {
                id: 'sample2',
                title: 'Academia',
                description: 'Treino de força',
                day: 'quarta',
                priority: 'media',
                completed: true,
                createdAt: new Date().toISOString()
            }
        ]
    };
    
    taskManager.tasks = sampleTasks;
    taskManager.saveTasks();
    taskManager.loadTasks();
}
