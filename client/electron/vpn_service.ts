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

import {invokeGoApi} from './go_plugin';
import {StartRequestJson} from '../src/www/app/outline_server_repository/vpn';

interface VpnConfig {
  interfaceName: string;
  ipAddress: string;
  dnsServers: string[];
  routingTableId: number;
  transport: string;
}

export async function establishVpn(request: StartRequestJson) {
  const config: VpnConfig = {
    interfaceName: 'outline-tun0',
    ipAddress: '10.0.85.2',
    dnsServers: ['9.9.9.9'],
    routingTableId: 13579,
    transport: JSON.stringify(request.config.transport),
  };
  const connectionJson = await invokeGoApi(
    'EstablishVPN',
    JSON.stringify(config)
  );
  console.info(JSON.parse(connectionJson));
}

export async function closeVpn(): Promise<void> {
  await invokeGoApi('CloseVPN', '');
}
