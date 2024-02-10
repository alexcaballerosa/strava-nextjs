import { z } from 'zod'

const sportTypeSchema = z.enum([
  'AlpineSki',
  'BackcountrySki',
  'Badminton',
  'Canoeing',
  'Crossfit',
  'EBikeRide',
  'Elliptical',
  'EMountainBikeRide',
  'Golf',
  'GravelRide',
  'Handcycle',
  'HighIntensityIntervalTraining',
  'Hike',
  'IceSkate',
  'InlineSkate',
  'Kayaking',
  'Kitesurf',
  'MountainBikeRide',
  'NordicSki',
  'Pickleball',
  'Pilates',
  'Racquetball',
  'Ride',
  'RockClimbing',
  'RollerSki',
  'Rowing',
  'Run',
  'Sail',
  'Skateboard',
  'Snowboard',
  'Snowshoe',
  'Soccer',
  'Squash',
  'StairStepper',
  'StandUpPaddling',
  'Surfing',
  'Swim',
  'TableTennis',
  'Tennis',
  'TrailRun',
  'Velomobile',
  'VirtualRide',
  'VirtualRow',
  'VirtualRun',
  'Walk',
  'WeightTraining',
  'Wheelchair',
  'Windsurf',
  'Workout',
  'Yoga',
])

const stravaSplitSchema = z.object({
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  split: z.number().int(),
  elevation_difference: z.number().nullish(),
  average_speed: z.number(),
  average_heartrate: z.number().nullish(),
})

const stravaLapSchema = z.object({
  id: z.number().int(),
  activity: z.object({
    id: z.number().int(),
  }),
  athlete: z.object({
    id: z.number().int(),
  }),
  name: z.string(),
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  lap_index: z.number().int(),
  split: z.number().int(),
  total_elevation_gain: z.number().nullish(),
  start_date: z.string().datetime(),
  start_date_local: z.string().datetime(),
  average_speed: z.number(),
  max_speed: z.number(),
  average_cadence: z.number().nullish(),
  average_heartrate: z.number().nullish(),
  max_heartrate: z.number().nullish(),
  average_watts: z.number().nullish(),
  device_watts: z.boolean().nullish(),
})

const stravaBestEffortSchema = z.object({
  id: z.number().int(),
  activity: z.object({
    id: z.number().int(),
  }),
  athlete: z.object({
    id: z.number().int(),
  }),
  name: z.string(),
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  start_date: z.string().datetime(),
  start_date_local: z.string().datetime(),
})

export const stravaActivitySchema = z.object({
  id: z.number().int(),
  external_id: z.string(),
  upload_id: z.number().int(),
  athlete: z.object({
    id: z.number().int(),
  }),
  name: z.string(),
  distance: z.number(),
  moving_time: z.number().int(),
  elapsed_time: z.number().int(),
  total_elevation_gain: z.number().nullish(),
  elev_high: z.number().nullish(),
  elev_low: z.number().nullish(),
  sport_type: sportTypeSchema,
  start_date: z.string().datetime(),
  start_date_local: z.string().datetime(),
  timezone: z.string(),
  location_city: z.string().nullable(),
  location_country: z.string().nullable(),
  start_latlng: z.array(z.number()),
  end_latlng: z.array(z.number()),
  map: z.object({
    id: z.string(),
    polyline: z.string(),
    summary_polyline: z.string(),
  }),
  average_speed: z.number(),
  max_speed: z.number(),
  average_cadence: z.number().nullish(),
  average_heartrate: z.number().nullish(),
  has_heartrate: z.boolean().nullish(),
  max_heartrate: z.number().int().nullish(),
  kilojoules: z.number().nullish(),
  average_watts: z.number().nullish(),
  device_watts: z.boolean().nullish(),
  max_watts: z.number().int().nullish(),
  weighted_average_watts: z.number().int().nullish(),
  description: z.string().nullable(),
  calories: z.number().nullish(),
  device_name: z.string().nullable(),
  splits_metric: z.array(stravaSplitSchema).nonempty(),
  laps: z.array(stravaLapSchema).nonempty(),
  best_efforts: z.array(stravaBestEffortSchema),
})

export type StravaActivity = z.infer<typeof stravaActivitySchema>
