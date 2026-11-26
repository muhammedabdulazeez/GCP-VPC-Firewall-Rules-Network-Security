# 04. Username Enumeration & Timing Attacks

Determining whether an account exists is frequently the first step in a targeted credential-stuffing or brute-force campaign.

---

## Root Cause

Applications inadvertently reveal account existence either through inconsistent error copy or through measurable CPU timing differences when password hashing is skipped for nonexistent users.

## How to Find It (Step-by-Step)

1. **Error Message Analysis**
   Attempt to log in with a known fake username and compare the response against a valid username with a wrong password. Look for distinct responses such as:
   - `"Invalid User"` vs. `"Invalid Password"`
   - Subtle differences in HTTP status codes, whitespace, or redirect targets.

2. **Timing Analysis in Burp Intruder**
   Send a wordlist of ~100 candidate usernames (mixing fake names and likely real accounts like `admin` or `carlos`) to the login endpoint using **Burp Intruder** (use a single thread or controlled concurrency to reduce network jitter).

3. **Inspect Response Latency**
   Sort the Intruder results by the **Response received / Time** column:
   - `fakeuser` completes in **~10 ms** (database lookup returns null, hashing skipped).
   - `admin` completes in **~200 ms** (server spends CPU cycles executing bcrypt/Argon2 verification).

   That latency gap leaks that `admin` is a valid account.

---

## Defensive Engineering

- **Generic Error Messaging**
  Always return an identical message and HTTP status code for every authentication failure:
  ```text
  "Invalid username or password."
  ```
- **Constant-Time Validation**
  When a username is not found in the database, perform a **dummy password hash calculation** using the same cost factor before returning the error response so valid and invalid usernames exhibit uniform latency.
