// Basic C++ WebSocket signaling server example using WebSocket++ and Boost.Asio
// NOTE: This is a minimal example. To compile and run you'll need WebSocket++ headers and Boost.

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>

#include <iostream>
#include <set>
#include <map>
#include <mutex>
#include <nlohmann/json.hpp> // optional, can parse manually if not available

using websocketpp::connection_hdl;
using server = websocketpp::server<websocketpp::config::asio>;

std::mutex g_lock;
std::map<std::string, std::set<connection_hdl, std::owner_less<connection_hdl>>> rooms;

void on_open(server* s, connection_hdl h) {
    std::lock_guard<std::mutex> lock(g_lock);
    std::cout << "client connected" << std::endl;
}

void on_close(server* s, connection_hdl h) {
    std::lock_guard<std::mutex> lock(g_lock);
    // remove from all rooms
    for (auto &kv : rooms) {
        kv.second.erase(h);
    }
    std::cout << "client disconnected" << std::endl;
}

void on_message(server* s, connection_hdl h, server::message_ptr msg) {
    try {
        auto payload = msg->get_payload();
        auto j = nlohmann::json::parse(payload);
        std::string type = j.value("type", "");
        if (type == "join") {
            std::string room = j.value("room", "default");
            std::lock_guard<std::mutex> lock(g_lock);
            rooms[room].insert(h);
            // send peers list
            std::vector<std::string> peers;
            for (const auto& conn : rooms[room]) {
                // Not including id mapping in this simple example
            }
            nlohmann::json out = { {"type","peers"}, {"peers", nlohmann::json::array()} };
            s->send(h, out.dump(), websocketpp::frame::opcode::text);
        } else if (type == "signal") {
            std::string target = j.value("target", "");
            std::string room = j.value("room", "");
            std::lock_guard<std::mutex> lock(g_lock);
            if (rooms.count(room)) {
                for (auto &conn : rooms[room]) {
                    // Broadcast to everyone except sender
                    if (conn.lock().get() != h.lock().get()) {
                        s->send(conn, payload, websocketpp::frame::opcode::text);
                    }
                }
            }
        }
    } catch (const std::exception &e) {
        std::cerr << "error parsing message: " << e.what() << std::endl;
    }
}

int main() {
    server ws_server;
    try {
        ws_server.init_asio();
        ws_server.set_open_handler(bind(&on_open, &ws_server, std::placeholders::_1));
        ws_server.set_close_handler(bind(&on_close, &ws_server, std::placeholders::_1));
        ws_server.set_message_handler(bind(&on_message, &ws_server, std::placeholders::_1, std::placeholders::_2));

        ws_server.listen(9002);
        ws_server.start_accept();
        std::cout << "C++ signaling server listening on :9002" << std::endl;
        ws_server.run();
    } catch (const std::exception &e) {
        std::cerr << "Exception: " << e.what() << std::endl;
    }
    return 0;
}
