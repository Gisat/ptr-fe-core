"use client";

import { UserInfo } from "../_logic/models.users";
import { swrFetcher } from "../_logic/utils";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Unsure } from "../coding/code.types";

/**
 * Reads user-info from related API URL using session id savend in cookie
 * @param userInfoUrl URL of Next backend with user info fetch including cookies
 * @returns User Info information for client components
 */
export const useUserInfoFromIdentity = (userInfoUrl: string) => {
    const [userInfoValue, setUserInfo] = useState<Unsure<UserInfo>>(undefined);
    const { data, error, isLoading } = useSWR(userInfoUrl, swrFetcher);

    useEffect(() => {

        if (error) {
            console.dir("User Info Error:")
            console.dir(error)
            return
        }

        if (data) {
            if (!data.email)
                return

            setUserInfo({
                email: data.email
            })
        }

    }, [data, error])

    return { isLoading, userInfoValue, error }
}
