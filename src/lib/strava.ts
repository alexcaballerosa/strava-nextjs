import { safeFetch } from '@/lib/fetch'
import {
  createOrUpdateStravaActivity,
  deleteStravaActivity,
} from '@/lib/prisma/stravaActivity'
import { StravaActivity, stravaActivitySchema } from '@/schemas/strava'
import { Prisma } from '@prisma/client'
import { parseJSON } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { z } from 'zod'

export const refreshStravaAccessTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_at: z.number(),
  expires_in: z.number(),
  refresh_token: z.string(),
})

async function refreshStravaAccessToken(): Promise<string | null> {
  try {
    const URL = [
      'https://www.strava.com/oauth/token',
      `?client_id=${process.env.STRAVA_CLIENT_ID}`,
      `&client_secret=${process.env.STRAVA_CLIENT_SECRET}`,
      `&grant_type=refresh_token`,
      `&refresh_token=${process.env.STRAVA_REFRESH_TOKEN}`,
    ].join('')

    const data = await safeFetch(refreshStravaAccessTokenSchema, URL, {
      method: 'POST',
    })

    return data.access_token
  } catch (e) {
    console.error(e)
    return null
  }
}

async function getActivityById(id: number): Promise<StravaActivity | null> {
  try {
    const accessToken = await refreshStravaAccessToken()

    if (!accessToken) {
      return null
    }

    const data = await safeFetch(
      stravaActivitySchema,
      `https://www.strava.com/api/v3/activities/${id}?include_all_efforts=true`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return data
  } catch (e) {
    console.error(e)
    return null
  }
}

function parseDate(datetime: string, timezone: string): string {
  const isoDate = parseJSON(datetime)

  return formatInTimeZone(isoDate, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

function parseSplits(
  splits: StravaActivity['splits_metric']
): Prisma.StravaSplitCreateWithoutActivityInput[] {
  return splits
    .sort((a, b) => a.split - b.split)
    .map((split) => {
      return {
        distance: split.distance,
        movingTime: split.moving_time,
        elapsedTime: split.elapsed_time,
        split: split.split,
        elevationDifference: split.elevation_difference ?? 0,
        averageSpeed: split.average_speed,
        averageHeartrate: split.average_heartrate,
      }
    })
}

function parseLaps(
  laps: StravaActivity['laps'],
  timezone: string
): Prisma.StravaLapCreateWithoutActivityInput[] {
  return laps
    .sort((a, b) => a.lap_index - b.lap_index)
    .map((lap) => {
      return {
        lapId: lap.id,
        name: lap.name,
        distance: lap.distance,
        movingTime: lap.moving_time,
        elapsedTime: lap.elapsed_time,
        lap: lap.lap_index,
        totalElevationGain: lap.total_elevation_gain ?? 0,
        startDate: parseDate(lap.start_date, timezone),
        averageSpeed: lap.average_speed,
        maxSpeed: lap.max_speed,
        averageCadence: lap.average_cadence,
        averageHeartrate: lap.average_heartrate,
        maxHeartrate: lap.max_heartrate,
        averageWatts: lap.device_watts ? lap.average_watts : null,
      }
    })
}

function parseBestEfforts(
  bestEfforts: StravaActivity['best_efforts'],
  timezone: string
): Prisma.StravaBestEffortCreateWithoutActivityInput[] {
  return bestEfforts.map((effort) => {
    return {
      bestEffortId: effort.id,
      name: effort.name,
      distance: effort.distance,
      elapsedTime: effort.elapsed_time,
      movingTime: effort.moving_time,
      startDate: parseDate(effort.start_date, timezone),
    }
  })
}

function parseActivity(data: StravaActivity): Prisma.StravaActivityCreateInput {
  const timezone = data.timezone.split(' ').pop() ?? 'Europe/Madrid'

  const splits = parseSplits(data.splits_metric)
  const laps = parseLaps(data.laps, timezone)
  const bestEfforts = parseBestEfforts(data.best_efforts, timezone)

  return {
    stravaId: data.id,
    externalId: data.external_id,
    name: data.name,
    distance: data.distance,
    movingTime: data.moving_time,
    elapsedTime: data.elapsed_time,
    totalElevationGain: Number(data.total_elevation_gain ?? 0),
    elevHigh: Number(data.elev_high ?? 0),
    elevLow: Number(data.elev_low ?? 0),
    sportType: data.sport_type,
    startDate: parseDate(data.start_date, timezone),
    locationCity: data.location_city,
    locationCountry: data.location_country,
    startLatLng: data.start_latlng,
    endLatLng: data.end_latlng,
    map: data.map?.polyline ?? null,
    averageSpeed: data.average_speed,
    maxSpeed: data.max_speed,
    averageCadence: data.average_cadence,
    averageHeartrate: data.average_heartrate,
    maxHeartrate: data.max_heartrate,
    kilojoules: data.device_watts ? data.kilojoules : null,
    averageWatts: data.device_watts ? data.average_watts : null,
    maxWatts: data.device_watts ? data.max_watts : null,
    weightedAverageWatts: data.device_watts
      ? data.weighted_average_watts
      : null,
    description: data.description ? data.description : null,
    calories: data.calories,
    deviceName: data.device_name,
    splits: {
      create: splits,
    },
    laps: {
      create: laps,
    },
    bestEfforts: {
      create: bestEfforts,
    },
  }
}

export async function createOrUpdateActivity(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const activity = await getActivityById(id)

    if (!activity) {
      return { ok: false, error: 'ACTIVITY_NOT_FOUND' }
    }

    const data = parseActivity(activity)

    const result = await createOrUpdateStravaActivity(id, data)

    if (!result?.id) {
      console.error(`Failed to create or update activity with Strava ID ${id}`)
      return { ok: false, error: 'ACTIVITY_NOT_CREATED' }
    }

    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'CREATE_UPDATE_ACTIVITY_FAILED' }
  }
}

export async function deleteActivity(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await deleteStravaActivity(id)

    if (!result.ok) {
      console.error(
        `Failed to delete activity with Strava ID ${id}: ${result.message}`
      )
      return { ok: false, error: 'ACTIVITY_NOT_DELETED' }
    }

    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'DELETE_ACTIVITY_FAILED' }
  }
}
