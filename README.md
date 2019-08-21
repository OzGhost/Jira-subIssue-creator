# Jira-subIssue-creator
A chrome extension to create sub-issue automatically for every story in a specified sprint

---

### Auto create missing subtask for every issue in a target sprint
1. Go to jira backlog board
2. Mount the trigger by press __Ctrl + Shift + F__
3. Click on the trigger next to the target sprint name
4. Enjoin

### How to determine a subtask is missing?
1. The scope to check was limited inside a story only
2. For each subtask name in story, turn subtask name to __upper case__ and __remove spaces__ --=> become _cooked name_
3. Transform given subtask name the same way (_upper case_ then _remove spaces_)
4. If the transformed given subtask name __DO NOT__ appear in any _cooked name_ --=> the given subtask name be considered as __missing__

### Config the subtask names 
1. Go to jira
2. Open configurator by press __Ctrl + Shift + E__
3. Input subtask name and enter to add
4. Click the (x) at the end of the subtask name to remove
5. Click Save then the page will reload to apply the change
6. The list of subtask name's is ready to go

### Shortcuts
- __Ctrl + Shift + F__: mount the trigger
- __Ctrl + Shift + E__: open configuration dashboard

