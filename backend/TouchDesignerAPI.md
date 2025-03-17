| Effect Name   | Associated Movement(s) or Triggers       | Required Tracking Data                                           |
| ------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| Idle          | None, users walking (pre-initialisation) | Position (x/y/z) of person                                       |
| Paint Trails  | Users moving/swaying their arms          | Arms (Elbows, Hands) x/y/z                                       |
| Initialise    | System determines permanent user         | Position (x/y/z) of person and time they have stood in place (s) |
| Colour Splash | Thrust hands forward                     | Hands (not sure if x/y/z or just z), gesture recognition         |

requird data:

- position of person
  - x/y/z
  - time stood in place (s)
- elbows
  - x/y/z
- hands
  - x/y/z
  - speed of movement
- user is registerd (walks in screen and stays for more than x seconds)
  - to start event (give flag that this happend)
- user is unregisterd (walking off screen when time did not end)
  - to end event and reset (give flag that this happend)
-
- gesture recognition (give flag that this happend)
  - thrust hands forward
  - swaying arms (optional)
  - walking (optional)
