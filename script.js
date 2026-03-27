class HabitTracker {
    constructor() {
        this.habits = [];
        this.todos = [];
        this.journal = {};
        this.habitHistory = {}; // Track habit completion by date
        this.currentDate = new Date();
        this.currentTheme = 'light';
        this.currentEditingHabitId = null;
        this.currentEditingTodoId = null;
        
        // Pomodoro settings
        this.pomodoroSettings = {
            focusDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsPerCycle: 4
        };
        
        // Pomodoro state
        this.pomodoroState = {
            isRunning: false,
            isPaused: false,
            timeRemaining: 25 * 60,
            currentSession: 1,
            isBreakTime: false,
            isLongBreak: false,
            timerInterval: null
        };
        
        this.loadFromStorage();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.updateDates();
        this.bindEvents();
        this.initPomodoro();
        this.renderWeekCalendar();
        this.renderTodos();
        if (this.habits.length === 0) {
            this.addSampleHabits();
        }
        this.render();
    }

    addSampleHabits() {
        const sampleHabits = [
            "Drink 8 glasses of water",
            "Exercise for 30 minutes",
            "Read for 20 minutes",
            "Meditate",
            "Take vitamins",
            "Journal"
        ];
        
        sampleHabits.forEach(name => {
            this.addHabit(name);
        });
    }

    addHabit(name) {
        const habit = {
            id: Date.now(),
            name: name,
            completed: false,
            dateAdded: new Date().toLocaleDateString(),
            daysCompleted: 0,
            goal: 30,
            details: '',
            lastCompletedDate: null
        };
        this.habits.push(habit);
        this.saveToStorage();
        this.render();
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;
        
        const today = new Date().toLocaleDateString();
        const completedToday = habit.lastCompletedDate === today;
        
        // Ensure goal and daysCompleted are initialized
        if (!habit.goal) habit.goal = 30;
        if (!habit.daysCompleted) habit.daysCompleted = 0;
        
        if (completedToday) {
            // Currently checked for today, unchecking it
            habit.daysCompleted = Math.max(0, habit.daysCompleted - 1);
            habit.lastCompletedDate = null;
            habit.completed = false;
        } else {
            // Currently unchecked for today, checking it
            habit.daysCompleted++;
            habit.lastCompletedDate = today;
            habit.completed = true;
        }
        
        this.saveToStorage();
        this.render();
    }

    nextDay() {
        this.currentDate = new Date(this.currentDate.getTime() + 24 * 60 * 60 * 1000);
        const dateKey = this.currentDate.toISOString().split('T')[0];
        
        // Save current day's completion status
        if (!this.habitHistory) {
            this.habitHistory = {};
        }
        this.habitHistory[dateKey] = this.habits.filter(h => h.completed).map(h => h.id);
        
        // Reset habits for new day
        const today = this.currentDate.toLocaleDateString();
        this.habits.forEach(habit => {
            habit.completed = false;
            habit.lastCompletedDate = null;
        });
        this.saveToStorage();
        this.updateDates();
        this.renderWeekCalendar();
        this.render();
    }

    updateDates() {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const dateString = this.currentDate.toLocaleDateString('en-US', options);
        document.getElementById('journalDate').textContent = dateString;
    }

    renderWeekCalendar() {
        const container = document.getElementById('weekCalendar');
        if (!container) return;

        const today = this.currentDate;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        let html = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            
            const isToday = dateKey === today.toISOString().split('T')[0];
            const dateNum = date.getDate();
            const dayName = dayNames[date.getDay()];
            
            // Count completed habits for this day
            let completedCount = 0;
            if (this.habitHistory && this.habitHistory[dateKey]) {
                completedCount = this.habitHistory[dateKey].filter(id => {
                    const habit = this.habits.find(h => h.id === id);
                    return habit && habit.completed;
                }).length;
            }
            const totalHabits = this.habits.length;
            
            const classStr = isToday ? 'calendar-day today' : 'calendar-day';
            html += `
                <div class="${classStr}" data-date="${dateKey}">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${dateNum}</div>
                    <div class="day-progress">${completedCount}/${totalHabits}</div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Add click handlers
        container.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                this.switchToDate(dateStr);
            });
        });
    }

    switchToDate(dateStr) {
        this.currentDate = new Date(dateStr + 'T00:00:00');
        this.updateDates();
        this.renderWeekCalendar();
        this.loadDayHabits(dateStr);
    }

    loadDayHabits(dateStr) {
        // Load habits for the specified date
        // For now, just render the current state
        this.render();
    }

    // Todo List Methods
    addTodo(text, priority = 'medium') {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority,
            dateAdded: new Date().toLocaleDateString(),
            details: '',
            subtasks: []
        };
        this.todos.push(todo);
        this.saveToStorage();
        this.renderTodos();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.renderTodos();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.renderTodos();
        }
    }

    renderTodos() {
        const container = document.getElementById('todoContainer');
        if (!container) return;

        if (this.todos.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one to get started!</p></div>';
            return;
        }

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const sorted = [...this.todos].sort((a, b) => {
            const aOrder = priorityOrder[a.priority] || 1;
            const bOrder = priorityOrder[b.priority] || 1;
            return aOrder - bOrder;
        });

        container.innerHTML = sorted.map(todo => {
            const subtasksHtml = (todo.subtasks && todo.subtasks.length > 0) ? 
                todo.subtasks.map(subtask => `
                    <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                        <input 
                            type="checkbox" 
                            class="subtask-checkbox-inline"
                            data-todo-id="${todo.id}"
                            data-id="${subtask.id}"
                            ${subtask.completed ? 'checked' : ''}>
                        <span class="subtask-text">${this.escapeHtml(subtask.text)}</span>
                        <button class="subtask-delete-inline" data-todo-id="${todo.id}" data-id="${subtask.id}">×</button>
                    </div>
                `).join('') : '<p class="empty-subtasks">No subtasks</p>';

            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <div class="todo-main">
                        <input 
                            type="checkbox" 
                            class="todo-checkbox"
                            data-id="${todo.id}"
                            ${todo.completed ? 'checked' : ''}>
                        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                        <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                        <button class="todo-expand-btn" data-id="${todo.id}" title="View details">↓</button>
                        <button class="todo-delete-btn" data-id="${todo.id}"></button>
                    </div>
                    <div class="todo-details hidden" data-id="${todo.id}">
                        <textarea class="todo-details-text" data-id="${todo.id}" placeholder="Add notes...">${this.escapeHtml(todo.details || '')}</textarea>
                        <div class="subtasks-section">
                            <h4>Subtasks</h4>
                            <div class="subtasks-list-inline" data-id="${todo.id}">
                                ${subtasksHtml}
                            </div>
                            <div class="add-subtask-inline">
                                <input type="text" class="add-subtask-input" data-id="${todo.id}" placeholder="Add a subtask...">
                                <button class="add-subtask-btn-inline" data-id="${todo.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTodo(parseInt(e.target.dataset.id));
            });
        });

        // Expand/collapse details
        container.querySelectorAll('.todo-expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const detailsSection = container.querySelector(`.todo-details[data-id="${id}"]`);
                if (detailsSection) {
                    detailsSection.classList.toggle('hidden');
                    e.target.classList.toggle('expanded');
                }
            });
        });

        // Save details on textarea change
        container.querySelectorAll('.todo-details-text').forEach(textarea => {
            textarea.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const todo = this.todos.find(t => t.id === id);
                if (todo) {
                    todo.details = e.target.value;
                    this.saveToStorage();
                }
            });
        });

        // Add subtask
        container.querySelectorAll('.add-subtask-btn-inline').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const input = container.querySelector(`.add-subtask-input[data-id="${id}"]`);
                if (input && input.value.trim()) {
                    this.addSubtask(id, input.value.trim());
                    input.value = '';
                }
            });
        });

        // Add subtask on Enter
        container.querySelectorAll('.add-subtask-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const btn = container.querySelector(`.add-subtask-btn-inline[data-id="${input.dataset.id}"]`);
                    if (btn) btn.click();
                }
            });
        });

        // Subtask checkbox
        container.querySelectorAll('.subtask-checkbox-inline').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleSubtask(
                    parseInt(e.target.dataset.todoId),
                    parseInt(e.target.dataset.id)
                );
            });
        });

        // Delete subtask
        container.querySelectorAll('.subtask-delete-inline').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteSubtask(
                    parseInt(e.target.dataset.todoId),
                    parseInt(e.target.dataset.id)
                );
            });
        });

        container.querySelectorAll('.todo-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this task?')) {
                    this.deleteTodo(parseInt(e.target.dataset.id));
                }
            });
        });
    }

    bindEvents() {
        // Add habit
        document.getElementById('addBtn').addEventListener('click', () => {
            const input = document.getElementById('habitInput');
            const habitName = input.value.trim();
            if (habitName) {
                this.addHabit(habitName);
                input.value = '';
                input.focus();
            }
        });

        document.getElementById('habitInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addBtn').click();
            }
        });

        // Next day
        document.getElementById('nextDayBtn').addEventListener('click', () => {
            this.nextDay();
        });

        // Journal
        document.getElementById('saveJournalBtn').addEventListener('click', () => {
            this.saveJournal();
        });

        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchPage(e.target.dataset.page);
            });
        });

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsModal')) {
                this.closeSettings();
            }
        });

        // Pomodoro settings modal
        const pomodoroSettingsBtn = document.getElementById('pomodoroSettingsBtn');
        if (pomodoroSettingsBtn) {
            pomodoroSettingsBtn.addEventListener('click', () => this.openPomodoroSettings());
        }

        document.getElementById('closePomodoroSettings').addEventListener('click', () => {
            this.closePomodoroSettings();
        });

        document.getElementById('pomodoroSettingsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('pomodoroSettingsModal')) {
                this.closePomodoroSettings();
            }
        });

        // Theme buttons
        document.querySelectorAll('.theme-swatch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTheme(e.target.dataset.theme);
            });
        });

        // Pomodoro settings buttons
        document.getElementById('focusMinus').addEventListener('click', () => this.adjustSetting('focusDuration', -1, 1, 60));
        document.getElementById('focusPlus').addEventListener('click', () => this.adjustSetting('focusDuration', 1, 1, 60));
        document.getElementById('shortBreakMinus').addEventListener('click', () => this.adjustSetting('shortBreakDuration', -1, 1, 30));
        document.getElementById('shortBreakPlus').addEventListener('click', () => this.adjustSetting('shortBreakDuration', 1, 1, 30));
        document.getElementById('longBreakMinus').addEventListener('click', () => this.adjustSetting('longBreakDuration', -1, 1, 60));
        document.getElementById('longBreakPlus').addEventListener('click', () => this.adjustSetting('longBreakDuration', 1, 1, 60));
        document.getElementById('sessionsMinus').addEventListener('click', () => this.adjustSetting('sessionsPerCycle', -1, 2, 10));
        document.getElementById('sessionsPlus').addEventListener('click', () => this.adjustSetting('sessionsPerCycle', 1, 2, 10));

        // Input change handlers
        document.getElementById('focusDuration').addEventListener('change', () => this.updateSettingFromInput('focusDuration', 1, 60));
        document.getElementById('shortBreakDuration').addEventListener('change', () => this.updateSettingFromInput('shortBreakDuration', 1, 30));
        document.getElementById('longBreakDuration').addEventListener('change', () => this.updateSettingFromInput('longBreakDuration', 1, 60));
        document.getElementById('sessionsPerCycle').addEventListener('change', () => this.updateSettingFromInput('sessionsPerCycle', 2, 10));

        // Habit details modal
        document.getElementById('closeDetails').addEventListener('click', () => this.closeHabitDetails());
        document.getElementById('saveDetailsBtn').addEventListener('click', () => this.saveHabitDetails());
        document.getElementById('habitDetailsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('habitDetailsModal')) {
                this.closeHabitDetails();
            }
        });

        // Todo input and priority
        const todoInput = document.getElementById('todoInput');
        const prioritySelect = document.getElementById('todoPriority');
        const addTodoBtn = document.getElementById('addTodoBtn');
        
        if (addTodoBtn && prioritySelect) {
            addTodoBtn.addEventListener('click', () => {
                const input = document.getElementById('todoInput');
                const todoText = input.value.trim();
                const priority = prioritySelect.value;
                if (todoText) {
                    this.addTodo(todoText, priority);
                    input.value = '';
                    input.focus();
                }
            });
        }

        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && addTodoBtn) {
                    addTodoBtn.click();
                }
            });
        }

        // Timer settings toggle
        const toggleTimerSettingsBtn = document.getElementById('toggleTimerSettingsBtn');
        const hideTimerSettingsBtn = document.getElementById('hideTimerSettingsBtn');
        const timerSettingsPanel = document.getElementById('timerSettingsPanel');
        
        if (toggleTimerSettingsBtn && timerSettingsPanel) {
            toggleTimerSettingsBtn.addEventListener('click', () => {
                if (timerSettingsPanel.classList.contains('hidden')) {
                    timerSettingsPanel.classList.remove('hidden');
                } else {
                    timerSettingsPanel.classList.add('hidden');
                }
            });
        }

        if (hideTimerSettingsBtn && timerSettingsPanel) {
            hideTimerSettingsBtn.addEventListener('click', () => {
                timerSettingsPanel.classList.add('hidden');
            });
        }

        // Todo details modal
        const closeTodoDetailsBtn = document.getElementById('closeTodoDetails');
        const saveTodoDetailsBtn = document.getElementById('saveTodoDetails');
        const todoDetailsModal = document.getElementById('todoDetailsModal');
        const addSubtaskBtn = document.getElementById('addSubtaskBtn');

        if (closeTodoDetailsBtn) {
            closeTodoDetailsBtn.addEventListener('click', () => this.closeTodoDetails());
        }

        if (saveTodoDetailsBtn) {
            saveTodoDetailsBtn.addEventListener('click', () => this.saveTodoDetails());
        }

        if (todoDetailsModal) {
            todoDetailsModal.addEventListener('click', (e) => {
                if (e.target === todoDetailsModal) {
                    this.closeTodoDetails();
                }
            });
        }

        if (addSubtaskBtn) {
            addSubtaskBtn.addEventListener('click', () => {
                const input = document.getElementById('addSubtaskInput');
                if (input && this.currentEditingTodoId) {
                    const text = input.value.trim();
                    if (text) {
                        this.addSubtask(this.currentEditingTodoId, text);
                        input.value = '';
                        input.focus();
                    }
                }
            });
        }

        const addSubtaskInput = document.getElementById('addSubtaskInput');
        if (addSubtaskInput) {
            addSubtaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addSubtaskBtn.click();
                }
            });
        }

        // Pomodoro buttons
        document.getElementById('startPomodoroBtn').addEventListener('click', () => this.startPomodoro());
        document.getElementById('pausePomodoroBtn').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('resetPomodoroBtn').addEventListener('click', () => this.resetPomodoro());

        // Input change handlers
        document.getElementById('focusDuration').addEventListener('change', () => this.updateSettingFromInput('focusDuration', 1, 60));
        document.getElementById('shortBreakDuration').addEventListener('change', () => this.updateSettingFromInput('shortBreakDuration', 1, 30));
        document.getElementById('longBreakDuration').addEventListener('change', () => this.updateSettingFromInput('longBreakDuration', 1, 60));
        document.getElementById('sessionsPerCycle').addEventListener('change', () => this.updateSettingFromInput('sessionsPerCycle', 2, 10));
    }

    adjustSetting(setting, delta, min, max) {
        let newValue = this.pomodoroSettings[setting] + delta;
        newValue = Math.max(min, Math.min(max, newValue));
        this.pomodoroSettings[setting] = newValue;
        document.getElementById(setting).value = newValue;
        this.saveToStorage();
        this.resetPomodoro();
    }

    updateSettingFromInput(setting, min, max) {
        let value = parseInt(document.getElementById(setting).value);
        if (isNaN(value)) value = this.pomodoroSettings[setting];
        value = Math.max(min, Math.min(max, value));
        this.pomodoroSettings[setting] = value;
        document.getElementById(setting).value = value;
        this.saveToStorage();
        this.resetPomodoro();
    }

    initPomodoro() {
        document.getElementById('focusDuration').value = this.pomodoroSettings.focusDuration;
        document.getElementById('shortBreakDuration').value = this.pomodoroSettings.shortBreakDuration;
        document.getElementById('longBreakDuration').value = this.pomodoroSettings.longBreakDuration;
        document.getElementById('sessionsPerCycle').value = this.pomodoroSettings.sessionsPerCycle;

        this.pomodoroState.timeRemaining = this.pomodoroSettings.focusDuration * 60;
        this.updatePomodoroDisplay();
    }

    startPomodoro() {
        if (this.pomodoroState.isRunning && !this.pomodoroState.isPaused) return;

        this.pomodoroState.isRunning = true;
        this.pomodoroState.isPaused = false;

        document.getElementById('startPomodoroBtn').style.display = 'none';
        document.getElementById('pausePomodoroBtn').style.display = 'block';

        this.pomodoroState.timerInterval = setInterval(() => {
            this.pomodoroState.timeRemaining--;

            if (this.pomodoroState.timeRemaining <= 0) {
                this.completePomodoro();
            } else {
                this.updatePomodoroDisplay();
            }
        }, 1000);
    }

    pausePomodoro() {
        this.pomodoroState.isPaused = true;
        clearInterval(this.pomodoroState.timerInterval);

        document.getElementById('startPomodoroBtn').style.display = 'block';
        document.getElementById('pausePomodoroBtn').style.display = 'none';
        document.getElementById('startPomodoroBtn').textContent = 'Resume';
    }

    completePomodoro() {
        clearInterval(this.pomodoroState.timerInterval);
        this.pomodoroState.isRunning = false;

        // Play notification sound
        this.playNotification();

        if (!this.pomodoroState.isBreakTime) {
            // Moving to break
            this.pomodoroState.isBreakTime = true;
            
            if (this.pomodoroState.currentSession % this.pomodoroSettings.sessionsPerCycle === 0) {
                this.pomodoroState.isLongBreak = true;
                this.pomodoroState.timeRemaining = this.pomodoroSettings.longBreakDuration * 60;
                alert('Great work! Time for a long break (Long Break)');
            } else {
                this.pomodoroState.isLongBreak = false;
                this.pomodoroState.timeRemaining = this.pomodoroSettings.shortBreakDuration * 60;
                alert('Taking a short break!');
            }
        } else {
            // Moving to next focus session
            this.pomodoroState.isBreakTime = false;
            this.pomodoroState.currentSession++;
            this.pomodoroState.timeRemaining = this.pomodoroSettings.focusDuration * 60;
            alert('Break time over! Ready for session ' + this.pomodoroState.currentSession + '?');
        }

        document.getElementById('startPomodoroBtn').style.display = 'block';
        document.getElementById('pausePomodoroBtn').style.display = 'none';
        document.getElementById('startPomodoroBtn').textContent = 'Start';
        this.updatePomodoroDisplay();
    }

    resetPomodoro() {
        clearInterval(this.pomodoroState.timerInterval);
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        this.pomodoroState.timeRemaining = this.pomodoroSettings.focusDuration * 60;
        this.pomodoroState.currentSession = 1;
        this.pomodoroState.isBreakTime = false;
        this.pomodoroState.isLongBreak = false;

        document.getElementById('startPomodoroBtn').style.display = 'block';
        document.getElementById('pausePomodoroBtn').style.display = 'none';
        document.getElementById('startPomodoroBtn').textContent = 'Start';
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroState.timeRemaining / 60);
        const seconds = this.pomodoroState.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('pomodoroTimer').textContent = timeString;

        let label = this.pomodoroState.isBreakTime ? 
            (this.pomodoroState.isLongBreak ? 'Long Break' : 'Short Break') : 
            'Focus';
        document.getElementById('pomodoroLabel').textContent = label;
        document.getElementById('pomodoroSession').textContent = `Session ${this.pomodoroState.currentSession}/${this.pomodoroSettings.sessionsPerCycle}`;
    }

    playNotification() {
        // Simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    switchPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        document.getElementById(`${pageName}-page`).classList.add('active');

        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.page === pageName);
        });

        // Load journal if switching to journal page
        if (pageName === 'journal') {
            this.loadJournalEntry();
        }
    }

    saveJournal() {
        const text = document.getElementById('journalInput').value.trim();
        if (text) {
            const dateKey = this.currentDate.toISOString().split('T')[0];
            this.journal[dateKey] = {
                date: this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                text: text,
                timestamp: new Date()
            };
            this.saveToStorage();
            document.getElementById('journalInput').value = '';
            this.loadJournalEntry();
        }
    }

    loadJournalEntry() {
        const dateKey = this.currentDate.toISOString().split('T')[0];
        const entry = this.journal[dateKey];
        
        if (entry) {
            document.getElementById('journalInput').value = entry.text;
        } else {
            document.getElementById('journalInput').value = '';
        }
        
        this.renderJournalEntries();
    }

    renderJournalEntries() {
        const container = document.getElementById('journalEntries');
        const entries = Object.entries(this.journal);
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No journal entries yet.</p></div>';
            return;
        }
        
        container.innerHTML = entries
            .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
            .map(([dateKey, entry]) => `
                <div class="journal-entry">
                    <div class="journal-entry-header">
                        <div class="journal-date">${entry.date}</div>
                        <button class="journal-delete-btn" data-date="${dateKey}" title="Delete entry">×</button>
                    </div>
                    <div class="journal-text">${this.escapeHtml(entry.text)}</div>
                </div>
            `)
            .join('');

        // Add event listeners for delete buttons
        container.querySelectorAll('.journal-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dateKey = e.target.dataset.date;
                if (confirm('Delete this journal entry?')) {
                    this.deleteJournalEntry(dateKey);
                }
            });
        });
    }

    deleteJournalEntry(dateKey) {
        delete this.journal[dateKey];
        this.saveToStorage();
        this.loadJournalEntry();
    }

    openSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
        this.updateStatistics();
        this.highlightCurrentTheme();
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    openPomodoroSettings() {
        document.getElementById('pomodoroSettingsModal').classList.remove('hidden');
    }

    closePomodoroSettings() {
        document.getElementById('pomodoroSettingsModal').classList.add('hidden');
    }

    selectTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        this.saveToStorage();
        this.highlightCurrentTheme();
    }

    applyTheme(theme) {
        document.body.className = '';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'blue') {
            document.body.classList.add('blue-mode');
        } else if (theme === 'pink') {
            document.body.classList.add('pink-mode');
        } else if (theme === 'green') {
            document.body.classList.add('green-mode');
        } else if (theme === 'yellow') {
            document.body.classList.add('yellow-mode');
        } else if (theme === 'purple') {
            document.body.classList.add('purple-mode');
        } else if (theme === 'orange') {
            document.body.classList.add('orange-mode');
        } else if (theme === 'teal') {
            document.body.classList.add('teal-mode');
        } else if (theme === 'red') {
            document.body.classList.add('red-mode');
        }
    }

    highlightCurrentTheme() {
        document.querySelectorAll('.theme-swatch').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.theme === this.currentTheme);
        });
    }

    updateStatistics() {
        const totalCompleted = Object.values(this.journal).length;
        const totalHabits = this.habits.length;
        const totalCompletions = this.habits.reduce((sum, h) => sum + h.daysCompleted, 0);
        const avgCompletion = totalHabits === 0 ? 0 : Math.round((totalCompletions / (totalHabits * 30)) * 100);

        document.getElementById('totalHabits').textContent = totalHabits;
        document.getElementById('totalCompleted').textContent = totalCompletions;
        document.getElementById('avgCompletion').textContent = Math.min(avgCompletion, 100) + '%';
        document.getElementById('journalCount').textContent = totalCompleted;
    }

    render() {
        const container = document.getElementById('habitsContainer');
        
        if (this.habits.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No habits yet. Add one to get started!</p></div>';
            return;
        }

        container.innerHTML = this.habits.map(habit => this.createHabitCard(habit)).join('');

        this.habits.forEach(habit => {
            const checkbox = document.querySelector(`input[data-id="${habit.id}"]`);
            const deleteBtn = document.querySelector(`button.btn-delete[data-id="${habit.id}"]`);
            const detailBtn = document.querySelector(`button.btn-detail[data-id="${habit.id}"]`);
            
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleHabit(habit.id));
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Delete this habit?')) {
                        this.deleteHabit(habit.id);
                    }
                });
            }
            if (detailBtn) {
                detailBtn.addEventListener('click', () => this.openHabitDetails(habit.id));
            }
        });

        this.updateFooter();
    }

    createHabitCard(habit) {
        // Ensure all required fields exist
        const goal = habit.goal || 30;
        const daysCompleted = habit.daysCompleted || 0;
        const progress = Math.min(daysCompleted / goal, 1) * 100;
        const completedClass = habit.completed ? 'completed' : '';

        return `
            <div class="habit-card ${completedClass}">
                <input 
                    type="checkbox" 
                    class="checkbox"
                    data-id="${habit.id}"
                    ${habit.completed ? 'checked' : ''}>
                <div class="habit-info">
                    <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                    <div class="habit-meta">Streak: ${habit.daysCompleted} days</div>
                </div>
                <div class="progress-box">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-label">${Math.round(progress)}%</div>
                </div>
                <button class="btn-detail" data-id="${habit.id}" title="Add details">Details</button>
                <button class="btn-delete" data-id="${habit.id}"></button>
            </div>
        `;
    }

    updateFooter() {
        const completed = this.habits.filter(h => h.completed).length;
        const total = this.habits.length;
        document.getElementById('completedCount').textContent = `${completed}/${total} completed`;
    }

    saveToStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('habitHistory', JSON.stringify(this.habitHistory));
        localStorage.setItem('journal', JSON.stringify(this.journal));
        localStorage.setItem('currentDate', this.currentDate.toISOString());
        localStorage.setItem('theme', this.currentTheme);
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.pomodoroSettings));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('habits');
        const storedTodos = localStorage.getItem('todos');
        const storedHistory = localStorage.getItem('habitHistory');
        const storedJournal = localStorage.getItem('journal');
        const storedDate = localStorage.getItem('currentDate');
        const storedTheme = localStorage.getItem('theme');
        const storedPomodoroSettings = localStorage.getItem('pomodoroSettings');
        
        if (stored) {
            this.habits = JSON.parse(stored);
            // Initialize missing fields for habits loaded from old storage
            const today = new Date().toLocaleDateString();
            this.habits.forEach(habit => {
                if (habit.goal === undefined) habit.goal = 30;
                if (habit.details === undefined) habit.details = '';
                if (habit.lastCompletedDate === undefined) habit.lastCompletedDate = null;
                // Sync completed flag with lastCompletedDate
                habit.completed = habit.lastCompletedDate === today;
            });
        }
        if (storedTodos) {
            this.todos = JSON.parse(storedTodos);
        }
        if (storedHistory) {
            this.habitHistory = JSON.parse(storedHistory);
        }
        if (storedJournal) {
            this.journal = JSON.parse(storedJournal);
        }
        if (storedDate) {
            this.currentDate = new Date(storedDate);
        }
        if (storedTheme) {
            this.currentTheme = storedTheme;
        }
        if (storedPomodoroSettings) {
            this.pomodoroSettings = JSON.parse(storedPomodoroSettings);
        }
    }

    openHabitDetails(id) {
        const habit = this.habits.find(h => h.id === id);
        if (habit) {
            this.currentEditingHabitId = id;
            document.getElementById('habitDetailsName').textContent = this.escapeHtml(habit.name);
            document.getElementById('habitDetailsText').value = habit.details || '';
            document.getElementById('habitGoalInput').value = habit.goal || 30;
            document.getElementById('habitDetailsModal').classList.remove('hidden');
        }
    }

    closeHabitDetails() {
        document.getElementById('habitDetailsModal').classList.add('hidden');
        this.currentEditingHabitId = null;
    }

    saveHabitDetails() {
        if (this.currentEditingHabitId) {
            const habit = this.habits.find(h => h.id === this.currentEditingHabitId);
            if (habit) {
                habit.details = document.getElementById('habitDetailsText').value;
                const goal = parseInt(document.getElementById('habitGoalInput').value);
                habit.goal = Math.max(1, isNaN(goal) ? 30 : goal);
                this.saveToStorage();
                this.closeHabitDetails();
                this.render();
            }
        }
    }

    openTodoDetails(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.currentEditingTodoId = id;
            document.getElementById('todoDetailsName').textContent = this.escapeHtml(todo.text);
            document.getElementById('todoDetailsText').value = todo.details || '';
            this.renderSubtasks();
            document.getElementById('todoDetailsModal').classList.remove('hidden');
        }
    }

    closeTodoDetails() {
        document.getElementById('todoDetailsModal').classList.add('hidden');
        this.currentEditingTodoId = null;
    }

    saveTodoDetails() {
        if (this.currentEditingTodoId) {
            const todo = this.todos.find(t => t.id === this.currentEditingTodoId);
            if (todo) {
                todo.details = document.getElementById('todoDetailsText').value;
                this.saveToStorage();
                this.closeTodoDetails();
                this.renderTodos();
            }
        }
    }

    addSubtask(todoId, text) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            const subtask = {
                id: Date.now(),
                text: text,
                completed: false
            };
            if (!todo.subtasks) {
                todo.subtasks = [];
            }
            todo.subtasks.push(subtask);
            this.saveToStorage();
            // Re-render both inline and modal views
            if (this.currentEditingTodoId === todoId) {
                this.renderSubtasks();
            } else {
                this.renderTodos();
            }
        }
    }

    deleteSubtask(todoId, subtaskId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo && todo.subtasks) {
            todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
            this.saveToStorage();
            // Re-render both inline and modal views
            if (this.currentEditingTodoId === todoId) {
                this.renderSubtasks();
            } else {
                this.renderTodos();
            }
        }
    }

    toggleSubtask(todoId, subtaskId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo && todo.subtasks) {
            const subtask = todo.subtasks.find(s => s.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                this.saveToStorage();
                // Re-render both inline and modal views
                if (this.currentEditingTodoId === todoId) {
                    this.renderSubtasks();
                } else {
                    this.renderTodos();
                }
            }
        }
    }

    renderSubtasks() {
        if (!this.currentEditingTodoId) return;

        const todo = this.todos.find(t => t.id === this.currentEditingTodoId);
        if (!todo) return;

        const subtasksList = document.getElementById('subtasksList');
        if (!subtasksList) return;

        if (!todo.subtasks || todo.subtasks.length === 0) {
            subtasksList.innerHTML = '<p style="color: rgba(0, 0, 0, 0.5); font-size: 14px;">No subtasks yet</p>';
            document.querySelector('.dark-mode') && (subtasksList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">No subtasks yet</p>');
        } else {
            subtasksList.innerHTML = todo.subtasks.map(subtask => `
                <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="subtask-checkbox"
                        data-todo-id="${todo.id}"
                        data-id="${subtask.id}"
                        ${subtask.completed ? 'checked' : ''}>
                    <span class="subtask-text">${this.escapeHtml(subtask.text)}</span>
                    <button class="subtask-delete" data-todo-id="${todo.id}" data-id="${subtask.id}">Delete</button>
                </div>
            `).join('');

            // Add subtask event listeners
            subtasksList.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.toggleSubtask(
                        parseInt(e.target.dataset.todoId),
                        parseInt(e.target.dataset.id)
                    );
                });
            });

            subtasksList.querySelectorAll('.subtask-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('Delete this subtask?')) {
                        this.deleteSubtask(
                            parseInt(e.target.dataset.todoId),
                            parseInt(e.target.dataset.id)
                        );
                    }
                });
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});
