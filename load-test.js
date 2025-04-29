import { WebSocket } from 'k6/experimental/websockets';

export default function () {
  const ws = new WebSocket('ws://localhost/ws/chat');
  ws.onopen = () => {
    ws.send('Hello, server!');
  };
  ws.onmessage = (message) => {
    console.log('Received:', message.data);
  };
  ws.onclose = () => {
    console.log('Connection closed');
  };
}