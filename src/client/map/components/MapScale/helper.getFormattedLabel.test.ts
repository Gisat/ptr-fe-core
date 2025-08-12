import { describe, expect, it } from 'vitest';
import { getFormattedLabel } from './helper.getFormattedLabel';

describe('getFormattedLabel', () => {
	it('formats values less than 1000 as meters', () => {
		expect(getFormattedLabel(500)).toBe('500 m');
		expect(getFormattedLabel(0)).toBe('0 m');
		expect(getFormattedLabel(999)).toBe('999 m');
	});

	it('formats values 1000 or more as kilometers', () => {
		expect(getFormattedLabel(1000)).toBe('1 km');
		expect(getFormattedLabel(1500)).toBe('1.5 km');
		expect(getFormattedLabel(12345)).toBe('12.345 km');
	});
});
