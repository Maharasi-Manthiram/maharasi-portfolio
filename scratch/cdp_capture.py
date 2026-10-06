import socket
import json
import base64
import os
import subprocess
import time
import urllib.request
import urllib.parse

def make_ws_handshake(sock, host, path):
    key = base64.b64encode(os.urandom(16)).decode('utf-8')
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(handshake.encode('utf-8'))
    resp = b""
    while b"\r\n\r\n" not in resp:
        chunk = sock.recv(4096)
        if not chunk:
            break
        resp += chunk
    return b"101" in resp

def send_ws_frame(sock, data):
    msg = data.encode('utf-8')
    length = len(msg)
    frame = bytearray()
    frame.append(0x81) # text frame, FIN
    mask_key = os.urandom(4)
    if length <= 125:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))
    frame.extend(mask_key)
    masked_msg = bytes([b ^ mask_key[i % 4] for i, b in enumerate(msg)])
    frame.extend(masked_msg)
    sock.sendall(frame)

def recv_ws_frame(sock):
    header = sock.recv(2)
    if not header or len(header) < 2:
        return None
    b1, b2 = header[0], header[1]
    length = b2 & 0x7F
    if length == 126:
        length = int.from_bytes(sock.recv(2), 'big')
    elif length == 127:
        length = int.from_bytes(sock.recv(8), 'big')
    
    payload = bytearray()
    while len(payload) < length:
        chunk = sock.recv(min(length - len(payload), 65536))
        if not chunk:
            break
        payload.extend(chunk)
    return payload.decode('utf-8', errors='ignore')

def call_cdp(sock, method, params=None, msg_id=1):
    req = {"id": msg_id, "method": method, "params": params or {}}
    send_ws_frame(sock, json.dumps(req))
    while True:
        res = recv_ws_frame(sock)
        if not res:
            return None
        data = json.loads(res)
        if data.get("id") == msg_id:
            return data

def capture_sections():
    chrome_cmd = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--window-size=1280,850',
        r'file:///c:/Users/MAHARASI/Desktop/MAHARASI MANTHIRAM/index.html'
    ]
    proc = subprocess.Popen(chrome_cmd)
    time.sleep(2)

    try:
        req = urllib.request.urlopen('http://localhost:9222/json')
        targets = json.loads(req.read().decode('utf-8'))
        page = [t for t in targets if t.get('type') == 'page'][0]
        parsed = urllib.parse.urlparse(page['webSocketDebuggerUrl'])
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((parsed.hostname, parsed.port))
        if not make_ws_handshake(sock, f"{parsed.hostname}:{parsed.port}", parsed.path):
            print("WS Handshake failed")
            return
        
        print("Connected to Chrome via CDP!")
        msg_id = 1
        
        # Make all elements active and wait for render
        eval_script = """
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        """
        call_cdp(sock, "Runtime.evaluate", {"expression": eval_script}, msg_id)
        msg_id += 1
        time.sleep(0.5)

        sections = [
            ("preview_hero.png", "window.scrollTo(0, 0);"),
            ("preview_about.png", "document.getElementById('about').scrollIntoView({block: 'start'});"),
            ("preview_education.png", "document.getElementById('education').scrollIntoView({block: 'start'});"),
            ("preview_skills.png", "document.getElementById('skills').scrollIntoView({block: 'start'});"),
            ("preview_project.png", "document.getElementById('projects').scrollIntoView({block: 'start'});"),
            ("preview_certifications.png", "document.getElementById('certifications').scrollIntoView({block: 'start'});"),
            ("preview_contact.png", "document.getElementById('contact').scrollIntoView({block: 'start'});")
        ]

        out_dir = r"c:\Users\MAHARASI\Desktop\MAHARASI MANTHIRAM"
        for filename, scroll_cmd in sections:
            call_cdp(sock, "Runtime.evaluate", {"expression": scroll_cmd}, msg_id)
            msg_id += 1
            time.sleep(0.35)
            
            # Take screenshot
            res = call_cdp(sock, "Page.captureScreenshot", {"format": "png"}, msg_id)
            msg_id += 1
            if res and "result" in res and "data" in res["result"]:
                img_data = base64.b64decode(res["result"]["data"])
                target_path = os.path.join(out_dir, filename)
                with open(target_path, "wb") as f:
                    f.write(img_data)
                print(f"Captured: {filename} ({len(img_data)} bytes)")
            else:
                print(f"Failed to capture {filename}")

        sock.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    capture_sections()
