export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "1.5",
      "position_y": "0.5",
      "dmx_address": 1,
      "channel_count": 6,
      "color_mode": "RGB"
    },
    {
      "id": 2,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": "3.5",
      "position_y": "0.5",
      "dmx_address": 7,
      "channel_count": 6,
      "color_mode": "RGB"
    },
    {
      "id": 3,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "5.5",
      "position_y": "0.5",
      "dmx_address": 13,
      "channel_count": 8,
      "color_mode": "RGBW"
    },
    {
      "id": 4,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "7.5",
      "position_y": "0.5",
      "dmx_address": 21,
      "channel_count": 14,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 5,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": "9.5",
      "position_y": "0.5",
      "dmx_address": 35,
      "channel_count": 12,
      "color_mode": "MOVING_HEAD"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场暖场",
      "fixture_states": "[{\"fixture_id\":1,\"intensity\":70},{\"fixture_id\":2,\"intensity\":70}]",
      "fade_in_ms": "800",
      "hold_ms": "4000",
      "priority": "10",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "主歌铺底",
      "fixture_states": "[{\"fixture_id\":3,\"intensity\":60},{\"fixture_id\":4,\"intensity\":80}]",
      "fade_in_ms": "1200",
      "hold_ms": "8000",
      "priority": "20",
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "高潮频闪",
      "fixture_states": "[{\"fixture_id\":4,\"intensity\":100}]",
      "fade_in_ms": "0",
      "hold_ms": "2000",
      "priority": "30",
      "scene_status": "DRAFT"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": 0,
      "duration_ms": 6000,
      "layer": 1,
      "locked": false
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": 6000,
      "duration_ms": 10000,
      "layer": 1,
      "locked": false
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": 16000,
      "duration_ms": 4000,
      "layer": 2,
      "locked": true
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "夏季巡演 A 场",
      "venue_name": "滨江Livehouse",
      "fixture_ids": [1, 2, 3, 4, 5],
      "track_ids": [1, 2, 3],
      "updated_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "title": "夏季巡演 B 场",
      "venue_name": "城南剧场",
      "fixture_ids": [1, 2, 3],
      "track_ids": [1, 2],
      "updated_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "title": "品牌发布会",
      "venue_name": "会展中心 3 号馆",
      "fixture_ids": [4, 5],
      "track_ids": [3],
      "updated_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
