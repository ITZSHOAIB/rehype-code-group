# Security Policy

## Supported versions

Security fixes are provided for the latest stable release. During the 1.0
release-candidate period, the latest 0.x release is also supported.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do
not open a public issue for a suspected vulnerability.

Include the affected version, a minimal reproduction, impact, and any known
mitigation. You can expect an acknowledgement within 48 hours and an initial
assessment within seven days. Confirmed issues will be coordinated privately
until a patched release and advisory are ready.

## Dependency policy

Pull requests are blocked by known vulnerabilities in production dependencies
and by critical or high vulnerabilities in development dependencies. Releases
require a clean full dependency audit. A temporary exception must document the
advisory, reachability, mitigation, owner, and an expiry of no more than 30
days.

Dependency install scripts are denied by default and explicitly reviewed.
Published packages use npm trusted publishing with provenance.
