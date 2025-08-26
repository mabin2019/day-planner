// Storage Manager - Handles all local storage operations
class StorageManager {
    static STORAGE_KEYS = {
        NOTES: 'dayPlanner_notes',
        ALARMS: 'dayPlanner_alarms',
        GAME_DATA: 'dayPlanner_gameData',
        QUOTES: 'dayPlanner_quotes',
        WISHES: 'dayPlanner_wishes',
        SETTINGS: 'dayPlanner_settings'
    };

    // Notes Management
    static getNotes() {
        try {
            const notes = localStorage.getItem(this.STORAGE_KEYS.NOTES);
            return notes ? JSON.parse(notes) : [];
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    static saveNotes(notes) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.NOTES, JSON.stringify(notes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }

    static addNote(note) {
        const notes = this.getNotes();
        const newNote = {
            id: Date.now().toString(),
            title: note.title || 'Untitled',
            content: note.content || '',
            important: note.important || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote);
        this.saveNotes(notes);
        return newNote;
    }

    static updateNote(id, updates) {
        const notes = this.getNotes();
        const index = notes.findIndex(note => note.id === id);
        if (index !== -1) {
            notes[index] = {
                ...notes[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveNotes(notes);
            return notes[index];
        }
        return null;
    }

    static deleteNote(id) {
        const notes = this.getNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        this.saveNotes(filteredNotes);
        return filteredNotes.length < notes.length;
    }

    // Alarms Management
    static getAlarms() {
        try {
            const alarms = localStorage.getItem(this.STORAGE_KEYS.ALARMS);
            return alarms ? JSON.parse(alarms) : [];
        } catch (error) {
            console.error('Error loading alarms:', error);
            return [];
        }
    }

    static saveAlarms(alarms) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
        } catch (error) {
            console.error('Error saving alarms:', error);
        }
    }

    static addAlarm(alarm) {
        const alarms = this.getAlarms();
        const newAlarm = {
            id: Date.now().toString(),
            title: alarm.title || 'Reminder',
            datetime: alarm.datetime,
            repeat: alarm.repeat || 'none',
            note: alarm.note || '',
            active: true,
            createdAt: new Date().toISOString()
        };
        alarms.push(newAlarm);
        this.saveAlarms(alarms);
        return newAlarm;
    }

    static updateAlarm(id, updates) {
        const alarms = this.getAlarms();
        const index = alarms.findIndex(alarm => alarm.id === id);
        if (index !== -1) {
            alarms[index] = {
                ...alarms[index],
                ...updates
            };
            this.saveAlarms(alarms);
            return alarms[index];
        }
        return null;
    }

    static deleteAlarm(id) {
        const alarms = this.getAlarms();
        const filteredAlarms = alarms.filter(alarm => alarm.id !== id);
        this.saveAlarms(filteredAlarms);
        return filteredAlarms.length < alarms.length;
    }

    static toggleAlarm(id) {
        const alarms = this.getAlarms();
        const alarm = alarms.find(alarm => alarm.id === id);
        if (alarm) {
            alarm.active = !alarm.active;
            this.saveAlarms(alarms);
            return alarm;
        }
        return null;
    }

    // Game Data Management
    static getGameData() {
        try {
            const gameData = localStorage.getItem(this.STORAGE_KEYS.GAME_DATA);
            return gameData ? JSON.parse(gameData) : {
                highScores: [],
                todayScore: 0,
                totalGamesPlayed: 0,
                dailyWordsCompleted: [],
                lastPlayedDate: null
            };
        } catch (error) {
            console.error('Error loading game data:', error);
            return {
                highScores: [],
                todayScore: 0,
                totalGamesPlayed: 0,
                dailyWordsCompleted: [],
                lastPlayedDate: null
            };
        }
    }

    static saveGameData(gameData) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.GAME_DATA, JSON.stringify(gameData));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }

    static addHighScore(score, wordsCompleted) {
        const gameData = this.getGameData();
        const newScore = {
            score: score,
            wordsCompleted: wordsCompleted,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        gameData.highScores.push(newScore);
        gameData.highScores.sort((a, b) => b.score - a.score);
        gameData.highScores = gameData.highScores.slice(0, 10); // Keep top 10

        this.saveGameData(gameData);
        return newScore;
    }

    static updateTodayScore(score) {
        const gameData = this.getGameData();
        gameData.todayScore = Math.max(gameData.todayScore, score);
        gameData.lastPlayedDate = new Date().toDateString();
        this.saveGameData(gameData);
    }

    // Quotes Management
    static getQuotesData() {
        try {
            const quotesData = localStorage.getItem(this.STORAGE_KEYS.QUOTES);
            return quotesData ? JSON.parse(quotesData) : {
                dailyQuote: null,
                lastQuoteDate: null,
                favoriteQuotes: []
            };
        } catch (error) {
            console.error('Error loading quotes data:', error);
            return {
                dailyQuote: null,
                lastQuoteDate: null,
                favoriteQuotes: []
            };
        }
    }

    static saveQuotesData(quotesData) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.QUOTES, JSON.stringify(quotesData));
        } catch (error) {
            console.error('Error saving quotes data:', error);
        }
    }

    static setDailyQuote(quote) {
        const quotesData = this.getQuotesData();
        quotesData.dailyQuote = quote;
        quotesData.lastQuoteDate = new Date().toDateString();
        this.saveQuotesData(quotesData);
    }

    static addFavoriteQuote(quote) {
        const quotesData = this.getQuotesData();
        const favoriteQuote = {
            ...quote,
            addedAt: new Date().toISOString()
        };
        quotesData.favoriteQuotes.unshift(favoriteQuote);
        quotesData.favoriteQuotes = quotesData.favoriteQuotes.slice(0, 50); // Keep last 50
        this.saveQuotesData(quotesData);
    }

    // Wishes Management
    static getWishesData() {
        try {
            const wishesData = localStorage.getItem(this.STORAGE_KEYS.WISHES);
            return wishesData ? JSON.parse(wishesData) : {
                lastCheckedDate: null,
                customWishes: []
            };
        } catch (error) {
            console.error('Error loading wishes data:', error);
            return {
                lastCheckedDate: null,
                customWishes: []
            };
        }
    }

    static saveWishesData(wishesData) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.WISHES, JSON.stringify(wishesData));
        } catch (error) {
            console.error('Error saving wishes data:', error);
        }
    }

    static addCustomWish(wish) {
        const wishesData = this.getWishesData();
        const newWish = {
            id: Date.now().toString(),
            title: wish.title,
            message: wish.message,
            date: wish.date, // MM-DD format
            recurring: wish.recurring || true,
            createdAt: new Date().toISOString()
        };
        wishesData.customWishes.push(newWish);
        this.saveWishesData(wishesData);
        return newWish;
    }

    // Settings Management
    static getSettings() {
        try {
            const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : {
                notifications: true,
                soundEnabled: true,
                theme: 'light',
                language: 'en',
                timeFormat: '12h'
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                notifications: true,
                soundEnabled: true,
                theme: 'light',
                language: 'en',
                timeFormat: '12h'
            };
        }
    }

    static saveSettings(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    static updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
        return settings;
    }

    // Utility Methods
    static clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    static exportData() {
        const data = {};
        Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[name] = JSON.parse(value);
                } catch (error) {
                    data[name] = value;
                }
            }
        });
        return data;
    }

    static importData(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                const key = this.STORAGE_KEYS[name];
                if (key) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Get storage usage information
    static getStorageInfo() {
        let totalSize = 0;
        const itemSizes = {};
        
        Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
            const value = localStorage.getItem(key);
            if (value) {
                const size = new Blob([value]).size;
                itemSizes[name] = size;
                totalSize += size;
            }
        });

        return {
            totalSize,
            itemSizes,
            totalSizeFormatted: this.formatBytes(totalSize)
        };
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Make StorageManager globally available
window.StorageManager = StorageManager;