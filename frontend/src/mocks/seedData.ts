export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "F-01",
      "fixture_type": "SPOT",
      "position_x": "1.5",
      "position_y": "0.8",
      "dmx_address": "1",
      "channel_count": 16,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 2,
      "fixture_code": "F-02",
      "fixture_type": "WASH",
      "position_x": "3.0",
      "position_y": "0.8",
      "dmx_address": "17",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 3,
      "fixture_code": "F-03",
      "fixture_type": "PAR",
      "position_x": "4.5",
      "position_y": "0.8",
      "dmx_address": "21",
      "channel_count": 3,
      "color_mode": "RGB"
    },
    {
      "id": 4,
      "fixture_code": "F-04",
      "fixture_type": "BEAM",
      "position_x": "6.0",
      "position_y": "0.8",
      "dmx_address": "33",
      "channel_count": 12,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 5,
      "fixture_code": "F-05",
      "fixture_type": "STROBE",
      "position_x": "7.5",
      "position_y": "0.8",
      "dmx_address": "45",
      "channel_count": 1,
      "color_mode": "DIMMER_ONLY"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "[{\"fixture_id\":1,\"dimmer\":60,\"color\":\"#ffb347\"},{\"fixture_id\":2,\"dimmer\":80,\"color\":\"#ff5f3c\"}]",
      "fade_in_ms": "800",
      "hold_ms": "4000",
      "priority": "1",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "逆光扫射",
      "fixture_states": "[{\"fixture_id\":4,\"dimmer\":100,\"color\":\"#3ca9ff\"}]",
      "fade_in_ms": "300",
      "hold_ms": "2000",
      "priority": "2",
      "scene_status": "DISABLED"
    },
    {
      "id": 3,
      "name": "全场频闪",
      "fixture_states": "[{\"fixture_id\":5,\"dimmer\":90,\"color\":\"#ffffff\"}]",
      "fade_in_ms": "0",
      "hold_ms": "1500",
      "priority": "3",
      "scene_status": "DRAFT"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "5000",
      "layer": "1",
      "locked": "true"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "6000",
      "duration_ms": "3000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "10000",
      "duration_ms": "2000",
      "layer": "2",
      "locked": "false"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "夏季巡演·首站",
      "venue_name": "滨江会展中心",
      "fixture_ids": [
        1,
        2,
        3,
        4,
        5
      ],
      "track_ids": [
        1,
        2,
        3
      ],
      "updated_at": "2026-09-20T09:00:00Z"
    }
  ]
} as const;
