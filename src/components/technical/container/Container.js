import { forwardRef } from "react";
import style from "./style";

const Container = forwardRef(({ className, children }, ref) => (
  <div ref={ref} className={className}>
    {children}
  </div>
));

export default style(Container);
