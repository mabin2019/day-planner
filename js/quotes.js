// Quotes Manager - Handles motivational quotes
class QuotesManager {
    constructor() {
        this.quotes = [
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle"
            },
            {
                text: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                text: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney"
            },
            {
                text: "Don't let yesterday take up too much of today.",
                author: "Will Rogers"
            },
            {
                text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
                author: "Unknown"
            },
            {
                text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
                author: "Steve Jobs"
            },
            {
                text: "Experience is a hard teacher because she gives the test first, the lesson afterwards.",
                author: "Vernon Law"
            },
            {
                text: "To handle yourself, use your head; to handle others, use your heart.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "Believe you can and you're halfway there.",
                author: "Theodore Roosevelt"
            },
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon"
            },
            {
                text: "The future depends on what you do today.",
                author: "Mahatma Gandhi"
            },
            {
                text: "It is not the mountain we conquer, but ourselves.",
                author: "Sir Edmund Hillary"
            },
            {
                text: "Your limitation—it's only your imagination.",
                author: "Unknown"
            },
            {
                text: "Push yourself, because no one else is going to do it for you.",
                author: "Unknown"
            },
            {
                text: "Great things never come from comfort zones.",
                author: "Unknown"
            },
            {
                text: "Dream it. Wish it. Do it.",
                author: "Unknown"
            },
            {
                text: "Success doesn't just find you. You have to go out and get it.",
                author: "Unknown"
            },
            {
                text: "The harder you work for something, the greater you'll feel when you achieve it.",
                author: "Unknown"
            },
            {
                text: "Dream bigger. Do bigger.",
                author: "Unknown"
            },
            {
                text: "Don't stop when you're tired. Stop when you're done.",
                author: "Unknown"
            },
            {
                text: "Wake up with determination. Go to bed with satisfaction.",
                author: "Unknown"
            },
            {
                text: "Do something today that your future self will thank you for.",
                author: "Sean Patrick Flanery"
            },
            {
                text: "Little things make big days.",
                author: "Unknown"
            },
            {
                text: "It's going to be hard, but hard does not mean impossible.",
                author: "Unknown"
            },
            {
                text: "Don't wait for opportunity. Create it.",
                author: "Unknown"
            },
            {
                text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
                author: "Unknown"
            },
            {
                text: "The key to success is to focus on goals, not obstacles.",
                author: "Unknown"
            },
            {
                text: "You are never too old to set another goal or to dream a new dream.",
                author: "C.S. Lewis"
            },
            {
                text: "A year from now you may wish you had started today.",
                author: "Karen Lamb"
            },
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            },
            {
                text: "Your only limit is your mind.",
                author: "Unknown"
            },
            {
                text: "Good things happen to those who hustle.",
                author: "Anais Nin"
            },
            {
                text: "What seems impossible today will one day become your warm-up.",
                author: "Unknown"
            },
            {
                text: "Make each day your masterpiece.",
                author: "John Wooden"
            },
            {
                text: "The difference between ordinary and extraordinary is that little extra.",
                author: "Jimmy Johnson"
            },
            {
                text: "You don't have to be great to get started, but you have to get started to be great.",
                author: "Les Brown"
            },
            {
                text: "A champion is defined not by their wins but by how they can recover when they fall.",
                author: "Serena Williams"
            }
        ];
        
        this.motivationalCategories = {
            morning: [
                "Today is a new beginning. Make it count! 🌅",
                "Rise and shine! Your dreams are waiting for you! ☀️",
                "Good morning! Today is full of possibilities! 🌟",
                "Wake up and be awesome! Today is your day! 💪",
                "Morning sunshine! Let's make today amazing! ✨"
            ],
            productivity: [
                "Focus on progress, not perfection! 🎯",
                "Small steps lead to big changes! 👣",
                "You're closer than you think! Keep going! 🚀",
                "Every task completed is a victory! 🏆",
                "Stay focused and make it happen! 💯"
            ],
            encouragement: [
                "You've got this! Believe in yourself! 💪",
                "Every challenge is an opportunity to grow! 🌱",
                "You're stronger than you know! 💎",
                "Keep pushing forward. You're amazing! ⭐",
                "Trust the process. You're on the right path! 🛤️"
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDailyQuote();
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshQuote');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.getRandomQuote();
            });
        }
    }

    loadDailyQuote() {
        const quotesData = StorageManager.getQuotesData();
        const today = new Date().toDateString();
        
        // Check if we need a new daily quote
        if (!quotesData.dailyQuote || quotesData.lastQuoteDate !== today) {
            const newQuote = this.getDailyQuote();
            StorageManager.setDailyQuote(newQuote);
            this.displayQuote(newQuote);
        } else {
            this.displayQuote(quotesData.dailyQuote);
        }
    }

    getDailyQuote() {
        // Use date as seed for consistent daily quote
        const today = new Date();
        const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        const index = seed % this.quotes.length;
        
        return {
            ...this.quotes[index],
            type: 'daily',
            date: today.toDateString()
        };
    }

    getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = {
            ...this.quotes[randomIndex],
            type: 'random',
            date: new Date().toDateString()
        };
        
        this.displayQuote(quote);
        return quote;
    }

    getMotivationalMessage(category = 'morning') {
        const messages = this.motivationalCategories[category] || this.motivationalCategories.morning;
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    displayQuote(quote) {
        const quoteTextElement = document.getElementById('dailyQuote');
        const quoteAuthorElement = document.getElementById('quoteAuthor');
        
        if (quoteTextElement && quoteAuthorElement) {
            // Add fade out effect
            quoteTextElement.style.opacity = '0';
            quoteAuthorElement.style.opacity = '0';
            
            setTimeout(() => {
                quoteTextElement.textContent = `"${quote.text}"`;
                quoteAuthorElement.textContent = `— ${quote.author}`;
                
                // Fade in effect
                quoteTextElement.style.transition = 'opacity 0.5s ease';
                quoteAuthorElement.style.transition = 'opacity 0.5s ease';
                quoteTextElement.style.opacity = '1';
                quoteAuthorElement.style.opacity = '1';
            }, 250);
        }
    }

    getQuotesByCategory(category) {
        // This could be expanded to categorize quotes
        return this.quotes.filter(quote => {
            const text = quote.text.toLowerCase();
            switch(category) {
                case 'success':
                    return text.includes('success') || text.includes('achieve') || text.includes('goal');
                case 'motivation':
                    return text.includes('dream') || text.includes('believe') || text.includes('can');
                case 'wisdom':
                    return text.includes('learn') || text.includes('experience') || text.includes('wisdom');
                default:
                    return true;
            }
        });
    }

    addToFavorites(quote) {
        StorageManager.addFavoriteQuote(quote);
        if (window.app) {
            window.app.showNotification('Quote added to favorites! ⭐', 'success');
        }
    }

    getFavoriteQuotes() {
        const quotesData = StorageManager.getQuotesData();
        return quotesData.favoriteQuotes || [];
    }

    shareQuote(quote) {
        const shareText = `"${quote.text}" — ${quote.author}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Inspirational Quote',
                text: shareText,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback to clipboard
            this.copyToClipboard(shareText);
            if (window.app) {
                window.app.showNotification('Quote copied to clipboard! 📋', 'success');
            }
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            
            document.body.removeChild(textArea);
        }
    }

    // Get contextual quote based on time of day
    getContextualQuote() {
        const hour = new Date().getHours();
        let filteredQuotes = this.quotes;
        
        if (hour >= 6 && hour < 12) {
            // Morning quotes - focus on new beginnings and energy
            filteredQuotes = this.quotes.filter(quote => {
                const text = quote.text.toLowerCase();
                return text.includes('begin') || text.includes('start') || text.includes('future') || text.includes('dream');
            });
        } else if (hour >= 12 && hour < 17) {
            // Afternoon quotes - focus on productivity and persistence
            filteredQuotes = this.quotes.filter(quote => {
                const text = quote.text.toLowerCase();
                return text.includes('work') || text.includes('do') || text.includes('action') || text.includes('push');
            });
        } else if (hour >= 17 && hour < 22) {
            // Evening quotes - focus on reflection and accomplishment
            filteredQuotes = this.quotes.filter(quote => {
                const text = quote.text.toLowerCase();
                return text.includes('success') || text.includes('great') || text.includes('achieve') || text.includes('experience');
            });
        }
        
        // If no contextual quotes found, use all quotes
        if (filteredQuotes.length === 0) {
            filteredQuotes = this.quotes;
        }
        
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        return filteredQuotes[randomIndex];
    }

    // Initialize quotes with animation
    initWithAnimation() {
        const quoteCard = document.querySelector('.quote-card');
        if (quoteCard) {
            quoteCard.style.transform = 'translateY(20px)';
            quoteCard.style.opacity = '0';
            
            setTimeout(() => {
                quoteCard.style.transition = 'all 0.6s ease';
                quoteCard.style.transform = 'translateY(0)';
                quoteCard.style.opacity = '1';
            }, 300);
        }
    }
}

// Initialize quotes manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quotesManager = new QuotesManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuotesManager;
}