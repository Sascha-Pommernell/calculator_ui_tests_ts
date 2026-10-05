#!/usr/bin/env python3
"""
Replace placeholders in index.html with HTML fragments read from files.

Usage:
    replace-placeholders.py [INDEX_HTML] [REPORTS_FILE] [HISTORY_FILE]

Defaults: site/index.html, /tmp/reports_content.txt, /tmp/history_content.txt
"""
import sys


def main(argv):
    index_html = argv[1] if len(argv) > 1 else "site/index.html"
    replacements = [
        ("<!-- REPORTS_PLACEHOLDER -->", argv[2] if len(argv) > 2 else "/tmp/reports_content.txt"),
        ("<!-- HISTORY_PLACEHOLDER -->", argv[3] if len(argv) > 3 else "/tmp/history_content.txt"),
    ]

    try:
        with open(index_html, "r", encoding="utf-8") as f:
            html_content = f.read()

        for placeholder, fragment_file in replacements:
            with open(fragment_file, "r", encoding="utf-8") as f:
                html_content = html_content.replace(placeholder, f.read())

        with open(index_html, "w", encoding="utf-8") as f:
            f.write(html_content)

        print("HTML placeholders replaced successfully")
        return 0
    except Exception as e:
        print(f"Error replacing placeholders: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
