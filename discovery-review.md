# Discovery review

## Decision

Proceed as a distinct 401 operational lab based on the immutable Sovereign AI
301 foundations. Keep it blocked from LIVE and certification until a real
confidential guest can boot, attest, and obtain policy-bound resources.

## Established patterns selected

| Source | Exact revision | Reused pattern | Boundary |
|---|---|---|---|
| Sovereign AI 301 | `d46625e8e1eb89e35c0a93385a47564d825a8115` | fail-closed evidence appraisal, refusal states, human authority, presentation/lab separation | immutable implementation foundation |
| Sovereign AI Lab | `05dea04c2faa95b2df426a228b8979ed7f07a098` | TDX/Kata, attestation, policy, ledger, and operator workflow concepts | read-only because the working tree contains a user-owned modified ledger submodule |

## Material 401 outcome

The learner operates the trust lifecycle rather than merely describing it:

1. observe confidential-compute capability and declared workload identity;
2. launch or inspect the confidential workload boundary;
3. challenge the workload and collect a fresh quote;
4. independently appraise measurements and TCB status;
5. authorize or refuse secret/model access through deterministic policy;
6. run one bounded inference only after authorization;
7. rotate or revoke trust and prove the next request is denied;
8. verify the immutable evidence chain and reclaim the namespace.

## Current blocker

The source lab records that Intel TDX host capability, TDX keys, firmware, the
DCAP operator, and a `kata-cc` RuntimeClass are present, but the confidential VM
guest does not complete the kata-agent/vsock connection. Therefore:

- `tdx-host-confirmed` is capability evidence, not workload attestation;
- simulated evidence must be labeled REHEARSAL;
- no secret release or confidential inference may be called LIVE;
- the 401 factory can complete packaging and negative paths, but Launchpad live
  certification remains blocked on confidential-guest proof.

## Exclusions

- no fabricated Intel Trust Authority response;
- no plaintext demo secrets in manifests;
- no `latest` images;
- no model authorization based only on prose from an LLM;
- no automatic policy promotion or remediation;
- no Launchpad mutation, certification, or promotion by the factory.

