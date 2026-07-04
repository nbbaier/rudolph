## Commands

### Setup & Fetching

-  **`rudolph setup [year] [day]`** — Create solution files, download input, and fetch puzzle.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Overwrite existing files
   -  `-o, --output-dir <dir>`: Custom output directory

-  **`rudolph input [year] [day]`** — Download puzzle input to `input.txt`.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Re-download even if exists
   -  `-o, --output-dir <dir>`

-  **`rudolph puzzle [year] [day]`** — Download puzzle description to `puzzle.md` (uses cache if available).

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Re-download even if exists
   -  `--no-print`: Don't print puzzle to console
   -  `-o, --output-dir <dir>`

-  **`rudolph refresh [year] [day]`** — Re-fetch puzzle description (useful for getting Part 2 after solving Part 1).
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Force refresh even if Part 1 isn't complete locally
   -  `-o, --output-dir <dir>`

### Running Solutions

-  **`rudolph run <target> [year] [day] [part]`** — Run your solution with timing.
   -  `<target>`: `sample` or `input`
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `[part]`: `1`, `2`, or `both` (default: `both`)
   -  `-o, --output-dir <dir>`

### Submitting & Tracking

-  **`rudolph answer <year> <day> <part>`** — Run solution and submit answer to AoC.

   -  `<year>`: Year (e.g., 2024)
   -  `<day>`: Day number (1-25)
   -  `<part>`: `1` or `2`
   -  `--no-refresh`: Skip auto-refreshing puzzle after correct Part 1

-  **`rudolph guesses [year] [day]`** — Show guess history for a specific day.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `--json`: Output as JSON

-  **`rudolph stars [year]`** — Show collected stars for a year (based on recorded guesses).
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `--json`: Output as JSON
   -  `-o, --output-dir <dir>`
