import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const promptAtom = atomWithStorage<string>(
  "prompt-atom-2",
  "guess what this is an image of and one interesting fact about it"
);
export const responseAtom = atomWithStorage<string>("response-atom", "");
export const inkColorAtom = atomWithStorage<string>("ink-color", "#000000");
export const isGeneratingAtom = atom(false);
export const canvasRefAtom = atom<{ current: HTMLCanvasElement | null }>({
  current: null,
});
