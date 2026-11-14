# Context Session Librarian website

Live website: **https://csl.vitral.ai**. Public, without sign-in.

CSL helps developers find, preserve and transfer coding-agent conversations. It
also provides an optional experimental bridge for coordinating existing Codex
agents. This repository contains the static website, not the CLI itself.

CLI source and current releases:
https://github.com/vitral-ai/context-session-librarian.

## Preview

```sh
python3 -m http.server 4387 --bind 127.0.0.1 --directory dist
```

Open http://localhost:4387. No build or dependencies are required.

The worked example replays results from an executed synthetic fixture. It is not
a live terminal or a customer testimonial. JSON evidence and a reproduction
script are included; no personal conversations or credentials are included.
The page does not upload sessions or execute terminal commands in the browser.

## License and product status

Apache-2.0, copyright 2026 Vitral AI Inc. See the CLI repository for the product's
license and notices. Release availability and compatibility are established by
the CLI's published releases and documentation. Updating this website does not
modify an existing CLI tag or validate an untested integration.
