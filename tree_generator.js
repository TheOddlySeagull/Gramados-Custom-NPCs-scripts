/*
This script is for plans to upgrade the lumberjack job on the Gramados server.
The final goal is to have a region with several values that will allow some trees grow. When a tree grows, it will change the region variables causing the player needing to prepare the area for fancyer and more expensive trees to grow.
*/


//var quality = 1;
var quality = Math.random() * 2;

// Script for scripted block that spawns a tree above it when interacted with
function interact(event) {
    buildTree(event);
    return true;
}

// Function to check if a point is inside a box
function isInside(x, y, z, x1, y1, z1, x2, y2, z2) {
    var inside = false;
    if ((x >= x1 && x <= x2) || (x <= x1 && x >= x2)) {
        if ((y >= y1 && y <= y2) || (y <= y1 && y >= y2)) {
            if ((z >= z1 && z <= z2) || (z <= z1 && z >= z2)) {
                inside = true;
            }
        }
    }
    return inside;
}

// Funtion to build a tree above the scripted block
function buildTree(event) {
    var block_location = event.block.getPos();
    var world = event.player.getWorld();
    //block_location is type IPos
    var x = block_location.getX();
    var y = block_location.getY();
    var z = block_location.getZ();

    // generate a tree
    var log = "minecraft:log";
    var leaves = "minecraft:leaves";
    var placeholder = "minecraft:sponge";
    var tree = treetypePine(log, leaves, placeholder, quality);

    // build the array in the world
    build3DArray(tree[0], x, y + 1, z, world);

    return true;
}


// algorithm to generate a tree of type tall oak. return a 3D array with the tree blocks
function treetypeTallOak(log, leaves, placeholder, quality) {
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
    //log("Upper leaves thick: " + upper_leaves_thick[0] + " to " + upper_leaves_thick[1]);
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
function treetypePine(log, leaves, placeholder, quality) {
    //log("Generating a pine tree with log " + log + " and leaves " + leaves + " with quality " + quality);
    //if quality under 1, set to 1
    var quality_size = quality;
    if (quality_size < 1) {
        quality_size = 1;
    }
    // Segmentise into layers, on a 10 basis.
    /*
        Quality of 1: 30 tall log (33 tall tree)
        Quality of 0: 10 tall log (13 tall tree)
    */

    // generate log height
    var log_height = Math.floor(10 + 20 * quality);
    // generate an x log
    var log_array = createLogX(log_height, 6, 12, log, placeholder);

    //update log_height to height of log_array
    log_height = log_array[0].length;

    // Create a leaf cap: 3x3 cross, of 2 tall
    //log("Creating leaf cap with leaves " + leaves);
    var cap = createX(3, leaves);
    //display2DArray(cap);
    cap = increase_2D_to_3D(cap, 2);
    //display3DArray(cap);

    var cap2 = createX(1, leaves);
    //display2DArray(cap2);
    cap2 = increase_2D_to_3D(cap2, 2);

    //display3DArray(cap2);

    //get center
    var center = Math.floor(log_array.length / 2);

    var cap = concatenate3DArrays(cap, cap2, 1, 2, 1);

    var tree = concatenate3DArrays(log_array, cap, center - 1, log_height - 1, center - 1, false);
    tree = increase3DArray(tree, 10, 10, 10);

    var tree_size = [tree.length, tree[0].length, tree[0][0].length];

    // Create many branches on the tree.
    // branches have quality, the lower the smaller. Make the quality proportionnal to the Y position of the branch on the main log, the taller the smaller (0 at the top, 2 at the bottom)
    // For each side, create a branch. Then, random between 3 to 4 blocks higher, create the next branch. Repeat until the top of the tree is reached.

    // get y min and max for the branches
    var branch_y = getBounds(1, 3, log_height, 3);
    
    // start by the top of the log
    var y = log_height - 3;
    // get the quality of the first branch
    var proportion = 1 - (y - branch_y[0]) / (branch_y[1] - branch_y[0]);
    // create the first branch
    var branch = createPineBranch(log, leaves, placeholder, proportion);
    // concatenate the branch to the tree
    tree = concatenate3DArrays(tree, branch, center + 1, y, center - 1, false);

    var step = 3;

    // for all the blocks lower, from 3 blocks under the previous branch, create a new branch (random)
    for (var y = log_height - 6; y > 0; y -= step) {
        // get the coordinate of the log from where the branch will start (max x log, y, z of log)
        //for the blocks of the layer
        var checked_logs = [];
        for (var x = 0; x < log_array.length; x++) {
            for (var z = 0; z < log_array[0][0].length; z++) {
                if (log_array[x][y][z] == log) {
                    checked_logs.push([x, z]);
                }
            }
        }
        // get the log with the highest x and center z
        var max_x = 0;
        var max_z = 0;
        for (var i = 0; i < checked_logs.length; i++) {
            if (checked_logs[i][0] > max_x) {
                max_x = checked_logs[i][0];
                max_z = checked_logs[i][1];
            }
        }

        // get the quality of the branch
        var proportion = 1 - (y - branch_y[0]) / (branch_y[1] - branch_y[0]);
        // create the branch with random chance
        if (Math.random() < 0.3) {
            var branch = createPineBranch(log, leaves, placeholder, proportion);
            //rotate the branch left
            branch = rotate3DArray(branch, false);

            // concatenate the branch to the tree
            tree = concatenate3DArrays(tree, branch, max_x, y, max_z, false);
            step = 3;
        }
        else {
            // if fail, try again right under the previous try
            step = 1;
        }
    }


    //tree[center][y][center] = placeholder;

    



    return [tree, tree_size];
}






// algorithm to generate a pine branch
function createPineBranch(log, leaves, placeholder, proportion) {
    // the lower the proportion, the smaller the branch

    // Start with an horizontal 1 to 5 blocks long log
    var log_length = Math.floor(1 + 4 * proportion);
    var branch_lenght = log_length + 3;
    var branch_width = log_length + 1;
    // if width is even, set to odd
    if (branch_width % 2 == 0) {
        branch_width++;
    }

    // create the 3D array (3 tall)
    var branch = create3DArray(branch_lenght, 3, branch_width);

    // create the log from south to north
    for (var x = 0; x < log_length; x++) {
        branch[x][1][Math.floor(branch_width / 2)] = log;
    }

    // after the log, fill with leaves to the tip
    for (var x = log_length; x < branch_lenght; x++) {
        branch[x][1][Math.floor(branch_width / 2)] = leaves;
    }

    // create the leaves on the sides of the log
    // make z the center of the branch
    var z_central = Math.floor(branch_width / 2);
    var z_1 = z_central + 1;
    var z_2 = z_central - 1;
    var x_1 = 0;
    var x_2 = branch_lenght - 2;

    // create fills
    for (var x = 0; x < branch_lenght - 1; x+=2) {
        fillZone([x_1, 1, z_1], [x_2, 1, z_2], leaves, 1, branch);

        // if x_1 to x_2 is 4 or more, break
        if (x_2 - x_1 < 5) {
            break;
        }


        z_2--;
        z_1++;

        x_2 -= 2;
    }

    z_1 = z_central;
    z_2 = z_central;
    x_1 = 0;
    x_2 = branch_lenght - 3;

    // create fills
    for (var x = 0; x < branch_lenght - 2; x+=2) {
        fillZone([x_1, 0, z_1], [x_2, 0, z_2], leaves, 1, branch);
        fillZone([x_1, 2, z_1], [x_2, 2, z_2], leaves, 1, branch);

        // if x_1 to x_2 is 4 or more, break
        if (x_2 - x_1 < 5) {
            break;
        }


        z_2--;
        z_1++;

        x_2 -= 2;
    }

    // remove the angles at z = 0 and z = branch_width - 1, and x = 0
    if (log_length > 1) {
        branch[0][1][0] = null;
        branch[0][1][branch_width - 1] = null;
    }

    if (branch_width > 7) {
        branch[0][0][2] = null;
        branch[0][2][2] = null;
        branch[0][0][branch_width - 3] = null;
        branch[0][2][branch_width - 3] = null;
    }


    return branch;
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

function createX(width, block) {
    //log("Creating X with width " + width + " and block " + block);
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
        //log("Placing " + block + " at " + center + ", " + i);
        x[center][i] = block;
        x[i][center] = block;
    }
    return x;
}

//subfunction to increase the height of a 2D array
function increase_2D_to_3D(array_2D, height) {
    
    var array_width = array_2D.length;
    // Create a 3D array of width x height x width
    var x = create3DArray(array_width, height, array_width);

    // for each layer, fill the X
    for (var i = 0; i < array_width; i++) {
        for (var j = 0; j < height; j++) {
            for (var k = 0; k < array_width; k++) {
                if (array_2D[i][k] != null) {
                    x[i][j][k] = array_2D[i][k];
                }
            }
        }
    }

    // return the X 
    return x;
}

// function to cerate a X log
function createLogX(height, min_layer_height, max_layer_height, log, placeholder) {

    // segment the height of the log into several segments of sizes between min_layer_height and max_layer_height
    var layers = segmentNumber(height, min_layer_height, max_layer_height);

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

    var x_2d = createX(log_width, log);
    var x_3d = increase_2D_to_3D(x_2d, layers[0], log);
    var log_array = x_3d;
    concat_offset++;

    if (layers.length > 1) {
        // for each layer, create a X and concatenate it to the log
        for (var i = 1; i < layers.length; i++) {
            log_width -= 2;
            //log("Creating layer " + i + " with height " + layers[i] + " and width " + log_width);

            // create the X
            x_2d = createX(log_width, log);
            // create the taller X
            x_3d = increase_2D_to_3D(x_2d, layers[i], log);
            //log("Created X log element, that will be placed between " + y_start + " and " + (y_start - layers[i] + 1));
            // concatenate the X to the log
            log_array = concatenate3DArrays(log_array, x_3d, concat_offset, y_start + layers[i] - 1, concat_offset);

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

// function to merge 2 3D arrays
function concatenate3DArrays(array1, array2, offset_x, offset_y, offset_z, replace_blocks) {
    //log("Concatenating 3D arrays with offset " + offset_x + ", " + offset_y + ", " + offset_z);

    // replace_blocks is true by default
    if (replace_blocks == null) {
        replace_blocks = true;
    }

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
                if (replace_blocks || merged[i + offset_x][j + offset_y][k + offset_z] == null) {
                    merged[i + offset_x][j + offset_y][k + offset_z] = array2[i][j][k];
                }
            }
        }
    }

    return merged;
}

// function to build a 3D array in the world
function build3DArray(array, build_x, build_y, build_z, world) {

    // for each block in the 3D array, place it in the world
    //log("Array size: " + array.length + ", " + array[0].length + ", " + array[0][0].length);
    for (var x = 0; x < array.length; x++) {
        for (var y = 0; y < array[0].length; y++) {
            for (var z = 0; z < array[0][0].length; z++) {
                if (array[x][y][z] != null) {
                    //log("Placing block " + array[x][y][z] + " at " + build_x + x + ", " + build_y + y + ", " + build_z + z);
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

//function to display a 3D array in chat
function display3DArray(array) {
    for (var y = 0; y < array[0].length; y++) {
        var line = "";
        for (var x = 0; x < array.length; x++) {
            for (var z = 0; z < array[0][0].length; z++) {
                if (array[x][y][z] != null) {
                    line += "o";
                }
                else {
                    line += "x";
                }
            }
            line += " ";
        }
        log(line);
    }
    log("______________________");
}

//function to display a 2D array in chat
function display2DArray(array) {
    for (var y = 0; y < array.length; y++) {
        var line = "";
        for (var x = 0; x < array.length; x++) {
            if (array[x][y] != null) {
                line += "o";
            }
            else {
                line += "x";
            }
        }
        log(line);
    }
    log("______________________");
}

//function to rotate a 3D array 90 degrees right or left
function rotate3DArray(array, right) {
    // create a new array with the same size
    var new_array = create3DArray(array.length, array[0].length, array[0][0].length);

    // for each block in the array, rotate it
    for (var x = 0; x < array.length; x++) {
        for (var y = 0; y < array[0].length; y++) {
            for (var z = 0; z < array[0][0].length; z++) {
                if (right) {
                    new_array[x][y][z] = array[array.length - z - 1][y][x];
                }
                else {
                    new_array[x][y][z] = array[z][y][array[0][0].length - x - 1];
                }
            }
        }
    }

    return new_array;
}

//function to increase a 3D array on each axis while keeping content centered
function increase3DArray(array, increase_x, increase_y, increase_z) {
    // create a new array with the increased size
    var new_array = create3DArray(array.length + increase_x, array[0].length + increase_y, array[0][0].length + increase_z);

    // get the offset for each axis
    var offset_x = Math.floor(increase_x / 2);
    var offset_y = Math.floor(increase_y / 2);
    var offset_z = Math.floor(increase_z / 2);

    // copy the content of the old array to the new array
    for (var x = 0; x < array.length; x++) {
        for (var y = 0; y < array[0].length; y++) {
            for (var z = 0; z < array[0][0].length; z++) {
                new_array[x + offset_x][y + offset_y][z + offset_z] = array[x][y][z];
            }
        }
    }

    return new_array;
}