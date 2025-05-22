export const enumToArray = (enumType: any) => Object.values(enumType);

export const enumIncludes = (enumType: any, value: string) => enumToArray(enumType).includes(value);

export const strCapitalizeFirstLetter = (str: string) => {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
};
