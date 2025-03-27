import { Loader } from "@mantine/core";
import {JSX} from "react";
import "./PageLoader.css";

/**
 * PageLoader component
 *
 * This component renders a loader for pages or components.
 * It uses the Loader component from the @mantine/core library.
 *
 * @returns {JSX.Element} The rendered loader component.
 */
export const PageLoader = (): JSX.Element => {
    return (
        <div className="ptr-PageLoader">
            <Loader color="var(--accent500)" />
        </div>
    );
};
