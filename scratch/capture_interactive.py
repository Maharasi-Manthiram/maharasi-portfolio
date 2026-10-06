import socket
import json
import base64
import os
import subprocess
import time
import urllib.request
import urllib.parse

from cdp_capture import make_ws_handshake, send_ws_frame, recv_ws_frame, call_cdp

def capture_interactive():
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
        make_ws_handshake(sock, f"{parsed.hostname}:{parsed.port}", parsed.path)
        
        msg_id = 1
        
        # 1. Activate all elements and click Simulator tab
        call_cdp(sock, "Runtime.evaluate", {"expression": "document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));"}, msg_id)
        msg_id += 1
        time.sleep(0.3)
        
        # Click Simulator tab and scroll to project
        sim_script = """
        document.querySelector('.proj-tab-btn[data-tab=\"tab-sim\"]').click();
        document.getElementById('projects').scrollIntoView({block: 'start'});
        """
        call_cdp(sock, "Runtime.evaluate", {"expression": sim_script}, msg_id)
        msg_id += 1
        time.sleep(0.6)
        
        res = call_cdp(sock, "Page.captureScreenshot", {"format": "png"}, msg_id)
        msg_id += 1
        if res and "result" in res and "data" in res["result"]:
            with open(r"c:\Users\MAHARASI\Desktop\MAHARASI MANTHIRAM\preview_simulator.png", "wb") as f:
                f.write(base64.b64decode(res["result"]["data"]))
            print("Captured simulator tab")

        # 2. Open Resume Modal
        modal_script = """
        document.querySelector('.open-resume-modal').click();
        """
        call_cdp(sock, "Runtime.evaluate", {"expression": modal_script}, msg_id)
        msg_id += 1
        time.sleep(0.5)

        res2 = call_cdp(sock, "Page.captureScreenshot", {"format": "png"}, msg_id)
        msg_id += 1
        if res2 and "result" in res2 and "data" in res2["result"]:
            with open(r"c:\Users\MAHARASI\Desktop\MAHARASI MANTHIRAM\preview_modal.png", "wb") as f:
                f.write(base64.b64decode(res2["result"]["data"]))
            print("Captured resume modal")

        sock.close()
    finally:
        proc.terminate()

if __name__ == '__main__':
    capture_interactive()
