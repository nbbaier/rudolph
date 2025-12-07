# Current command surface

-  `scaffold` Set up a new day (creates files, downloads input and puzzle)
-  `input` [options] Download puzzle input to input.txt
-  `init` Interactive setup for a new AoC workspace
-  `try|sample` [options] Run solution against sample.txt
-  `answer` [options] Run solution against input.txt and submit to AoC
-  `attempt|run` [options] Run solution against input.txt, executing both parts and showing total time
-  `guesses` [options] Show guess history for a day
-  `status` [options] Show progress for a year using recorded guesses
-  `read` [options] Download puzzle description to puzzle.md
-  `refresh` [options] Re-download puzzle (useful after solving part 1 to get part 2)
-  `help` [command] display help for command

# User stories + Revised command surface

-  I want to initialize an Advent of Code repo to use with rudolph:
   -  `rudolph init` => interactive setup, sets env variables, installs etc
-  I want to start a day that I haven't worked on yet
   -  `rudolph setup` => create day folder, runner/test templates, sample stub; fetches and caches input and puzzle
-  I want to fetch and cache just the input
   -  `rudolph input`: download puzzle input to `input.txt` (or use cached input)
-  I want to read a day's puzzle
   -  `rudolph puzzle`: download puzzle description to `puzzle.md`, print to stdout. Use puzzle.md if present.
-  I want to run my solution against `input.txt` or `sample.txt`:
   -  `rudolph run sample` => execute both parts against `sample.txt` showing execution time
   -  `rudolph run input` => execute both parts against `input.txt` showing execution time
-  I want to run a solution against `input.txt`, submit to AoC with guardrails (duplicate/too-high/too-low/locked/cooldown), and log guesses (cache + project).
   -  `rudolph answer`
-  I want to see cached guesses
   -  `rudolph guesses`
-  I want to show stars
   -  `rudolph stars`
-  I want to update a puzzle for part 2
   -  `rudolph refresh`

Some notes on the desired behavior:

-  `input` should fetch AND cache (or read from cache) the input to the day folder (or re-download if force is passed)
-  `puzzle` should fetch AND cache (or read from cache) the puzzle to the day folder (or re-download if force is passed)
   -  `puzzle --read` should do the above and pretty print to stdout
-  `setup` should (1) create day folder, runner/test templates, sample stub; (2) fetch AND cache (or read from cache) the input AND puzzle to the day folder
-  `run sample` should run solutions against `sample.txt`
-  `run puzzle` should run solutions against `input.txt`
-  `answer` should run solutions against `input.txt` submit to AoC with guardrails (duplicate/too-high/too-low/locked/cooldown), and log guesses (cache + project).
-  `guesses` should print the display local guess history
-  `stars` should print the display the star history for a given year
-  `refresh` should basically run `puzzle --force` but have guardrails for if part 1 is completed

Some notes on arguments/options

-  global options
   -  `-h, --help`
-  `input`
   -  `-f, --force` (boolean option)
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
-  `puzzle`
   -  `-f, --force` (boolean option)
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
-  `setup`
   -  `-f, --force` (boolean option) DISPLAYS WARNING THAT THIS ERASES SOLUTIONS
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
-  `run`
   -  `<sample|input>` required positional arg
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
-  `answer`
   -  `<year>` required positional arg
   -  `<day>` required positional arg
   -  `<part>` required positional arg
-  `guesses`
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
-  `stars`
   -  `[year]` optional arg (default = current)
-  `refresh`
   -  `[year]` optional arg (default = current)
   -  `[day]` optional arg (default = current)
