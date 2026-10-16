// Set the public API URL after deploying the backend. Local previews use port 3001.
const localPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
window.LEILA_API_BASE = localPreview ? 'http://localhost:3001/api' : '';
