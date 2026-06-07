/**
 * Unit tests for the main app module (www/js/index.js)
 */

const fs = require('fs');
const path = require('path');

// Load source files
const recommendationScript = fs.readFileSync(
  path.resolve(__dirname, '../www/js/recommendation.js'),
  'utf-8'
);
const indexScript = fs.readFileSync(
  path.resolve(__dirname, '../www/js/index.js'),
  'utf-8'
);

// HTML template for DOM setup
const htmlTemplate = fs.readFileSync(
  path.resolve(__dirname, '../www/index.html'),
  'utf-8'
);

let app;

beforeEach(() => {
  // Reset DOM
  document.documentElement.innerHTML = htmlTemplate;

  // Clear localStorage
  localStorage.clear();

  // Clear timers
  jest.clearAllTimers();

  // Load WaterRecommendation first (dependency)
  const loadRec = new Function(recommendationScript + '\nreturn WaterRecommendation;');
  global.WaterRecommendation = loadRec();

  // Load app without auto-initialization (remove the last line that calls app.initialize())
  const modifiedIndexScript = indexScript.replace(
    'app.initialize();',
    '// initialization disabled for testing'
  );
  const loadApp = new Function('WaterRecommendation', modifiedIndexScript + '\nreturn app;');
  app = loadApp(global.WaterRecommendation);
});

describe('app', () => {
  describe('formatDate', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      expect(app.formatDate(date)).toBe('2024-01-05');
    });

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date(2024, 2, 9); // Mar 9, 2024
      expect(app.formatDate(date)).toBe('2024-03-09');
    });

    it('should handle December 31st correctly', () => {
      const date = new Date(2024, 11, 31); // Dec 31, 2024
      expect(app.formatDate(date)).toBe('2024-12-31');
    });
  });

  describe('formatTime', () => {
    it('should format time as HH:MM:SS', () => {
      const date = new Date(2024, 0, 1, 14, 30, 45);
      expect(app.formatTime(date)).toBe('14:30:45');
    });

    it('should pad single-digit hours, minutes, seconds', () => {
      const date = new Date(2024, 0, 1, 5, 3, 7);
      expect(app.formatTime(date)).toBe('05:03:07');
    });

    it('should handle midnight correctly', () => {
      const date = new Date(2024, 0, 1, 0, 0, 0);
      expect(app.formatTime(date)).toBe('00:00:00');
    });
  });

  describe('saveRecord / getRecords', () => {
    it('should save a record to localStorage', () => {
      const record = { id: 1, timestamp: 1000, date: '2024-01-01', time: '10:00:00' };
      app.saveRecord(record);
      const records = app.getRecords();
      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(record);
    });

    it('should prepend new records (most recent first)', () => {
      const record1 = { id: 1, timestamp: 1000, date: '2024-01-01', time: '10:00:00' };
      const record2 = { id: 2, timestamp: 2000, date: '2024-01-01', time: '11:00:00' };
      app.saveRecord(record1);
      app.saveRecord(record2);
      const records = app.getRecords();
      expect(records[0]).toEqual(record2);
      expect(records[1]).toEqual(record1);
    });

    it('should return empty array when no records exist', () => {
      expect(app.getRecords()).toEqual([]);
    });
  });

  describe('getTodayRecords', () => {
    it('should filter records for today only', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 5, 15, 12, 0, 0));

      const todayRecord = { id: 1, timestamp: 1000, date: '2024-06-15', time: '10:00:00' };
      const yesterdayRecord = { id: 2, timestamp: 2000, date: '2024-06-14', time: '09:00:00' };
      app.saveRecord(todayRecord);
      app.saveRecord(yesterdayRecord);

      const todayRecords = app.getTodayRecords();
      expect(todayRecords).toHaveLength(1);
      expect(todayRecords[0].date).toBe('2024-06-15');

      jest.useRealTimers();
    });

    it('should return empty array when no records for today', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 5, 15));

      const oldRecord = { id: 1, timestamp: 1000, date: '2024-06-10', time: '10:00:00' };
      app.saveRecord(oldRecord);

      expect(app.getTodayRecords()).toHaveLength(0);
      jest.useRealTimers();
    });
  });

  describe('updateTodayCount', () => {
    it('should update the todayCount element with number of today records', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 5, 15, 12, 0, 0));

      app.saveRecord({ id: 1, timestamp: 1000, date: '2024-06-15', time: '10:00:00' });
      app.saveRecord({ id: 2, timestamp: 2000, date: '2024-06-15', time: '11:00:00' });

      app.updateTodayCount();
      const countEl = document.getElementById('todayCount');
      expect(countEl.textContent).toBe('2');

      jest.useRealTimers();
    });
  });

  describe('loadRecords', () => {
    it('should show empty message when no records', () => {
      app.loadRecords();
      const recordsList = document.getElementById('recordsList');
      expect(recordsList.innerHTML).toContain('暂无打卡记录');
    });

    it('should render records as HTML', () => {
      app.saveRecord({ id: 1, timestamp: 1000, date: '2024-01-01', time: '08:30:00' });
      app.loadRecords();
      const recordsList = document.getElementById('recordsList');
      expect(recordsList.innerHTML).toContain('2024-01-01');
      expect(recordsList.innerHTML).toContain('08:30:00');
      expect(recordsList.innerHTML).toContain('💧');
    });
  });

  describe('checkIn', () => {
    it('should create a new record with current date and time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 5, 15, 14, 30, 45));

      app.checkIn();

      const records = app.getRecords();
      expect(records).toHaveLength(1);
      expect(records[0].date).toBe('2024-06-15');
      expect(records[0].time).toBe('14:30:45');
      expect(records[0].id).toBeDefined();
      expect(records[0].timestamp).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('switchTab', () => {
    it('should activate the home tab', () => {
      app.switchTab('home');
      const homeTab = document.getElementById('homeTab');
      expect(homeTab.classList.contains('active')).toBe(true);
    });

    it('should activate the profile tab', () => {
      app.switchTab('profile');
      const profileTab = document.getElementById('profileTab');
      expect(profileTab.classList.contains('active')).toBe(true);
      const homeTab = document.getElementById('homeTab');
      expect(homeTab.classList.contains('active')).toBe(false);
    });

    it('should update nav-tab button active states', () => {
      app.switchTab('profile');
      const tabs = document.querySelectorAll('.nav-tab');
      const activeTab = [...tabs].find(t => t.classList.contains('active'));
      expect(activeTab.dataset.tab).toBe('profile');
    });
  });

  describe('switchTheme', () => {
    it('should add theme class for a valid time slot', () => {
      app.switchTheme('morning');
      expect(document.body.classList.contains('theme-morning')).toBe(true);
    });

    it('should remove previous theme classes when switching', () => {
      app.switchTheme('morning');
      app.switchTheme('afternoon');
      expect(document.body.classList.contains('theme-morning')).toBe(false);
      expect(document.body.classList.contains('theme-afternoon')).toBe(true);
    });

    it('should not add theme class for night', () => {
      app.switchTheme('night');
      const themeClasses = [...document.body.classList].filter(c => c.startsWith('theme-'));
      expect(themeClasses).toHaveLength(0);
    });

    it('should not add theme class for afterLunch', () => {
      app.switchTheme('afterLunch');
      const themeClasses = [...document.body.classList].filter(c => c.startsWith('theme-'));
      expect(themeClasses).toHaveLength(0);
    });

    it('should use current time slot when no argument passed', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 15, 0)); // afternoon
      app.switchTheme();
      expect(document.body.classList.contains('theme-afternoon')).toBe(true);
      jest.useRealTimers();
    });
  });

  describe('toggleQuickBuy', () => {
    it('should save quickBuyEnabled state to localStorage', () => {
      app.toggleQuickBuy(true);
      expect(localStorage.getItem('quickBuyEnabled')).toBe('true');
      app.toggleQuickBuy(false);
      expect(localStorage.getItem('quickBuyEnabled')).toBe('false');
    });
  });

  describe('updateBuyButtonVisibility', () => {
    it('should show buy button when quickBuy enabled, profile exists, and waterType set', () => {
      localStorage.setItem('quickBuyEnabled', 'true');
      localStorage.setItem('userProfile', JSON.stringify({ age: 30, gender: 'male', workType: 'office' }));
      app.currentWaterType = 'tea';
      app.updateBuyButtonVisibility();
      const buyBtn = document.getElementById('buyBtn');
      expect(buyBtn.style.display).toBe('block');
    });

    it('should hide buy button when quickBuy is disabled', () => {
      localStorage.setItem('quickBuyEnabled', 'false');
      localStorage.setItem('userProfile', JSON.stringify({ age: 30, gender: 'male', workType: 'office' }));
      app.currentWaterType = 'tea';
      app.updateBuyButtonVisibility();
      const buyBtn = document.getElementById('buyBtn');
      expect(buyBtn.style.display).toBe('none');
    });

    it('should hide buy button when no profile exists', () => {
      localStorage.setItem('quickBuyEnabled', 'true');
      app.currentWaterType = 'tea';
      app.updateBuyButtonVisibility();
      const buyBtn = document.getElementById('buyBtn');
      expect(buyBtn.style.display).toBe('none');
    });

    it('should hide buy button when no currentWaterType', () => {
      localStorage.setItem('quickBuyEnabled', 'true');
      localStorage.setItem('userProfile', JSON.stringify({ age: 30, gender: 'male', workType: 'office' }));
      app.currentWaterType = null;
      app.updateBuyButtonVisibility();
      const buyBtn = document.getElementById('buyBtn');
      expect(buyBtn.style.display).toBe('none');
    });
  });

  describe('toggleReminder', () => {
    it('should save reminder enabled state to localStorage', () => {
      // Mock alert
      global.alert = jest.fn();
      app.scheduleReminders = jest.fn();

      app.toggleReminder(true);
      expect(localStorage.getItem('reminderEnabled')).toBe('true');
      expect(global.alert).toHaveBeenCalledWith('喝水提醒已开启');

      app.toggleReminder(false);
      expect(localStorage.getItem('reminderEnabled')).toBe('false');
      expect(global.alert).toHaveBeenCalledWith('喝水提醒已关闭');
    });
  });

  describe('saveProfile', () => {
    it('should save profile to localStorage from form values', () => {
      document.getElementById('age').value = '25';
      document.getElementById('gender').value = 'female';
      document.getElementById('workType').value = 'student';

      global.alert = jest.fn();
      app.saveProfile();

      const saved = JSON.parse(localStorage.getItem('userProfile'));
      expect(saved.age).toBe(25);
      expect(saved.gender).toBe('female');
      expect(saved.workType).toBe('student');
    });
  });

  describe('loadProfile', () => {
    it('should populate form fields from localStorage', () => {
      localStorage.setItem('userProfile', JSON.stringify({
        age: 40, gender: 'male', workType: 'physical'
      }));
      localStorage.setItem('reminderEnabled', 'true');
      localStorage.setItem('quickBuyEnabled', 'true');

      app.loadProfile();

      expect(document.getElementById('age').value).toBe('40');
      expect(document.getElementById('gender').value).toBe('male');
      expect(document.getElementById('workType').value).toBe('physical');
      expect(document.getElementById('reminderEnabled').checked).toBe(true);
      expect(document.getElementById('quickBuyEnabled').checked).toBe(true);
    });

    it('should handle missing profile gracefully', () => {
      expect(() => app.loadProfile()).not.toThrow();
    });
  });

  describe('checkAndNotify', () => {
    it('should not notify when reminder is disabled', () => {
      app.showNotification = jest.fn();
      localStorage.setItem('reminderEnabled', 'false');
      app.checkAndNotify();
      expect(app.showNotification).not.toHaveBeenCalled();
    });

    it('should not notify when no profile exists', () => {
      app.showNotification = jest.fn();
      localStorage.setItem('reminderEnabled', 'true');
      app.checkAndNotify();
      expect(app.showNotification).not.toHaveBeenCalled();
    });

    it('should notify when reminder is enabled and profile exists', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 9, 0)); // morning
      app.showNotification = jest.fn();
      localStorage.setItem('reminderEnabled', 'true');
      localStorage.setItem('userProfile', JSON.stringify({
        age: 30, gender: 'male', workType: 'office'
      }));
      app.checkAndNotify();
      expect(app.showNotification).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  describe('animateButton', () => {
    it('should modify button transform style', () => {
      jest.useFakeTimers();
      const btn = document.getElementById('checkInBtn');
      app.animateButton();
      expect(btn.style.transform).toBe('scale(0.9)');
      jest.advanceTimersByTime(200);
      expect(btn.style.transform).toBe('scale(1)');
      jest.useRealTimers();
    });
  });
});
