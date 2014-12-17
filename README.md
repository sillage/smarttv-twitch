Original source tree
==============
<a href="https://github.com/mkvd/smarttv-twitch">https://github.com/mkvd/smarttv-twitch</a>

Fork status
==============
This fork currently features:
[All components]
* Code cleaning and refactoring
* Own functions now require strict javascript validation
* Divided everything into smaller pieces for the sake of code readability and future development
* Fixed problem where volume control would work only after the second keypress after launching the application
* Moved throbber to the bottom right corner
* Status messages now appear in bottom left corner
* Included some minor animations
* Added polish language

[Stream Browser]
* Enabled mouse and smart remote integration (currently only for keyboard input and as a simple 'pointer')
* Stream list not does not clean itself for a brief moment on loading new page, just the scrolling is paused a bit util more streams are loaded.
* Removed static sleep (2s) from the stream loading code and replaced it with css improvements so list loading will seem to load faster
* Blue button (D) (refresh) is now removed, because refresh can be initiated by pressing the current view button again (ex. list of streams (red) can be refreshed by pressing red button and list of games can be refreshed by pressing yellow button)

[Stream Channel]
* Defaults to "Source" resolution
* Stream quality chooser now grays out the quality not yet applied
* Stream info is partrially transparent
* You can see stream title on stream start and every time the title changes (it persists 6 seconds)

Tested on Samsung H6400, feedback highly appreciated

TODO
=============
* Focused elements in Browser sometimes dont show part of the border (css)
* Support mouse/smart remote in the whole application
* Complete the code cleaning/refactoring
* After all that is done try to make some sane pull requests to the original forked source tree
