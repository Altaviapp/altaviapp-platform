#!/bin/sh
# Crea la base y el rol de la aplicación. El rol NO es superusuario: es el dueño de sus
# tablas, pero queda sujeto a la seguridad por fila (FORCE ROW LEVEL SECURITY).
set -eu
psql -v ON_ERROR_STOP=1 --username postgres <<SQL
CREATE ROLE abordo LOGIN PASSWORD '${APP_DB_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE DATABASE abordo OWNER abordo;
SQL
