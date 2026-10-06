#!/usr/bin/env bash
# Root-side setup for Fiery Mud NEXT. Run with sudo.
#   sudo ./setup-root.sh prepare   # take over /opt/NEXT (old C++ -> backup), perms, env links, postgres, apache, units
#   sudo ./setup-root.sh certs     # certbot for muditor + muditor-api (needs DNS)
#   sudo ./setup-root.sh start     # start the three services and smoke test
#   sudo ./setup-root.sh opt-perms # chmod g+x /opt (only that bit)
#   sudo ./setup-root.sh units     # reinstall systemd units from the kit + daemon-reload
#   sudo ./setup-root.sh game-cert # game TLS (4443): use the Let's Encrypt cert + certbot deploy hook for renewals
# Idempotent. Never prints secrets.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then echo "run with sudo" >&2; exit 1; fi

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXT=/opt/NEXT
SRC_HOME=/home/strider/fierymudv3
OLD_OPT=/opt/V3   # earlier staging location (migrated if present)
DOM_WEB=muditor.fierymud.org
DOM_API=muditor-api.fierymud.org

step() { printf '\n== %s ==\n' "$*"; }

apache_vhost_summary() {
  echo "-- apache2ctl -S (ports 80/443) --"
  apache2ctl -S 2>&1 | grep -E '443|80' || true
}

apache_reload_checked() {
  if ! apache2ctl configtest; then
    echo "ERROR: apache configtest failed; disabling 05-muditor and NOT reloading" >&2
    a2dissite 05-muditor >/dev/null || true
    exit 1
  fi
  systemctl reload apache2
}

do_certs() {
  step "certbot ($DOM_WEB, $DOM_API)"
  if ! getent hosts "$DOM_WEB" >/dev/null; then
    echo "DNS not set yet: rerun \`sudo ./setup-root.sh certs\` after adding the CNAMEs"
    return 0
  fi
  getent hosts "$DOM_API" >/dev/null || { echo "DNS for $DOM_API not resolving yet; rerun certs after adding the CNAME"; return 0; }
  local args=(--apache --non-interactive --agree-tos --keep-until-expiring --redirect -d "$DOM_WEB" -d "$DOM_API")
  local out
  if ! out="$(/usr/bin/certbot "${args[@]}" 2>&1)"; then
    if grep -qiE 'no.*account|email' <<<"$out"; then
      echo "certbot reports no account/email; retrying with --register-unsafely-without-email"
      /usr/bin/certbot "${args[@]}" --register-unsafely-without-email
    else
      printf '%s\n' "$out" >&2
      return 1
    fi
  else
    printf '%s\n' "$out" | tail -n 15
  fi
  apache_reload_checked
  apache_vhost_summary
}

# Install kit units into /etc/systemd/system, expanding @BACKUP_PATHS@.
# InaccessiblePaths does not take globs: expand any old-install backups explicitly.
# Usage: install_units unit-name...   (no daemon-reload here)
install_units() {
  local hidden=() b u
  for b in /opt/NEXT.cpp-backup-*; do [[ -d $b ]] && hidden+=("-$b"); done
  for u in "$@"; do
    # fieryNT.service in /etc/systemd/system overrides the vendor /usr/lib/systemd/system/fieryNT.service (left untouched)
    sed "s#@BACKUP_PATHS@#${hidden[*]:-}#" "$KIT_DIR/units/$u.service" > "/etc/systemd/system/$u.service"
    chmod 644 "/etc/systemd/system/$u.service"
  done
}

do_opt_perms() {
  step "/opt traversal (add g+x only)"
  echo "before: $(stat -c '%A %U:%G' /opt)"
  chmod g+x /opt
  echo "after:  $(stat -c '%A %U:%G' /opt)"
}

do_units() {
  step "install systemd units from $KIT_DIR/units"
  local f names=()
  for f in "$KIT_DIR"/units/*.service; do names+=("$(basename "$f" .service)"); done
  install_units "${names[@]}"
  systemctl daemon-reload
  systemctl show -p TimeoutStopUSec muditorNT-api
}

do_prepare() {
  # --- 1. retire units of the earlier staging layout (their paths/DB no longer exist after the move)
  step "retire earlier-layout units (if any)"
  local old_units=(fieryV3 muditorV3-api muditorV3-web) ou found_old=0
  for ou in "${old_units[@]}"; do
    if [[ -e /etc/systemd/system/$ou.service ]]; then found_old=1; fi
  done
  if (( found_old )); then
    for ou in "${old_units[@]}"; do systemctl disable --now "$ou" 2>/dev/null || true; done
    for ou in "${old_units[@]}"; do rm -f "/etc/systemd/system/$ou.service"; done
    systemctl daemon-reload
    for ou in "${old_units[@]}"; do systemctl reset-failed "$ou" 2>/dev/null || true; done
    echo "old units disabled and removed"
  else
    echo "none present"
  fi

  step "relocate to $NEXT (takeover of the old C++ NEXT install)"
  if [[ -L $NEXT ]]; then
    echo "ERROR: $NEXT is a symlink; refusing to proceed (chown/chmod -R would follow into the target)" >&2
    exit 1
  fi
  if [[ -d $NEXT/fierymud-rs ]]; then
    # already our tree (re-run): never stop the new services or move anything
    echo "$NEXT already holds the Rust tree; leaving in place"
  else
    # --- 2/3. locate the staged tree: the earlier /opt location, else wherever the staging symlink points
    SRC_REAL=""
    if [[ -d $OLD_OPT/fierymud-rs && ! -L $OLD_OPT ]]; then
      SRC_REAL=$OLD_OPT
    else
      SRC_REAL="$(readlink -f "$SRC_HOME" 2>/dev/null || true)"
    fi
    [[ -n $SRC_REAL && -d $SRC_REAL/fierymud-rs && $SRC_REAL != "$NEXT" && ( $SRC_REAL == /home/strider/* || $SRC_REAL == /opt/* ) ]] \
      || { echo "ERROR: no staged tree found (looked at $OLD_OPT and $SRC_HOME -> '$SRC_REAL'; need fierymud-rs/ under /home/strider or /opt)" >&2; exit 1; }
    if [[ -e $NEXT ]]; then
      if [[ -f $NEXT/fierymud ]]; then
        echo "old C++ install detected in $NEXT; stopping fieryNT"
        systemctl stop fieryNT || true
        systemctl disable fieryNT || true
        systemctl reset-failed fieryNT 2>/dev/null || true
        BACKUP="$NEXT.cpp-backup-$(date +%F)"
        [[ -e $BACKUP ]] && BACKUP="$BACKUP-$(date +%H%M%S)"
        mv "$NEXT" "$BACKUP"
        echo "old C++ install moved to $BACKUP"
      else
        echo "ERROR: $NEXT exists but is neither the old C++ install (no fierymud binary) nor ours (no fierymud-rs/); refusing" >&2
        exit 1
      fi
    fi
    mv "$SRC_REAL" "$NEXT"
    echo "moved $SRC_REAL -> $NEXT"
  fi
  # the kit may have just moved with the tree
  if [[ -n "${SRC_REAL:-}" && "$KIT_DIR" == "$SRC_REAL"/* ]]; then KIT_DIR="$NEXT${KIT_DIR#"$SRC_REAL"}"; fi

  # home symlinks (the earlier one may be root-owned): recreate, owned by strider
  local hl
  for hl in "$SRC_HOME" /home/strider/fierynext; do
    if [[ -L $hl || ! -e $hl ]]; then
      rm -f "$hl"; ln -sfn "$NEXT" "$hl"; chown -h strider:strider "$hl"
    else
      echo "WARNING: $hl exists and is not a symlink; left alone" >&2
    fi
  done

  # re-point symlinks inside the tree that still target the earlier location
  local lk tgt
  while IFS= read -r -d '' lk; do
    tgt="$(readlink "$lk")"
    ln -sfn "$NEXT/${tgt#"$OLD_OPT"/}" "$lk"
    echo "relinked ${lk#"$NEXT"/}"
  done < <(find "$NEXT" -maxdepth 4 -type l -lname "$OLD_OPT/*" -print0)

  step "ownership and permissions"
  id fierymud >/dev/null
  chown -R strider:fierymud "$NEXT"
  chmod 2750 "$NEXT"
  # g+rxs: new subdirs inherit group fierymud
  find "$NEXT" -type d -not -path "$NEXT/.secrets" -not -path "$NEXT/.secrets/*" -exec chmod g+rxs {} +
  chmod 700 "$NEXT/.secrets"
  mkdir -p "$NEXT/logs"
  chown strider:fierymud "$NEXT/logs"
  chmod 2770 "$NEXT/logs"
  # HOME for the services, and the mud's state/ snapshots (cwd-relative writes)
  mkdir -p "$NEXT/run" "$NEXT/fierymud-rs/state"
  chown strider:fierymud "$NEXT/run" "$NEXT/fierymud-rs/state"
  chmod 2770 "$NEXT/run" "$NEXT/fierymud-rs/state"
  find "$NEXT/fierymud-rs/state" -type f -exec chmod g+rw {} + -exec chgrp fierymud {} +
  chmod 640 "$NEXT"/env/*
  # TLS key must be readable by the fierymud group
  [[ -f $NEXT/certs/server.key ]] && chmod 640 "$NEXT/certs/server.key"
  [[ -f $NEXT/certs/server.crt ]] && chmod 644 "$NEXT/certs/server.crt"
  # bun must be executable by fierymud
  chmod -R g+rX "$NEXT/tools"

  step "env file links"
  ln -sfn "$NEXT/env/fierymud-rs.env" "$NEXT/fierymud-rs/.env"
  ln -sfn "$NEXT/env/muditor.env"     "$NEXT/.env"
  ln -sfn "$NEXT/.env"                "$NEXT/muditor/.env"
  ln -sfn "$NEXT/.env"                "$NEXT/muditor/apps/web/.env"
  ln -sfn "$NEXT/env/fierylib.env"    "$NEXT/fierylib/.env"

  step "postgresql role + database"
  local pw
  pw="$(tr -d '\r\n' < "$NEXT/.secrets/pg_password")"
  # migrate the earlier role/database names in place (keeps the imported data)
  if [[ -n $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_roles WHERE rolname='fierymudv3'") \
     && -z $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_roles WHERE rolname='fierynext'") ]]; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -q -c 'ALTER ROLE fierymudv3 RENAME TO fierynext'
    echo "role fierymudv3 renamed to fierynext"
  fi
  if [[ -n $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_database WHERE datname='fierymudv3'") \
     && -z $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_database WHERE datname='fierynext'") ]]; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -q -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='fierymudv3' AND pid <> pg_backend_pid()" >/dev/null
    sudo -u postgres psql -v ON_ERROR_STOP=1 -q -c 'ALTER DATABASE fierymudv3 RENAME TO fierynext'
    echo "database fierymudv3 renamed to fierynext"
  fi
  if [[ -z $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_roles WHERE rolname='fierynext'") ]]; then
    # password passed via psql variable on stdin so it never appears in argv/output
    printf '%s\n' "\\set pw '$pw'" "CREATE ROLE fierynext LOGIN PASSWORD :'pw';" \
      | sudo -u postgres psql -v ON_ERROR_STOP=1 -q
    echo "role fierynext created"
  else
    echo "role fierynext exists"
  fi
  # always sync the password with .secrets/pg_password
  printf '%s\n' "\\set pw '$pw'" "ALTER ROLE fierynext PASSWORD :'pw';" \
    | sudo -u postgres psql -v ON_ERROR_STOP=1 -q
  echo "role password synced from .secrets/pg_password"
  if [[ -z $(sudo -u postgres psql -Atc "SELECT 1 FROM pg_database WHERE datname='fierynext'") ]]; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -q -c 'CREATE DATABASE fierynext OWNER fierynext'
    echo "database fierynext created"
  else
    echo "database fierynext exists"
  fi
  # refresh pgpass for the new db/user (same password); psql tooling uses it
  ( umask 077; printf '127.0.0.1:5432:fierynext:fierynext:%s\n' "$pw" > "$NEXT/.secrets/pgpass" )
  chown strider:strider "$NEXT/.secrets/pgpass"; chmod 600 "$NEXT/.secrets/pgpass"
  echo "pgpass rewritten"
  unset pw

  step "apache"
  echo "(BEFORE enabling the muditor site)"
  apache_vhost_summary
  a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl >/dev/null
  install -m 644 "$KIT_DIR/apache/05-muditor.conf" /etc/apache2/sites-available/05-muditor.conf
  a2ensite 05-muditor >/dev/null
  apache_reload_checked
  echo "(AFTER reload; confirm muditor did not become the default for unknown hosts)"
  apache_vhost_summary
  do_certs || echo "WARNING: certbot step failed (see above); fix and rerun: sudo $0 certs"

  step "systemd units (enabled, not started)"
  install_units fieryNT muditorNT-api muditorNT-web
  systemctl daemon-reload
  systemctl enable fieryNT muditorNT-api muditorNT-web

  step "firewall"
  if command -v ufw >/dev/null && ufw status | grep -q 'Status: active'; then
    ufw allow 4003/tcp
    ufw allow 4443/tcp
  else
    echo "ufw not active; nothing to do"
  fi

  cat <<NEXT

Prepare done.
$( [[ -n "${hidden[*]:-}" ]] && echo "The old C++ NEXT install is preserved at ${hidden[*]#-} (its .env holds the old remote DB creds); delete it later with sudo once happy." )
Next:
  1. as strider:  $NEXT/deploy/phase2-strider.sh     (import, build; needs the rust build finished)
  2. then:        sudo $NEXT/deploy/setup-root.sh start
  3. after DNS:   sudo $NEXT/deploy/setup-root.sh certs
NEXT
}

do_game_cert() {
  step "game TLS certificate (Let's Encrypt -> $NEXT/certs)"
  local live=/etc/letsencrypt/live lineage="" d
  for d in fierymud.org doom.fierymud.org; do
    if [[ -r $live/$d/fullchain.pem && -r $live/$d/privkey.pem ]]; then lineage="$live/$d"; break; fi
  done
  if [[ -z $lineage ]]; then
    echo "No Let's Encrypt lineage for fierymud.org or doom.fierymud.org under $live." >&2
    echo "Obtain one with:" >&2
    echo "  certbot certonly --apache -d fierymud.org -d doom.fierymud.org" >&2
    exit 1
  fi
  echo "lineage: $lineage"
  openssl x509 -noout -subject -ext subjectAltName -enddate -in "$lineage/fullchain.pem"

  local hook=/etc/letsencrypt/renewal-hooks/deploy/fierynext-game-cert.sh
  local flag="$NEXT/run/game-cert-autorestart"
  mkdir -p "$(dirname "$hook")"
  # quoted heredoc; the lineage path is substituted below
  cat > "$hook.tmp" <<'HOOK'
#!/usr/bin/env bash
# Installed by setup-root.sh game-cert. Certbot deploy hook: publish the renewed cert to the Rust game server.
# Runs for every renewal; acts only for the game lineage (or when run by hand with no RENEWED_LINEAGE).
# The game (rustls) cannot reload certs live: it restarts fieryNT after copying iff the flag file exists.
# Remove /opt/NEXT/run/game-cert-autorestart to stop renewals from restarting the game.
# Never prints key material.
set -euo pipefail
LINEAGE="@LINEAGE@"
DEST=/opt/NEXT/certs
FLAG=/opt/NEXT/run/game-cert-autorestart
if [[ -n ${RENEWED_LINEAGE:-} && ${RENEWED_LINEAGE%/} != "$LINEAGE" ]]; then exit 0; fi
CRT="$LINEAGE/fullchain.pem"; KEY="$LINEAGE/privkey.pem"
# the key must belong to the certificate (compare public keys; works for RSA and EC)
c="$(openssl x509 -noout -pubkey -in "$CRT" | openssl sha256)"
k="$(openssl pkey -pubout -in "$KEY" | openssl sha256)"
if [[ $c != "$k" ]]; then echo "game-cert: key does not match certificate in $LINEAGE; aborting" >&2; exit 1; fi
for f in server.crt server.key; do
  [[ -f $DEST/$f ]] && cp -p "$DEST/$f" "$DEST/$f.bak"
done
install -o strider -g fierymud -m 0640 "$CRT" "$DEST/server.crt"
install -o strider -g fierymud -m 0640 "$KEY" "$DEST/server.key"
[[ -f $DEST/server.crt.bak ]] && chown strider:fierymud "$DEST/server.crt.bak" "$DEST/server.key.bak" 2>/dev/null || true
echo "game-cert: installed $(basename "$LINEAGE") cert into $DEST"
if [[ -z ${GAME_CERT_NO_RESTART:-} && -e $FLAG ]]; then
  systemctl restart fieryNT
  echo "game-cert: restarted fieryNT"
fi
HOOK
  sed -i "s#@LINEAGE@#$lineage#" "$hook.tmp"
  chown root:root "$hook.tmp"; chmod 755 "$hook.tmp"
  mv -f "$hook.tmp" "$hook"
  echo "deploy hook: $hook"
  touch "$flag"; chown strider:fierymud "$flag"; chmod 640 "$flag"
  echo "auto-restart flag: $flag (remove it to stop renewals from restarting fieryNT)"

  step "install now (hook), then restart fieryNT"
  GAME_CERT_NO_RESTART=1 "$hook"
  systemctl restart fieryNT
  sleep 5
  echo "fieryNT: $(systemctl is-active fieryNT || true)"
  openssl s_client -connect 127.0.0.1:4443 -servername fierymud.org </dev/null 2>/dev/null \
    | openssl x509 -noout -subject -issuer -enddate || echo "WARNING: could not read the cert served on 127.0.0.1:4443" >&2
}

do_start() {
  step "starting services"
  systemctl start fieryNT muditorNT-api muditorNT-web
  sleep 5
  for u in fieryNT muditorNT-api muditorNT-web; do
    printf '%-18s %s\n' "$u" "$(systemctl is-active "$u" || true)"
  done
  systemctl --no-pager --lines=0 status fieryNT muditorNT-api muditorNT-web | grep -E '^(●|\s+Active:)' || true

  step "http checks"
  local tok code
  tok="$(tr -d '\r\n' < "$NEXT/.secrets/admin_token")"
  code="$(curl -s -o /dev/null -m 10 -w '%{http_code}' http://127.0.0.1:3001/graphql || true)"
  echo "api   :3001/graphql                 -> HTTP $code"
  code="$(curl -s -o /dev/null -m 10 -w '%{http_code}' http://127.0.0.1:3000/ || true)"
  echo "web   :3000/                        -> HTTP $code"
  # header goes via a curl config on stdin so the token never appears in argv
  code="$(printf 'header = "Authorization: Bearer %s"\n' "$tok" \
    | curl -s -o /dev/null -m 10 -w '%{http_code}' -K - http://127.0.0.1:8080/api/admin/world/status || true)"
  echo "admin :8080/api/admin/world/status  -> HTTP $code"
  unset tok

  step "listening sockets"
  ss -ltn | awk 'NR==1 || $4 ~ /:(4003|4443|8080|3000|3001)$/'
  echo
  echo "Logs: journalctl -u fieryNT -u muditorNT-api -u muditorNT-web -f"
}

case "${1:-}" in
  prepare) do_prepare ;;
  certs)   do_certs ;;
  start)   do_start ;;
  opt-perms) do_opt_perms ;;
  units)   do_units ;;
  game-cert) do_game_cert ;;
  *) echo "usage: sudo $0 prepare|certs|start|opt-perms|units|game-cert" >&2; exit 2 ;;
esac
