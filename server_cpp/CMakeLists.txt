cmake_minimum_required(VERSION 3.10)
project(cekirdek_signaling_cpp)

set(CMAKE_CXX_STANDARD 17)

# You need Boost.Asio (standalone or via Boost) and WebSocket++ header files available.
# This CMake file assumes WebSocket++ is available in /usr/include or via system packages.

find_package(Boost REQUIRED COMPONENTS system)

include_directories(${Boost_INCLUDE_DIRS})

add_executable(signaling_server signaling_server.cpp)

target_link_libraries(signaling_server PRIVATE ${Boost_LIBRARIES})

# If you use standalone Asio, link with pthread on POSIX
if(UNIX)
  target_link_libraries(signaling_server PRIVATE pthread)
endif()
