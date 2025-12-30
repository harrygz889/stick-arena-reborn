import { Constants } from "./Constants";

// Common type to represent a `Point` (x, y coordinates)
export interface Point {
  x: number;
  y: number;
}

// Common type to represent a rectangular hitbox with 4 corners
export interface Rectangle {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export class Physics {
  // Check if a circle is colliding with a rectangle
  static isCircleCollidingRect(circle: Point, rect: Rectangle, radius: number = Constants.STICK_FIGURE_HEAD_RADIUS): boolean {
    const { topLeft, topRight, bottomLeft, bottomRight } = rect;

    // Check the distance from the circle's center to each side of the rectangle
    const distanceToTop = this.distanceToLine(circle, topLeft, topRight);
    const distanceToRight = this.distanceToLine(circle, topRight, bottomRight);
    const distanceToBottom = this.distanceToLine(circle, bottomRight, bottomLeft);
    const distanceToLeft = this.distanceToLine(circle, bottomLeft, topLeft);

    // If the circle's radius overlaps any of the rectangle's sides, it's a collision
    return distanceToTop <= radius || distanceToRight <= radius || distanceToBottom <= radius || distanceToLeft <= radius;
  }

  // Get the perpendicular distance of a point to a line defined by two points
  static distanceToLine(point: Point, linePoint1: Point, linePoint2: Point): number {
    const lineLength = this.distance(linePoint1, linePoint2);

    if (lineLength === 0) return this.distance(point, linePoint1); // Degenerate line (point)

    // Calculate perpendicular distance using the line equation
    const numerator = Math.abs(
      (linePoint2.y - linePoint1.y) * point.x -
      (linePoint2.x - linePoint1.x) * point.y +
      linePoint2.x * linePoint1.y -
      linePoint2.y * linePoint1.x
    );

    return numerator / lineLength;
  }

  // Calculate the Euclidean distance between two points
  static distance(point1: Point, point2: Point): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }

  // Rotate a point around another point (e.g., for rotated hitboxes)
  // Adapted from https://stackoverflow.com/a/22428650
  static rotatePoint(centerX: number, centerY: number, pointX: number, pointY: number, rotation: number): Point {
    const dx = pointX - centerX;
    const dy = pointY - centerY;
    const rotatedX = centerX + dx * Math.cos(rotation) - dy * Math.sin(rotation);
    const rotatedY = centerY + dx * Math.sin(rotation) + dy * Math.cos(rotation);

    return { x: rotatedX, y: rotatedY };
  }

  // Calculate a transformed point (used for physics simulation)
  static calculateTransformedPoint(originX: number, originY: number, spriteCenter: Point, rotation: number): Point {
    return {
      x: originX - spriteCenter.x * Math.cos(rotation) + spriteCenter.y * Math.sin(rotation),
      y: originY - spriteCenter.x * Math.sin(rotation) - spriteCenter.y * Math.cos(rotation),
    };
  }

  // Check for obstacles between two points in a grid-based representation (e.g., tilemaps)
  static checkForObstacles(playerPos: Point, targetPos: Point): boolean {
    // Calculate the distance between two points
    const xDistance = targetPos.x - playerPos.x;
    const yDistance = targetPos.y - playerPos.y;
    const totalDistance = Math.sqrt(xDistance ** 2 + yDistance ** 2);

    // Calculate the number of tiles between the two points
    const numTiles = totalDistance / 50;

    // Calculate x and y steps for traversing the tiles
    const xStep = xDistance / numTiles;
    const yStep = yDistance / numTiles;

    // Start from the player's position and step toward the target
    let currentX = playerPos.x;
    let currentY = playerPos.y;

    for (let i = 0; i < numTiles; i++) {
      const tileX = Math.floor(currentX / 50); // Convert real-world position to tile index
      const tileY = Math.floor(currentY / 50);
      const tileIndex = tileX + tileY * 35; // Flat array index for the tile

      // Look up the tile in the Constants.TILE_OBSTACLES array
      if (Constants.TILE_OBSTACLES[tileIndex] === 1) {
        return true; // Obstacle found
      }

      // Move to the next tile
      currentX += xStep;
      currentY += yStep;
    }

    return false; // No obstacles found
  }
}
