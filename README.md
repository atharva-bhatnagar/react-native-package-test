# React native package test

### for canister deployment -->

1. run mops i
2. dfx start
3. dfx deps pull
4. dfx deps deploy
5. dfx deploy
6. get the canister id of backend canister

### for react native app -->

1. run 'npm i --force' if 'npm i' gives error
2. change the canister id passed in createactor function in index.js to your backend canister id(line number 125)
3. change the canister id in canister in src/declarations/backend/index.js to your backend canister id (line 12)
4. install adb if not available
5. change the URL to your LoginWeb url you get after dfx deploy command in index.js (line 47)
6. use 'adb reverse tcp:4943 tcp:4943'
7. npm start
