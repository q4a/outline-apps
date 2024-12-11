// Copyright 2024 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as method_channel from '@outline/client/src/www/app/method_channel';

import * as errors from '../../model/errors';

export const TEST_ONLY = {
  parseAccessKey: parseAccessKey,
  getAddressFromTransportConfig: getAddressFromTransportConfig,
  serviceNameFromAccessKey: serviceNameFromAccessKey,
};

/**
 * ServiceConfig represents an Outline service. It's the structured representation of an Access Key.
 * It has a name, a tunnel config that can be statically or dynamically defined.
 */
export type ServiceConfig = StaticServiceConfig | DynamicServiceConfig;

/**
 * StaticServiceConfig is a ServiceConfig with a static tunnel config.
 * It's the structured representation of a Static Access Key.
 */
export class StaticServiceConfig {
  constructor(readonly name: string, readonly tunnelConfig: TunnelConfigJson) {}
}

/**
 * DynamicServiceConfig is a ServiceConfig that has the location to fetch the tunnel config.
 * It's the structured representation of a Dynamic Access Key.
 */
export class DynamicServiceConfig {
  constructor(readonly name: string, readonly transportConfigLocation: URL) {}
}

/**
 * TunnelConfigJson represents the configuration to set up a tunnel.
 * This is where VPN-layer parameters would go (e.g. interface IP, routes, dns, etc.).
 */
export interface TunnelConfigJson {
  firstHop: string;
  /** transport describes how to establish connections to the destinations.
   * See https://github.com/Jigsaw-Code/outline-apps/blob/master/client/go/outline/config.go for format. */
  transport: string;
}

/**
 * TransportConfigJson represents the transport to be used.
 * Application code should treat it as opaque, as it's handled by the networking layer.
 */
export type TransportConfigJson = object;

/**
 * setTransportConfigHost returns a new TransportConfigJson with the given host as the tunnel server.
 * Should only be set if getHostFromTransportConfig returns one.
 * This is used by the proxy resolution in Electron.
 */
// TODO(fortuna): Move config parsing to Go and do the DNS resolution and IP injection for Electron there.
export function setTransportConfigHost(
  transport: TransportConfigJson,
  newHost: string
): TransportConfigJson | undefined {
  if (!('host' in transport)) {
    return undefined;
  }
  return {...transport, host: newHost};
}

// getAddressFromTransportConfig validates the transport config and returns the address of the first hop.
async function getAddressFromTransportConfig(
  tunnelConfigText: string
): Promise<string> {
  const firstHop = await method_channel
    .getDefaultMethodChannel()
    .invokeMethod('GetFirstHop', tunnelConfigText);
  return firstHop;
}

/**
 * parseTunnelConfig parses the given tunnel config as text and returns a new TunnelConfigJson.
 * The config text may be a "ss://" link or a JSON object.
 * This is used by the server to parse the config fetched from the dynamic key, and to parse
 * static keys as tunnel configs (which may be present in the dynamic config).
 */
export async function parseTunnelConfig(
  tunnelConfigText: string
): Promise<TunnelConfigJson | null> {
  return {
    firstHop: await getAddressFromTransportConfig(tunnelConfigText),
    transport: tunnelConfigText,
  };
}

export async function parseAccessKey(accessKeyText: string): Promise<ServiceConfig> {
  try {
    const accessKeyUrl = new URL(accessKeyText.trim());

    // The default service name is extracted from the URL fragment of the access key.
    const name = serviceNameFromAccessKey(accessKeyUrl);
    // The hash only encodes service config, not tunnel config or config location.
    const noHashAccessKey = new URL(accessKeyUrl);
    noHashAccessKey.hash = '';

    // Static ss:// keys. It encodes the full service config.
    if (noHashAccessKey.protocol === 'ss:') {
      return new StaticServiceConfig(
        name,
        await parseTunnelConfig(noHashAccessKey.toString())
      );
    }

    // Dynamic ssconf:// keys. It encodes the location of the service config.
    if (
      noHashAccessKey.protocol === 'ssconf:' ||
      noHashAccessKey.protocol === 'https:'
    ) {
      try {
        // URL does not parse the hostname (treats as opaque string) if the protocol is non-standard (e.g. non-http).
        const configLocation = new URL(
          noHashAccessKey.toString().replace(/^ssconf:\/\//, 'https://')
        );
        return new DynamicServiceConfig(name, configLocation);
      } catch (error) {
        throw new errors.ServerUrlInvalid(error.message);
      }
    }

    throw new TypeError('Access Key is not a ss:// or ssconf:// URL');
  } catch (e) {
    throw new errors.ServerAccessKeyInvalid('Invalid static access key.', {
      cause: e,
    });
  }
}

/**
 * serviceNameFromAccessKey extracts the service name from the access key.
 * This is done by getting parsing the fragment hash in the URL and returning the
 * entry that is not a key=value pair.
 * This is used to name the service card in the UI when the service is added.
 */
function serviceNameFromAccessKey(accessKey: URL): string | undefined {
  if (!accessKey.hash) return;

  return decodeURIComponent(
    accessKey.hash
      .slice(1)
      .split('&')
      .find(keyValuePair => !keyValuePair.includes('='))
  );
}
