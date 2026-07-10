# Çekirdek Chat

The primary objective of the **Çekirdek Chat** project is to engineer a serverless, zero-configuration, and end-to-end encrypted (E2EE) peer-to-peer (P2P) communication architecture tailored for a localized 5-member user group. The infrastructure is systematically optimized to eliminate external server overhead, maintenance costs, and complex network configurations such as port forwarding.

The comprehensive core values and architectural paradigms of the project are defined below:

### 1. Decentralized Peer-to-Peer Architecture

Unlike conventional communication platforms that rely on centralized data persistence, Çekirdek executes direct node-to-node data transmission. Utilizing the **Simple-peer (WebRTC)** framework, the application programmatically bypasses symmetric and asymmetric NAT firewalls, mitigating the necessity for manual router configuration or network address translation adjustments.

### 2. Hybrid Technical Framework Matrix

The system capitalizes on a hybrid deployment strategy to maximize runtime efficiency and minimize resource allocation:

* **80% C# / C++ / JS Integration Layer:** Manages the core user interface (UI) rendering, real-time audio encoding/decoding engines, and multi-platform native asset handling without impacting concurrent system performance.
* **20% Python (Twisted) Layer:** Operates as a lightweight UDP DatagramProtocol discovery service, acting as a secure signaling directory that facilitates initial peer discovery and connection scheduling.

### 3. Data Mitigation and Privacy Enforcement

To ensure absolute compliance with free-tier cloud infrastructure limitations and strict user privacy protocols, the system enforces the following policies:

* **Automated Ledger Truncation:** To minimize data storage overhead, chat channels enforce a strict 50-message retention cap. Upon reaching this threshold, an automated database trigger purges the historical 40 records to maintain an optimized footprint.
* **Anonymous Authentication:** Integrated session management permits secure network access via custom cryptographic or anonymous tokens, entirely bypassing the necessity for personally identifiable information (PII) such as telephony data or email addresses.

### 4. Advanced Operational Capabilities

The architecture delivers a comprehensive enterprise-grade feature set designed for seamless daily execution:

* **Synchronous Low-Latency Audio:** Direct WebRTC media streaming ensures real-time vocal data transfer with minimal packet loss and absolute latency mitigation.
* **Dynamic Asset Lifecycle Management:** File transfers up to 5 GB are routed via Supabase Storage and native localized caches. Upon verified P2P receipt confirmation, assets are immediately deprecated from cloud storage to optimize available capacity.
* **Cross-Platform Interoperability:** A unified codebase structure ensures consistent binary compilation across Windows environments (.exe), mobile deployments (.apk), and standard web browsers.
