# Overview

The init command needs to know thw following:

-  Where is the command running:
   -  Empty directory => needs to infer package manager from how cli is being run/where it is installed.
   -  Directory with existing package.json => need to infer package manager, determine if typescript is set up, add dependencies, etc.
   -  Non-empty directory without package.json => needs to prompt if the user wants to overwrite
-  What the project is called
-  What the output dir is
-  What the default year is
-  AOC session token
-  AOC user agent
-  If a git repo should be initialized
-  If dependencies should be installed
