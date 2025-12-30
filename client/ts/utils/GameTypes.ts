import { Spritesheet } from "../spritesheet/Spritesheet";

export type GameObjectConfig = {
	spritesheetName: string | null; // Name of the spritesheet (null by default)
	x: number;                      // X-coordinate
	y: number;                      // Y-coordinate
	isVisible: boolean;             // Visibility flag
	repeatTimes: number;            // Number of animation repeats (-1 for infinite)
	getSpritesheet: (name: string) => Spritesheet; // function to get spritesheet data
};

// Event listener callback type
export type GameObjectEventListener = (data?: any) => void;
