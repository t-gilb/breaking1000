import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools((set) => ({
    countdown: {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    },

    setCountdown: (value) =>
      set(
        (state) => ({ countdown: { ...state.constructor, ...value } }),
        false,
        "store/countdown"
      ),
  }))
);

export default useStore;
