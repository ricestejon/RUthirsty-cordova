// Sanitize a string for safe insertion into HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Safely parse JSON with a fallback default
function safeJSONParse(str, fallback) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return fallback;
    }
}

// Validate that a value is one of the allowed options
function isAllowedValue(value, allowedValues) {
    return allowedValues.includes(value);
}

// 应用主逻辑
const app = {
    // 初始化
    initialize: function() {
        // 支持浏览器和Cordova环境
        if (window.cordova) {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        } else {
            // 浏览器环境直接初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.onDeviceReady.bind(this));
            } else {
                this.onDeviceReady();
            }
        }
    },

    // 设备就绪
    onDeviceReady: function() {
        this.initApp();
    },

    // 初始化应用
    initApp: function() {
        this.loadRecords();
        this.updateTodayCount();
        this.bindEvents();
        this.loadProfile();
        this.updateRecommendation();
        this.initReminder();
        this.switchTheme(); // 应用当前时段主题
    },

    // 绑定事件
    bindEvents: function() {
        const checkInBtn = document.getElementById('checkInBtn');
        checkInBtn.addEventListener('click', this.checkIn.bind(this));

        // 标签页切换
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 个人资料表单
        const profileForm = document.getElementById('profileForm');
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // 提醒开关
        const reminderToggle = document.getElementById('reminderEnabled');
        reminderToggle.addEventListener('change', (e) => {
            this.toggleReminder(e.target.checked);
        });

        // 一键购买开关
        const quickBuyToggle = document.getElementById('quickBuyEnabled');
        quickBuyToggle.addEventListener('change', (e) => {
            this.toggleQuickBuy(e.target.checked);
        });

        // 购买按钮
        const buyBtn = document.getElementById('buyBtn');
        buyBtn.addEventListener('click', () => {
            this.buyOnMeituan();
        });

        // 时段选择器
        const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
        timeSlotBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 更新按钮状态
                timeSlotBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // 更新推荐
                const slot = e.target.dataset.slot;
                this.updateRecommendation(slot === 'current' ? null : slot);

                // 切换主题
                this.switchTheme(slot === 'current' ? null : slot);
            });
        });
    },

    // 打卡
    checkIn: function() {
        const now = new Date();
        const record = {
            id: Date.now(),
            timestamp: now.getTime(),
            date: this.formatDate(now),
            time: this.formatTime(now)
        };

        // 保存记录
        this.saveRecord(record);

        // 更新界面
        this.loadRecords();
        this.updateTodayCount();

        // 按钮动画反馈
        this.animateButton();
    },

    // 按钮动画反馈
    animateButton: function() {
        const btn = document.getElementById('checkInBtn');
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 200);
    },

    // 保存记录
    saveRecord: function(record) {
        let records = this.getRecords();
        records.unshift(record);
        localStorage.setItem('waterRecords', JSON.stringify(records));
    },

    // 获取所有记录
    getRecords: function() {
        const data = localStorage.getItem('waterRecords');
        return data ? safeJSONParse(data, []) : [];
    },

    // 获取今日记录
    getTodayRecords: function() {
        const records = this.getRecords();
        const today = this.formatDate(new Date());
        return records.filter(record => record.date === today);
    },

    // 更新今日计数
    updateTodayCount: function() {
        const todayRecords = this.getTodayRecords();
        const countElement = document.getElementById('todayCount');
        countElement.textContent = todayRecords.length;
    },

    // 加载记录列表
    loadRecords: function() {
        const records = this.getRecords();
        const recordsList = document.getElementById('recordsList');

        if (records.length === 0) {
            recordsList.innerHTML = '<p class="empty-message">暂无打卡记录</p>';
            return;
        }

        let html = '';
        records.forEach(record => {
            html += `
                <div class="record-item">
                    <span class="record-time">${escapeHTML(String(record.date))} ${escapeHTML(String(record.time))}</span>
                    <span class="record-icon">💧</span>
                </div>
            `;
        });
        recordsList.innerHTML = html;
    },

    // 格式化日期
    formatDate: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 格式化时间
    formatTime: function(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    // 保存个人资料
    saveProfile: function() {
        const ageValue = parseInt(document.getElementById('age').value, 10);
        const genderValue = document.getElementById('gender').value;
        const workTypeValue = document.getElementById('workType').value;

        if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
            alert('请输入有效年龄（1-120）');
            return;
        }
        if (!isAllowedValue(genderValue, ['male', 'female'])) {
            alert('请选择有效的性别');
            return;
        }
        if (!isAllowedValue(workTypeValue, ['office', 'physical', 'outdoor', 'student'])) {
            alert('请选择有效的工作类型');
            return;
        }

        const profile = {
            age: ageValue,
            gender: genderValue,
            workType: workTypeValue
        };

        localStorage.setItem('userProfile', JSON.stringify(profile));
        this.updateRecommendation();
        alert('个人资料已保存');
    },

    // 加载个人资料
    loadProfile: function() {
        const data = localStorage.getItem('userProfile');
        if (data) {
            const profile = safeJSONParse(data, {});
            document.getElementById('age').value = profile.age || '';
            document.getElementById('gender').value = profile.gender || '';
            document.getElementById('workType').value = profile.workType || '';
        }

        // 加载提醒设置
        const reminderEnabled = localStorage.getItem('reminderEnabled') === 'true';
        document.getElementById('reminderEnabled').checked = reminderEnabled;

        // 加载一键购买设置
        const quickBuyEnabled = localStorage.getItem('quickBuyEnabled') === 'true';
        document.getElementById('quickBuyEnabled').checked = quickBuyEnabled;
        this.updateBuyButtonVisibility();
    },

    // 更新推荐信息
    updateRecommendation: function(timeSlot) {
        const profileData = localStorage.getItem('userProfile');
        const profile = profileData ? safeJSONParse(profileData, null) : null;

        const recommendation = WaterRecommendation.getRecommendation(profile, timeSlot);
        const formatted = WaterRecommendation.formatRecommendation(recommendation);

        const recommendationCard = document.getElementById('recommendationCard');
        recommendationCard.innerHTML = formatted.html;

        // 保存当前推荐的水类型，供购买功能使用
        if (recommendation) {
            this.currentWaterType = recommendation.waterType;
        }

        this.updateBuyButtonVisibility();
    },

    // 切换一键购买
    toggleQuickBuy: function(enabled) {
        localStorage.setItem('quickBuyEnabled', enabled);
        this.updateBuyButtonVisibility();
    },

    // 更新购买按钮显示状态
    updateBuyButtonVisibility: function() {
        const quickBuyEnabled = localStorage.getItem('quickBuyEnabled') === 'true';
        const buyBtn = document.getElementById('buyBtn');
        const profileData = localStorage.getItem('userProfile');

        if (quickBuyEnabled && profileData && this.currentWaterType) {
            buyBtn.style.display = 'block';
        } else {
            buyBtn.style.display = 'none';
        }
    },

    // 在美团购买
    buyOnMeituan: function() {
        if (!this.currentWaterType) {
            alert('请先完善个人资料以获取推荐');
            return;
        }

        const water = WaterRecommendation.waterTypes[this.currentWaterType];
        const searchKeyword = encodeURIComponent(water.name);

        // 生成美团搜索URL
        const meituanWebUrl = `https://i.meituan.com/search?q=${searchKeyword}`;

        // 尝试打开美团app（使用URL Scheme）
        const meituanAppUrl = `imeituan://www.meituan.com/search?q=${searchKeyword}`;

        // 先尝试打开app，如果失败则打开网页
        const openApp = () => {
            window.location.href = meituanAppUrl;

            // 2秒后检查是否成功打开app，如果没有则打开网页
            setTimeout(() => {
                window.open(meituanWebUrl, '_blank');
            }, 2000);
        };

        if (confirm(`即将在美团搜索"${water.name}"，是否继续？`)) {
            openApp();
        }
    },

    // 初始化提醒功能
    initReminder: function() {
        const reminderEnabled = localStorage.getItem('reminderEnabled') === 'true';
        if (reminderEnabled) {
            this.scheduleReminders();
        }
    },

    // 切换提醒
    toggleReminder: function(enabled) {
        localStorage.setItem('reminderEnabled', enabled);
        if (enabled) {
            this.scheduleReminders();
            alert('喝水提醒已开启');
        } else {
            alert('喝水提醒已关闭');
        }
    },

    // 安排提醒
    scheduleReminders: function() {
        // 每小时检查一次是否需要提醒
        setInterval(() => {
            this.checkAndNotify();
        }, 3600000); // 1小时

        // 立即检查一次
        this.checkAndNotify();
    },

    // 检查并发送通知
    checkAndNotify: function() {
        const reminderEnabled = localStorage.getItem('reminderEnabled') === 'true';
        if (!reminderEnabled) return;

        const profileData = localStorage.getItem('userProfile');
        if (!profileData) return;

        const recommendation = WaterRecommendation.getRecommendation(safeJSONParse(profileData, null));
        if (recommendation) {
            const water = WaterRecommendation.waterTypes[recommendation.waterType];
            this.showNotification(`该喝水了！建议喝${water.name} ${recommendation.amount}ml`);
        }
    },

    // 显示通知
    showNotification: function(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('喝水提醒', { body: message });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('喝水提醒', { body: message });
                }
            });
        } else {
            alert(message);
        }
    },

    // 切换主题
    switchTheme: function(timeSlot) {
        // 如果没有指定时段，使用当前时段
        if (!timeSlot) {
            timeSlot = WaterRecommendation.getCurrentTimeSlot();
        }

        // 移除所有主题class
        const themeClasses = [
            'theme-earlyMorning',
            'theme-morning',
            'theme-beforeLunch',
            'theme-afternoon',
            'theme-evening',
            'theme-beforeSleep'
        ];
        themeClasses.forEach(cls => document.body.classList.remove(cls));

        // 添加新的主题class
        if (timeSlot && timeSlot !== 'current' && timeSlot !== 'night' && timeSlot !== 'afterLunch') {
            document.body.classList.add(`theme-${timeSlot}`);
        }
    },

    // 切换标签页
    switchTab: function(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // 更新标签页内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        if (tabName === 'home') {
            document.getElementById('homeTab').classList.add('active');
        } else if (tabName === 'profile') {
            document.getElementById('profileTab').classList.add('active');
        }
    }
};

// 启动应用
app.initialize();
