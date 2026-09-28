# Sovereign AI 401 — Operate Confidential AI with Intel TDX

This repository is the factory workspace for the 401-level Red Hat + Intel
Sovereign AI catalog item. It teaches operators to verify confidential-runtime
identity, appraise Intel TDX evidence, bind secrets and inference authorization
to approved measurements, refuse stale or mismatched evidence, and preserve a
reviewable trust chain.

The current state is factory implementation with a passing deterministic
REHEARSAL journey. It is not orderable, certified, deployable, or promoted.
The factory may build an immutable
REHEARSAL artifact, but LIVE confidential-inference claims require a working
OpenShift Sandboxed Containers confidential workload plus a current verified
TDX quote. Host capability alone is not sufficient.
