var ncols = 10;
var nrows = 10;
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var w = 40;
var word = 'ISTHISTOOHARDORTOOEASY';


function findSolution(graph){
  let unvisited = [];
  
  for (let i = 0; i < graph.nodes.length; i ++) { //add all nodes to the unvisited list
    graph.nodes[i].visited = false;
    unvisited.push(graph.nodes[i]);
  }
  graph.nodes[0].distance = 0;
  
  while (unvisited.length > 0){
      let min = Infinity;
      let v = undefined;
      let indx = -1;
      for (let i = 0; i < unvisited.length; i ++){
        let d = unvisited[i].distance;
        if (d < min){
          min = d;
          v = unvisited[i];
          indx = i;
        }
      }
      unvisited.splice(indx,1);
      // update distances for v
      for (let i = 0; i < v.connected.length; i++){
        let neighbor = v.connected[i];
        let newDist = v.distance + 1;
        if (newDist < neighbor.distance){
          neighbor.distance = newDist;
        }
      } 
  }
  // now backtrack to follow path;
  let path = [];
  let v = graph.nodes[nrows*ncols-1];
  while (v.distance > 0){
    path.push(graph.index(v.i,v.j));
    let lowest = Infinity;
    let next;
    for (let i = 0; i < v.connected.length; i++){
      let n = v.connected[i];
      if (n.distance < lowest){
        lowest = n.distance;
        next = n;
      }
    }
    v = next;
  }
  path.push(0);

  return path;
}

function createMaze(ncols,nrows){
   let graph = new Graph(ncols,nrows);
   let current = graph.nodes[0];
   let stack = [];
   while (!graph.allVisited()){
      current.visited = true;
      let next = current.checkNeighbors(graph);
      if (next) {
        stack.push(current);
        next.visited = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } 
   }
  return graph;  
}


function range(n){
  let r = [];
  for (let i=0; i < n; i++){
    r.push(i)
  }
  return r;
}

function choose(array,n){
  //return n indicies within array without repatition
  let indices = range(array.length);
  shuffle(indices,true);
  let result = indices.slice(0,n);
  result = result.sort((a, b) => b - a);
  return result;
}

function setup() {
  createCanvas(ceil(ncols*w)+20,ceil(nrows*w)+20);
  let graph = createMaze(ncols,nrows);
  background(255);
  let solution = findSolution(graph);
  console.log("solution",solution);
  
  // now draw letters in each cell along path;
  //let word = 'SCHOOLBAG';
  
  // randomly choose k spots from path
  let positions = choose(solution,word.length);
  console.log("positions",positions);
  for (let i = 0; i < positions.length; i++) {
    let position = positions[i];
    let cellIndx = solution[position];
    graph.nodes[cellIndx].letter = word[i];
    solution[position].letter = word[i];
  }
 
  // for all cells not in the solution insert a random letter with the same density as the solution path
  let density = word.length/solution.length;
  for (let i = 0; i < graph.nodes.length; i ++) {
    if (!solution.includes(i)){
      if (random() > 0.5) {
        let letterIndx = floor(random(letters.length));
        let randomLetter = letters[letterIndx];
        graph.nodes[i].letter = randomLetter;
      }
    }
  }
  
  
  
  graph.show();

}

function draw(){
  
}




//move to the next closest neighbor

function Graph(ncols,nrows){
  this.ncols = ncols;
  this.nrows = nrows;
  this.nodes = []; //each cell in the grid is a node
  
  for (let i = 0; i < nrows; i++){
    for (let j = 0; j < ncols; j ++){
      let c = new Cell(i,j)
      this.nodes.push(c);
    }
  }
  this.nodes[0].walls[3]=false; //no left wall
  this.nodes[ncols*nrows-1].walls[1]=false; //no right wall
  
  
  this.show = function(){
    for (let i = 0; i < this.nodes.length; i++){
      this.nodes[i].show();
    }
  };
  
  this.allVisited = function(){
    let count = 0;
    for (let i = 0; i < this.nodes.length; i++){
      if (this.nodes[i].visited){
        count ++;
      }
    }
    if (count == ncols*nrows){
      return true;
    }      
    return false;  
  };
  
  this.index = function(i,j) {
    if (i < 0 || j < 0 || i > this.nrows - 1 || j > this.ncols - 1) {
      return -1;
    }
    let result = j + i*this.ncols;
    return result;
  };
}


function Cell(i,j) {
  this.i = i;
  this.j = j;
  this.visited = false;
  this.walls = [true, true, true, true]; //top, right, bottom, left
  this.connected = []; //reachable neighbours in maze
  this.distance = Infinity;
  this.letter = undefined;
  
  this.checkNeighbors = function(graph) {
      // returns either a random unexpored neighbour or undefined if none exist. 
    let i = this.i;
    let j = this.j;
    var neighbors = [
      graph.index(i - 1, j), // top
      graph.index(i, j + 1), // right
      graph.index(i + 1, j), // bottom
      graph.index(i, j - 1) //left
    ];
    let valid = [];
    for (let k = 0; k < neighbors.length; k++){
      var n = graph.nodes[neighbors[k]];
      if (n && !n.visited){
        valid.push(k);
      }
    }
    if (valid.length > 0){
      let side = valid[floor(random(0, valid.length))];
      let opposite = (side + 2)%4;
      let neighborCell = graph.nodes[neighbors[side]];
      
      this.walls[side] = false;
      neighborCell.walls[opposite] = false;
      
      this.connected.push(neighborCell);
      neighborCell.connected.push(this);
      
      return neighborCell;
      
    } else {
      return undefined;
    }
  };
      
  this.show = function() {
    let x = 10+this.j*w;
    let y = 10+this.i*w;
    strokeWeight(2);
    stroke(0);
    if (this.walls[0]){
      line(x,y,x+w,y); //top
    }
    if (this.walls[1]){
      line(x+w,y,x+w,y+w);//right
    }
    if (this.walls[2]) {
      line(x,y+w,x+w,y+w);//bottom
    }
    if (this.walls[3]){
      line(x,y,x,y+w); //left
    }
    
    if (this.letter){
       let grey = 0;
       textAlign(CENTER,CENTER)
       textSize(32);
       stroke(grey);
       fill(grey);
       text(this.letter,x+w/2,y+w/2);
    }
    
  };
  
}

// Start with a grid. Figure out what walls to remove to make a good maze pattern. 
// We still need to use a seperate algorithm to find the shortest path through the maze. 


