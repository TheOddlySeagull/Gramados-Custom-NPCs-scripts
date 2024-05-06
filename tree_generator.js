/*
This script is for plans to upgrade the lumberjack job on the Gramados server.
The final goal is to have a region with several values that will allow some trees grow. When a tree grows, it will change the region variables causing the player needing to prepare the area for fancyer and more expensive trees to grow.
*/


//var quality = 1;
var quality = Math.random() * 2;

// Script for scripted block that spawns a tree above it when interacted with
function interact(event) {
    // Get the player
    var player = event.player;
    buildTree(event, player);


    // Return true to prevent the default action
    return true;
}

// This function checks if a block is inside a region
function isInside(player, x, y, z, x1, y1, z1, x2, y2, z2) {
    //player.message("Checking if block is inside region");
    //player.message("Region: " + x1 + ", " + y1 + ", " + z1 + " to " + x2 + ", " + y2 + ", " + z2);
    
    var inside = false;
    if ((x >= x1 && x <= x2) || (x <= x1 && x >= x2)) {
        if ((y >= y1 && y <= y2) || (y <= y1 && y >= y2)) {
            if ((z >= z1 && z <= z2) || (z <= z1 && z >= z2)) {
                inside = true;
            }
        }
    }

    /*if (inside) {
        player.message("Block is inside region");
    }
    else {
        player.message("Block is outside region");
    }*/

    return inside;
}

// Funtion to build a tree above the scripted block
function buildTree(event, player) {
    // Get the block the player interacted with
    var block = event.block;
    var block_location = block.getPos();
    //block_location is type IPos
    var x = block_location.getX();
    var y = block_location.getY();
    var z = block_location.getZ();

    // generate a tree
    var log = "minecraft:log";
    var leaves = "minecraft:leaves";
    var placeholder = "minecraft:log2";
    var tree = treetypePine(player, log, leaves, placeholder, quality);

    // build the array in the world
    build3DArray(player, tree[0], x, y + 1, z);



    return true;
}


// algorithm to generate a tree of type tall oak. return a 3D array with the tree blocks
function treetypeTallOak(player, log, leaves, placeholder, quality) {
    //if quality under 1, set to 1
    var quality_size = quality;
    if (quality_size < 1) {
        quality_size = 1;
    }
    //quality is a number from 0 to 1. 0 is a small tree, 1 is a big tree
    //log is the block type for the log
    //leaves is the block type for the leaves
    //the tree will be a 3D array with the blocks [5][50][5]
    var tree_size = [5, Math.floor(quality_size*60), 5]
    var tree = new Array(tree_size[0]);
    for (var x = 0; x < tree_size[0]; x++) {
        tree[x] = new Array(tree_size[1]);
        for (var y = 0; y < tree_size[1]; y++) {
            tree[x][y] = new Array(tree_size[2]);
            for (var z = 0; z < tree_size[2]; z++) {
                tree[x][y][z] = null;
            }
        }
    }

    // Segmentise into layers, on a 20 basis.
    /*
        Quality of 1: 50 tall
        Quality of 0: 16 tall
    */
    /*
        Each layer is minimum 1 block tall.
        each layer is in 20ths of the tree height
        0 - 16: log - DONE
        0 - 3: root layer - DONE
        7 - 10: lower random leaves
        10 - 11: lower leaves
        11 - 16: main leaf body
        (12 - 15): leaf body random
        16 - 17: upper leaves thick
        17 - 18: upper leaves thin
        18 - 20: upper random leaves
    */

    // Tree Height: minimum 16, maximum 50
    var tree_height = Math.floor(16 + 34 * quality);

    /// LOG OF THE TREE ///

    /*
    The log is 1 block in the center of the tree
    */

    var log_height = Math.floor(tree_height * 0.8);
    for (var y = 0; y < log_height; y++) {
        tree[2][y][2] = log;
    }

    // ROOTS OF THE TREE //

    /*
    The roots are a cross around the log, random height, minimum 1 block
    */
    var root_height = Math.floor(tree_height * 0.15);
    // for each of the 4 roots, get a random height between 1 to root_height
    for (var i = 0; i < 4; i++) {
        var root = Math.floor(1 + Math.random() * root_height);

        // switch on the 4 roots: root 1 is the north root, root 2 is the east root, root 3 is the south root, root 4 is the west root
        switch (i) {
            case 0:
                // north root
                for (var y = 0; y < root; y++) {
                    tree[2][y][1] = log;
                }
                break;
            case 1:
                // east root
                for (var y = 0; y < root; y++) {
                    tree[3][y][2] = log;
                }
                break;
            case 2:
                // south root
                for (var y = 0; y < root; y++) {
                    tree[2][y][3] = log;
                }
                break;
            case 3:
                // west root
                for (var y = 0; y < root; y++) {
                    tree[1][y][2] = log;
                }
                break;
        }
    }

    // LOWER RANDOM LEAVES OF THE TREE //

    var lower_leaves_random = getBounds(7, 10, tree_height, 20);
    for (var i = lower_leaves_random[0]; i < lower_leaves_random[1]; i++) {
        if (Math.random() < 0.5) {
            tree[1][i][2] = leaves;
        }
        if (Math.random() < 0.5) {
            tree[3][i][2] = leaves;
        }
        if (Math.random() < 0.5) {
            tree[2][i][1] = leaves;
        }
        if (Math.random() < 0.5) {
            tree[2][i][3] = leaves;
        }
    }

    // LOWER LEAVES OF THE TREE //

    var lower_leaves = getBounds(10, 11, tree_height, 20);
    for (var i = lower_leaves[0]; i < lower_leaves[1]; i++) {
        //place 4 blocks on each side of the log
        tree[1][i][2] = leaves;
        tree[3][i][2] = leaves;
        tree[2][i][1] = leaves;
        tree[2][i][3] = leaves;
    }

    // MAIN LEAF BODY OF THE TREE //

    var main_leaf_body = getBounds(11, 16, tree_height, 20);

    //from top of log to leaf_heigh under it, fill with a 3*3 leaves
    for (var y = main_leaf_body[0]; y < main_leaf_body[1]; y++) {
        for (var x = 1; x < 4; x++) {
            for (var z = 1; z < 4; z++) {
                if (tree[x][y][z] != log) {
                    tree[x][y][z] = leaves;
                }
            }
        }
    }

    // LEAF BODY RANDOM OF THE TREE //

    var leaf_body_random = [main_leaf_body[0] + 1, main_leaf_body[1] - 2];
    
    fillZone([0, leaf_body_random[0], 1], [0, leaf_body_random[1], 3], leaves, 0.6, tree);
    fillZone([1, leaf_body_random[0], 0], [3, leaf_body_random[1], 0], leaves, 0.6, tree);
    fillZone([1, leaf_body_random[0], 4], [3, leaf_body_random[1], 4], leaves, 0.6, tree);
    fillZone([4, leaf_body_random[0], 1], [4, leaf_body_random[1], 3], leaves, 0.6, tree);

    // UPPER LEAVES THICK OF THE TREE //

    var upper_leaves_thick = getBounds(16, 17, tree_height, 20);
    //player.message("Upper leaves thick: " + upper_leaves_thick[0] + " to " + upper_leaves_thick[1]);
    for (var i = upper_leaves_thick[0]; i < upper_leaves_thick[1]; i++) {
        tree[1][i][2] = leaves;
        tree[3][i][2] = leaves;
        tree[2][i][1] = leaves;
        tree[2][i][3] = leaves;
        tree[2][i][2] = leaves;
    }

    // UPPER LEAVES THIN OF THE TREE //

    var upper_leaves_thin = getBounds(17, 18, tree_height, 20);
    for (var i = upper_leaves_thin[0]; i < upper_leaves_thin[1]; i++) {
        tree[2][i][2] = leaves;
    }

    // UPPER RANDOM LEAVES OF THE TREE //

    var upper_leaves_random = getBounds(18, 20, tree_height, 20);
    // get a random height within the bounds
    var margin = upper_leaves_random[1] - upper_leaves_random[0];
    var random_height = Math.floor(upper_leaves_random[0] + Math.random() * margin);
    // fill the top of the tree with leaves
    for (var i = upper_leaves_random[0]; i < random_height; i++) {
        tree[2][i][2] = leaves;
    }

    return [tree, tree_size];
}

// algorithm to generate a tree of type pine. return a 3D array with the tree blocks
function treetypePine(player, log, leaves, placeholder, quality) {
    //player.message("Generating a pine tree with log " + log + " and leaves " + leaves + " with quality " + quality);
    //if quality under 1, set to 1
    var quality_size = quality;
    if (quality_size < 1) {
        quality_size = 1;
    }
    //quality is a number from 0 to 1. 0 is a small tree, 1 is a big tree
    //log is the block type for the log
    //leaves is the block type for the leaves
    //the tree will be a 3D array with the blocks [5][50][5]
    /*
    var tree = new Array(tree_size[0]);
    for (var x = 0; x < tree_size[0]; x++) {
        tree[x] = new Array(tree_size[1]);
        for (var y = 0; y < tree_size[1]; y++) {
            tree[x][y] = new Array(tree_size[2]);
            for (var z = 0; z < tree_size[2]; z++) {
                tree[x][y][z] = null;
            }
        }
    }*/

    // Segmentise into layers, on a 10 basis.
    /*
        Quality of 1: 30 tall log (33 tall tree)
        Quality of 0: 10 tall log (13 tall tree)
    */

    // generate log height
    var log_height = Math.floor(10 + 20 * quality);
    // generate an x log
    var log_array = createLogX(player, log_height, 6, 12, log, placeholder);

    //player.message("Log height: " + log_height);

    var tree_size = [log_array.length, log_array[0].length, log_array[0][0].length];

    return [log_array, tree_size];
}





//function to get a lower and upper bound for a proportion of a tree
function getBounds(lower, upper, total_height, proportion) {
    /*
        for example, I want bounds from 7/20 to 10/20 of the tree height:
        lower = 7
        upper = 10
        total_height = <height>
        proportion = 20
    */
    var lower_bound = Math.floor(lower / proportion * total_height);
    var upper_bound = Math.floor(upper / proportion * total_height);
    //if 0, set to 1
    if (lower_bound < 0) {
        lower_bound = 1;
    }
    if (upper_bound < 0) {
        upper_bound = 1;
    }
    return [lower_bound, upper_bound];
}

//function to fill a zone with a block and a random chance
function fillZone(pos1, pos2, block, chance, tree) {
    //pos 1 and pos2 are [x, y, z]
    //block is the block type
    //chance is the chance of the block being placed
    var x1 = pos1[0];
    var y1 = pos1[1];
    var z1 = pos1[2];
    var x2 = pos2[0];
    var y2 = pos2[1];
    var z2 = pos2[2];

    var x_min = Math.min(x1, x2);
    var x_max = Math.max(x1, x2);
    var y_min = Math.min(y1, y2);
    var y_max = Math.max(y1, y2);
    var z_min = Math.min(z1, z2);
    var z_max = Math.max(z1, z2);

    for (var x = x_min; x <= x_max; x++) {
        for (var y = y_min; y <= y_max; y++) {
            for (var z = z_min; z <= z_max; z++) {
                if (Math.random() < chance) {
                    //if no block is already there
                    if (tree[x][y][z] == null) {
                        tree[x][y][z] = block;
                    }
                }
            }
        }
    }

    return true;
}

// function to cerate a X log
function createLogX(player, height, min_layer_height, max_layer_height, log, placeholder) {
    //player.message("Creating a log with block " + log + " of height " + height + " with min layer height " + min_layer_height + " and max layer height " + max_layer_height);

    //subfunction to create an X
    function createX(width) {
        //player.message("Creating a X of width " + width);
        // Create a 2D array of width x width
        var x = new Array(width);
        for (var i = 0; i < width; i++) {
            x[i] = new Array(width);
            for (var j = 0; j < width; j++) {
                x[i][j] = null;
            }
        }

        // get the center of the width (if 3, then 1, if 5, then 2...)
        var center = Math.floor(width / 2);
        // for the center as x, fill z
        for (var i = 0; i < width; i++) {
            x[center][i] = log;
            x[i][center] = log;
        }
        // show in chat the X
        /*for (var i = 0; i < width; i++) {
            var line = "";
            for (var j = 0; j < width; j++) {
                if (x[i][j] != null) {
                    line += "X";
                }
                else {
                    line += " ";
                }
            }
            //player.message(line);
        }*/
        // return the X
        return x;
    }

    //subfunction to create a taller X
    function createXTall(x_2d, height) {
        //player.message("Creating a taller X of height " + height);

        //player.message("X: " + x_2d);
        
        var array_width = x_2d.length;
        // Create a 3D array of width x height x width
        var x = create3DArray(array_width, height, array_width);

        // for each layer, fill the X
        for (var i = 0; i < array_width; i++) {
            for (var j = 0; j < height; j++) {
                for (var k = 0; k < array_width; k++) {
                    if (x_2d[i][k] != null) {
                        x[i][j][k] = log;
                    }
                }
            }
        }

        //build3DArray(player, x, 2066, 76, 3716);

        // return the X 
        return x;
    }

    //player.message("Creating a log of height " + height + " with min layer height " + min_layer_height + " and max layer height " + max_layer_height);

    // segment the height of the log into several segments of sizes between min_layer_height and max_layer_height
    var layers = segmentNumber(height, min_layer_height, max_layer_height);


    //player.message("Created a log with " + layers.length + " layers: " + layers);

    // create the ampty log
    //sum of all layers
    var log_height = 0;
    for (var i = 0; i < layers.length; i++) {
        log_height += layers[i];
    }
    // log width:
    var log_width = layers.length * 2;
    // make it odd
    if (log_width % 2 == 0) {
        log_width--;
    }

    // Create a 3D array of width x height x width
    //var log_array = create3DArray(log_width, log_height, log_width);

    // for each layers, from top to bottom, create a X that increases in size
    var y_start = 0;
    var concat_offset = 0;

    var x_2d = createX(log_width);
    var x_3d = createXTall(x_2d, layers[0]);
    var log_array = x_3d;
    concat_offset++;

    if (layers.length > 1) {
        // for each layer, create a X and concatenate it to the log
        for (var i = 1; i < layers.length; i++) {
            log_width -= 2;
            //player.message("Creating layer " + i + " with height " + layers[i] + " and width " + log_width);

            // create the X
            x_2d = createX(log_width);
            // create the taller X
            x_3d = createXTall(x_2d, layers[i]);
            //player.message("Created X log element, that will be placed between " + y_start + " and " + (y_start - layers[i] + 1));
            // concatenate the X to the log
            log_array = concatenate3DArrays(player, log_array, x_3d, concat_offset, y_start + layers[i] - 1, concat_offset);

            // update the y_start and the concat_offset
            y_start += layers[i];
            concat_offset++;
        }
    }

    // scan the log, and for every log that has nothing above, place a placeholder
    for (var x = 0; x < log_array.length; x++) {
        for (var y = 0; y < log_array[0].length; y++) {
            for (var z = 0; z < log_array[0][0].length; z++) {
                if (log_array[x][y][z] == log) {
                    var has_nothing_above = true;
                    for (var i = y + 1; i < log_array[0].length; i++) {
                        if (log_array[x][i][z] == log) {
                            has_nothing_above = false;
                        }
                    }
                    // Verticaly expand the log with a random height
                    if (has_nothing_above) {
                        var random = Math.floor(Math.random() * (Math.floor(min_layer_height / 4))*3);
                        for (var i = 1; i <= random; i++) {
                            if (y + i < log_array[0].length) {
                                log_array[x][y + i][z] = placeholder;
                            }
                        }
                    }
                }
            }
        }
    }

    // replace the placeholders with logs
    log_array = replaceBlock(log_array, placeholder, log);


    return log_array;
}

function segmentNumber(number, min, max) {
    // Calculate the number of segments needed
    var numSegments = Math.ceil(number / max);
    
    // Calculate the size of each segment
    var segmentSize = Math.ceil(number / numSegments);
    
    // Ensure segment size is within the min-max range
    var adjustedSegmentSize = Math.max(min, Math.min(max, segmentSize));
    
    // Calculate the number of segments with adjusted size
    var adjustedNumSegments = Math.ceil(number / adjustedSegmentSize);
    
    // Calculate the remainder
    var remainder = number % adjustedNumSegments;
    
    // Calculate the number of segments with adjusted size + 1
    var numSegmentsWithExtra = remainder;
    
    // Create an array to store the segments
    var segments = new Array(adjustedNumSegments);

    // Fill the array with the adjusted segment size
    for (var i = 0; i < adjustedNumSegments; i++) {
        segments[i] = adjustedSegmentSize;
    }
    
    // Add 1 to the first `remainder` segments
    for (var i = 0; i < numSegmentsWithExtra; i++) {
        segments[i]++;
    }
    
    return segments;
}


// function to create a 3D array
function create3DArray(x, y, z) {
    var array = new Array(x);
    for (var i = 0; i < x; i++) {
        array[i] = new Array(y);
        for (var j = 0; j < y; j++) {
            array[i][j] = new Array(z);
            for (var k = 0; k < z; k++) {
                array[i][j][k] = null;
            }
        }
    }
    return array;
}

// function to merge 2 3D arrays centered
/*
array1: 3D array
array2: 3D array
from_bottom: boolean (if true, merge from bottom to top, if false, merge from top to bottom)
*/
function concatenate3DArrays(player, array1, array2, offset_x, offset_y, offset_z) {
    //player.message("Concatenating 3D arrays with offset " + offset_x + ", " + offset_y + ", " + offset_z);

    // get the size of the arrays
    var x1 = array1.length;
    var y1 = array1[0].length;
    var z1 = array1[0][0].length;
    var x2 = array2.length;
    var y2 = array2[0].length;
    var z2 = array2[0][0].length;

    // get the size of the merged array
    var x = Math.max(x1, x2 + offset_x);
    var y = Math.max(y1, y2 + offset_y);
    var z = Math.max(z1, z2 + offset_z);

    // create the merged array
    var merged = create3DArray(x, y, z);

    // copy the first array to the merged array
    for (var i = 0; i < x1; i++) {
        for (var j = 0; j < y1; j++) {
            for (var k = 0; k < z1; k++) {
                merged[i][j][k] = array1[i][j][k];
            }
        }
    }

    // copy the second array to the merged array
    for (var i = 0; i < x2; i++) {
        for (var j = 0; j < y2; j++) {
            for (var k = 0; k < z2; k++) {
                merged[i + offset_x][j + offset_y][k + offset_z] = array2[i][j][k];
            }
        }
    }

    return merged;
}

// function to build a 3D array in the world
function build3DArray(player, array, build_x, build_y, build_z) {
    // tell in chat
    //player.message("Building 3D array in the world");
    // get the world
    var world = player.getWorld();

    // for each block in the 3D array, place it in the world
    //player.message("Array size: " + array.length + ", " + array[0].length + ", " + array[0][0].length);
    for (var x = 0; x < array.length; x++) {
        for (var y = 0; y < array[0].length; y++) {
            for (var z = 0; z < array[0][0].length; z++) {
                if (array[x][y][z] != null) {
                    //player.message("Placing block " + array[x][y][z] + " at " + build_x + x + ", " + build_y + y + ", " + build_z + z);
                    world.setBlock(build_x + x, build_y + y, build_z + z, array[x][y][z], 0);
                }
            }
        }
    }

    return true;
}

// function to replace a block with another within a 3D array
function replaceBlock(array, block, replacement) {
    for (var x = 0; x < array.length; x++) {
        for (var y = 0; y < array[0].length; y++) {
            for (var z = 0; z < array[0][0].length; z++) {
                if (array[x][y][z] == block) {
                    array[x][y][z] = replacement;
                }
            }
        }
    }
    return array;
}