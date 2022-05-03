#!/bin/bash

ssh ec2 "cd ~/telegram-expense-tracker \
            && git fetch origin master \
            && git reset --hard origin/master \
            && source ~/.nvm/nvm.sh \
            && node -v \
            && npm i \
            && npm run prod:db:migrate \
            && npm run prod:start"
