"""Stdlib HTTP server: JSON API + serves the dashboard frontend."""
from __future__ import annotations

import base64
import hmac
import json
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import analytics
import config
import db

_ingest_lock = threading.Lock()
_ingest_state = {"running": False, "last_result": None}
_audit_lock = threading.Lock()
_audit_state = {"running": False, "last_result": None}


def _run_ingest_bg():
    import ingest
    with _ingest_lock:
        if _ingest_state["running"]:
            return
        _ingest_state["running"] = True
    try:
        _ingest_state["last_result"] = ingest.ingest_once()
    except Exception as e:  # noqa: BLE001
        _ingest_state["last_result"] = {"error": str(e)}
    finally:
        _ingest_state["running"] = False


def _run_audit_bg():
    import audit
    with _audit_lock:
        if _audit_state["running"]:
            return
        _audit_state["running"] = True
    try:
        _audit_state["last_result"] = audit.audit()
    except Exception as e:  # noqa: BLE001
        _audit_state["last_result"] = {"error": str(e)}
    finally:
        _audit_state["running"] = False


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):  # quieter logging
        return

    def _authorized(self):
        """HTTP Basic auth gate. Open when no DASH_PASSWORD is configured."""
        if not config.AUTH_PASSWORD:
            return True
        header = self.headers.get("Authorization", "")
        if header.startswith("Basic "):
            try:
                decoded = base64.b64decode(header[6:]).decode("utf-8", "replace")
                user, _, pw = decoded.partition(":")
            except Exception:  # noqa: BLE001
                user = pw = ""
            # constant-time compare to avoid leaking length/prefix via timing
            if hmac.compare_digest(user, config.AUTH_USERNAME) and hmac.compare_digest(
                pw, config.AUTH_PASSWORD
            ):
                return True
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Momentum Dashboard"')
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def _send_json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, content_type):
        try:
            data = path.read_bytes()
        except FileNotFoundError:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if not self._authorized():
            return
        parsed = urllib.parse.urlparse(self.path)
        route = parsed.path
        q = urllib.parse.parse_qs(parsed.query)
        window = (q.get("window", ["weekly"])[0]).lower()
        limit = int(q.get("limit", ["30"])[0])
        source = q.get("source", [None])[0]
        if source in ("", "all"):
            source = None

        try:
            if route in ("/", "/index.html"):
                return self._send_file(config.FRONTEND_DIR / "index.html", "text/html; charset=utf-8")
            if route == "/api/movers":
                return self._send_json(analytics.movers(window, limit, source))
            if route == "/api/overview":
                return self._send_json({
                    **analytics.overview(window, source),
                    "breakdown": analytics.source_breakdown(window),
                })
            if route == "/api/ticker":
                sym = q.get("symbol", [""])[0]
                if not sym:
                    return self._send_json({"error": "symbol required"}, 400)
                return self._send_json({
                    "series": analytics.timeseries(sym, window, source),
                    "posts": analytics.top_posts(sym, window, 10, source),
                })
            if route == "/api/status":
                return self._send_json({**analytics.status(), "ingest": _ingest_state})
            if route == "/api/audit":
                import audit
                return self._send_json({**audit.summary(), "run": _audit_state})
            return self.send_error(404)
        except Exception as e:  # noqa: BLE001
            return self._send_json({"error": str(e)}, 500)

    def do_POST(self):
        if not self._authorized():
            return
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/ingest":
            threading.Thread(target=_run_ingest_bg, daemon=True).start()
            return self._send_json({"started": True})
        if parsed.path == "/api/audit":
            threading.Thread(target=_run_audit_bg, daemon=True).start()
            return self._send_json({"started": True})
        return self.send_error(404)


def main():
    db.init_db()
    server = ThreadingHTTPServer((config.HOST, config.PORT), Handler)
    url = f"http://{config.HOST}:{config.PORT}"
    print(f"Reddit Momentum Dashboard running at {url}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
