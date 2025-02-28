import { TextStyles } from "@/utils/constants";
import { TextStyle } from "pixi.js";
import { create } from "zustand";

interface TextStore {
  textStyles: Record<string, TextStyle>;
  initText: () => void;
}

export const useTextStore = create<TextStore>((set, get) => ({
  textStyles: {},

  initText: () => {
    set((state) => ({
      textStyles: {
        [TextStyles.TITLE_STD]: new TextStyle({
          fill: 0x000000,
          fontSize: 20
        })
      }
    }))
  }
}));
