import { promises as fs } from "fs";
import path from "path";
import xmldom from "xmldom";
import { gpx } from "@mapbox/togeojson";
import { csvParse } from "d3-dsv";
import { createPathHelper } from "positic";
import {
  differenceInMilliseconds,
  formatDistance,
  intervalToDuration,
} from "date-fns";
import detectPeaks from "../helpers/peak";
import { Suspense, useEffect, useRef, useState } from "react";

import useStore from "@/store/store";
import { AutoSizer } from "react-virtualized";
import { Container, Model, Overlay } from "@/components";
import smooth from "array-smooth";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Glitch,
  Pixelation,
} from "@react-three/postprocessing";
import { Float } from "@react-three/drei";
import useInterval from "@/hooks/useInterval";
import * as d3Array from "d3-array";

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps() {
  const directory = path.join(process.cwd(), "src/assets");
  const gpxFilePath = path.join(directory, `grp2023.gpx`);
  const gpxFileContents = await fs.readFile(gpxFilePath, "utf8");
  const xml = new xmldom.DOMParser().parseFromString(gpxFileContents);
  const geojson = gpx(xml);
  const coordinates = geojson.features[0].geometry.coordinates;

  const csvFilePath = path.join(directory, `grp2023.csv`);
  const csvFileContents = await fs.readFile(csvFilePath, {
    encoding: "utf8",
    flag: "r",
  });
  const csv = csvParse(csvFileContents);

  const { columns, ...rest } = csv;
  const checkpoints = Object.values(rest).filter(
    (location) => location.cutOffTime || !/^\s*$/.test(location.cutOffTime)
    // ||
    // location.refueling ||
    // !/^\s*$/.test(location.refueling)
  );

  // compute trail metadata
  const helper = createPathHelper(coordinates);

  // detect peaks
  const peaks = detectPeaks(coordinates, (d) => d[2], {
    lookaround: 90,
    sensitivity: 1,
    coalesce: 16,
    full: false,
  });

  // stats
  const distance = helper.calculatePathLength();
  const elevation = helper.calculatePathElevation();

  const region = helper.calculatePathBoundingBox();
  const latitude = (region.minLatitude + region.maxLatitude) / 2;
  const longitude = (region.minLongitude + region.maxLongitude) / 2;
  const center = { longitude, latitude };

  const refDistance = checkpoints[checkpoints.length - 1].km * 1000;
  const error = distance / refDistance;

  const distances = checkpoints.map(
    (checkpoint) => checkpoint.km * error * 1000
  );

  const locationsIndices = helper.getPositionsIndicesAlongPath(...distances);
  const checkPointsLocations = helper.getPositionsAlongPath(...distances);

  // compute section indices (start - stop)
  const sectionsIndices = locationsIndices.reduce(
    (accum, locationIndex, index, array) => {
      if (index > 0) {
        return [...accum, [array[index - 1], locationIndex - 1]];
      } else return accum;
    },
    []
  );

  // split trace into sections
  const sectionsLocations = sectionsIndices.reduce((accu, sectionIndices) => {
    const section = coordinates.slice(sectionIndices[0], sectionIndices[1]);
    return [...accu, section];
  }, []);

  // compute section stats
  const sectionsStats = sectionsLocations
    //.filter((section) => section.length > 0)
    .map((section) => {
      const helper = createPathHelper(section);
      return section.length > 0
        ? {
            distance: helper.calculatePathLength(),
            elevation: helper.calculatePathElevation(),
            region: helper.calculatePathBoundingBox(),
            coordinates: section,
          }
        : {
            distance: 0,
            elevation: { positive: 0, negative: 0 },
            coordinates: [],
          };
    });

  // aggregate sections details
  const sections = checkpoints.reduce((accu, checkpoint, index, array) => {
    if (index > 0) {
      const endingDate = new Date(checkpoint.cutOffTime);
      const raceStartDate = new Date(array[0].cutOffTime);
      const elapsedHoursFromStart = differenceInMilliseconds(
        endingDate,
        raceStartDate
      );

      const startingDate = new Date(array[index - 1].cutOffTime);
      const duration = differenceInMilliseconds(endingDate, startingDate);

      const sectionStats = sectionsStats[index - 1];
      const total = helper.getProgressionStatistics(
        sectionsIndices[index - 1][1]
      )[0];

      const avgSpeed = (total / elapsedHoursFromStart) * 3600;
      const updatedSectionStats = { ...sectionStats, avgSpeed };

      return [
        ...accu,
        {
          lifeBase: array[index - 1].refueling.toLowerCase() === "gros rav",
          elapsedHoursFromStart,
          startingDate: array[index - 1].cutOffTime,
          endingDate: checkpoint.cutOffTime,
          departureLocation: array[index - 1][columns[0]],
          arrivalLocation: checkpoint[columns[0]],
          duration,
          cutOffTime: checkpoint.cutOffTime,
          ...updatedSectionStats,
          fromKm: helper.getProgressionStatistics(
            sectionsIndices[index - 1][0]
          )[0],
          toKm: total,
          indices: sectionsIndices[index - 1],
        },
      ];
    }
    return accu;
  }, []);

  const stages = sections.reduce(
    (accu, section, index, array) => {
      if (section.lifeBase) {
        if (accu.stages.length > 0) {
          //get previous stage stats
          const lastStage = accu.stages[accu.stages.length - 1];

          //duration
          const startingDate = new Date(lastStage.endingDate);
          const endingDate = new Date(section.cutOffTime);
          const duration = differenceInMilliseconds(endingDate, startingDate);
          const humanReadableDuration = formatDistance(
            startingDate,
            endingDate
          );

          //distance
          const distance = section.toKm - lastStage.toKm;
          const cumulativeElevationGain =
            accu.stats.cumulativeElevation.gain + section.elevation.positive;
          const cumulativeElevationLoss =
            accu.stats.cumulativeElevation.loss + section.elevation.negative;
          const cumulativeDistance = accu.stats.distance + section.distance;

          return {
            ...accu,
            stats: {
              distance: cumulativeDistance,
              cumulativeElevation: {
                gain: cumulativeElevationGain,
                loss: cumulativeElevationLoss,
              },
            },
            stages: [
              ...accu.stages,
              {
                elevation: {
                  gain:
                    cumulativeElevationGain -
                    lastStage.cumulativeElevation.gain,
                  loss:
                    cumulativeElevationLoss -
                    lastStage.cumulativeElevation.loss,
                },
                cumulativeElevation: {
                  gain: cumulativeElevationGain,
                  loss: cumulativeElevationLoss,
                },
                departure: lastStage.arrival,
                arrival: section.arrivalLocation,
                toKm: section.toKm,
                fromKm: lastStage.toKm,
                duration,
                startingDate,
                endingDate,
                distance,
                humanReadableDuration,
              },
            ],
          };
        } else {
          const cumulativeElevationGain =
            accu.stats.cumulativeElevation.gain + section.elevation.positive;
          const cumulativeElevationLoss =
            accu.stats.cumulativeElevation.loss + section.elevation.negative;
          const cumulativeDistance = accu.stats.distance + section.distance;

          //duration
          const startingDate = new Date(checkpoints[0].cutOffTime);
          const endingDate = new Date(section.cutOffTime);
          const duration = differenceInMilliseconds(endingDate, startingDate);
          const humanReadableDuration = formatDistance(
            startingDate,
            endingDate
          );

          return {
            ...accu,
            stats: {
              distance: cumulativeDistance,
              cumulativeElevation: {
                gain: cumulativeElevationGain,
                loss: cumulativeElevationLoss,
              },
            },
            stages: [
              ...accu.stages,
              {
                departure: checkpoints[0][columns[0]],
                arrival: section.arrivalLocation,
                toKm: section.toKm,
                fromKm: 0,
                duration,
                startingDate,
                endingDate,
                distance: cumulativeDistance,
                humanReadableDuration,
                elevation: {
                  gain: cumulativeElevationGain,
                  loss: cumulativeElevationLoss,
                },
                cumulativeElevation: {
                  gain: cumulativeElevationGain,
                  loss: cumulativeElevationLoss,
                },
              },
            ],
          };
        }
      } else {
        if (index === array.length - 1) {
          const lastStage = accu.stages[accu.stages.length - 1];
          if (!lastStage) return accu;

          const cumulativeElevationGain =
            accu.stats.cumulativeElevation.gain + section.elevation.positive;
          const cumulativeElevationLoss =
            accu.stats.cumulativeElevation.loss + section.elevation.negative;

          //duration
          const startingDate = new Date(lastStage.endingDate);
          const endingDate = new Date(section.cutOffTime);
          const duration = differenceInMilliseconds(endingDate, startingDate);
          const humanReadableDuration = formatDistance(
            startingDate,
            endingDate
          );

          const distance = section.toKm - lastStage.toKm;

          return {
            ...accu,
            stages: [
              ...accu.stages,
              {
                departure: lastStage.arrival,
                arrival: section.arrivalLocation,
                toKm: section.toKm,
                fromKm: lastStage.toKm,
                duration,
                startingDate,
                endingDate,
                distance,
                humanReadableDuration,
                elevation: {
                  gain:
                    cumulativeElevationGain -
                    lastStage.cumulativeElevation.gain,
                  loss:
                    cumulativeElevationLoss -
                    lastStage.cumulativeElevation.loss,
                },
              },
            ],
            stats: {
              distance: accu.stats.distance + section.distance,
              cumulativeElevation: {
                gain: cumulativeElevationGain,
                loss: cumulativeElevationLoss,
              },
            },
          };
        } else {
          // section
          return {
            ...accu,
            stats: {
              distance: accu.stats.distance + section.distance,
              cumulativeElevation: {
                gain:
                  accu.stats.cumulativeElevation.gain +
                  section.elevation.positive,
                loss:
                  accu.stats.cumulativeElevation.loss +
                  section.elevation.negative,
              },
            },
          };
        }
      }
    },
    {
      stages: [],
      stats: { distance: 0, cumulativeElevation: { gain: 0, loss: 0 } },
    }
  );

  const sumUp = stages.stages.map((stage) => ({
    departure: stage.departure,
    arrival: stage.arrival,
    distance: stage.distance,
    elevation: stage.elevation,
    duration: stage.humanReadableDuration,
    fromKm: stage.fromKm,
    toKm: stage.toKm,
  }));

  const elevations = coordinates
    .map((coordinate) => coordinate[2])
    .filter((_, index) => index % 2 !== 0);
  const smoothedElevations = smooth(elevations, 3);

  return {
    // Passed to the page component as props
    props: {
      stages: sumUp,
      route: geojson,
      coordinates, //: smoothedElevations,
      checkpoints,
      distance,
      elevation,
      sections,
      center,
      checkPointsLocations,
      peaks,
      locationsIndices,
    },
  };
}

export default function Home({
  checkpoints,
  distance,
  elevation,
  sections,
  stages,
  coordinates,
  locationsIndices,
  peaks,
}) {
  const [isPaused, _] = useState(false);

  const setCountdown = useStore((state) => state.setCountdown);
  const setDomain = useStore((state) => state.setDomain);

  const overlay = useRef();
  const caption = useRef();
  const container = useRef();
  const scroll = useRef(0);

  useEffect(() => {
    const duration = intervalToDuration({
      start: new Date(checkpoints[0].cutOffTime.replace(/-/g, "/")),
      end: new Date(),
    });

    setCountdown(duration);
  }, []);

  const intervalRef = useInterval(
    () => {
      const duration = intervalToDuration({
        start: new Date(checkpoints[0].cutOffTime.replace(/-/g, "/")),
        end: new Date(),
      });

      setCountdown(duration);
    },
    isPaused ? null : 10000
  );

  useEffect(() => {
    if (!coordinates) return;
    const altitudes = coordinates.map((item) => item[2]);
    const extentY = d3Array.extent(altitudes);

    //const lowerFullHundred = Math.floor(extentY[0] / 100) * 100;
    setDomain({
      x: { min: 0, max: coordinates.length },
      y: { min: 0, max: extentY[1] * 1.2 },
    });

    console.log("set domain");
  }, [coordinates]);

  return (
    <Container ref={container}>
      <AutoSizer defaultHeight={200} defaultWidth={200}>
        {({ width, height }) => (
          <Canvas
            eventPrefix="client"
            eventSource={container}
            shadows
            style={{ width, height }}
            dpr={[1, 2]}
            camera={{ fov: 50 }}
          >
            <Suspense fallback={null}>
              {/*  <EffectComposer>
                <Pixelation granularity={2} />
                <Glitch />
              </EffectComposer>*/}

              <Float>
                <Model scroll={scroll} />
              </Float>
            </Suspense>
          </Canvas>
        )}
      </AutoSizer>
      <Overlay
        distance={distance}
        elevation={elevation}
        sections={sections}
        stages={stages}
        coordinates={coordinates}
        ref={overlay}
        caption={caption}
        scroll={scroll}
        container={container}
        checkpoints={checkpoints}
        locationsIndices={locationsIndices}
        peaks={peaks}
      />
    </Container>
  );
}
