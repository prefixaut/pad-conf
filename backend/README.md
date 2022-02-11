# Backend

This backend is an intermediate hub used to enable communinication between the calibration application and the actual board.

For the communication between the Calibration App and the Backend, a WebSocket API is being used.
Models for that can be found at [/common/src/api.ts](/common/src/api.ts).

For the communication between the Backend and the board, a small line-based protocol is being used.
A detailed documentation for it can be found at [/docs/FIRMWARE_PROTOCOL.md](/docs/FIRMWARE_PROTOCOL.md).

# Commands

* `backend:serve`: Start the backend in development mode with auto-restart on file-change
* `backend:build`: Builds the backend and outputs a bundle to execute
