import classnames from 'classnames';
import { SingleMap } from '../MapSet/SingleMap';
import useSharedState from '../../shared/hooks/state.useSharedState';
import { getMapSetByKey } from '../../shared/appState/selectors/getMapSetByKey';
import { getSyncedView } from '../../shared/appState/selectors/getSyncedView';
import './MapSet.css';

export interface MapSetProps {
	// map set identifier
	sharedStateKey: string;
}
/**
 * MapSet component
 *
 * This component renders a set of maps (with either synced, or unsynced view) based on the shared state key.
 * It uses the SingleMap component to render each individual map.
 *
 * @param {MapSetProps} props - The properties for the MapSet component.
 * @returns {JSX.Element | null} The rendered MapSet component or null if no map set is found.
 */
export const MapSet = ({ sharedStateKey }: MapSetProps) => {
	const [sharedState] = useSharedState();
	const mapSet = getMapSetByKey(sharedState, sharedStateKey);
	const numberOfMaps = mapSet?.maps?.length;

	if (numberOfMaps) {
		const syncedView = getSyncedView(sharedState, sharedStateKey);
		const gridClasses = classnames('ptr-MapSet-grid', `has-${numberOfMaps}-maps`);

		return (
			<div className="ptr-MapSet">
				<div className={gridClasses}>
					{mapSet.maps.map((mapKey: string) => {
						return (
							<div key={mapKey} className="ptr-MapSet-map">
								<SingleMap mapKey={mapKey} syncedView={syncedView} />
							</div>
						);
					})}
				</div>
			</div>
		);
	} else {
		return null;
	}
};
