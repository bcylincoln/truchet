const n = 7;
let grid;
let tileSize;

let groupCounter = 1;

let colorMap = new Map();
let seedColor1;
let seedColor2;
let seedColor3;
const grayRatio = 0.7;

function setup() {
  createCanvas(400, 400);
  tileSize = width / n;
  initTiles();
  findGroups();
  
  seedColor1 = color("magenta");
  seedColor2 = color("green");
  seedColor3 = color("pink");
}

function draw() {
  clear();
  background("white");
  let tile;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      tile = grid[i][j];
      if (tile.active) {
        fill(210);
        noStroke();
        blendMode(DARKEST);
        rect(
          tile.x - (tileSize / 2), 
          tile.y - (tileSize / 2), 
          tileSize, tileSize);
        blendMode(BLEND);
      }
      translate(tile.x, tile.y);
      if (tile.isRotated) {
          rotate(HALF_PI);
      }
      if (tile.type === 1) {
        drawTile1(tile);
      } else if (tile.type === 2) {
        drawTile2(tile);
      } else {
        drawTile3(tile);
      }
      if (tile.isRotated) {
          rotate(-HALF_PI);
      }
      translate(-tile.x, -tile.y);
    }
  }
}

function mouseMoved() {
  let tile;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      tile = grid[i][j];
      tile.active = inTile(tile);
    }
  }
}

function mouseClicked() {
  let tile;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      tile = grid[i][j];
      if (inTile(tile)) {
        if (tile.type !== 3) {
          tile.isRotated = ! tile.isRotated;
          onChange(tile);
        }
        break;
      }
    }
  }
}

function doubleClicked() {
  let tile;
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      tile = grid[i][j];
      if (inTile(tile)) {
        tile.isRotated = false;
        tile.type = tile.type + 1;
        if (tile.type > 3) {
          tile.type = 1;
        }
        onChange(tile);
        break;
      }
    }
  }
}

function initTiles() {
  grid = new Array(n);
  let x = tileSize / 2;
  let y = tileSize / 2;
  for (let i = 0; i < n; i+=1) {
    grid[i] = new Array(n);
    for (let j = 0; j < n; j+=1) {
      grid[i][j] = makeTile(i, j, x, y);
      y += tileSize;
    }
    y = tileSize / 2;
    x += tileSize;
  }
}

function makeTile(i, j, x, y) {
  let type;
  const toss = random();
  if (toss < 0.5) {
    type = 1;
  } else if (toss < 0.75) {
    type = 2;
  } else {
    type = 3;
  }
  return {
    i: i,
    j: j,
    x: x,
    y: y,
    active: false,
    type: type,
    isRotated: type !== 3 && random() < 0.5,
    group1: -1,
    group2: -1
  }
}

// curves
function drawTile1(tile) {
  noFill();
  strokeWeight(tileSize / 5);
  stroke(tile.group1 === -1 ? "black" : getColorForGroup(tile.group1));
  arc(tileSize / 2, -tileSize / 2, tileSize, tileSize, PI / 2, PI);
  stroke(tile.group2 === -1 ? "black" : getColorForGroup(tile.group2));
  arc(-tileSize / 2, tileSize / 2, tileSize, tileSize, 3 * PI / 2, 0);
}

// line
function drawTile2(tile) {
  noFill();
  strokeWeight(tileSize / 5);
  stroke(tile.group1 === -1 ? "black" : getColorForGroup(tile.group1));
  line(-tileSize / 2, 0, tileSize / 2, 0);
}

// cross
function drawTile3(tile) {
  strokeWeight(tileSize / 5);
  stroke(tile.group1 === -1 ? "black" : getColorForGroup(tile.group1));
  line(0, -tileSize / 2, 0, tileSize / 2);
  stroke(tile.group2 === -1 ? "black" : getColorForGroup(tile.group2));
  line(-tileSize / 2, 0, tileSize / 2, 0);
}

function getColorForGroup(group) {
  if (!colorMap.get(group)) {
    let r1 = random();
    let r2 = random();
    let r3 = random();
    const toss = random();
    if (toss < 1/3) {
      r1 *= grayRatio;
    } else if (toss < 2/3) {
      r2 *= grayRatio;
    } else {
      r3 *= grayRatio;
    }
    const total = r1 + r2 + r3;
    r1 /= total;
    r2 /= total;
    r3 /= total;
    const generatedColor = color(
      red(seedColor1) * r1 + red(seedColor2) * r2 + red(seedColor3) * r3,
      green(seedColor1) * r1 + green(seedColor2) * r2 + green(seedColor3) * r3,
      blue(seedColor1) * r1 + blue(seedColor2) * r2 + blue(seedColor3) * r3
    );
    colorMap.set(group, generatedColor);
    return generatedColor;
  } else {
    return colorMap.get(group);
  }
}

function findGroups() {
  let tile;
  for (let i=0; i<n; i+=1) {
    for (let j=0; j<n; j+=1) {
      tile = grid[i][j];
      followPath1(tile, groupCounter);
      if (tile.group1 !== -1) {
        groupCounter = tile.group1 + 1;
      }
      if (tile.type !== 2) {
        followPath2(tile, groupCounter);
        if (tile.group2 !== -1) {
          groupCounter = tile.group2 + 1;
        }
      }
    }
  }
}

function followPath1(tile, group, fromTile) {
  let neighbors = group1Neighbors(tile);
  if (fromTile) {
    // is tile connected?
    if (neighbors.has(fromTile)) {
      if (tile.group1 === group) {
        return;
      }
      tile.group1 = group;
    } else {
      return;
    }
  } else {
    tile.group1 = group;
  }
  if ((! fromTile || neighbors.delete(fromTile)) &&
    neighbors.size > 0) {
    neighbors.forEach(n => {
      followPath1(n, group, tile);
      followPath2(n, group, tile);
    });
  }
}

function followPath2(tile, group, fromTile) {
  let neighbors = group2Neighbors(tile);
  if (fromTile) {
    // is tile connected?
    if (neighbors.has(fromTile)) {
      if (tile.group2 === group) {
        return;
      }
      tile.group2 = group;
    } else {
      return;
    }
  } else {
    tile.group2 = group;
  }
  if ((! fromTile || neighbors.delete(fromTile)) &&
    neighbors.size > 0) {
    neighbors.forEach(n => {
      followPath1(n, group, tile);
      followPath2(n, group, tile);
    });
  }
}

function onChange(tile, ) {
  gridNeighbors(tile).forEach(neighbor => {
    if (! (group1Neighbors(tile).has(neighbor))) {
      if (tile.group1 === neighbor.group1 || tile.group2 === neighbor.group1) {
        groupCounter += 1;
        followPath1(neighbor, groupCounter);
      }
    }
    if (! (group2Neighbors(tile).has(neighbor))) {
      if (tile.group1 === neighbor.group2 || tile.group2 === neighbor.group2) {
        groupCounter += 1;
        followPath2(neighbor, groupCounter);
      }
    }
  });
  tile.group1 = -1;
  tile.group2 = -1;
  group1Neighbors(tile).forEach(neighbor => {
    if (group1Neighbors(neighbor).has(tile)) {
      followPath1(tile, neighbor.group1, neighbor);
    } 
    if (group2Neighbors(neighbor).has(tile)) {
      followPath1(tile, neighbor.group2, neighbor);
    }
  });
  group2Neighbors(tile).forEach(neighbor => {
    if (group1Neighbors(neighbor).has(tile)) {
      followPath2(tile, neighbor.group1, neighbor);
    } 
    if (group2Neighbors(neighbor).has(tile)) {
      followPath2(tile, neighbor.group2, neighbor);
    }
  });
  if (tile.group1 === -1) {
    groupCounter += 1;
    tile.group1 = groupCounter;
  }
  if (tile.type !== 2 && tile.group2 === -1) {
    groupCounter += 1;
    tile.group2 = groupCounter;
  }
}

function inTile(tile) {
  const halfSize = tileSize / 2;
  return mouseX < tile.x + halfSize &&
    mouseX > tile.x - halfSize &&
    mouseY < tile.y + halfSize &&
    mouseY > tile.y - halfSize;
}

function group1Neighbors(tile) {
  let neighbors = new Set();
  if (tile.type === 1) {
    // curves
    if (tile.isRotated) {
      below(tile, neighbors);
      right(tile, neighbors);
    } else {
      above(tile, neighbors);
      right(tile, neighbors);
    }
  } else if (tile.type === 2) {
    // line
    if (tile.isRotated) {
      above(tile, neighbors);
      below(tile, neighbors);
    } else {
      left(tile, neighbors);
      right(tile, neighbors);
    }
  } else {
    // cross
    above(tile, neighbors);
    below(tile, neighbors);
  }
  return neighbors;
}

function group2Neighbors(tile) {
  let neighbors = new Set();
  if (tile.type === 2) {
    return neighbors;
  }
  if (tile.type === 1) {
    if (tile.isRotated) {
      above(tile, neighbors);
      left(tile, neighbors);
    } else {
      below(tile, neighbors);
      left(tile, neighbors);
    }
  } else if (tile.type === 3) {
    left(tile, neighbors);
    right(tile, neighbors);
  }
  return neighbors;
}
function gridNeighbors(tile) {
  neighbors = new Set();
  left(tile, neighbors);
  right(tile, neighbors);
  above(tile, neighbors);
  below(tile, neighbors);
  return neighbors;
}

function left(tile, neighbors) {
  if (tile.i > 0) {
    neighbors.add(grid[tile.i - 1][tile.j]);
  }
}
function right(tile, neighbors) {
  if (tile.i < n - 1) {
    neighbors.add(grid[tile.i + 1][tile.j]);
  }
}
function above(tile, neighbors) {
  if (tile.j > 0) {
    neighbors.add(grid[tile.i][tile.j - 1]);
  }
}
function below(tile, neighbors) {
  if (tile.j < n - 1) {
    neighbors.add(grid[tile.i][tile.j + 1]);
  }
}
