// 喝水推荐系统
const WaterRecommendation = {
    // 水的类型定义
    waterTypes: {
        plain: { name: '温开水', icon: '💧', temp: '温热' },
        warm: { name: '热水', icon: '♨️', temp: '热' },
        tea: { name: '茶水', icon: '🍵', temp: '温热' },
        lemon: { name: '柠檬水', icon: '🍋', temp: '常温' },
        honey: { name: '蜂蜜水', icon: '🍯', temp: '温热' },
        milk: { name: '牛奶', icon: '🥛', temp: '温热' },
        juice: { name: '果汁', icon: '🧃', temp: '常温' }
    },

    // 时间段定义
    timeSlots: {
        earlyMorning: { start: 6, end: 8, name: '清晨' },
        morning: { start: 8, end: 12, name: '上午' },
        beforeLunch: { start: 11, end: 12, name: '饭前' },
        afternoon: { start: 14, end: 17, name: '下午' },
        evening: { start: 17, end: 20, name: '晚上' },
        beforeSleep: { start: 20, end: 22, name: '睡前' }
    },

    // 获取当前时间段 (delegates to shared DateUtils)
    getCurrentTimeSlot: function() {
        return DateUtils.getCurrentTimeSlot();
    },

    // 根据用户资料和时间段生成推荐
    getRecommendation: function(profile, timeSlot) {
        if (!profile || !profile.age || !profile.gender || !profile.workType) {
            return null;
        }

        // 如果没有指定时段，使用当前时段
        if (!timeSlot) {
            timeSlot = this.getCurrentTimeSlot();
        }

        const { age, gender, workType } = profile;

        // 基础推荐逻辑
        let recommendation = {
            waterType: 'plain',
            amount: 200,
            reason: '',
            tips: []
        };

        // 根据时间段推荐
        switch (timeSlot) {
            case 'earlyMorning':
                recommendation.waterType = 'warm';
                recommendation.amount = 300;
                recommendation.reason = '清晨起床后，喝一杯温热水有助于唤醒身体，促进新陈代谢';
                break;
            case 'morning':
                recommendation.waterType = 'tea';
                recommendation.reason = '上午工作时，茶水可以提神醒脑，提高工作效率';
                break;
            case 'beforeLunch':
                recommendation.waterType = 'plain';
                recommendation.amount = 150;
                recommendation.reason = '饭前适量饮水有助于消化，但不宜过多';
                break;
            case 'afternoon':
                recommendation.waterType = 'lemon';
                recommendation.reason = '下午来杯柠檬水，补充维生素C，缓解疲劳';
                break;
            case 'evening':
                recommendation.waterType = 'plain';
                recommendation.reason = '晚上适合喝温开水，避免影响睡眠';
                break;
            case 'beforeSleep':
                recommendation.waterType = 'honey';
                recommendation.amount = 150;
                recommendation.reason = '睡前少量蜂蜜水有助于睡眠，但不宜过多';
                break;
        }

        // 根据工作类型调整
        if (workType === 'physical' || workType === 'outdoor') {
            recommendation.amount += 100;
            recommendation.tips.push('体力劳动者需要更多水分补充');
        }

        // 根据性别调整
        if (gender === 'male') {
            recommendation.amount += 50;
        }

        // 根据年龄调整
        if (age > 60) {
            recommendation.tips.push('老年人要注意少量多次饮水');
        } else if (age < 18) {
            recommendation.tips.push('青少年要保证充足的水分摄入');
        }

        return recommendation;
    },

    // 格式化推荐信息
    formatRecommendation: function(recommendation) {
        if (!recommendation) {
            return {
                html: '<p class="recommendation-text">请先完善个人资料以获取个性化推荐</p>'
            };
        }

        const water = this.waterTypes[recommendation.waterType];
        let html = `
            <div class="recommendation-header">
                <span class="water-icon">${water.icon}</span>
                <span class="water-name">${water.name}</span>
                <span class="water-amount">${recommendation.amount}ml</span>
            </div>
            <p class="recommendation-reason">${recommendation.reason}</p>
        `;

        if (recommendation.tips.length > 0) {
            html += '<div class="recommendation-tips">';
            recommendation.tips.forEach(tip => {
                html += `<p class="tip">💡 ${tip}</p>`;
            });
            html += '</div>';
        }

        return { html, waterType: recommendation.waterType };
    }
};
