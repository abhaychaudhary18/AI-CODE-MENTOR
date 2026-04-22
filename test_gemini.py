import urllib.request, json
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDSZkTlHvFB7DKUldl9ArAmaTrYknwLBWk"
req = urllib.request.Request(url, json.dumps({"contents":[{"parts":[{"text":"hi"}]}]}).encode('utf-8'), {'Content-Type': 'application/json'})
try:
    print(urllib.request.urlopen(req).read().decode())
except Exception as e:
    print(e.read().decode())
