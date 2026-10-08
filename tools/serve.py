"""Local preview that behaves like Cloudflare Pages: /patna serves patna.html.

Usage (from the project folder):  python tools/serve.py   then open http://localhost:8000
"""
import http.server, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        local = os.path.join(ROOT, path.lstrip("/"))
        if not os.path.exists(local) and os.path.exists(local + ".html"):
            self.path = path + ".html" + self.path[len(path):]
        elif not os.path.exists(local):
            self.path = "/404.html"
        return super().send_head()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Serving {ROOT} at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), CleanURLHandler).serve_forever()
