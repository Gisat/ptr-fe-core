import '../../../_styles/globals.css';

type defaultThemeTypes = {
	fontFamily: string;
	white: string;
	black: string;
	primaryColor: string;
	colors: {
		light: readonly [string, string, string, string, string, string, string, string, string, string, ...string[]];
		dark: readonly [string, string, string, string, string, string, string, string, string, string, ...string[]];
		gray: readonly [string, string, string, string, string, string, string, string, string, string, ...string[]];
		accented: readonly [string, string, string, string, string, string, string, string, string, string, ...string[]];
	}
};


export const defaultTheme:defaultThemeTypes = {
	fontFamily: 'var(--defaultFontFamily)',
	white: 'var(--base0)',
	black: 'var(--base950)',
	primaryColor: 'accented',
	colors: {
		light: ['var(--base25)', 'var(--base50)', 'var(--base100)', 'var(--base200)', 'var(--base300)', 'var(--base400)', 'var(--base500)', 'var(--base600)', 'var(--base700)', 'var(--base800)'],
		dark: ['var(--base800)', 'var(--base700)', 'var(--base600)', 'var(--base500)', 'var(--base400)', 'var(--base300)', 'var(--base200)', 'var(--base100)', 'var(--base50)','var(--base25)'],
		gray: ['var(--base25)', 'var(--base50)', 'var(--base100)', 'var(--base200)', 'var(--base300)', 'var(--base400)', 'var(--base500)', 'var(--base600)', 'var(--base700)', 'var(--base800)'],
		accented: ['var(--accent25)', 'var(--accent50)', 'var(--accent100)', 'var(--accent200)', 'var(--accent300)', 'var(--accent400)', 'var(--accent500)', 'var(--accent600)', 'var(--accent700)', 'var(--accent800)'],
	}
}

export default defaultTheme;