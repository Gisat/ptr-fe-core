/**
 *
 */
export interface Selection {
	key: string;
	distinctColours: string[];
	distinctItems: boolean;
	featureKeyColourIndexPairs: { [key: string]: number };
	featureKeys: string[];
}
