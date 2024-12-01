#!/bin/bash

# Copyright 2024 The Outline Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Dependencies:
#   - libcap2-bin: setcap
#   - patchelf: patchelf

set -eux

# Capabilitites will disable LD_LIBRARY_PATH, and $ORIGIN evaluation in binary's
# rpath. So we need to set the rpath to an absolute path. (for libffmpeg.so)
# This command will also reset capabilitites, so we need to run this before setcap.
/usr/bin/patchelf --add-rpath /opt/Outline /opt/Outline/Outline

# Grant specific capabilities so Outline can run without root permisssion
#   - cap_net_admin: configure network interfaces, set up routing tables, etc.
#   - cap_dac_override: modify network configuration files owned by root
/usr/sbin/setcap cap_net_admin,cap_dac_override+eip /opt/Outline/Outline

# From electron's hint:
#   > The SUID sandbox helper binary was found, but is not configured correctly.
#   > Rather than run without sandboxing I'm aborting now. You need to make sure
#   > that /opt/Outline/chrome-sandbox is owned by root and has mode 4755.
/usr/bin/chmod 4755 /opt/Outline/chrome-sandbox
