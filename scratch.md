Think about it more simply: if you're at position i and you've already included b batteries, then you need 12 - b more batteries from the remaining positions.
So the question becomes: among the next 12 - b positions (the closest ones you could possibly include to reach 12), is there one with a digit larger than d?
If yes, then you should skip d, because you can definitely include that larger digit instead.
If no, then you should include d, because skipping it won't let you get anything better.
Does that make sense? You're looking at a "window" of the next 12 - b positions to see if any have a larger digit.
Let me trace through 234234234234278:

Position 0, digit 2, batteries so far: 0, need 12 more
Look at next 12 positions (1-12): contains 3, 4, 7, 8 - all larger than 2
Skip it
Position 1, digit 3, batteries so far: 0, need 12 more
Look at next 12 positions (2-13): contains 4, 7, 8 - all larger than 3
Skip it

