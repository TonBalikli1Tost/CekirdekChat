C++ Signaling Server (server_cpp)

Overview:
- A minimal C++ WebSocket signaling server is included at server_cpp/signaling_server.cpp.
- It uses WebSocket++ and Boost.Asio for networking. The example is intentionally small and focuses on JSON-based signaling messages.

Build:
1. Install dependencies (on Debian/Ubuntu):
   sudo apt-get install libboost-all-dev cmake build-essential
   # Install WebSocket++ and nlohmann/json via your package manager or manually

2. Build with CMake:
   mkdir build && cd build
   cmake ..
   make

3. Run:
   ./signaling_server

Notes:
- The C++ signaling server is compatible with WebSocket-based clients (e.g., browsers using simple-peer over WebSocket signaling).
- For production, add TLS, authentication, and robust peer ID management.

Twisted seeder (Python):
- A lightweight Twisted/WebSocket seeder is in backend-python/twisted_seeder.py and can be used for simple deployments or testing.
- Run: pip install -r backend-python/requirements.txt && python backend-python/twisted_seeder.py

Integration:
- Browser/mobile clients may use a WebSocket to ws://<host>:9002 (C++ server) or ws://<host>:9003 (Twisted seeder).
- simple-peer clients should use the WebSocket to exchange signaling data (offer/answer/candidates).
