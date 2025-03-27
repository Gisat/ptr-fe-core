'use client';

import { swrFetcher } from '@features/(shared)/_logic/utils';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import useSWR from 'swr';
import { FaroConfigProps } from '../_logic/models.faro';
import { parseFaroParameters } from '../_logic/parsers.faro';


/**
 * Grafana Faro initialisaion as a Reac component using fetch to NextJS backend API route for faro parameters. 
 * @param props Props including path for faro parameters URL source
 * @returns 
 */
export default function FaroFrontendMonitoring(props: { envUrl: string }) {

  // Fetch data from the custom URL with SWR
  const { data, isLoading } = useSWR(props.envUrl, swrFetcher);

  // skip if already initialized
  if (faro.api) {
    return null;
  }

  if (!isLoading) {

    // convert fetch data into faro config model
    const {appName, environment, faroUrl, version} = parseFaroParameters(data as FaroConfigProps)

    try {
      initializeFaro({
        url: faroUrl,
        app: {
          name: appName,
          version: version,
          environment
        },

        instrumentations: [
          // Mandatory, omits default instrumentations otherwise.
          ...getWebInstrumentations(),

          // Tracing package to get end-to-end visibility for HTTP requests.
          new TracingInstrumentation(),
        ],
      });
    } catch (e: any) {
      console.error(e.message)
      return null;
    }
    return null;
  }
}