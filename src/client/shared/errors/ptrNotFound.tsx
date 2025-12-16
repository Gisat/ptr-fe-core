import React from 'react';
import './errorStyle.css';

/**
 * Reusable "Not Found" (404) component for applications using ptr-fe-core.
 *
 * Renders a simple message that the requested resource could not be found and
 * optionally displays a navigation link (by default a "Return Home" anchor).
 * The layout and visual styling are handled via `errorStyle.css`.
 *
 * @param link - Optional React node rendered as the navigation element under
 *   the message. When omitted, a default "Return Home" link to `/` is used.
 */
export const PtrNotFound = ({
	link = (
		<a href="/" className="ptrNotFound-link">
			Return Home
		</a>
	),
}: {
	link?: React.ReactNode;
}) => {
	return (
		<div className="globalError-div">
			<h2>Not Found</h2>
			<p>Could not find requested resource</p>
			{link}
		</div>
	);
};
