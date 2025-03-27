# Grafana Intefration
This feature is focused on integration of Grafana Faro and application monitoring.

## NextJS Setup
Expecting an API route with ENV variables for Grafana Faro setup. 

## Resources:
- https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/quickstart/nextjs/

## NextJS API Route Example
```
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { FaroConfigProps } from "@features/(grafana)/_logic/models.faro";
import { parseFaroParameters } from "@features/(grafana)/_logic/parsers.faro";

// do not batch into app build
export const dynamic = 'force-dynamic'

/**
 * Rout endpoint to extract and return Faro configuration parameters as shared model
 * @returns 
 */
export async function GET() {
    
    try {
        // environment parameters
        const env = process.env.NODE_ENV
        const faroUrl = process.env.FARO_URL

        // read package json
        const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

        // prepare grafana faro configuration from package json and environment values 
        const faroSetup: FaroConfigProps = parseFaroParameters({
            appName: packageJson["name"],
            environment: env,
            faroUrl: faroUrl as string,
            version: packageJson["version"]
        })

        return NextResponse.json(faroSetup)
    } catch (error: any) {
        return NextResponse.json({ "error": error["message"] })
    }
}
```