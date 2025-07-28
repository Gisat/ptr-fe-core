import classnames from 'classnames';
import React from 'react';
import { ReactCompareSlider, ReactCompareSliderHandle } from 'react-compare-slider';
import { SingleMap } from '../MapSet/SingleMap';
import { useSharedState } from '../../shared/hooks/state.useSharedState';
import { getMapSetByKey } from '../../shared/appState/selectors/getMapSetByKey';
import { getSyncedView } from '../../shared/appState/selectors/getSyncedView';
import './MapSet.css';

/**
 * Props for the MapSetWrapper component.
 * @interface MapSetWrapperProps
 * @property {React.ReactNode} [children] - The child elements to be wrapped.
 */
export interface MapSetWrapperProps {
	children?: React.ReactNode;
}

/**
 * A wrapper component for the MapSet. Adds a consistent outer div with a specific class.
 * @param {MapSetWrapperProps} props - The props for the wrapper component.
 * @returns {JSX.Element} The wrapped children inside a div with the "ptr-MapSet" class.
 */
export const MapSetWrapper = ({ children }: MapSetWrapperProps) => {
	return <div className="ptr-MapSet">{children}</div>;
};

/**
 * Props for the MapSet component.
 * @interface MapSetProps
 * @property {string} sharedStateKey - The key used to retrieve the map set from the shared state.
 * @property {React.ElementType} [SingleMapTools] - Optional tools component to render alongside each map.
 * @property {React.ElementType} [MapSetTools] - Optional tools component to render for the entire map set.
 */
export interface MapSetProps {
	sharedStateKey: string;
	SingleMapTools?: React.ElementType;
	MapSetTools?: React.ElementType;
}

/**
 * MapSet component renders a set of maps in either a grid or slider mode based on the shared state.
 * Handles synced zoom and center for maps and provides warnings for invalid configurations.
 * @param {MapSetProps} props - The props for the MapSet component.
 * @returns {JSX.Element | null} The rendered MapSet or null if no maps are found.
 */
export const MapSet = ({ sharedStateKey, SingleMapTools, MapSetTools }: MapSetProps) => {
	// Retrieve shared state and map set using the provided key
	const [sharedState] = useSharedState();
	const mapSet = getMapSetByKey(sharedState, sharedStateKey);
	const maps = mapSet?.maps;

	// Return null and log a warning if the map set or maps are not found
	if (!mapSet || !maps?.length) {
		console.warn(`MapSet with key "${sharedStateKey}" not found or has no maps.`);
		return null;
	}

	// Extract map set properties
	const numberOfMaps = maps.length;
	const mode = mapSet.mode ?? 'grid';
	const hasSyncedZoomAndCenter = mapSet.sync && (mapSet.sync.zoom || mapSet.sync.center);

	// Memoize the synced view for performance optimization
	const syncedView = getSyncedView(sharedState, sharedStateKey);

	// Generate CSS classes for the grid layout based on the number of maps
	const gridClasses = classnames('ptr-MapSet-grid', `has-${numberOfMaps}-maps`);

	// Render slider mode if requirements are met
	if (mode === 'slider' && numberOfMaps === 2 && hasSyncedZoomAndCenter) {
		return (
			<MapSetWrapper>
				<ReactCompareSlider
					onlyHandleDraggable
					handle={<ReactCompareSliderHandle />}
					className="ptr-MapSetSliderComparator"
					itemOne={
						<div key={maps[0]} className="ptr-MapSet-map">
							{/* Render individual map */}
							<SingleMap mapKey={maps[0]} syncedView={syncedView} />
							{/* Optionally render tools for the map */}
							{SingleMapTools &&
								React.createElement(SingleMapTools, {
									mapKey: maps[0],
									mapSetKey: sharedStateKey,
									isSliderModeLeftMap: true,
								})}
						</div>
					}
					itemTwo={
						<div key={maps[1]} className="ptr-MapSet-map">
							{/* Render individual map */}
							<SingleMap mapKey={maps[1]} syncedView={syncedView} />
							{/* Optionally render tools for the map */}
							{SingleMapTools &&
								React.createElement(SingleMapTools, {
									mapKey: maps[1],
									mapSetKey: sharedStateKey,
									isSliderModeRightMap: true,
								})}
						</div>
					}
				></ReactCompareSlider>
				{MapSetTools && React.createElement(MapSetTools, { mapSetKey: sharedStateKey })}
			</MapSetWrapper>
		);
	}

	// Log warnings if slider mode is requested but requirements are not met
	if (mode === 'slider') {
		if (numberOfMaps !== 2) {
			console.warn(
				`MapSet with key "${sharedStateKey}" is in slider mode but has ${numberOfMaps} maps. Slider mode requires exactly 2 maps.`
			);
		}
		if (!hasSyncedZoomAndCenter) {
			console.warn(`MapSet with key "${sharedStateKey}" is in slider mode but does not have synced zoom and center.`);
		}
	}

	// Render grid mode for all other cases
	return (
		<MapSetWrapper>
			<div className={gridClasses}>
				{maps.map((mapKey: string) => (
					<div key={mapKey} className="ptr-MapSet-map">
						{/* Render individual map */}
						<SingleMap mapKey={mapKey} syncedView={syncedView} />
						{/* Optionally render tools for the map */}
						{SingleMapTools && React.createElement(SingleMapTools, { mapKey, mapSetKey: sharedStateKey })}
					</div>
				))}
			</div>
			{MapSetTools && React.createElement(MapSetTools, { mapSetKey: sharedStateKey })}
		</MapSetWrapper>
	);
};
