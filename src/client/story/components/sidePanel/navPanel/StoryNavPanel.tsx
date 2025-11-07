import { StoryNavPanelContainer } from './StoryNavPanelContainer';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StoryNavPanel component.
 */
interface StoryNavPanelProps {
	/** Additional class names for styling */
	className?: string;
	/** The currently active step in the navigation */
	activeStep?: number;
	/** Callback to set the section to jump to */
	setJumpSection?: (section: number) => void;
	/** Reference to the side panel */
	sidePanelRef?: React.RefObject<HTMLDivElement>;
	/** Layout of the navigation panel (e.g., "horizontal", "vertical") */
	layout?: string;
	/** Size of the content area ([width, height]) */
	contentSize?: [number, number];
	/** Custom navigation icons for specific sections (e.g., home, footer, etc.) */
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	/** Whether to show full navigation */
	fullNavigation?: boolean;
}

/**
 * StoryNavPanel Component
 *
 * This component represents the navigation panel within the side panel of a story layout.
 * It provides navigation functionality, such as jumping between sections, and supports
 * customizable layouts.
 *
 * @param {StoryNavPanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryNavPanel component.
 */
export const StoryNavPanel: React.FC<StoryNavPanelProps> = ({
	className,
	activeStep,
	setActiveStep,
	setJumpSection,
	sidePanelRef,
	layout,
	contentSize,
	navigationIcons,
	fullNavigation,
	isSmallScreen,
}) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StoryNavPanel', {}, layout, className);

	return (
		<div className={classes}>
			<StoryNavPanelContainer
				className={className}
				activeStep={activeStep}
				setActiveStep={setActiveStep}
				setJumpSection={setJumpSection}
				sidePanelRef={sidePanelRef}
				contentSize={contentSize}
				navigationIcons={navigationIcons}
				fullNavigation={fullNavigation}
				isSmallScreen={isSmallScreen}
			/>
		</div>
	);
};
