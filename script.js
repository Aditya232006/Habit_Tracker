// DOM elements
const habitInput = document.getElementById('habit-input');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitList = document.getElementById('habit-list');
const reminderMessage = document.getElementById('reminder-message');

// Load habits from local storage
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Save habits to local storage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Get today's date as string
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Calculate streak for a habit
function calculateStreak(completedDates) {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const sortedDates = completedDates.sort().reverse();
    let streak = 0;
    const today = new Date(getTodayDate());
    
    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// Check if habit completed today
function isCompletedToday(habit) {
    const today = getTodayDate();
    return habit.completedDates && habit.completedDates.includes(today);
}

// Get badge info based on streak
function getBadgeInfo(streak) {
    if (streak >= 100) {
        return { level: 'Diamond', emoji: '💎', color: '#00BCD4', threshold: 100 };
    } else if (streak >= 60) {
        return { level: 'Platinum', emoji: '🏆', color: '#9C27B0', threshold: 60 };
    } else if (streak >= 30) {
        return { level: 'Gold', emoji: '🥇', color: '#FFD700', threshold: 30 };
    } else if (streak >= 14) {
        return { level: 'Silver', emoji: '🥈', color: '#C0C0C0', threshold: 14 };
    } else if (streak >= 7) {
        return { level: 'Bronze', emoji: '🥉', color: '#CD7F32', threshold: 7 };
    } else {
        return { level: 'Starter', emoji: '🌱', color: '#8BC34A', threshold: 0 };
    }
}

// Render all habits
function renderHabits() {
    habitList.innerHTML = '';
    
    if (habits.length === 0) {
        habitList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No habits yet. Add one to get started!</p>';
        updateStats();
        return;
    }
    
    // Sort habits: completed today first
    const sortedHabits = [...habits].sort((a, b) => {
        const aCompleted = isCompletedToday(a) ? 0 : 1;
        const bCompleted = isCompletedToday(b) ? 0 : 1;
        return aCompleted - bCompleted;
    });
    
    sortedHabits.forEach((habit, index) => {
        const originalIndex = habits.indexOf(habit);
        const completedToday = isCompletedToday(habit);
        const streak = calculateStreak(habit.completedDates);
        const badge = getBadgeInfo(streak);
        
        const habitCard = document.createElement('div');
        habitCard.className = `habit-card ${completedToday ? 'done' : ''}`;
        
        habitCard.innerHTML = `
            <div class="habit-header">
                <div class="habit-info">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div>
                            <h3>${habit.name}</h3>
                            <div class="habit-stats">
                                <span class="streak">🔥 ${streak} day streak</span>
                                <span class="today-status">${completedToday ? '✓ Done today' : '⭕ Not done'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="badge-container">
                    <div class="badge badge-${badge.level.toLowerCase()}" title="${badge.level}: ${streak}/${badge.threshold + (badge.level !== 'Starter' ? '+' : '')} days">
                        <span class="badge-emoji">${badge.emoji}</span>
                        <span class="badge-text">${badge.level}</span>
                    </div>
                </div>
            </div>
            <div class="badge-progress">
                <div class="badge-progress-bar" style="width: ${Math.min((streak / badge.threshold) * 100, 100)}%"></div>
            </div>
            <div class="progress">
                <div class="progress-bar" style="width: ${completedToday ? '100' : '0'}%"></div>
            </div>
            <div class="actions">
                <button class="done-btn">${completedToday ? 'Mark Incomplete' : 'Mark Done'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        habitCard.querySelector('.done-btn').addEventListener('click', () => {
            if (!habit.completedDates) habit.completedDates = [];
            const today = getTodayDate();
            
            if (completedToday) {
                habit.completedDates = habit.completedDates.filter(d => d !== today);
            } else {
                habit.completedDates.push(today);
            }
            saveHabits();
            renderHabits();
        });
        
        habitCard.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm(`Delete "${habit.name}"?`)) {
                habits.splice(originalIndex, 1);
                saveHabits();
                renderHabits();
            }
        });
        
        habitList.appendChild(habitCard);
    });
    
    updateStats();
}

// Update statistics
function updateStats() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => isCompletedToday(h)).length;
    const percentage = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
    
    reminderMessage.textContent = totalHabits === 0 
        ? '🚀 Start by adding your first habit!'
        : `📊 ${completedToday}/${totalHabits} habits completed today (${percentage}%)`;
}

// Add habit
function addHabit() {
    const habitName = habitInput.value.trim();
    if (habitName) {
        habits.push({ 
            name: habitName, 
            completedDates: [],
            createdDate: getTodayDate()
        });
        saveHabits();
        renderHabits();
        habitInput.value = '';
        habitInput.focus();
    }
}

// Event listeners
addHabitBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addHabit();
    }
});

// Initial render
renderHabits();
