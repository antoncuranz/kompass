# Container scans

The build workflows need GitHub Actions secrets `DHI_USERNAME` and `DHI_TOKEN`
for a Docker account with access to `dhi.io`. Secrets are not available to
pull requests from forks, so those builds need a trusted workflow with access
to the registry.

Syft uploads an SPDX SBOM for each built image. Grype scans that SBOM, using
Docker's published VEX for the final DHI runtime base. The transportation API
uses a scratch runtime and has no DHI runtime VEX. Findings are reported in
the job log without a severity gate; scanner or VEX download failures still
fail the job. The exact image scanned is the one pushed on main.
