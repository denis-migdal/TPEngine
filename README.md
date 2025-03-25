<div align="center">
  <h1>[PROJECT TITLE]</h1>

  <p>[Project description</p>
</div>

## Build

- `npm run build`
- `npm run watch`

0. Refactors
  -> :not(:defined) -> invisible...
  -> TPPage/AnswersBrowser -> move to skeleton/libs/pages TS

1. modify questions upon changes.
  a. grade => set color (0 à 1)
  b. comment
  c. suspicious set flag
2. MultiRep...
  - Use sujet for meta infos... (better)
3. Import/export + test import corrigé.

X. group & sort answers...
X. Coeff export CSV (meta from sujet)
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