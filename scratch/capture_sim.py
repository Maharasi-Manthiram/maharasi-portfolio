import socket, json, base64, subprocess, time, urllib.request, urllib.parse
from cdp_capture import make_ws_handshake, send_ws_frame, recv_ws_frame, call_cdp

proc = subprocess.Popen([
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new', '--disable-gpu', '--remote-debugging-port=9222',
    '--window-size=1280,1050', r'file:///c:/Users/MAHARASI/Desktop/MAHARASI MANTHIRAM/index.html'
])
time.sleep(2)
try:
    req = urllib.request.urlopen('http://localhost:9222/json')
    targets = json.loads(req.read().decode('utf-8'))
    page = [t for t in targets if t.get('type') == 'page'][0]
    parsed = urllib.parse.urlparse(page['webSocketDebuggerUrl'])
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((parsed.hostname, parsed.port))
    make_ws_handshake(sock, f"{parsed.hostname}:{parsed.port}", parsed.path)

    # Click simulator tab and scroll directly into view
    call_cdp(sock, "Runtime.evaluate", {"expression": "document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));"}, 1)
    call_cdp(sock, "Runtime.evaluate", {"expression": "document.querySelector('.proj-tab-btn[data-tab=\"tab-sim\"]').click();"}, 2)
    call_cdp(sock, "Runtime.evaluate", {"expression": "const c = document.getElementById('racing-canvas'); c.scrollIntoView({behavior: 'instant', block: 'center'});"}, 3)
    time.sleep(0.6)

    res = call_cdp(sock, "Page.captureScreenshot", {"format": "png"}, 4)
    if res and "result" in res and "data" in res["result"]:
        with open(r"c:\Users\MAHARASI\Desktop\MAHARASI MANTHIRAM\preview_simulator.png", "wb") as f:
            f.write(base64.b64decode(res["result"]["data"]))
        print("Captured centered simulator!")
    sock.close()
finally:
    proc.terminate()
