import React, { forwardRef } from "react";

import style from "./style";
import useStore from "@/store/store";
import { differenceInHours } from "date-fns";
import { AutoSizer } from "react-virtualized";
import Stages from "@/components/technical/stages/Stages";
import { Profile } from "@/components";
import Live from "@/components/technical/live/Live";

const Overlay = forwardRef(
  (
    {
      className,
      caption,
      scroll,
      distance,
      elevation,
      sections,
      stages,
      coordinates,
      checkpoints,
      locationsIndices,
      peaks,
    },
    ref
  ) => {
    const countdown = useStore((state) => state.countdown);
    const domain = useStore((state) => state.domain);

    return (
      <div
        id={"toto"}
        ref={ref}
        onScroll={(e) => {
          scroll.current =
            e.target.scrollTop / (e.target.scrollHeight - window.innerHeight);
          //caption.current.innerText = scroll.current.toFixed(2);
        }}
        className={className}
      >
        <div style={{ height: "300vh" }}>
          <div className="dot">
            <h1>GRP 160 preview</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "3rem",
                //backgroundColor: "pink",
              }}
            >
              <div>{`${countdown.days} days ${countdown.hours} hours ${countdown.minutes} minutes ${countdown.seconds} seconds`}</div>
              <div>{`${(distance / 1000).toFixed()}km`}</div>
              <div>{`${Math.round(elevation.positive)} D+/- `}</div>
              <div>{`${sections.length} sections`} </div>
              <div>{`${stages.length} stages`} </div>
              <div>
                {`${differenceInHours(
                  new Date(
                    checkpoints[checkpoints.length - 1].cutOffTime.replace(
                      /-/g,
                      "/"
                    )
                  ),
                  new Date(checkpoints[0].cutOffTime.replace(/-/g, "/"))
                )} hours`}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: "200vh" }}>
          <div className="dot">
            <h1>Stages</h1>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                flex: "1 1 auto",
                minHeight: "300px",
              }}
            >
              <AutoSizer>
                {({ width, height }) => (
                  <Stages width={width} height={height} stages={stages} />
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
        <div style={{ height: "300vh" }}>
          <div className="dot">
            <h1>Sections</h1>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                flex: "1 1 auto",
                minHeight: "700px",
              }}
            >
              <AutoSizer>
                {({ width, height }) => (
                  <Profile
                    width={width}
                    height={height}
                    coordinates={coordinates}
                    domain={domain}
                    delimiterIndices={locationsIndices}
                    peaks={peaks}
                    sections={sections}
                  />
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
        <div style={{ height: "200vh" }}>
          <div className="dot">
            <h1>Time table</h1>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexDirection: "column",
                width: "100%",
                minHeight: "500px",
                position: "relative",
              }}
            >
              <AutoSizer>
                {({ width, height }) => (
                  <Live
                    width={width}
                    height={height}
                    checkpoints={checkpoints}
                  />
                )}
              </AutoSizer>
            </div>
          </div>
        </div>
        <div style={{ height: "200vh" }}>
          <div className="dot">
            <h1>Credits</h1>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "3rem",
              }}
            >
              Ut Lybitos voluptas sed voluptatum eaque ut neque velit est vitae
              consequatur aut asperiores esse ultra mollitia baraba qui mierda
              obcaecati?
            </div>
          </div>
        </div>

        {/* <span className="caption" ref={caption}>
      0.00
    </span>*/}
      </div>
    );
  }
);

export default style(Overlay);
