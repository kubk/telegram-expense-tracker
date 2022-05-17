#!/usr/bin/env bash

set -e

[ -z "$SSH_PRIVATE_KEY" ] && echo "Missed required variable SSH_PRIVATE_KEY" && exit 1;
[ -z "$SSH_USER_HOST" ] && echo "Missed required variable SSH_USER_HOST" && exit 1;

which ssh-agent
eval $(ssh-agent -s)
ssh-add <(echo "$SSH_PRIVATE_KEY")
mkdir -p ~/.ssh
chmod 700 ~/.ssh

ssh "$SSH_USER_HOST" -o StrictHostKeyChecking=no -A "\
            cd ~/telegram-expense-tracker \
            && git fetch origin master \
            && git reset --hard origin/master \
            && source ~/.nvm/nvm.sh \
            && node -v \
            && npm i \
            && npm run prod:db:migrate \
            && npm run prod:start"
