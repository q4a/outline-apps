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

package vpnlinux

import (
	"log/slog"

	"github.com/Jigsaw-Code/outline-apps/client/go/outline/platerrors"
	"github.com/songgao/water"
)

func ConfigureTUNDevice(name string) (_ *water.Interface, perr *platerrors.PlatformError) {
	tun, err := water.New(water.Config{
		DeviceType: water.TUN,
		PlatformSpecificParams: water.PlatformSpecificParams{
			Name:    name,
			Persist: false,
		},
	})
	if err != nil {
		return nil, &platerrors.PlatformError{
			Code:    platerrors.SetupSystemVPNFailed,
			Message: "failed to open the TUN device",
			Details: platerrors.ErrorDetails{"name": name},
			Cause:   platerrors.ToPlatformError(err),
		}
	}
	defer func() {
		if perr != nil {
			CloseTUNDevice(tun)
		}
	}()

	slog.Info("successfully configured TUN device", "name", tun.Name())
	return tun, nil
}

func CloseTUNDevice(tun *water.Interface) *platerrors.PlatformError {
	if tun == nil {
		return nil
	}
	if err := tun.Close(); err != nil {
		slog.Error("failed to close TUN device", "name", tun.Name(), "err", err)
		return &platerrors.PlatformError{
			Code:    platerrors.DisconnectSystemVPNFailed,
			Message: "failed to close the TUN device",
			Details: platerrors.ErrorDetails{"name": tun.Name()},
			Cause:   platerrors.ToPlatformError(err),
		}
	}

	slog.Info("successfully closed TUN device", "name", tun.Name())
	return nil
}
