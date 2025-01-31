import { Position } from "@/generated/process";
import { customAlphabet } from "nanoid";

export const RESOURCE_ID = "rsrc";
export const GRID_CELL_ID = "grd_cl";
export const PROCESS_ID = "prc";
export const OPERATION_ID = "op";
export const PARTICLE_ID = "p";

export const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ID_LENGTH = 16;
export function genId(prefix: string) {
  return `${prefix}_${customAlphabet(ID_ALPHABET, ID_LENGTH)()}`;
}

export function posToStr(position: Position) {
  return `${position.x},${position.y}`;
}
export function strToPos(str: string) {
  return { x: str.substring(0, str.indexOf(',')), y: str.substring(str.indexOf(',')) };
}
