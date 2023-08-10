import { createGlobalStyle } from "styled-components";
import THEME from "../theme/theme";
import { ThemeProvider } from "../components";

const setDefaultColors = (variant = "dark") => {
  return Object.entries(THEME.colors[variant]).reduce((accu, [rule, value]) => {
    return `${rule}:${value}; ${accu}`;
  }, "");
};

const setFonts = () => {
  const strings = Object.entries(THEME.font).map(([_, category]) => {
    return Object.entries(category).reduce((accu, [rule, value]) => {
      return `${rule}:${value}; ${accu}`;
    }, "");
  });
  return strings.join(";");
};

const GlobalStyle = createGlobalStyle`
  html{
    min-height: calc(100% + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  body {
    height:100vh;
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    background-color: #101010;
    background: radial-gradient(circle at bottom center, #212121 0%, #101010 80%);
   
    margin: 0;
    font-family: "Open Sans", sans-serif;
    
    *, *:before, *:after {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    *:focus {
      -webkit-tap-highlight-color: transparent;
      outline: none;
      -ms-touch-action: manipulation;
      touch-action: manipulation;
    }
    
    ::selection{
      background-color: transparent;
    }
 

    > div:first-child,
    div#__next,
    div#__next > div {
      height:100vh;
      background-color: #101010;
      background: radial-gradient(circle at bottom center, #212121 0%, #101010 80%);
    }

  }



  :root{
    ${setDefaultColors()};
    ${setFonts()};
  
  }

`;

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={THEME}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
