/**
 * What types of graph nodes we use in metadata model
 */
export enum UsedNodeLabels {
	Application = 'application', // Application node (the root of the FE app)
	Datasource = 'datasource', // Datasource node for data including GIS information
	Place = 'place', // Place node for geographical information
	Period = 'period', // Period node for time information
	AreaTree = 'areaTree', // Area tree node for administrative division
	AreaTreeLevel = 'areaTreeLevel', // Area tree level node for administrative division
	Layer = 'layer', // Layer node for map layer (layer have a style and a datasource)
	Style = 'style', // Style node for map layer or a feature
	Feature = 'feature', // Feature node for map layer
}

/**
 * What datasources we use in the system
 */
export enum UsedDatasourceLabels {
	Attribute = 'attribute', // Column(s) with attribute values
	Geojson = 'geojson', // Geojson for web map
	WMS = 'wms', // WMS online source
	COG = 'cogBitmap', // COG online source
	MVT = 'mvt', // MVT (Mapbox Vector Tiles) source
	XYZ = 'xyz', // XYZ tile source
	CSV = 'csv', // CSV data source
	GeoTIFF = 'geotiff', // GeoTIFF raster data
	Shapefile = 'shapefile', // ESRI Shapefile format
	PostGIS = 'postgis', // PostGIS database source
	WMTS = 'wmts', // Web Map Tile Service
	WFS = 'wfs', // Web Feature Service
	GeoPackage = 'geopackage', // OGC GeoPackage format
}

/**
 * What types of edges we use in metadata model
 */
export enum UsedEdgeLabels {
	RelatedTo = 'RELATED', // Generic edge for any relation
	Has = 'HAS', // Edge for ownership relation
}
