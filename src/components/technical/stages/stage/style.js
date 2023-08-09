import styled from "styled-components";

const style = (Component) => styled(Component)`
  height: 100%;
  position: relative;
  scroll-snap-align: center;
  display: flex;

  .detail {
    min-width: 100vw;
    width: 100vw;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    opacity: 1;
    padding: 1rem;

    .stage-index {
      //font-family: "Love Ya Like A Sister", cursive;
      display: grid;
      place-items: center;
      font-weight: bolder;
      font-size: 7rem;
      letter-spacing: -0.05em;
      min-width: 10rem;
      //flex: 1 1 auto;
    }

    .stage-data {
      display: flex;
      flex: 1 1 auto;
      height: 100%;
      font-family: "Helvetica Neue";

      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      span:first-child {
        color: var(--syntax-del);
        font-weight: 900;
        font-size: 1.1rem;
        padding-bottom: 2px;
        //font-family: "Love Ya Like A Sister", cursive;
      }

      .type {
        font-weight: 800;
        color: var(--syntax-regex);
        text-transform: capitalize;
        //font-family: "Love Ya Like A Sister", cursive;
      }

      .locations {
        font-size: 1.2rem;
        font-weight: bolder;
      }

      span:not(.type) {
        margin-top: 0.1rem;
      }
    }
  }
`;

export default style;
