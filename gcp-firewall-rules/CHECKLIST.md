# GCP VPC Firewall Security Audit Checklist

Use this checklist when auditing default VPC networks or reviewing Cloud NGFW firewall policy changes.

## 01. Default Rule Cleanup

- [ ] `default-allow-ssh` (`tcp:22` from `0.0.0.0/0`) is removed or restricted to specific bastion/admin CIDRs.
- [ ] `default-allow-rdp` (`tcp:3389` from `0.0.0.0/0`) is removed or replaced with IAP tunneling.
- [ ] `default-allow-icmp` is reviewed and restricted if external ping discovery is unnecessary.
- [ ] `default-allow-internal` (`tcp:0-65535`, `udp:0-65535`) is narrowed to required service ports and tiers.

## 02. Least-Privilege & Identity Controls

- [ ] Administrative SSH/RDP traffic uses Identity-Aware Proxy (`35.235.240.0/20`) rather than public IPs.
- [ ] Ingress rules target specific **service accounts** or network tags instead of **Apply to all**.
- [ ] Network firewall policies are governed via IAM least-privilege roles.
- [ ] Operators auditing inherited policies hold `compute.organizations.listAssociations` (read-only) where appropriate.

## 03. Observability & Egress Controls

- [ ] Firewall Rules Logging is enabled (`Logs: On`) for perimeter allow and deny rules.
- [ ] Explicit deny-egress or DNS/proxy controls supplement GCP's built-in `SMTP port 25` restriction.
