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
	activeStep: number;
	/** Callback to set the active step */
	setActiveStep: (step: number) => void;
	/** Callback to set the section to jump to */
	setJumpSection: (section: number) => void;
	/** Reference to the side panel */
	sidePanelRef: React.RefObject<HTMLDivElement | null>;
	/** Number of children (sections) in the side panel */
	sidePanelChildrenCount: number;
	/** Layout of the navigation panel (e.g., "horizontal", "vertical", "single") */
	panelLayout: string;
	/** Size of the content area ([width, height]) */
	contentSize?: [number, number];
	/** Custom navigation icons for specific sections (e.g., home, footer, etc.) */
	navigationIcons?: {
		/** Icon for the home section */
		home?: React.ReactNode;
		/** Icon for the case section */
		case?: React.ReactNode;
		/** Icon for the footer section */
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
 * customizable layouts and icons.
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
	sidePanelChildrenCount,
	panelLayout,
	contentSize,
	navigationIcons,
	fullNavigation,
}) => {
	/**
	 * Generates dynamic class names for the navigation panel based on layout and custom classes.
	 */
	const classes = classnames('ptr-StoryNavPanel', `is-${panelLayout}-layout`, className);

	return (
		<div className={classes}>
			<StoryNavPanelContainer
				className={className}
				activeStep={activeStep}
				setActiveStep={setActiveStep}
				setJumpSection={setJumpSection}
				sidePanelRef={sidePanelRef}
				sidePanelChildrenCount={sidePanelChildrenCount}
				contentSize={contentSize}
				navigationIcons={navigationIcons}
				fullNavigation={fullNavigation}
				isSmallScreen={panelLayout === 'single'}
			/>
		</div>
	);
};
