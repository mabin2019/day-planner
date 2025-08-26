// Main App Controller
class DayPlannerApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.updateDateTime();
        this.setGreeting();
        this.updateStats();
        this.setupServiceWorker();
        
        // Update date/time every minute
        setInterval(() => {
            this.updateDateTime();
            this.setGreeting();
        }, 60000);

        // Update stats every 5 seconds
        setInterval(() => {
            this.updateStats();
        }, 5000);
        
        console.log('Daily Planner App initialized');
    }

    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-page="${pageId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentPage = pageId;

        // Trigger page-specific initialization
        this.onPageChange(pageId);
    }

    onPageChange(pageId) {
        switch(pageId) {
            case 'home':
                if (window.quotesManager) {
                    window.quotesManager.loadDailyQuote();
                }
                if (window.wishesManager) {
                    window.wishesManager.checkAndDisplayWishes();
                }
                break;
            case 'game':
                if (window.gameManager) {
                    window.gameManager.init();
                }
                break;
            case 'notes':
                if (window.notesManager) {
                    window.notesManager.loadNotes();
                }
                break;
            case 'alarms':
                if (window.alarmsManager) {
                    window.alarmsManager.loadAlarms();
                }
                break;
        }
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    setGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greeting;

        if (hour < 6) {
            greeting = "Good Night! 🌙";
        } else if (hour < 12) {
            greeting = "Good Morning! ☀️";
        } else if (hour < 17) {
            greeting = "Good Afternoon! 🌤️";
        } else if (hour < 21) {
            greeting = "Good Evening! 🌆";
        } else {
            greeting = "Good Night! 🌙";
        }

        const greetingElement = document.getElementById('greeting');
        if (greetingElement) {
            greetingElement.textContent = greeting;
        }
    }

    updateStats() {
        // Update notes count
        const notesCount = StorageManager.getNotes().length;
        const notesCountElement = document.getElementById('notesCount');
        if (notesCountElement) {
            notesCountElement.textContent = notesCount;
        }

        // Update reminders count
        const alarms = StorageManager.getAlarms();
        const activeReminders = alarms.filter(alarm => alarm.active && new Date(alarm.datetime) > new Date()).length;
        const remindersCountElement = document.getElementById('remindersCount');
        if (remindersCountElement) {
            remindersCountElement.textContent = activeReminders;
        }

        // Update game score
        const gameScore = StorageManager.getGameData().todayScore || 0;
        const gameScoreElement = document.getElementById('gameScore');
        if (gameScoreElement) {
            gameScoreElement.textContent = gameScore;
        }
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notificationsContainer = document.getElementById('notifications');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

        notificationsContainer.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notificationsContainer.removeChild(notification);
            }, 300);
        }, duration);
    }

    // Utility function to format time
    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Utility function to format date
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Check if it's a new day and reset daily data
    checkNewDay() {
        const today = new Date().toDateString();
        const lastActiveDate = localStorage.getItem('lastActiveDate');
        
        if (lastActiveDate !== today) {
            // Reset daily game score
            const gameData = StorageManager.getGameData();
            gameData.todayScore = 0;
            gameData.dailyWordsCompleted = [];
            StorageManager.saveGameData(gameData);
            
            // Mark today as active
            localStorage.setItem('lastActiveDate', today);
            
            return true; // It's a new day
        }
        
        return false; // Same day
    }
}

// Global functions for navigation (used by action buttons)
function showPage(pageId) {
    if (window.app) {
        window.app.showPage(pageId);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DayPlannerApp();
    
    // Check for new day
    window.app.checkNewDay();
});

// Handle visibility change (when app comes back to foreground)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        window.app.checkNewDay();
        window.app.updateStats();
        
        // Refresh current page content
        window.app.onPageChange(window.app.currentPage);
    }
});

// Add custom styles for slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);