import { AppSharedState } from '../state.models';
import { RenderingLayer, GeometryDrawingModel } from '../../models/models.layers';
import { ActionGeometryDrawingUpdate } from '../state.models.actions';

/**
 * Full default drawing state used when a layer has no existing `polygonDrawing`
 * value and a patch is dispatched for it.
 *
 * Ensures that after every update the resulting `GeometryDrawingModel` shape is
 * always fully populated – no required field can be absent due to an incomplete
 * first patch.
 */
const DEFAULT_GEOMETRY_DRAWING_STATE: GeometryDrawingModel = {
	mode: 'polygon',
	isActive: false,
	isClosed: false,
	geometryCoordinates: [],
	hoveredPointIndex: null,
};

/**
 * Core reducer handler for GEOMETRY_DRAWING_UPDATE.
 *
 * Finds the RenderingLayer identified by `payload.layerKey` and merges
 * `payload.patch` into its `polygonDrawing` field.  All other layers and
 * all other state properties are left untouched.
 *
 * Registered as a core reducer in `state.reducer.ts` so any application
 * using `ptr-fe-core` automatically supports drawing state without having
 * to add an app-specific reducer entry.
 */
export const reduceHandlerGeometryDrawingUpdate = <T extends AppSharedState>(
	state: T,
	action: ActionGeometryDrawingUpdate
): T => {
	const { layerKey, patch } = action.payload;

	const newRenderingLayers = state.renderingLayers.map((layer: RenderingLayer) => {
		if (layer.key !== layerKey) return layer;

		/**
		 * Fall back to the full default state when `polygonDrawing` is absent.
		 * Using `{}` here would leave required fields (mode, geometryCoordinates,
		 * isActive, isClosed) missing after the spread, causing runtime crashes
		 * in drawing handlers that assume those fields always exist.
		 */
		const current: GeometryDrawingModel =
			layer.polygonDrawing ?? DEFAULT_GEOMETRY_DRAWING_STATE;

		/**
		 * No-op guard: if every field in the patch already has the same value
		 * (using Object.is for primitives, reference equality for arrays),
		 * return the same layer reference so React does not schedule a re-render.
		 *
		 * This is the backstop that prevents an infinite loop when onGeometryHover
		 * fires repeatedly with `hoveredPointIndex: null` → `null` → `null` …
		 * (The primary guard lives in SingleMap onHover; this one catches any
		 * other caller that may dispatch an unchanged patch.)
		 *
		 * Note: for arrays (geometryCoordinates) the caller always creates a new
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
			},
		};
	});

	return { ...state, renderingLayers: newRenderingLayers };
};

