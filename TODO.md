- QMultiText (tester).

- MWL+TPEngine
    - ATP cours (cf below)
    - doc
    - TODO
    - remove old
        - delete FrameScheduler/defer + delete WebComponent + old Properties.

- Expand<>/expand() in MWL
- Debug
    - __LOG__() [only in __DEBUG__ + only during __START_LOG__ / __STOP_LOG__]
        - console : beging/stop group.
        - + possibilité de filter sur ID ?
    - __SET_ID__(name) => this + [NAME]-[id] (?).
    - propagation : represent tree -> how (with SET) ?

- bindProperties : ensure keys type (hard).

- ATP
    -> (model/core si pas de lib...) -> ATP... (/src => de ce qu'on construit)
        -> /build // /build/cache
        -> model/tools (éventuellement).
        -> ports/gui/?
        -> ports/codec/?
        -> pages/template (too) [TS/CSS].

======================

- TODO
    - answers
        - sort
        - merge identical (?).
    - page in Cours.

- corrector
    - ARFile

- fraude
    - calcul score de proximité.
        -> longueur (au carré) parties communes après normalisation (supr mots <3 chars + espaces + ponctuation.)
    - suspicious set flag.
    - verif identical zip.

- see branch master for previous version...