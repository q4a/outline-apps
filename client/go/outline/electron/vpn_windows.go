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

package main

import (
	"context"

	"github.com/Jigsaw-Code/outline-apps/client/go/outline/platerrors"
)

type VPNConnection struct {
	Status   string `json:"status"`
	RouteUDP bool   `json:"routeUDP"`
}

func establishVPN(context.Context, *VPNConfig) (*VPNConnection, *platerrors.PlatformError) {
	return nil, &platerrors.PlatformError{
		Code:    platerrors.InternalError,
		Message: "not implemented yet",
	}
}

func closeVPNConn(*VPNConnection) *platerrors.PlatformError {
	return &platerrors.PlatformError{
		Code:    platerrors.InternalError,
		Message: "not implemented yet",
	}
}
