import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Unsure } from '../coding/code.types';
import { swrFetcher } from '../helpers/utils';
import { UserInfo } from '../models/models.users';

/**
 * Reads user-info from related API URL using session id saved in cookie
 * @param userInfoUrl - URL of Next backend with user info fetch including cookies
 * @param redirectPaths - Optional login and error redirect paths
 * @returns User Info information for client components
 */
export const useUserInfoFromIdentity = (
	userInfoUrl: string,
	redirectPaths?: {
		loginRedirectPath?: string; // e.g. '/account'
		errorRedirectPath?: string; // e.g. '/error'
	}
) => {
	const [userInfoValue, setUserInfo] = useState<Unsure<UserInfo>>(undefined);
	const { data, error, isLoading } = useSWR(userInfoUrl, (url: string) =>
		swrFetcher(url, {
			loginRedirectPath: redirectPaths?.loginRedirectPath,
			errorRedirectPath: redirectPaths?.errorRedirectPath,
		})
	);

	useEffect(() => {
		if (error) {
			console.error('User Info Fetch Error:', error);
			return;
		}

		if (data) {
			if (!data.email) return;

			setUserInfo({
				email: data.email,
			});
		}
	}, [data, error]);

	return { isLoading, userInfoValue, error };
};
