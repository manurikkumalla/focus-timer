let initialSeconds = 1500;
let secondsLeft = 1500;
let timer = null;
let currentMode = 'pomodoro';

const timeDisplay = document.getElementById('timeDisplay');
const progressFill = document.getElementById('progressFill');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

const pomodoroTab = document.getElementById('pomodoroTab');
const shortTab = document.getElementById('shortTab');
const longTab = document.getElementById('longTab');

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
let todos = JSON.parse(localStorage.getItem('todos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
    playBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    pomodoroTab.addEventListener('click', () => setMode('pomodoro', 1500));
    shortTab.addEventListener('click', () => setMode('short', 300));
    longTab.addEventListener('click', () => setMode('long', 900));

    todoForm.addEventListener('submit', addTodo);
    renderTodos();
});

function setMode(mode, seconds) {
    currentMode = mode;
    initialSeconds = seconds;
    secondsLeft = seconds;
    
    pomodoroTab.classList.toggle('active', mode === 'pomodoro');
    shortTab.classList.toggle('active', mode === 'short');
    longTab.classList.toggle('active', mode === 'long');

    clearInterval(timer);
    timer = null;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    timeDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const circ = 283;
    const offset = circ - (secondsLeft / initialSeconds) * circ;
    progressFill.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        timer = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();
            if (secondsLeft <= 0) {
                clearInterval(timer);
                timer = null;
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                playBeep();
                alert('Time is up!');
            }
        }, 1000);
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    secondsLeft = initialSeconds;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    updateTimerDisplay();
}

function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
        console.error(e);
    }
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent';
        li.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${idx})">
                <span class="${todo.completed ? 'text-decoration-line-through text-muted' : ''}">${escapeHTML(todo.text)}</span>
            </div>
            <button class="btn-delete-task" onclick="deleteTodo(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        todoList.appendChild(li);
    });
}

function addTodo(e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        localStorage.setItem('todos', JSON.stringify(todos));
        todoInput.value = '';
        renderTodos();
    }
}

function toggleTodo(idx) {
    todos[idx].completed = !todos[idx].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function deleteTodo(idx) {
    todos.splice(idx, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}