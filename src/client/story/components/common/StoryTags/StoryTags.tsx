import React, { useEffect } from 'react';
import classnames from 'classnames';
import './style.css';
import { Badge } from '@mantine/core';

/**
 * Represents a single tag's data.
 */
interface TagData {
	/** Unique key for the tag */
	key: string;
	/** Data associated with the tag */
	data: {
		/** Display name for the tag */
		nameDisplay: string;
		/** Color associated with the tag */
		color: string;
	};
}

/**
 * Props for the StoryTags component.
 */
interface StoryTagsProps {
	/** Additional class names for styling */
	className?: string;
	/** Callback when the component mounts */
	onMount?: (tagKeys?: any) => void;
	/** Callback when the component unmounts */
	onUnmount?: () => void;
	/** Array of tag objects */
	tags?: TagData[];
	/** Additional keys for tags */
	tagKeys?: any;
}

/**
 * StoryTags Component
 *
 * This component renders a list of tags using the `Badge` component from Mantine.
 * It supports lifecycle callbacks for mounting and unmounting, and allows for
 * dynamic styling and customization of tags.
 *
 * @param {StoryTagsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryTags component.
 */
export const StoryTags: React.FC<StoryTagsProps> = ({ className, onMount, onUnmount, tags, tagKeys }) => {
	// Handle lifecycle events
	useEffect(() => {
		if (onMount && typeof onMount === 'function') {
			onMount(tagKeys);
		}

		return () => {
			if (onUnmount && typeof onUnmount === 'function') {
				onUnmount();
			}
		};
	}, [onMount, onUnmount, tagKeys]);

	// Generate dynamic class names
	const classes = classnames('ptr-StoryTags', className);

	return (
		<div className={classes}>
			{tags &&
				tags.map((tag) => (
					<Badge key={tag.key} size={'lg'} className="ptr-StoryTag" tt="none" color={tag.data.color}>
						{tag.data.nameDisplay}
					</Badge>
				))}
		</div>
	);
};
