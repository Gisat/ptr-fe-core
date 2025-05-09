import { MantineProvider as Mantine, createTheme, MantineThemeOverride } from '@mantine/core';
import { defaultTheme } from './defaultTheme';
import React, { JSX } from 'react';

/**
 * Props for the MantineProvider component.
 */
type MantineProviderProps = {
	/** React children elements to be rendered inside the provider */
	children: any;
	/** Optional theme object to override the default theme */
	theme?: MantineThemeOverride;
};

/**
 * A wrapper around MantineProvider that applies a default theme if none is provided.
 *
 * @param {MantineProviderProps} props - The props for the provider.
 * @returns {JSX.Element} The MantineProvider component.
 */
export const MantineProvider: React.FC<MantineProviderProps> = ({
	children,
	theme = defaultTheme,
}: MantineProviderProps): JSX.Element => {
	return <Mantine theme={createTheme(theme)}>{children}</Mantine>;
};

export default MantineProvider;
