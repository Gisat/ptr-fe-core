import { MapView, MapViewState } from "@deck.gl/core"

/**
 * Default state of the map
 * @returns 
 */
export const defaultMapState = () => {
    const initMapState: MapViewState = {
        latitude: 37.783822,
        longitude: -122.3915991,
        zoom: 4.5,
        maxZoom: 20,
        maxPitch: 89,
        bearing: 0,
      }

    return initMapState
}

/**
 * Default state of the map view
 * @returns 
 */
export const defaultMapView = () => {
  const defaultView = new MapView({ repeat: true })
  return defaultView
}