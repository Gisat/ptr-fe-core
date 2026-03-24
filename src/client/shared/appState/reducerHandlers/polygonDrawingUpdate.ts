import { AppSharedState } from '../state.models';
import { RenderingLayer, RenderingLayerPolygonDrawing } from '../../models/models.layers';
import { ActionPolygonDrawingUpdate } from '../state.models.actions';

/**
 * Core reducer handler for POLYGON_DRAWING_UPDATE.
 *
 * Finds the RenderingLayer identified by `payload.layerKey` and merges
 * `payload.patch` into its `polygonDrawing` field.  All other layers and
 * all other state properties are left untouched.
 *
 * Registered as a core reducer in `state.reducer.ts` so any application
 * using `ptr-fe-core` automatically supports drawing state without having
 * to add an app-specific reducer entry.
 */
export const reduceHandlerPolygonDrawingUpdate = <T extends AppSharedState>(
	state: T,
	action: ActionPolygonDrawingUpdate
): T => {
	const { layerKey, patch } = action.payload;

	const newRenderingLayers = state.renderingLayers.map((layer: RenderingLayer) => {
		if (layer.key !== layerKey) return layer;

		const current = layer.polygonDrawing ?? {};

		/**
		 * No-op guard: if every field in the patch already has the same value
		 * (using Object.is for primitives, reference equality for arrays),
		 * return the same layer reference so React does not schedule a re-render.
		 *
		 * This is the backstop that prevents an infinite loop when onHover fires
		 * repeatedly with `hoveredPointIndex: null` → `null` → `null` …
		 * (The primary guard lives in SingleMap onHover; this one catches any
		 * other caller that may dispatch an unchanged patch.)
		 *
		 * Note: for arrays (polygonCoordinates) the caller always creates a new
		 * array reference when coordinates change, so Object.is correctly returns
		 * false there and the update proceeds normally.
		 */
		const isNoOp = Object.keys(patch).every(
			(key) => Object.is((current as any)[key], (patch as any)[key])
		);
		if (isNoOp) return layer;

		return {
			...layer,
			polygonDrawing: {
				...current,
				...patch,
			} as RenderingLayerPolygonDrawing,
		};
	});

	return { ...state, renderingLayers: newRenderingLayers };
};

