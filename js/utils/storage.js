/**
 * Storage Utilities for MTable
 * localStorage wrapper with error handling and data validation
 */

const Storage = {
    // Get item from localStorage with error handling
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },

    // Set item in localStorage with error handling
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    },

    // Clear all localStorage data
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Check if localStorage is available
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Get all keys with a specific prefix
    getKeysWithPrefix(prefix) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        return keys;
    },

    // Get multiple items at once
    getMultiple(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    },

    // Set multiple items at once
    setMultiple(items) {
        let success = true;
        Object.keys(items).forEach(key => {
            if (!this.set(key, items[key])) {
                success = false;
            }
        });
        return success;
    },

    // Get storage usage information
    getStorageInfo() {
        if (!this.isAvailable()) {
            return { available: false };
        }

        let totalSize = 0;
        const items = {};

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const value = localStorage[key];
                const itemSize = (key.length + value.length) * 2; // Approximate bytes
                items[key] = {
                    size: itemSize,
                    value: value.length > 100 ? value.substring(0, 100) + '...' : value
                };
                totalSize += itemSize;
            }
        }

        return {
            available: true,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            itemCount: Object.keys(items).length,
            items: items,
            approximateLimit: 5 * 1024 * 1024, // 5MB typical limit
            percentageUsed: (totalSize / (5 * 1024 * 1024)) * 100
        };
    },

    // Format bytes for display
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Backup data to JSON
    backup() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = this.get(key);
        }
        return {
            timestamp: new Date().toISOString(),
            data: data
        };
    },

    // Restore data from backup
    restore(backup) {
        if (!backup || !backup.data) {
            console.error('Invalid backup data');
            return false;
        }

        try {
            // Clear existing data
            this.clear();
            
            // Restore backup data
            Object.keys(backup.data).forEach(key => {
                this.set(key, backup.data[key]);
            });
            
            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    },

    // MTable specific storage methods
    mtable: {
        // Get user data
        getUserData() {
            return Storage.get('mtable_user_data', {
                name: '',
                email: '',
                preferences: {}
            });
        },

        // Set user data
        setUserData(userData) {
            return Storage.set('mtable_user_data', userData);
        },

        // Get today's stats
        getTodayStats() {
            const today = new Date().toISOString().split('T')[0];
            return Storage.get(`mtable_stats_${today}`, {
                date: today,
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                meals: []
            });
        },

        // Set today's stats
        setTodayStats(stats) {
            const today = new Date().toISOString().split('T')[0];
            return Storage.set(`mtable_stats_${today}`, stats);
        },

        // Get inventory
        getInventory() {
            return Storage.get('mtable_inventory', {});
        },

        // Set inventory
        setInventory(inventory) {
            return Storage.set('mtable_inventory', inventory);
        },

        // Get goals
        getGoals() {
            return Storage.get('mtable_goals', {
                dailyCalories: 2000,
                dailyProtein: 150,
                dailyCarbs: 250,
                dailyFat: 65
            });
        },

        // Set goals
        setGoals(goals) {
            return Storage.set('mtable_goals', goals);
        },

        // Get meal plans
        getMealPlans() {
            return Storage.get('mtable_meal_plans', {});
        },

        // Set meal plans
        setMealPlans(mealPlans) {
            return Storage.set('mtable_meal_plans', mealPlans);
        },

        // Clean old data (older than 30 days)
        cleanOldData() {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            const cutoffString = cutoffDate.toISOString().split('T')[0];

            const keysToRemove = Storage.getKeysWithPrefix('mtable_stats_')
                .filter(key => {
                    const dateMatch = key.match(/mtable_stats_(.+)/);
                    if (dateMatch) {
                        return dateMatch[1] < cutoffString;
                    }
                    return false;
                });

            keysToRemove.forEach(key => Storage.remove(key));
            return keysToRemove.length;
        },

        // Get all MTable data for export
        exportAllData() {
            const mtableKeys = Storage.getKeysWithPrefix('mtable_');
            const data = {};
            
            mtableKeys.forEach(key => {
                data[key] = Storage.get(key);
            });

            return {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: data
            };
        },

        // Import MTable data
        importAllData(exportData) {
            if (!exportData || !exportData.data) {
                return false;
            }

            try {
                Object.keys(exportData.data).forEach(key => {
                    if (key.startsWith('mtable_')) {
                        Storage.set(key, exportData.data[key]);
                    }
                });
                return true;
            } catch (error) {
                console.error('Error importing data:', error);
                return false;
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}