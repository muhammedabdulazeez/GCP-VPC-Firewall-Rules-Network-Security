# 02. Firewall Hardening & Network Firewall Policies

Moving from permissive `default` VPC rules to least-privilege network segmentation requires replacing broad `0.0.0.0/0` rules with Identity-Aware Proxy (IAP) tunneling, network tags/service accounts, and IAM-governed Network Firewall Policies.

---

## Hardening Steps

### 1. Replace Public SSH & RDP with Identity-Aware Proxy (IAP)

Instead of allowing `tcp:22` and `tcp:3389` from `0.0.0.0/0`, restrict administrative access strictly to Google's IAP forwarding range (`35.235.240.0/20`) and remove public external IPs from compute instances:

```bash
# Delete permissive default SSH and RDP rules
gcloud compute firewall-rules delete default-allow-ssh default-allow-rdp --quiet

# Allow SSH/RDP strictly through IAP TCP forwarding
gcloud compute firewall-rules create allow-iap-ssh-rdp \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:22,tcp:3389 \
  --source-ranges=35.235.240.0/20 \
  --enable-logging
```

### 2. Scope Rules with Service Accounts or Network Tags

Avoid `Apply to all` targets for application ports. Bind ingress rules to explicit **target service accounts** (preferred, IAM-controlled) or **network tags**:

```bash
gcloud compute firewall-rules create allow-https-web-tier \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-service-accounts=web-frontend@PROJECT_ID.iam.gserviceaccount.com \
  --priority=1000 \
  --enable-logging
```

### 3. Enable Firewall Rules Logging

Enable logging on critical allow and explicit deny rules to surface connection telemetry in Cloud Logging and verify hit counts:

```bash
gcloud compute firewall-rules update default-allow-icmp --enable-logging
```

### 4. Adopt Network Firewall Policies

As noted in Cloud NGFW, **Network firewall policies** allow teams to group multiple rules into a single versioned policy object controlled by IAM roles (`compute.networkFirewallPolicyAdmin`), supporting:
- Geo-location, threat intelligence, and FQDN objects
- Address groups instead of hardcoding raw CIDR blocks
- Consistent ordering across subnets and VPCs
