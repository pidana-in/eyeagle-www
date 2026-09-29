from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parent / "dist"


class AstroPreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        request = urlsplit(self.path)
        path = request.path

        if path == "/.netlify/images":
            source = parse_qs(request.query).get("url", [""])[0].lstrip("/")
            source_path = (ROOT / source).resolve()

            if source and source_path.is_relative_to(ROOT) and source_path.is_file():
                self.path = f"/{source}"
                super().do_GET()
                return

        if path == "/":
            self.path = "/index.html"
        elif not Path(path).suffix:
            html_path = ROOT / f"{path.lstrip('/').rstrip('/')}.html"
            nested_index = ROOT / path.lstrip("/") / "index.html"

            if html_path.is_file():
                self.path = f"{path.rstrip('/')}.html"
            elif nested_index.is_file():
                self.path = f"{path.rstrip('/')}/index.html"

        super().do_GET()


if __name__ == "__main__":
    handler = partial(AstroPreviewHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 4321), handler)
    print("EyEagle preview running at http://127.0.0.1:4321", flush=True)
    server.serve_forever()
