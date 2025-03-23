<div align="center">
  <h1>[PROJECT TITLE]</h1>

  <p>[Project description</p>
</div>

## Build

- `npm run build`
- `npm run watch`

TODO: Signal -> default value (static prop?)
  + setProperties() => sub from signal...

0. écrire les sujets (sinon pas le temps...)
1. modify questions upon changes.
  a. grade => set color (0 à 1)
  b. comment
  c. suspicious set flag
  => how to notify (?) => target notify ? => pas besoin d'être un LISSSignal alors.
2. notify to save in localstorage + initial load from localstorage.
3. Import/export + test import corrigé.
4. MultiRep...

X. group & sort answers...
X. URL du sujet dans zip...
X. Coeff export CSV (from corrigé) [now requiert] + show subject
X. Update LISS

X. docs

## ?

- Correcteur : question type
	+ verify result
	+ désigner équiv (sans espaces répétés ? + casse) ?
	+ prev good/bad + see previous ? [per answers]
	+ calculer taux similarités 2à2 (garder max) + % suspicieux + nom similaire.

## TODO

- bug avec ctrl+Z ?

- Moodle ID to Odin ID conversion...

- verif identical zip.

- auto-correct if equals to corrige...
  -> spaces/break-lines/casse.
- distance entre rendus.

- Questions types :
  - Images/Files
  - exec code in Browser (JS/Py/HTML/CSS/Shell/SQL)
  - Tableur (PDF export ?)