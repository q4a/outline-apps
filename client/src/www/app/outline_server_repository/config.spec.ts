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

import * as config from './config';

describe('newTunnelJson', () => {
  it('parses dynamic key', () => {
    expect(
      config.newTunnelJson({
        server: 'example.com',
        server_port: 443,
        method: 'METHOD',
        password: 'PASSWORD',
      })
    ).toEqual({
      transport: {
        type: 'shadowsocks',
        endpoint: {
          type: 'dial',
          host: 'example.com',
          port: 443,
        },
        cipher: 'METHOD',
        secret: 'PASSWORD',
      },
    } as config.TunnelConfigJson);
  });
});

describe('getAddressFromTransport', () => {
  it('extracts address', () => {
    expect(
      config.getAddressFromTransportConfig({
        endpoint: {
          type: 'dial',
          host: 'example.com',
          port: 443,
        },
      } as config.TransportConfigJson)
    ).toEqual('example.com:443');
    expect(
      config.getAddressFromTransportConfig({
        endpoint: {
          type: 'dial',
          host: '1:2::3',
          port: 443,
        },
      } as config.TransportConfigJson)
    ).toEqual('[1:2::3]:443');
  });

  it('fails on invalid config', () => {
    expect(
      config.getAddressFromTransportConfig(
        {} as unknown as config.TransportConfigJson
      )
    ).toBeUndefined();
  });
});

describe('getHostFromTransport', () => {
  it('extracts host', () => {
    expect(
      config.getHostFromTransportConfig({
        type: 'shadowsocks',
        endpoint: {
          type: 'dial',
          host: 'example.com',
        },
      } as config.TransportConfigJson)
    ).toEqual('example.com');
    expect(
      config.getHostFromTransportConfig({
        endpoint: {
          type: 'dial',
          host: '1:2::3',
        },
      } as config.TransportConfigJson)
    ).toEqual('1:2::3');
  });

  it('fails on invalid config', () => {
    expect(
      config.getHostFromTransportConfig(
        {} as unknown as config.TransportConfigJson
      )
    ).toBeUndefined();
  });
});

describe('setTransportHost', () => {
  it('sets host', () => {
    expect(
      JSON.stringify(
        config.setTransportConfigHost(
          {
            endpoint: {
              type: 'dial',
              host: 'example.com',
              port: 443,
            },
          } as config.TransportConfigJson,
          '1.2.3.4'
        )
      )
    ).toEqual('{"endpoint":{"type":"dial","host":"1.2.3.4","port":443}}');
    expect(
      JSON.stringify(
        config.setTransportConfigHost(
          {
            endpoint: {
              type: 'dial',
              host: 'example.com',
              port: 443,
            },
          } as config.TransportConfigJson,
          '1:2::3'
        )
      )
    ).toEqual('{"endpoint":{"type":"dial","host":"1:2::3","port":443}}');
    expect(
      JSON.stringify(
        config.setTransportConfigHost(
          {
            endpoint: {
              type: 'dial',
              host: '1.2.3.4',
              port: 443,
            },
          } as config.TransportConfigJson,
          '1:2::3'
        )
      )
    ).toEqual('{"endpoint":{"type":"dial","host":"1:2::3","port":443}}');
  });

  it('fails on invalid config', () => {
    expect(
      config.setTransportConfigHost(
        {} as unknown as config.TransportConfigJson,
        '1:2::3'
      )
    ).toBeUndefined();
  });
});
