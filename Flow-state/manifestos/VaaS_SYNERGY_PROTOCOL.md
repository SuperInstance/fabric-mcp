# VaaS-TZ Pro Synergy Protocol

## Purpose
To bind the high-fidelity sensory stream of the TZ Pro system to high-tier cognitive agents via a formalized service contract.

## Input Vectors
- **NMEA Bridge**: GPS, SOG, COG.
- **Sounder Stream**: Visual textures, fish returns, bottom detection.
- **Bathymetric Ground Truth**: The local contour grid.

## Interface
Agents subscribe to a 'Continuous Observation' stream. The Observer (Spline) produces the high-level JSONL that the VaaS agent consumes.
