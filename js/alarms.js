// Alarms Manager - Handles alarms and reminders
class AlarmsManager {
    constructor() {
        this.editingAlarmId = null;
        this.activeAlarms = new Map(); // Track active alarm timeouts
        this.notificationPermission = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.loadAlarms();
        this.checkActiveAlarms();
        
        // Check alarms every minute
        setInterval(() => {
            this.checkActiveAlarms();
        }, 60000);
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            
            if (!this.notificationPermission && window.app) {
                window.app.showNotification('Enable notifications to receive alarm alerts! 🔔', 'info', 5000);
            }
        }
    }

    setupEventListeners() {
        // Add alarm button
        const addAlarmBtn = document.getElementById('addAlarmBtn');
        if (addAlarmBtn) {
            addAlarmBtn.addEventListener('click', () => this.showAlarmModal());
        }

        // Modal controls
        const closeAlarmModal = document.getElementById('closeAlarmModal');
        const cancelAlarm = document.getElementById('cancelAlarm');
        const saveAlarm = document.getElementById('saveAlarm');
        const alarmModal = document.getElementById('alarmModal');

        if (closeAlarmModal) {
            closeAlarmModal.addEventListener('click', () => this.hideAlarmModal());
        }

        if (cancelAlarm) {
            cancelAlarm.addEventListener('click', () => this.hideAlarmModal());
        }

        if (saveAlarm) {
            saveAlarm.addEventListener('click', () => this.saveAlarm());
        }

        // Modal backdrop click
        if (alarmModal) {
            alarmModal.addEventListener('click', (e) => {
                if (e.target === alarmModal) {
                    this.hideAlarmModal();
                }
            });
        }

        // Set default date and time
        this.setDefaultDateTime();
    }

    setDefaultDateTime() {
        const alarmDate = document.getElementById('alarmDate');
        const alarmTime = document.getElementById('alarmTime');

        if (alarmDate) {
            const today = new Date();
            alarmDate.value = today.toISOString().split('T')[0];
        }

        if (alarmTime) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes() + 5).padStart(2, '0'); // 5 minutes from now
            alarmTime.value = `${hours}:${minutes}`;
        }
    }

    loadAlarms() {
        const alarms = StorageManager.getAlarms();
        this.displayAlarms(alarms);
    }

    displayAlarms(alarms) {
        const alarmsContainer = document.getElementById('alarmsContainer');
        if (!alarmsContainer) return;

        if (alarms.length === 0) {
            alarmsContainer.innerHTML = this.getEmptyStateHTML();
            return;
        }

        // Sort alarms by datetime
        const sortedAlarms = alarms.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        const alarmsHTML = sortedAlarms.map(alarm => this.createAlarmHTML(alarm)).join('');
        alarmsContainer.innerHTML = alarmsHTML;

        // Add event listeners to alarm actions
        this.attachAlarmEventListeners();
    }

    createAlarmHTML(alarm) {
        const alarmDate = new Date(alarm.datetime);
        const now = new Date();
        const isOverdue = alarmDate < now && alarm.active;
        const isToday = alarmDate.toDateString() === now.toDateString();
        
        const timeDisplay = alarmDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });

        let dateDisplay;
        if (isToday) {
            dateDisplay = 'Today';
        } else {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (alarmDate.toDateString() === tomorrow.toDateString()) {
                dateDisplay = 'Tomorrow';
            } else {
                dateDisplay = alarmDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: alarmDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        }

        const repeatText = this.getRepeatText(alarm.repeat);
        const statusClass = isOverdue ? 'overdue' : (alarm.active ? 'active' : 'inactive');

        return `
            <div class="alarm-item ${statusClass}" data-alarm-id="${alarm.id}">
                <div class="alarm-info">
                    <h3 class="alarm-title">${this.escapeHtml(alarm.title)}</h3>
                    <div class="alarm-time">${timeDisplay}</div>
                    <div class="alarm-details">
                        ${dateDisplay}${repeatText ? ` • ${repeatText}` : ''}
                        ${alarm.note ? ` • ${this.escapeHtml(alarm.note)}` : ''}
                        ${isOverdue ? ' • <span style="color: #ef4444;">Overdue</span>' : ''}
                    </div>
                </div>
                <div class="alarm-controls">
                    <button class="alarm-toggle ${alarm.active ? 'active' : ''}" 
                            data-alarm-id="${alarm.id}" 
                            title="${alarm.active ? 'Turn off' : 'Turn on'}">
                    </button>
                    <button class="alarm-action-btn edit-alarm" title="Edit alarm">✏️</button>
                    <button class="alarm-action-btn delete-alarm" title="Delete alarm">🗑️</button>
                </div>
            </div>
        `;
    }

    attachAlarmEventListeners() {
        // Toggle alarm buttons
        const toggleBtns = document.querySelectorAll('.alarm-toggle');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alarmId = e.target.dataset.alarmId;
                this.toggleAlarm(alarmId);
            });
        });

        // Edit alarm buttons
        const editBtns = document.querySelectorAll('.edit-alarm');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alarmId = e.target.closest('.alarm-item').dataset.alarmId;
                this.editAlarm(alarmId);
            });
        });

        // Delete alarm buttons
        const deleteBtns = document.querySelectorAll('.delete-alarm');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const alarmId = e.target.closest('.alarm-item').dataset.alarmId;
                this.deleteAlarm(alarmId);
            });
        });
    }

    showAlarmModal(alarm = null) {
        const modal = document.getElementById('alarmModal');
        const modalTitle = document.getElementById('alarmModalTitle');
        const alarmTitle = document.getElementById('alarmTitle');
        const alarmTime = document.getElementById('alarmTime');
        const alarmDate = document.getElementById('alarmDate');
        const alarmRepeat = document.getElementById('alarmRepeat');
        const alarmNote = document.getElementById('alarmNote');

        if (!modal) return;

        // Reset form
        if (alarmTitle) alarmTitle.value = '';
        if (alarmNote) alarmNote.value = '';
        if (alarmRepeat) alarmRepeat.value = 'none';

        if (alarm) {
            // Edit mode
            this.editingAlarmId = alarm.id;
            if (modalTitle) modalTitle.textContent = 'Edit Alarm';
            
            const alarmDateTime = new Date(alarm.datetime);
            if (alarmTitle) alarmTitle.value = alarm.title;
            if (alarmTime) alarmTime.value = alarmDateTime.toTimeString().slice(0, 5);
            if (alarmDate) alarmDate.value = alarmDateTime.toISOString().split('T')[0];
            if (alarmRepeat) alarmRepeat.value = alarm.repeat;
            if (alarmNote) alarmNote.value = alarm.note || '';
        } else {
            // Add mode
            this.editingAlarmId = null;
            if (modalTitle) modalTitle.textContent = 'Add New Alarm';
            this.setDefaultDateTime();
        }

        modal.classList.add('active');
        
        // Focus on title field
        setTimeout(() => {
            if (alarmTitle) alarmTitle.focus();
        }, 100);
    }

    hideAlarmModal() {
        const modal = document.getElementById('alarmModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.editingAlarmId = null;
    }

    saveAlarm() {
        const alarmTitle = document.getElementById('alarmTitle');
        const alarmTime = document.getElementById('alarmTime');
        const alarmDate = document.getElementById('alarmDate');
        const alarmRepeat = document.getElementById('alarmRepeat');
        const alarmNote = document.getElementById('alarmNote');

        if (!alarmTitle || !alarmTime || !alarmDate) return;

        const title = alarmTitle.value.trim();
        const time = alarmTime.value;
        const date = alarmDate.value;
        const repeat = alarmRepeat ? alarmRepeat.value : 'none';
        const note = alarmNote ? alarmNote.value.trim() : '';

        if (!title) {
            if (window.app) {
                window.app.showNotification('Please enter a title for your alarm! ⏰', 'error');
            }
            return;
        }

        if (!time || !date) {
            if (window.app) {
                window.app.showNotification('Please select a valid date and time! 📅', 'error');
            }
            return;
        }

        // Combine date and time
        const datetime = new Date(`${date}T${time}`);
        
        // Check if the datetime is in the past (only for new alarms)
        if (!this.editingAlarmId && datetime < new Date()) {
            if (window.app) {
                window.app.showNotification('Cannot set alarm in the past! ⏰', 'error');
            }
            return;
        }

        const alarmData = {
            title: title,
            datetime: datetime.toISOString(),
            repeat: repeat,
            note: note
        };

        try {
            if (this.editingAlarmId) {
                // Update existing alarm
                const updatedAlarm = StorageManager.updateAlarm(this.editingAlarmId, alarmData);
                if (updatedAlarm) {
                    this.scheduleAlarm(updatedAlarm);
                    if (window.app) {
                        window.app.showNotification('Alarm updated successfully! ⏰', 'success');
                    }
                }
            } else {
                // Add new alarm
                const newAlarm = StorageManager.addAlarm(alarmData);
                if (newAlarm) {
                    this.scheduleAlarm(newAlarm);
                    if (window.app) {
                        window.app.showNotification('Alarm set successfully! ⏰', 'success');
                    }
                }
            }

            this.loadAlarms();
            this.hideAlarmModal();
        } catch (error) {
            console.error('Error saving alarm:', error);
            if (window.app) {
                window.app.showNotification('Error saving alarm. Please try again.', 'error');
            }
        }
    }

    editAlarm(alarmId) {
        const alarms = StorageManager.getAlarms();
        const alarm = alarms.find(a => a.id === alarmId);
        
        if (alarm) {
            this.showAlarmModal(alarm);
        }
    }

    deleteAlarm(alarmId) {
        const alarms = StorageManager.getAlarms();
        const alarm = alarms.find(a => a.id === alarmId);
        
        if (!alarm) return;

        // Confirm deletion
        const confirmed = confirm(`Are you sure you want to delete "${alarm.title}"?`);
        
        if (confirmed) {
            // Clear any active timeout
            this.clearAlarmTimeout(alarmId);
            
            const success = StorageManager.deleteAlarm(alarmId);
            if (success) {
                this.loadAlarms();
                if (window.app) {
                    window.app.showNotification('Alarm deleted successfully! 🗑️', 'success');
                }
            }
        }
    }

    toggleAlarm(alarmId) {
        const updatedAlarm = StorageManager.toggleAlarm(alarmId);
        
        if (updatedAlarm) {
            if (updatedAlarm.active) {
                this.scheduleAlarm(updatedAlarm);
                if (window.app) {
                    window.app.showNotification('Alarm activated! ⏰', 'success');
                }
            } else {
                this.clearAlarmTimeout(alarmId);
                if (window.app) {
                    window.app.showNotification('Alarm deactivated! 🔇', 'info');
                }
            }
            
            this.loadAlarms();
        }
    }

    scheduleAlarm(alarm) {
        if (!alarm.active) return;

        const alarmTime = new Date(alarm.datetime);
        const now = new Date();
        const timeUntilAlarm = alarmTime.getTime() - now.getTime();

        // Clear existing timeout if any
        this.clearAlarmTimeout(alarm.id);

        if (timeUntilAlarm > 0) {
            // Schedule the alarm
            const timeoutId = setTimeout(() => {
                this.triggerAlarm(alarm);
            }, timeUntilAlarm);

            this.activeAlarms.set(alarm.id, timeoutId);
        } else if (alarm.repeat !== 'none') {
            // If alarm is overdue but repeating, schedule next occurrence
            this.scheduleNextRepeat(alarm);
        }
    }

    clearAlarmTimeout(alarmId) {
        if (this.activeAlarms.has(alarmId)) {
            clearTimeout(this.activeAlarms.get(alarmId));
            this.activeAlarms.delete(alarmId);
        }
    }

    triggerAlarm(alarm) {
        // Play notification sound (if available)
        this.playAlarmSound();

        // Show browser notification
        if (this.notificationPermission) {
            const notification = new Notification(alarm.title, {
                body: alarm.note || 'Reminder time!',
                icon: './assets/icon-192.png',
                tag: `alarm-${alarm.id}`,
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }

        // Show in-app notification
        if (window.app) {
            window.app.showNotification(`🔔 ${alarm.title}${alarm.note ? ` - ${alarm.note}` : ''}`, 'info', 10000);
        }

        // Handle repeating alarms
        if (alarm.repeat !== 'none') {
            this.scheduleNextRepeat(alarm);
        } else {
            // Deactivate one-time alarm
            StorageManager.updateAlarm(alarm.id, { active: false });
            this.loadAlarms();
        }

        // Remove from active alarms
        this.activeAlarms.delete(alarm.id);
    }

    scheduleNextRepeat(alarm) {
        const currentTime = new Date(alarm.datetime);
        let nextTime = new Date(currentTime);

        switch (alarm.repeat) {
            case 'daily':
                nextTime.setDate(nextTime.getDate() + 1);
                break;
            case 'weekly':
                nextTime.setDate(nextTime.getDate() + 7);
                break;
            case 'monthly':
                nextTime.setMonth(nextTime.getMonth() + 1);
                break;
            default:
                return;
        }

        // Update the alarm with new datetime
        const updatedAlarm = StorageManager.updateAlarm(alarm.id, {
            datetime: nextTime.toISOString()
        });

        if (updatedAlarm) {
            this.scheduleAlarm(updatedAlarm);
            this.loadAlarms();
        }
    }

    playAlarmSound() {
        // Create audio context and play a simple beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play alarm sound:', error);
        }
    }

    checkActiveAlarms() {
        const alarms = StorageManager.getAlarms();
        const activeAlarms = alarms.filter(alarm => alarm.active);

        activeAlarms.forEach(alarm => {
            if (!this.activeAlarms.has(alarm.id)) {
                this.scheduleAlarm(alarm);
            }
        });
    }

    getRepeatText(repeat) {
        const repeatTexts = {
            'none': '',
            'daily': 'Daily',
            'weekly': 'Weekly',
            'monthly': 'Monthly'
        };
        return repeatTexts[repeat] || '';
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state" style="text-align: center; padding: 3rem 1rem; color: #6b7280;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
                <h3 style="font-size: 1.25rem; color: #374151; margin-bottom: 0.5rem;">No alarms set</h3>
                <p style="line-height: 1.6; margin-bottom: 2rem;">Stay on track by setting reminders for important tasks and events.</p>
                <button onclick="window.alarmsManager.showAlarmModal()" 
                        style="background: #4F46E5; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                    Set Your First Alarm
                </button>
            </div>
        `;
    }

    // Get alarms statistics
    getAlarmsStats() {
        const alarms = StorageManager.getAlarms();
        const now = new Date();
        
        return {
            total: alarms.length,
            active: alarms.filter(alarm => alarm.active).length,
            upcoming: alarms.filter(alarm => alarm.active && new Date(alarm.datetime) > now).length,
            overdue: alarms.filter(alarm => alarm.active && new Date(alarm.datetime) < now).length,
            repeating: alarms.filter(alarm => alarm.repeat !== 'none').length
        };
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Snooze functionality (for future enhancement)
    snoozeAlarm(alarmId, minutes = 10) {
        const alarm = StorageManager.getAlarms().find(a => a.id === alarmId);
        if (alarm) {
            const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);
            const updatedAlarm = StorageManager.updateAlarm(alarmId, {
                datetime: snoozeTime.toISOString()
            });
            
            if (updatedAlarm) {
                this.scheduleAlarm(updatedAlarm);
                if (window.app) {
                    window.app.showNotification(`Alarm snoozed for ${minutes} minutes! 😴`, 'info');
                }
            }
        }
    }
}

// Initialize alarms manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alarmsManager = new AlarmsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlarmsManager;
}