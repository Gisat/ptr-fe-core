import { getFormattedLabel } from './helper.getFormattedLabel';

describe('Get formatted label with units', () => {
	// Test that values less than 1000 are formatted as meters
	it('should return the value in meters when the input is less than 1000', () => {
		expect(getFormattedLabel(500)).toBe('500 m');
		expect(getFormattedLabel(0)).toBe('0 m');
		expect(getFormattedLabel(999)).toBe('999 m');
	});

	// Test that values of 1000 or more are converted to kilometers and formatted correctly
	it('should convert values of 1000 or more to kilometers and format them correctly', () => {
		expect(getFormattedLabel(1000)).toBe('1 km');
		expect(getFormattedLabel(1500)).toBeOneOf(['1.5 km', '1,5 km']);
		expect(getFormattedLabel(12345)).toBeOneOf(['12.345 km', '12,345 km']);
	});
});
