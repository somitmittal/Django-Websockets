import json
import pytest
from channels.testing import WebsocketCommunicator
from app.chat.consumers import ChatConsumer

@pytest.mark.asyncio
async def test_connect():
    communicator = WebsocketCommunicator(ChatConsumer, "/ws/chat/")
    connected, _ = await communicator.connect()
    assert connected
    
    # Test session ID is returned
    response = await communicator.receive_from()
    response_data = json.loads(response)
    assert "session" in response_data
    assert "count" in response_data
    
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_chat_message():
    communicator = WebsocketCommunicator(ChatConsumer, "/ws/chat/")
    await communicator.connect()
    
    # Send message
    await communicator.send_to(text_data=json.dumps({
        "message": "test message"
    }))
    
    # Verify response
    response = await communicator.receive_from()
    response_data = json.loads(response)
    assert response_data["message"] == "test message"
    assert response_data["count"] == 1
    
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_disconnect():
    communicator = WebsocketCommunicator(ChatConsumer, "/ws/chat/")
    await communicator.connect()
    
    # Send a message first to increment count
    await communicator.send_to(text_data=json.dumps({
        "message": "test message"
    }))
    
    # Disconnect and verify bye message
    await communicator.disconnect()
    response = await communicator.receive_from()
    response_data = json.loads(response)
    assert response_data["bye"] is True
    assert response_data["total"] == 1