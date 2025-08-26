// Wishes Manager - Handles calendar-based wishes and greetings
class WishesManager {
    constructor() {
        this.holidays = {
            // Fixed date holidays (MM-DD format)
            "01-01": { name: "New Year's Day", message: "🎊 Happy New Year! May this year bring you joy, success, and amazing adventures!" },
            "02-14": { name: "Valentine's Day", message: "💝 Happy Valentine's Day! Spread love and kindness today!" },
            "03-17": { name: "St. Patrick's Day", message: "🍀 Happy St. Patrick's Day! May luck be with you!" },
            "04-01": { name: "April Fool's Day", message: "😄 Happy April Fool's Day! Keep smiling and spread joy!" },
            "04-22": { name: "Earth Day", message: "🌍 Happy Earth Day! Let's take care of our beautiful planet!" },
            "05-01": { name: "May Day", message: "🌸 Happy May Day! Celebrate the beauty of spring!" },
            "06-05": { name: "World Environment Day", message: "🌱 Happy World Environment Day! Every small action counts!" },
            "07-04": { name: "Independence Day", message: "🎆 Happy Independence Day! Celebrate freedom and unity!" },
            "10-31": { name: "Halloween", message: "🎃 Happy Halloween! Have a spook-tacular day!" },
            "11-11": { name: "Veterans Day", message: "🇺🇸 Happy Veterans Day! Thank you to all who served!" },
            "12-25": { name: "Christmas", message: "🎄 Merry Christmas! May your day be filled with love, joy, and wonderful memories!" },
            "12-31": { name: "New Year's Eve", message: "🎉 Happy New Year's Eve! Get ready for a fresh start tomorrow!" }
        };

        this.specialDays = {
            // Dynamic holidays and special days
            mothersDay: { name: "Mother's Day", message: "💐 Happy Mother's Day! Celebrate the amazing mothers in your life!" },
            fathersDay: { name: "Father's Day", message: "👨‍👧‍👦 Happy Father's Day! Honor the wonderful fathers in your life!" },
            thanksgiving: { name: "Thanksgiving", message: "🦃 Happy Thanksgiving! Take time to appreciate all the blessings in your life!" }
        };

        this.seasonalWishes = {
            spring: "🌺 Welcome Spring! Time for new beginnings and fresh starts!",
            summer: "☀️ Hello Summer! Enjoy the sunshine and warm adventures ahead!",
            autumn: "🍂 Happy Autumn! Embrace the beautiful changes around you!",
            winter: "❄️ Welcome Winter! Stay cozy and spread warmth to others!"
        };

        this.inspirationalWishes = [
            "✨ New week, new opportunities! Make it amazing!",
            "🌟 Monday motivation: You have the power to make today great!",
            "💪 Believe in yourself - you're capable of incredible things!",
            "🎯 Focus on progress, not perfection. You've got this!",
            "🌈 Every day is a chance to start fresh and chase your dreams!",
            "⭐ Your potential is limitless. What will you create today?",
            "🚀 Ready for takeoff? Today is your launchpad to success!",
            "🌸 Bloom where you are planted. Today is your day to shine!"
        ];

        this.init();
    }

    init() {
        this.checkAndDisplayWishes();
    }

    checkAndDisplayWishes() {
        const today = new Date();
        const wishes = this.getTodaysWishes(today);
        
        if (wishes.length > 0) {
            this.displayWishes(wishes);
        } else {
            this.displayGeneralWish(today);
        }
    }

    getTodaysWishes(date) {
        const wishes = [];
        const monthDay = this.formatMonthDay(date);
        
        // Check for fixed date holidays
        if (this.holidays[monthDay]) {
            wishes.push({
                type: 'holiday',
                ...this.holidays[monthDay]
            });
        }

        // Check for dynamic holidays
        const dynamicWishes = this.getDynamicHolidays(date);
        wishes.push(...dynamicWishes);

        // Check for seasonal wishes (first day of season)
        const seasonalWish = this.getSeasonalWish(date);
        if (seasonalWish) {
            wishes.push(seasonalWish);
        }

        // Check for custom wishes
        const customWishes = this.getCustomWishes(date);
        wishes.push(...customWishes);

        return wishes;
    }

    getDynamicHolidays(date) {
        const wishes = [];
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // Mother's Day (Second Sunday in May)
        if (month === 4) { // May (0-indexed)
            const mothersDay = this.getNthWeekdayOfMonth(year, 4, 0, 2); // 2nd Sunday
            if (day === mothersDay.getDate()) {
                wishes.push({
                    type: 'holiday',
                    ...this.specialDays.mothersDay
                });
            }
        }

        // Father's Day (Third Sunday in June)
        if (month === 5) { // June (0-indexed)
            const fathersDay = this.getNthWeekdayOfMonth(year, 5, 0, 3); // 3rd Sunday
            if (day === fathersDay.getDate()) {
                wishes.push({
                    type: 'holiday',
                    ...this.specialDays.fathersDay
                });
            }
        }

        // Thanksgiving (Fourth Thursday in November)
        if (month === 10) { // November (0-indexed)
            const thanksgiving = this.getNthWeekdayOfMonth(year, 10, 4, 4); // 4th Thursday
            if (day === thanksgiving.getDate()) {
                wishes.push({
                    type: 'holiday',
                    ...this.specialDays.thanksgiving
                });
            }
        }

        return wishes;
    }

    getNthWeekdayOfMonth(year, month, weekday, n) {
        const firstDay = new Date(year, month, 1);
        const firstWeekday = firstDay.getDay();
        const daysToAdd = (weekday - firstWeekday + 7) % 7;
        const nthWeekday = new Date(year, month, 1 + daysToAdd + (n - 1) * 7);
        return nthWeekday;
    }

    getSeasonalWish(date) {
        const month = date.getMonth();
        const day = date.getDate();

        // Spring (March 20/21)
        if (month === 2 && (day === 20 || day === 21)) {
            return {
                type: 'seasonal',
                name: 'First Day of Spring',
                message: this.seasonalWishes.spring
            };
        }

        // Summer (June 20/21)
        if (month === 5 && (day === 20 || day === 21)) {
            return {
                type: 'seasonal',
                name: 'First Day of Summer',
                message: this.seasonalWishes.summer
            };
        }

        // Autumn (September 22/23)
        if (month === 8 && (day === 22 || day === 23)) {
            return {
                type: 'seasonal',
                name: 'First Day of Autumn',
                message: this.seasonalWishes.autumn
            };
        }

        // Winter (December 21/22)
        if (month === 11 && (day === 21 || day === 22)) {
            return {
                type: 'seasonal',
                name: 'First Day of Winter',
                message: this.seasonalWishes.winter
            };
        }

        return null;
    }

    getCustomWishes(date) {
        const wishesData = StorageManager.getWishesData();
        const monthDay = this.formatMonthDay(date);
        
        return wishesData.customWishes.filter(wish => {
            return wish.date === monthDay && wish.recurring;
        }).map(wish => ({
            type: 'custom',
            name: wish.title,
            message: wish.message
        }));
    }

    displayWishes(wishes) {
        const wishesElement = document.getElementById('todayWishes');
        if (!wishesElement) return;

        const wishesHTML = wishes.map(wish => {
            return `<div class="wish-item">${wish.message}</div>`;
        }).join('');

        wishesElement.innerHTML = wishesHTML;
        
        // Add special styling for holidays
        if (wishes.some(wish => wish.type === 'holiday')) {
            wishesElement.classList.add('holiday-wishes');
        }
    }

    displayGeneralWish(date) {
        const wishesElement = document.getElementById('todayWishes');
        if (!wishesElement) return;

        let generalWish = this.getGeneralWish(date);
        wishesElement.innerHTML = `<div class="wish-item">${generalWish}</div>`;
    }

    getGeneralWish(date) {
        const dayOfWeek = date.getDay();
        const hour = date.getHours();

        // Special messages for different days and times
        if (dayOfWeek === 1) { // Monday
            return "💪 New week, new possibilities! Let's make it count!";
        } else if (dayOfWeek === 5) { // Friday
            return "🎉 Friday vibes! You've worked hard this week!";
        } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            return "🌅 Weekend joy! Time to relax and recharge!";
        } else {
            // Random inspirational wish for other days
            const randomIndex = Math.floor(Math.random() * this.inspirationalWishes.length);
            return this.inspirationalWishes[randomIndex];
        }
    }

    addCustomWish(title, message, date) {
        const wishesData = StorageManager.getWishesData();
        const newWish = StorageManager.addCustomWish({
            title: title,
            message: message,
            date: date,
            recurring: true
        });

        if (window.app) {
            window.app.showNotification('Custom wish added! 🎊', 'success');
        }

        return newWish;
    }

    getBirthdayWish(name) {
        const birthdayMessages = [
            `🎂 Happy Birthday, ${name}! Hope your special day is amazing!`,
            `🎉 Wishing ${name} a fantastic birthday filled with joy and laughter!`,
            `🎈 Happy Birthday to ${name}! May all your dreams come true!`,
            `🎁 Celebrating ${name} today! Have a wonderful birthday!`,
            `🥳 It's ${name}'s special day! Happy Birthday and many happy returns!`
        ];

        const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
        return birthdayMessages[randomIndex];
    }

    getAnniversaryWish(occasion) {
        const anniversaryMessages = [
            `💕 Happy Anniversary! Celebrating this special milestone!`,
            `🎊 Congratulations on your anniversary! Here's to many more wonderful years!`,
            `💐 Happy Anniversary! May your love continue to grow stronger!`,
            `🥂 Cheers to your anniversary! Wishing you continued happiness!`,
            `❤️ Happy Anniversary! Celebrating the beautiful journey you're on together!`
        ];

        const randomIndex = Math.floor(Math.random() * anniversaryMessages.length);
        return anniversaryMessages[randomIndex];
    }

    getUpcomingWishes(days = 7) {
        const upcoming = [];
        const today = new Date();

        for (let i = 1; i <= days; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() + i);
            
            const wishes = this.getTodaysWishes(checkDate);
            if (wishes.length > 0) {
                upcoming.push({
                    date: checkDate,
                    wishes: wishes
                });
            }
        }

        return upcoming;
    }

    formatMonthDay(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}-${day}`;
    }

    getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    // Check for important life events and milestones
    checkMilestones(date) {
        const milestones = [];
        const dayOfYear = this.getDayOfYear(date);

        // New Year milestone
        if (dayOfYear === 1) {
            milestones.push({
                type: 'milestone',
                name: 'New Year',
                message: '🎊 Welcome to a brand new year! Time to set new goals and create amazing memories!'
            });
        }

        // Mid-year check-in
        if (dayOfYear === 183 || dayOfYear === 184) { // July 1st or 2nd (leap year)
            milestones.push({
                type: 'milestone',
                name: 'Mid-Year Check-in',
                message: '📊 Half the year is done! How are you doing with your goals? Time to reflect and refocus!'
            });
        }

        return milestones;
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    // Get wishes for specific occasions
    getOccasionWish(occasion) {
        const occasionWishes = {
            graduation: "🎓 Congratulations on your graduation! Your hard work has paid off!",
            promotion: "🚀 Congratulations on your promotion! You've earned this success!",
            newjob: "💼 Congratulations on your new job! Wishing you success in this new chapter!",
            wedding: "💒 Congratulations on your wedding! Wishing you a lifetime of love and happiness!",
            newbaby: "👶 Congratulations on your new baby! What a wonderful blessing!",
            newhome: "🏠 Congratulations on your new home! May it be filled with love and laughter!",
            retirement: "🌅 Happy Retirement! Enjoy this new chapter of life and all the adventures ahead!"
        };

        return occasionWishes[occasion] || "🎉 Congratulations! Wishing you all the best!";
    }

    // Weather-based wishes (would require weather API integration)
    getWeatherWish(weather) {
        const weatherWishes = {
            sunny: "☀️ What a beautiful sunny day! Perfect for outdoor activities and good vibes!",
            rainy: "🌧️ Rainy day vibes! Perfect for cozy indoor activities and reflection!",
            snowy: "❄️ Snow day magic! Enjoy the winter wonderland and stay warm!",
            cloudy: "☁️ Cloudy but lovely! Sometimes the best days have interesting skies!",
            stormy: "⛈️ Stormy weather! Stay safe and cozy indoors with a good book!"
        };

        return weatherWishes[weather] || "🌤️ Whatever the weather, make today amazing!";
    }

    // Export wishes data
    exportWishes() {
        const wishesData = StorageManager.getWishesData();
        const dataStr = JSON.stringify(wishesData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `wishes-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        if (window.app) {
            window.app.showNotification('Wishes exported successfully! 💾', 'success');
        }
    }

    // Import wishes data
    importWishes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.customWishes && Array.isArray(importedData.customWishes)) {
                    importedData.customWishes.forEach(wish => {
                        this.addCustomWish(wish.title, wish.message, wish.date);
                    });
                    
                    if (window.app) {
                        window.app.showNotification(`Imported ${importedData.customWishes.length} custom wishes! 📥`, 'success');
                    }
                }
            } catch (error) {
                console.error('Error importing wishes:', error);
                if (window.app) {
                    window.app.showNotification('Error importing wishes. Please check the file format.', 'error');
                }
            }
        };
        reader.readAsText(file);
    }

    // Get statistics about wishes
    getWishesStats() {
        const wishesData = StorageManager.getWishesData();
        const today = new Date();
        const upcoming = this.getUpcomingWishes(30);
        
        return {
            customWishes: wishesData.customWishes.length,
            upcomingEvents: upcoming.length,
            lastChecked: wishesData.lastCheckedDate,
            todaysWishes: this.getTodaysWishes(today).length
        };
    }

    // Mark wishes as seen for the day
    markWishesAsSeen() {
        const wishesData = StorageManager.getWishesData();
        wishesData.lastCheckedDate = new Date().toDateString();
        StorageManager.saveWishesData(wishesData);
    }
}

// Initialize wishes manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wishesManager = new WishesManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishesManager;
}