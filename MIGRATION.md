I want to move back to a single package architecture. What we need to have at the end is the following:

1. No monorepo structure, a single `npm` package, `@nbbaier/rudolph`
2. Updated publishing commands, dependences, scripts, etc.
3. The cli should have all the same functionality it has now
4. We should add a `rudolph init` command that a user can run in a directory to set that directory up for success
5. When the user runs `rudolph init` should do the following, in order
   -  Check if `cwd` is empty
      -  If `cwd` is empty, tell the user we'll be initializing a new project in the directory
         -  prompt the user to choose a package manager (defaults to the one that is being used for the cli), store response
         -  use `cwd` as the project name (but ask if they want it to be different), store response
         -  ask if the user wants to use the default output dir = `solutions`, store response
         -  ask the user what year they want to default to (will be the current), store response
         -  ask the user for their token (AOC_SESSION, required), store response
         -  ask the user if they want to use their email for the user agent (recommended but optional)
            -  if no, continue, store that AOC_USER_AGENT will not be present in `.env`
            -  if yes, ask the user for their email, (AOC_USER_AGENT, defaults to git email), store response
         -  ask the user if they want to install dependencies (optional, default yes), store response
         -  ask the user if they want to initialize a git repo (optional, default yes), store response
         -  ask the user if they want to fetch the current AOC day, store response
         -  use the stored responses to determine what will be created, display to user, confirm, execute
         -  display "next steps message" and exit
      -  If `cwd` is NOT empty, determine if the contents are an existing JS/TS project
         -  If we have an existing JS/TS project, walk through the steps above, but use the project.json name, etc.
         -  If we do not have an existing JS/TS project, ask the user if they want to empty the contents of the dir and start from scratch, if yes, walk through empty steps, if no, exit
6. A full test suite for each command in the cli, and for the `rudolph init` command
