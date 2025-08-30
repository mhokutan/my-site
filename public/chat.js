let clientId = null;
let partnerId = null;

async function join() {
    const res = await fetch('/join');
    const data = await res.json();
    clientId = data.clientId;
    if (data.partnerId) {
        partnerId = data.partnerId;
        startChat();
    } else {
        pollPartner();
    }
}

async function pollPartner() {
    const res = await fetch('/partner?clientId=' + clientId);
    const data = await res.json();
    if (data.partnerId) {
        partnerId = data.partnerId;
        startChat();
    } else {
        setTimeout(pollPartner, 1000);
    }
}

function startChat() {
    document.getElementById('join').classList.add('hidden');
    document.getElementById('chat').classList.remove('hidden');
    setInterval(receive, 1000);
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value;
    input.value = '';
    await fetch('/send?from=' + clientId, {method:'POST', body:text});
    addMessage('Me: ' + text);
}

async function receive() {
    const res = await fetch('/receive?clientId=' + clientId);
    const data = await res.json();
    data.forEach(msg => addMessage('Partner: ' + msg));
}

function addMessage(text) {
    const div = document.getElementById('messages');
    const p = document.createElement('div');
    p.textContent = text;
    div.appendChild(p);
    div.scrollTop = div.scrollHeight;
}

document.getElementById('joinBtn').addEventListener('click', join);
document.getElementById('sendBtn').addEventListener('click', sendMessage);
