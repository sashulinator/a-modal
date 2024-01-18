# a-modal

## Description

A Modal Component

## Features

### Return focus

Returns the focus back to the element that was in focus before opening the modal

## Subtree

### `pull`/`push`

```bash
# Push
git subtree push --prefix=src/abstract/modal a-modal master
# Pull
git subtree pull --prefix=src/abstract/modal a-modal master
# Force
git push a-modal `git subtree split --prefix=src/abstract/modal @`:master --force
```

### `diff`

```
git --no-pager diff a-modal/master master:src/abstract/modal
```

### Add to your project

1. Add a repository alias `git remote add a-modal git@github.com:sashulinator/a-modal.git`
2. To check a list of aliases `git remote -v`, you must see `a-modal`
3. Check that your project has no changes
4. run `git subtree add --prefix=src/abstract/modal a-modal master`
