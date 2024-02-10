-- CreateTable
CREATE TABLE "strava_activities" (
    "id" UUID NOT NULL,
    "strava_id" BIGINT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "moving_time" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL,
    "total_elevation_gain" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "elev_high" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "elev_low" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sport_type" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "location_city" TEXT,
    "location_country" TEXT,
    "start_latlng" JSONB,
    "end_latlng" JSONB,
    "map" TEXT,
    "average_speed" DECIMAL(10,3) NOT NULL,
    "max_speed" DECIMAL(10,2) NOT NULL,
    "average_cadence" DECIMAL(10,2),
    "average_heartrate" DECIMAL(10,2),
    "max_heartrate" INTEGER,
    "kilojoules" DECIMAL(10,2),
    "average_watts" DECIMAL(10,2),
    "max_watts" INTEGER,
    "weighted_average_watts" INTEGER,
    "description" TEXT,
    "calories" DECIMAL(10,2),
    "device_name" TEXT,

    CONSTRAINT "strava_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_splits" (
    "id" UUID NOT NULL,
    "strava_activity_id" UUID NOT NULL,
    "split" INTEGER NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "moving_time" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL,
    "elevation_difference" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "average_speed" DECIMAL(10,3) NOT NULL,
    "average_heartrate" DECIMAL(10,2),

    CONSTRAINT "strava_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_laps" (
    "id" UUID NOT NULL,
    "lap_id" BIGINT NOT NULL,
    "strava_activity_id" UUID NOT NULL,
    "lap" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "moving_time" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL,
    "total_elevation_gain" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "start_date" TIMESTAMPTZ NOT NULL,
    "average_speed" DECIMAL(10,3) NOT NULL,
    "max_speed" DECIMAL(10,2) NOT NULL,
    "average_cadence" DECIMAL(10,2),
    "average_heartrate" DECIMAL(10,2),
    "max_heartrate" INTEGER,
    "average_watts" DECIMAL(10,2),

    CONSTRAINT "strava_laps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_best_efforts" (
    "id" UUID NOT NULL,
    "best_effort_id" BIGINT NOT NULL,
    "strava_activity_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "moving_time" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "strava_best_efforts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strava_activities_strava_id_key" ON "strava_activities"("strava_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_activities_external_id_key" ON "strava_activities"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_laps_lap_id_key" ON "strava_laps"("lap_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_best_efforts_best_effort_id_key" ON "strava_best_efforts"("best_effort_id");

-- AddForeignKey
ALTER TABLE "strava_splits" ADD CONSTRAINT "strava_splits_strava_activity_id_fkey" FOREIGN KEY ("strava_activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_laps" ADD CONSTRAINT "strava_laps_strava_activity_id_fkey" FOREIGN KEY ("strava_activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_best_efforts" ADD CONSTRAINT "strava_best_efforts_strava_activity_id_fkey" FOREIGN KEY ("strava_activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
