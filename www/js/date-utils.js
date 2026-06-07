// Shared date/time utilities
const DateUtils = {
    /**
     * Format a Date object as 'YYYY-MM-DD'.
     */
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Format a Date object as 'HH:MM:SS'.
     */
    formatTime: function(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    /**
     * Determine the current time-of-day slot based on the hour.
     * Returns one of: 'earlyMorning', 'morning', 'beforeLunch',
     * 'afterLunch', 'afternoon', 'evening', 'beforeSleep', or 'night'.
     */
    getCurrentTimeSlot: function() {
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 8) return 'earlyMorning';
        if (hour >= 8 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 12) return 'beforeLunch';
        if (hour >= 12 && hour < 14) return 'afterLunch';
        if (hour >= 14 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        if (hour >= 20 && hour < 22) return 'beforeSleep';

        return 'night';
    }
};
