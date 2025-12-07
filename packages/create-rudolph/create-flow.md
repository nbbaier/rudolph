-  User runs `bun create @nbbaier/rudolph` with default project name (`advent-of-code`), and default output directory (`./solutions`). This will do the following:

   -  Check if `./advent-of-code` exists/is empty
   -  If TRUE: ask if the user wants to overwrite it (flow irrelevant here)
   -  If FALSE: create the project at `./advent-of-code`
   -  Create the following files:
      -  `./advent-of-code/.env`
      -  `./advent-of-code/package.json`
      -  `./advent-of-code/README.md`
      -  `./advent-of-code/.gitignore`
      -  `./advent-of-code/solutions/`
      -  `./advent-of-code/solutions/<AOC_YEAR>/`
      -  `./advent-of-code/solutions/<AOC_YEAR>/day<DAY>/`
      -  `./advent-of-code/solutions/<AOC_YEAR>/day<DAY>/index.ts`
      -  `./advent-of-code/solutions/<AOC_YEAR>/day<DAY>/puzzle.md`
      -  `./advent-of-code/solutions/<AOC_YEAR>/day<DAY>/input.txt`
      -  `./advent-of-code/solutions/<AOC_YEAR>/day<DAY>/sample.txt`

-  User runs `bun create @nbbaier/rudolph .` with default output directory (`./solutions`). This will do the following:

   -  Check if `./` exists/is empty
   -  If TRUE: ask if the user wants to overwrite it (flow irrelevant here)
   -  If FALSE: create the project at `./`
   -  Create the following files:
      -  `./package.json`
      -  `./README.md`
      -  `./solutions/`
      -  `./solutions/<AOC_YEAR>/`
      -  `./solutions/<AOC_YEAR>/day<DAY>/`
      -  `./solutions/<AOC_YEAR>/day<DAY>/index.ts`
      -  `./solutions/<AOC_YEAR>/day<DAY>/puzzle.md`
      -  `./solutions/<AOC_YEAR>/day<DAY>/input.txt`
      -  `./solutions/<AOC_YEAR>/day<DAY>/sample.txt`

-  User runs `bun create @nbbaier/rudolph my-aoc-workshop` with default output directory (`./solutions`). This will do the following:

   -  Check if `./my-aoc-workshop` exists/is empty
   -  If TRUE: ask if the user wants to overwrite it (flow irrelevant here)
   -  If FALSE: create the project at `./my-aoc-workshop`
   -  Create the following files:
      -  `./my-aoc-workshop/.env`
      -  `./my-aoc-workshop/package.json`
      -  `./my-aoc-workshop/README.md`
      -  `./my-aoc-workshop/.gitignore`
      -  `./my-aoc-workshop/solutions/`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/day<DAY>/`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/day<DAY>/index.ts`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/day<DAY>/puzzle.md`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/day<DAY>/input.txt`
      -  `./my-aoc-workshop/solutions/<AOC_YEAR>/day<DAY>/sample.txt`

-  Test scenarios:
   -  project name = default (`advent-of-code`), output directory = default (`solutions`)
   -  project name = default (`advent-of-code`), output directory = custom (`answers`)
   -  project name = custom (`my-aoc-workshop`), output directory = default (`solutions`)
   -  project name = custom (`my-aoc-workshop`), output directory = custom (`answers`)
   -  project name = cwd (`.`), output directory = default (`solutions`)
   -  project name = cwd (`.`), output directory = custom (`answers`)
