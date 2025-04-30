import pytest
import asyncio
import websockets
import json
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_websocket_connection():
    """Test basic WebSocket connectivity and message counting"""
    uri = "ws://localhost:8001/ws/chat/"
    
    async with websockets.connect(uri) as websocket:
        # Test connection ID
        response = await websocket.recv()
        data = json.loads(response)
        assert "connectionId" in data
        
        # Test message counting
        await websocket.send("test message")
        response = await websocket.recv()
        data = json.loads(response)
        assert data["count"] == 1
        
        # Test heartbeat
        start_time = datetime.now()
        while datetime.now() - start_time < timedelta(seconds=35):
            response = await websocket.recv()
            data = json.loads(response)
            if "ts" in data:
                break
            await asyncio.sleep(1)
        
        assert "ts" in data

@pytest.mark.asyncio
async def test_graceful_shutdown():
    """Test graceful shutdown with proper close code"""
    uri = "ws://localhost:8001/ws/chat/"
    
    async with websockets.connect(uri) as websocket:
        await websocket.send("test message")
        response = await websocket.recv()
        data = json.loads(response)
        assert data["count"] == 1
        
        # Server should send final message before closing
        try:
            async with asyncio.timeout(2):
                response = await websocket.recv()
                data = json.loads(response)
                assert "bye" in data
                assert "total" in data
        except asyncio.TimeoutError:
            pytest.fail("Did not receive goodbye message")

@pytest.mark.asyncio
async def test_reconnection():
    """Test session restoration on reconnection"""
    uri = "ws://localhost:8001/ws/chat/"
    
    # First connection
    async with websockets.connect(uri) as websocket:
        response = await websocket.recv()
        data = json.loads(response)
        session_id = data["connectionId"]
        
        await websocket.send("test message")
        response = await websocket.recv()
        data = json.loads(response)
        assert data["count"] == 1
    
    # Reconnect with session ID
    uri_with_session = f"{uri}?session_id={session_id}"
    async with websockets.connect(uri_with_session) as websocket:
        await websocket.send("test message")
        response = await websocket.recv()
        data = json.loads(response)
        assert data["count"] == 2  # Counter should continue from previous session