#!/usr/bin/env bash

set -e

[ -z "$DB_NAME" ] && echo "Missed required variable DB_NAME" && exit 1;
[ -z "$DB_USER" ] && echo "Missed required variable DB_USER" && exit 1;
[ -z "$DB_PASSWORD" ] && echo "Missed required variable DB_PASSWORD" && exit 1;
[ -z "$DB_HOST" ] && echo "Missed required variable DB_HOST" && exit 1;

DUMP_NAME=prod.sql
DEV_DB=$(cat .env.dev | grep DATABASE_NAME= | cut -d '=' -f2)

echo "Generating dump..."
PGPASSWORD=$DB_PASSWORD pg_dump -h "$DB_HOST" -U "$DB_USER" -f $DUMP_NAME "$DB_NAME" --no-privileges

echo "Applying dump..."
dropdb "$DEV_DB" && createdb "$DEV_DB"

psql -d "$DEV_DB" -f $DUMP_NAME

echo "Removing dump..."
rm $DUMP_NAME

echo "Done"

