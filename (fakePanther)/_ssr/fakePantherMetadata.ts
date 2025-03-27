import { UsedDatasourceLabels, UsedNodeLabels } from "../../(shared)/panther/enums.panther";
import { ApplicationNode, Datasource } from "../../(shared)/panther/models.nodes";

export const fakePantherMetadataForApp = () => {
    const applicationConfig: ApplicationNode = {
      key: "nextdemo",
      labels: [UsedNodeLabels.Application],
      description: null,
      lastUpdatedAt: 123,
      nameDisplay: "Greengage Demo App",
      nameInternal: "ggapp",
      configuration: JSON.stringify({
        layerTree: [
          {
            key: "baseDS",
            level: 0,
            isBasemap: true,
            category: "basemaps",
            onClickInteraction: null,
          }
        ],
      }),
    };

    const datasources: Datasource[] = [
      {
        key: "baseDS",
        labels: [UsedNodeLabels.Datasource, UsedDatasourceLabels.XYZ],
        nameDisplay: "Open Street Maps (OSM)",
        nameInternal: "osm",
        description: null,
        lastUpdatedAt: 123,
        configuration: JSON.stringify({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        }),
      }
    ];

    return [...datasources, applicationConfig];
  };
