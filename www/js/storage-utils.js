// Shared localStorage utilities
const StorageUtils = {
    /**
     * Get a JSON-parsed value from localStorage.
     * Returns defaultValue if the key doesn't exist or parsing fails.
     */
    getJSON: function(key, defaultValue) {
        const data = localStorage.getItem(key);
        if (data === null) return defaultValue !== undefined ? defaultValue : null;
        try {
            return JSON.parse(data);
        } catch (e) {
            return defaultValue !== undefined ? defaultValue : null;
        }
    },

    /**
     * Stringify and save a value to localStorage.
     */
    setJSON: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    /**
     * Get a boolean value from localStorage (stored as 'true'/'false' strings).
     */
    getBoolean: function(key) {
        return localStorage.getItem(key) === 'true';
    },

    /**
     * Save a boolean value to localStorage.
     */
    setBoolean: function(key, value) {
        localStorage.setItem(key, String(!!value));
    }
};
