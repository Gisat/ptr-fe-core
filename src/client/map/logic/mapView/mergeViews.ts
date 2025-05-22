import { MapView } from '../../../shared/models/models.mapView';
import { MapViewState } from '@deck.gl/core';
import { defaultMapViewState } from '../../logic/map.defaults';

/**
 * Get merged map view state
 * @param mapViewFromProps {MapView} - synced map view
 * @param mapViewFromSharedState {MapView} - map view
 */
export const mergeViews = (
	mapViewFromProps: Partial<MapView>,
	mapViewFromSharedState: Partial<MapView>
): MapViewState => {
	const defaultViewState: MapViewState = defaultMapViewState();
	return { ...defaultViewState, ...mapViewFromSharedState, ...mapViewFromProps };
};
