
import '../map.css';
import { defaultMapViewState, defaultMapView } from '../logic/map.defaults';
import React, { useState } from 'react';
import { parseLayersFromSharedState } from '../logic/parsing.layers';

import FeatureDetailModal, { FeatureModalState } from './FeatureDetailModal';
import { FeatureInteractionFunc } from '../logic/models.events';
import useSharedState from '../../shared/hooks/state.useSharedState';
import { LayersList, MapViewState } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { LayerTreeInteraction } from '../../shared/layers/models.layers';
import { Nullable } from '../../../globals/shared/coding/code.types';
import { TileLayer } from '@deck.gl/geo-layers';

/**
 * Interface for the RenderMapProps.
 */
export interface RenderMapProps {
	/** Reference to the map. */
	mapRef?: any;
	/** Custom base map layer. */
	customBaseMap?: TileLayer;
	/** Width of the map. */
	width?: string;
	/** Height of the map. */
	height?: string;
	/** List of layers to be rendered. */
	layer?: LayersList;
	/** Callback function for click events. */
	onClick?: (info: object) => void;
	/** Function to get the cursor style. */
	getCursor?: (info: object) => string;
	/** Callback function for hover events. */
	onHover?: (info: object) => void;
	/** Callback function for drag events. */
	onDrag?: (info: object) => void;
	/** Callback function for drag start events. */
	onStartDragging?: (info: object) => void;
	/** Callback function for drag stop events. */
	onStopDragging?: (info: object) => void;
	/** Callback function for view state change events. */
	onViewStateChange?: (info: object) => void;
	/** Boolean to disable controls. */
	disableControls?: boolean;
	/** Initial view state of the map. */
	initialViewState?: MapViewState | null;
	/** Function to set distance scales. */
	setDistanceScales?: (distanceScales: { unitsPerDegree?: Array<number>; metersPerUnit: Array<number> }) => void;
}

/** Rendered map with DeckGL tool used as a geospatial renderer */
export const RenderingMap: React.FC<RenderMapProps> = (props: RenderMapProps) => {
	// shared application state in context
	const [sharedState] = useSharedState();

	// TODO custom hook
	// modal window with feature detail state
	const [featureModalState, setFeatureModalState] = useState<FeatureModalState<any>>({
		isVisible: false,
		featureRecord: null,
	});

	// interaction map
	// TODO out of this code, somewhere standalone
	const interactionMap = new Map<LayerTreeInteraction, FeatureInteractionFunc>();

	// add interaction for feature detail into the map
	interactionMap.set(LayerTreeInteraction.FeatureDetail, (propertiesEntity: Nullable<any>) => {
		if (!propertiesEntity)
			throw new Error(
				`Feature Interaction: Callback for ${LayerTreeInteraction.FeatureDetail} requires feature property data`
			);
	});

	// deck GL map view state
	const initMapState: MapViewState = defaultMapViewState();
	const initMapView = defaultMapView();

	// layers setup
	const mapLayers: LayersList = parseLayersFromSharedState([...sharedState.renderingLayers], interactionMap);

	const layers = [...mapLayers, props.layer];

	return (
		<section className="ptr-mapRender">
			<DeckGL
				ref={props.mapRef}
				views={initMapView}
				initialViewState={props.initialViewState ?? initMapState}
				layers={layers}
				controller={!props.disableControls}
				style={{ position: 'relative', width: props.width, height: props.height }}
				onClick={props.onClick}
				onHover={props.onHover}
				onDrag={props.onDrag}
				onDragStart={props.onStartDragging}
				onDragEnd={props.onStopDragging}
				onViewStateChange={props.onViewStateChange}
				getCursor={(info) => {
					return props.getCursor ? props.getCursor(info) : info.isDragging ? 'grabbing' : 'grab';
				}} // otherwise throws an error
			></DeckGL>

			<FeatureDetailModal
				isVisible={featureModalState.isVisible}
				detailEntity={featureModalState.featureRecord}
				onCloseHandler={() => setFeatureModalState({ isVisible: false, featureRecord: null })}
			/>
		</section>
	);
};
