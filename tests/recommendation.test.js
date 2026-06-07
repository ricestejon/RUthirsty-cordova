/**
 * Unit tests for WaterRecommendation module (www/js/recommendation.js)
 */

const fs = require('fs');
const path = require('path');

// Load the recommendation module in jsdom
const scriptContent = fs.readFileSync(
  path.resolve(__dirname, '../www/js/recommendation.js'),
  'utf-8'
);

let WaterRecommendation;

beforeAll(() => {
  const script = new Function(scriptContent + '\nreturn WaterRecommendation;');
  WaterRecommendation = script();
});

describe('WaterRecommendation', () => {
  describe('waterTypes', () => {
    it('should define all expected water types', () => {
      const expectedTypes = ['plain', 'warm', 'tea', 'lemon', 'honey', 'milk', 'juice'];
      expectedTypes.forEach(type => {
        expect(WaterRecommendation.waterTypes[type]).toBeDefined();
        expect(WaterRecommendation.waterTypes[type].name).toBeTruthy();
        expect(WaterRecommendation.waterTypes[type].icon).toBeTruthy();
        expect(WaterRecommendation.waterTypes[type].temp).toBeTruthy();
      });
    });
  });

  describe('timeSlots', () => {
    it('should define time slots with start and end hours', () => {
      const slots = Object.values(WaterRecommendation.timeSlots);
      slots.forEach(slot => {
        expect(slot.start).toBeGreaterThanOrEqual(0);
        expect(slot.end).toBeLessThanOrEqual(24);
        expect(slot.name).toBeTruthy();
      });
    });

    it('should cover key parts of the day', () => {
      expect(WaterRecommendation.timeSlots.earlyMorning).toBeDefined();
      expect(WaterRecommendation.timeSlots.morning).toBeDefined();
      expect(WaterRecommendation.timeSlots.afternoon).toBeDefined();
      expect(WaterRecommendation.timeSlots.evening).toBeDefined();
      expect(WaterRecommendation.timeSlots.beforeSleep).toBeDefined();
    });
  });

  describe('getCurrentTimeSlot', () => {
    it('should return earlyMorning for hours 6-7', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 6, 30));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('earlyMorning');
      jest.setSystemTime(new Date(2024, 0, 1, 7, 59));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('earlyMorning');
      jest.useRealTimers();
    });

    it('should return morning for hours 8-10', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 9, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('morning');
      jest.useRealTimers();
    });

    it('should return beforeLunch for hour 11', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 11, 30));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('beforeLunch');
      jest.useRealTimers();
    });

    it('should return afterLunch for hours 12-13', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('afterLunch');
      jest.useRealTimers();
    });

    it('should return afternoon for hours 14-16', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 15, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('afternoon');
      jest.useRealTimers();
    });

    it('should return evening for hours 17-19', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 18, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('evening');
      jest.useRealTimers();
    });

    it('should return beforeSleep for hours 20-21', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 21, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('beforeSleep');
      jest.useRealTimers();
    });

    it('should return night for hours 22-5', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 23, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('night');
      jest.setSystemTime(new Date(2024, 0, 1, 3, 0));
      expect(WaterRecommendation.getCurrentTimeSlot()).toBe('night');
      jest.useRealTimers();
    });
  });

  describe('getRecommendation', () => {
    const baseProfile = { age: 30, gender: 'male', workType: 'office' };

    it('should return null if profile is missing or incomplete', () => {
      expect(WaterRecommendation.getRecommendation(null, 'morning')).toBeNull();
      expect(WaterRecommendation.getRecommendation({}, 'morning')).toBeNull();
      expect(WaterRecommendation.getRecommendation({ age: 25 }, 'morning')).toBeNull();
      expect(WaterRecommendation.getRecommendation({ age: 25, gender: 'male' }, 'morning')).toBeNull();
    });

    it('should return warm water for earlyMorning', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'earlyMorning');
      expect(rec.waterType).toBe('warm');
      expect(rec.amount).toBe(350); // 300 base + 50 for male
    });

    it('should return tea for morning', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'morning');
      expect(rec.waterType).toBe('tea');
      expect(rec.amount).toBe(250); // 200 base + 50 for male
    });

    it('should return plain water with reduced amount for beforeLunch', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'beforeLunch');
      expect(rec.waterType).toBe('plain');
      expect(rec.amount).toBe(200); // 150 base + 50 for male
    });

    it('should return lemon water for afternoon', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'afternoon');
      expect(rec.waterType).toBe('lemon');
      expect(rec.amount).toBe(250); // 200 base + 50 for male
    });

    it('should return plain water for evening', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'evening');
      expect(rec.waterType).toBe('plain');
      expect(rec.amount).toBe(250); // 200 base + 50 for male
    });

    it('should return honey water for beforeSleep', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'beforeSleep');
      expect(rec.waterType).toBe('honey');
      expect(rec.amount).toBe(200); // 150 base + 50 for male
    });

    it('should increase amount for physical workers', () => {
      const physicalProfile = { age: 30, gender: 'male', workType: 'physical' };
      const rec = WaterRecommendation.getRecommendation(physicalProfile, 'morning');
      expect(rec.amount).toBe(350); // 200 base + 100 physical + 50 male
      expect(rec.tips).toContain('体力劳动者需要更多水分补充');
    });

    it('should increase amount for outdoor workers', () => {
      const outdoorProfile = { age: 30, gender: 'male', workType: 'outdoor' };
      const rec = WaterRecommendation.getRecommendation(outdoorProfile, 'morning');
      expect(rec.amount).toBe(350); // 200 base + 100 outdoor + 50 male
    });

    it('should add 50ml for male gender', () => {
      const maleRec = WaterRecommendation.getRecommendation(
        { age: 30, gender: 'male', workType: 'office' }, 'morning'
      );
      const femaleRec = WaterRecommendation.getRecommendation(
        { age: 30, gender: 'female', workType: 'office' }, 'morning'
      );
      expect(maleRec.amount - femaleRec.amount).toBe(50);
    });

    it('should add tip for elderly (age > 60)', () => {
      const elderlyProfile = { age: 65, gender: 'male', workType: 'office' };
      const rec = WaterRecommendation.getRecommendation(elderlyProfile, 'morning');
      expect(rec.tips).toContain('老年人要注意少量多次饮水');
    });

    it('should add tip for youth (age < 18)', () => {
      const youthProfile = { age: 16, gender: 'male', workType: 'student' };
      const rec = WaterRecommendation.getRecommendation(youthProfile, 'morning');
      expect(rec.tips).toContain('青少年要保证充足的水分摄入');
    });

    it('should not add age-related tips for middle-aged users', () => {
      const rec = WaterRecommendation.getRecommendation(baseProfile, 'morning');
      expect(rec.tips).not.toContain('老年人要注意少量多次饮水');
      expect(rec.tips).not.toContain('青少年要保证充足的水分摄入');
    });

    it('should use current time slot when timeSlot is not specified', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 0, 1, 15, 0)); // afternoon
      const rec = WaterRecommendation.getRecommendation(baseProfile, null);
      expect(rec.waterType).toBe('lemon');
      jest.useRealTimers();
    });
  });

  describe('formatRecommendation', () => {
    it('should return placeholder HTML when recommendation is null', () => {
      const result = WaterRecommendation.formatRecommendation(null);
      expect(result.html).toContain('请先完善个人资料以获取个性化推荐');
    });

    it('should format recommendation with water icon, name, and amount', () => {
      const recommendation = {
        waterType: 'tea',
        amount: 250,
        reason: '上午工作时，茶水可以提神醒脑',
        tips: []
      };
      const result = WaterRecommendation.formatRecommendation(recommendation);
      expect(result.html).toContain('🍵');
      expect(result.html).toContain('茶水');
      expect(result.html).toContain('250ml');
      expect(result.html).toContain('上午工作时，茶水可以提神醒脑');
      expect(result.waterType).toBe('tea');
    });

    it('should include tips in the formatted output', () => {
      const recommendation = {
        waterType: 'plain',
        amount: 300,
        reason: 'Test reason',
        tips: ['体力劳动者需要更多水分补充', '老年人要注意少量多次饮水']
      };
      const result = WaterRecommendation.formatRecommendation(recommendation);
      expect(result.html).toContain('体力劳动者需要更多水分补充');
      expect(result.html).toContain('老年人要注意少量多次饮水');
      expect(result.html).toContain('💡');
    });

    it('should not include tips section when tips array is empty', () => {
      const recommendation = {
        waterType: 'plain',
        amount: 200,
        reason: 'Test',
        tips: []
      };
      const result = WaterRecommendation.formatRecommendation(recommendation);
      expect(result.html).not.toContain('recommendation-tips');
    });
  });
});
