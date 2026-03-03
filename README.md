# Bonus – Tags et Releases avancés

> **Niveau** : Avancé  
> **Prérequis** : Connaître `git tag`, `git push --tags`, le versioning sémantique  
> **Durée estimée** : 1h30

Ce dépôt simule une application avec un historique de versions réel. Tu vas pratiquer le versioning sémantique complet : créer des tags annotés, naviguer entre les versions, comprendre quand bumper MAJOR/MINOR/PATCH, rétroporter des correctifs, et automatiser la release.

---

## Rappel SemVer

```
MAJOR.MINOR.PATCH

MAJOR → breaking change (incompatibilité avec versions précédentes)
MINOR → nouvelle fonctionnalité rétrocompatible
PATCH → correction de bug rétrocompatible
```

**Exemples :**
- `1.3.2 → 1.3.3` : patch (bugfix)
- `1.3.2 → 1.4.0` : minor (nouvelle feature)
- `1.3.2 → 2.0.0` : major (breaking change)

---

## Exercice 1 – Reconstituer l'historique de tags

Le dépôt contient un `CHANGELOG.md` avec l'historique complet depuis `v1.0.0`. Ton premier travail est de reconstituer les tags manquants.

```bash
git clone https://github.com/JSurquin/bonus-exercices-tags-releases.git
cd bonus-exercices-tags-releases
```

**Étape 1** – Crée des commits pour simuler l'historique des versions :

```bash
# Simuler v1.0.0 (déjà présent comme commit initial)
git tag -a v1.0.0 -m "Release v1.0.0 – Initial release: auth + user list"

# Simuler v1.1.0 : ajouter la recherche
echo "// search feature added" >> src/features.js
git add src/features.js
git commit -m "feat(search): add user search functionality"
git tag -a v1.1.0 -m "Release v1.1.0 – Add search"

# Simuler v1.2.0 : export CSV
echo "// csv export added" >> src/features.js
git add src/features.js
git commit -m "feat(export): add CSV export"
git tag -a v1.2.0 -m "Release v1.2.0 – Add CSV export"

# Simuler v1.3.0 : dark mode
echo "// dark mode added" >> src/features.js
git add src/features.js
git commit -m "feat(ui): add dark mode"
git tag -a v1.3.0 -m "Release v1.3.0 – Add dark mode"

# Simuler v1.3.1 : hotfix CSV
echo "// fix: utf8 csv encoding" >> src/features.js
git add src/features.js
git commit -m "fix(export): fix UTF-8 encoding in CSV export"
git tag -a v1.3.1 -m "Release v1.3.1 – Fix CSV encoding"

# Simuler v1.3.2 : hotfix dark mode Safari
echo "// fix: safari dark mode" >> src/features.js
git add src/features.js
git commit -m "fix(ui): fix dark mode display on Safari"
git tag -a v1.3.2 -m "Release v1.3.2 – Fix dark mode on Safari"
```

**Étape 2** – Vérifie les tags créés :

```bash
git tag -l
# → v1.0.0  v1.1.0  v1.2.0  v1.3.0  v1.3.1  v1.3.2

git tag -l "v1.*"
# → filtre uniquement les v1.x ✅

git show v1.2.0
# → Voir le détail du tag annoté ✅
```

**Étape 3** – Navigation entre les versions :

```bash
# Checkout d'une version spécifique (HEAD détaché)
git checkout v1.1.0
cat src/features.js
# → État exact du code à v1.1.0

# Revenir sur main
git switch main
```

---

## Exercice 2 – Décider le bon type de bump

Pour chaque changement ci-dessous, détermine si c'est un **patch**, **minor** ou **major**, puis crée le tag approprié.

**Changement A** – Dans `src/version.js`, la fonction `bumpVersion` lève désormais une exception différente :

```js
// Avant :
throw new Error(`Unknown bump type: ${type}`);
// Après :
throw new TypeError(`Invalid bump type "${type}". Expected: major, minor, patch`);
```

```bash
git switch -c fix/version-error-type
# ... modifier src/version.js ...
git commit -m "fix(version): use TypeError for invalid bump type"
git switch main
git merge --no-ff fix/version-error-type -m "fix: merge version error type fix"
# Quel tag ? v1.3.3 (patch – bugfix interne, pas de breaking change)
git tag -a v1.3.3 -m "Release v1.3.3 – Better error type for invalid bump"
```

**Changement B** – `bumpVersion` accepte maintenant un objet de config en plus du type :

```js
function bumpVersion(version, type, options = { prerelease: null }) {
  const v = parseVersion(version);
  let result;
  if (type === "major") result = `${v.major + 1}.0.0`;
  else if (type === "minor") result = `${v.major}.${v.minor + 1}.0`;
  else if (type === "patch") result = `${v.major}.${v.minor}.${v.patch + 1}`;
  else throw new TypeError(`Invalid bump type "${type}"`);

  if (options.prerelease) return `${result}-${options.prerelease}`;
  return result;
}
```

```bash
git switch -c feature/version-prerelease
# ... modifier src/version.js ...
git commit -m "feat(version): add prerelease support to bumpVersion"
git switch main
git merge --no-ff feature/version-prerelease -m "feat: merge prerelease support"
# Quel tag ? v1.4.0 (minor – nouvelle fonctionnalité rétrocompatible)
git tag -a v1.4.0 -m "Release v1.4.0 – Prerelease version support"
```

**Changement C** – La signature de `isCompatible` change complètement :

```js
// Avant : isCompatible(v1, v2) → boolean
// Après : checkCompatibility(v1, v2) → { compatible: boolean, reason: string }
function checkCompatibility(v1, v2) {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  if (a.major !== b.major) {
    return { compatible: false, reason: `Major versions differ: ${a.major} vs ${b.major}` };
  }
  return { compatible: true, reason: "Same major version" };
}
```

```bash
git switch -c breaking/rename-compatibility
# ... modifier src/version.js (supprimer isCompatible, ajouter checkCompatibility) ...
git commit -m "feat(version)!: rename isCompatible to checkCompatibility with richer output

BREAKING CHANGE: isCompatible() removed, use checkCompatibility() instead"
git switch main
git merge --no-ff breaking/rename-compatibility -m "feat!: merge breaking compatibility API change"
# Quel tag ? v2.0.0 (major – breaking change)
git tag -a v2.0.0 -m "Release v2.0.0 – Breaking: rename compatibility API"
```

---

## Exercice 3 – Rétroporter un correctif (backport)

Un bug critique est découvert et tu dois le corriger sur la version **v1.3.x** en production, sans embarquer les nouvelles features de v1.4.0 et v2.0.0.

```bash
# Créer une branche de maintenance depuis v1.3.2
git switch -c support/v1.3.x v1.3.2

# Appliquer le correctif sur cette branche
echo "// critical bugfix: memory leak patched" >> src/features.js
git add src/features.js
git commit -m "fix(memory): patch memory leak in feature loading"

# Créer le tag de la version patchée
git tag -a v1.3.4 -m "Release v1.3.4 – Critical memory leak fix (backport)"

# Également appliquer sur main via cherry-pick
HASH=$(git log --oneline -1 | awk '{print $1}')
git switch main
git cherry-pick $HASH
# ⚠️ Si un conflit apparaît sur src/features.js (car main a avancé avec les exercices 1 et 2) :
#   → c'est normal ! Résoudre en gardant TOUTES les lignes des deux versions
#   → git add src/features.js && git cherry-pick --continue

# Créer le tag sur main également (si applicable)
git tag -a v2.0.1 -m "Release v2.0.1 – Cherry-pick memory leak fix"
```

Vérifie :
```bash
git log --oneline --decorate --graph --all | head -20
# → Tu dois voir les branches support/v1.3.x et main avec leurs tags respectifs
```

---

## Exercice 4 – Automatiser avec le script de release

Ce dépôt inclut un script `scripts/release.js` qui automatise le bump de version.

```bash
# Voir ce que fait le script
cat scripts/release.js

# Bump de patch
node scripts/release.js patch
# → Met à jour package.json et src/version.js automatiquement
# → Affiche les étapes manuelles restantes

git add package.json src/version.js
git commit -m "chore(release): v$(node -e "console.log(require('./package.json').version)")"
git tag -a "v$(node -e "console.log(require('./package.json').version)")" \
  -m "Release $(node -e "console.log(require('./package.json').version)")"
```

Adapte maintenant ce script pour qu'il :
1. Mette aussi à jour `CHANGELOG.md` en ajoutant une section `## [X.Y.Z] – YYYY-MM-DD`
2. Lance automatiquement `git add`, `git commit` et `git tag`
3. Affiche un message de succès avec le tag créé

---

## Exercice 5 – Tags légers vs annotés : comprendre la différence

```bash
# Tag léger (simple pointeur, pas de métadonnées)
git tag v2.0.0-light

# Tag annoté (objet Git avec auteur, date, message)
git tag -a v2.0.0-annotated -m "Version annotée avec message"

# Voir la différence
git show v2.0.0-light      # → Montre directement le commit
git show v2.0.0-annotated  # → Montre les métadonnées du tag PUIS le commit

# Vérifier le type d'objet
git cat-file -t v2.0.0-light      # → commit
git cat-file -t v2.0.0-annotated  # → tag

# Pousser les tags
git push origin --tags            # push tous les tags
git push origin v2.0.0-annotated  # push un tag spécifique

# Supprimer un tag local et distant
git tag -d v2.0.0-light
git push origin --delete v2.0.0-light
```

**Question** : Pour une release de production, lequel utiliser et pourquoi ?

---

## Points de validation

- [ ] Exercice 1 : `git tag -l` liste `v1.0.0` à `v1.3.2`, `git show v1.2.0` affiche les métadonnées
- [ ] Exercice 2 : tu as correctement identifié patch/minor/major pour chaque changement
- [ ] Exercice 3 : `git log --all --decorate` montre `support/v1.3.x` avec `v1.3.4` et `main` avec `v2.0.1`
- [ ] Exercice 4 : le script de release met à jour les 2 fichiers et crée le tag automatiquement
- [ ] Exercice 5 : tu comprends la différence entre tag léger et annoté (`git cat-file -t`)

## Commandes de référence

```bash
git tag -a v1.0.0 -m "message"     # tag annoté
git tag v1.0.0                      # tag léger
git tag -l "v1.*"                   # lister avec filtre
git show v1.0.0                     # détails d'un tag
git checkout v1.0.0                 # naviguer vers un tag (HEAD détaché)
git push origin --tags              # push tous les tags
git push origin v1.0.0              # push un tag spécifique
git tag -d v1.0.0                   # supprimer en local
git push origin --delete v1.0.0    # supprimer sur le remote
git describe --tags                 # version courante selon le dernier tag
git log --oneline v1.0.0..v2.0.0   # commits entre deux tags
```
