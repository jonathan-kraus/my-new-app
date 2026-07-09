from __future__ import annotations

import re
from pathlib import Path


def main() -> None:
    path = Path("pnpm-lock.yaml")
    text = path.read_text(encoding="utf-8")

    text = text.replace("typescript@7.0.2", "typescript@5.4.5")
    text = text.replace(
        "      typescript:\n        specifier: 7.0.2\n        version: 7.0.2",
        "      typescript:\n        specifier: 5.4.5\n        version: 5.4.5",
    )
    text = text.replace(
        "  typescript@5.4.5:\n"
        "    resolution: {integrity: sha512-8FYau96o3NKOhbjKi/qNvG/W5jhzxkbdm5sj9AbZ/5T5sWqn3hJgLfGx27sRKZWTvyzCP8dLRBTf5tBTSRVUNA==}\n"
        "    engines: {node: '>=16.20.0'}\n"
        "    hasBin: true",
        "  typescript@5.4.5:\n"
        "    resolution: {integrity: sha512-vcI4UpRgg81oIRUFwR0WSIHKt11nJ7SAVlYNIu+QpqeyXP+gpQJy/Z4+F0aGxSE4MqwjyXvW/TzgkLAx2AGHwQ==}\n"
        "    engines: {node: '>=14.17'}\n"
        "    hasBin: true",
    )

    text = re.sub(
        r"^  '@typescript/typescript-[^']+@7\.0\.2':\n(?:    [^\n]+\n)+\n",
        "",
        text,
        flags=re.M,
    )
    text = re.sub(
        r"^  '@typescript/typescript-[^']+@7\.0\.2': \{\}\n",
        "",
        text,
        flags=re.M,
    )
    text = re.sub(
        r"^  typescript@5\.4\.5:\n"
        r"    optionalDependencies:\n"
        r"(?:      '@typescript/typescript-[^']+': 7\.0\.2\n)+\n",
        "  typescript@5.4.5: {}\n\n",
        text,
        flags=re.M,
    )

    path.write_text(text, encoding="utf-8")
    print("lines", len(text.splitlines()))
    print("remaining platform refs", text.count("@typescript/typescript-"))
    print("remaining ts7 refs", text.count("typescript@7.0.2"))


if __name__ == "__main__":
    main()
