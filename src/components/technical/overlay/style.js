import styled from "styled-components";

const style = (Component) => styled(Component)`
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
  position: absolute;
  top: 0;
  left: 0;
  overflow-y: auto;
  scroll-snap-type: y proximity;
  width: 100vw;
  height: 100%;
  margin: 0;
  padding: 0;
  user-select: none;

  > div {
    scroll-snap-align: start;
  }

  .caption {
    pointer-events: none;
    position: fixed;
    top: 0;
    right: 0;
    margin: 80px;
    color: white;
    font-size: 8em;
    font-weight: 100;
    line-height: 1em;
    font-variant-numeric: tabular-nums;
    -webkit-font-smoothing: auto;
  }

  .dot {
    //pointer-events: none;
    position: sticky;
    top: 0px;
    display: inline-block;

    color: #a0a0a0;
    line-height: 1.6em;
    font-size: 15px;
    letter-spacing: 1.5px;
    width: 100%;
    overflow: hidden;
  }

  .dot > h1 {
    -webkit-font-smoothing: auto;
    pointer-events: none;
    color: white;
    font-size: 5em;
    font-weight: 100;
    line-height: 1em;
    margin: 0;
    margin-bottom: 0.25em;
    padding: 2rem;
  }

  @media only screen and (max-width: 1000px) {
    .caption {
      font-size: 4em;
    }
  }

  @media only screen and (max-width: 800px) {
    .caption {
      font-size: 3em;
    }
    .dot > h1 {
      font-size: 3em;
    }
  }

  @media only screen and (max-width: 700px) {
    .caption {
      font-size: 2em;
    }
    .dot > h1 {
      font-size: 3em;
    }
  }

  @media only screen and (max-width: 600px) {
    .caption {
      font-size: 0.4em;
    }
    .dot > h1 {
      font-size: 2em;
    }
  }
`;

export default style;
