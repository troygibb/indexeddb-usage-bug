# indexeddb-usage-bug

Reproduces a chrome bug that results in runaway indexeddb usage.

## Chrome bug submission

[Issue 1035025: Multiple concurrent IndexedDB delete, open, fill and openCursor operations leads to linearly increasing disk usage](https://bugs.chromium.org/p/chromium/issues/detail?id=1035025)

### Please enter a one-line summary

Multiple concurrent IndexedDB delete, open, fill and openCursor operations leads to linearly increasing disk usage.

### Do you have a reduced test case?

See ![index.html](./index.html), or view it hosted here: https://troygibb.github.io/indexeddb-usage-bug/.

### Does this feature work correctly in other browsers?

Yes -- although I've only tested in Firefox. I assume the behavior is different because Chrome's IndexedDB implementation is built on top of LevelDB whereas Firefox uses SQLite. The logic in my reduced test case does not work in Firefox since I use a few Chrome specific apis (e.g. `indexedDB.databases()`), but this app could easily be refactored for that use case. 

### Steps to reproduce the problem:

1. Load the provided ![index.html](./index.html) file (or go here: https://troygibb.github.io/indexeddb-usage-bug/).
2. Wait until `Total IndexedDB size` message is produced.
3. Reload.
4. Observe that the IndexedDB size is now much higher than it was after the first load.
5. Repeat and watch the IndexedDB size approximately linearly increase, even though the number of databases remains constant.

### What is the expected behavior?

That the `deleteDatabase` operations that proceed each newly created IndexedDB database would lead to constant disk usage.

### What went wrong?

As disk usage increases, our web app becomes increasingly sluggish, and eventually, unusable.

### Did this work before?

Not that I'm aware of.
