import hmac
import hashlib
import subprocess
from django.http import HttpResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

@csrf_exempt
def github_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        return HttpResponseForbidden("Missing signature")

    sha_name, received_signature = signature.split("=")
    mac = hmac.new(
        key=settings.GITHUB_SECRET.encode(),
        msg=request.body,
        digestmod=hashlib.sha256
    )
    expected_signature = mac.hexdigest()

    if not hmac.compare_digest(received_signature, expected_signature):
        return HttpResponseForbidden("Invalid signature")

    import json
    payload = json.loads(request.body)
    if payload.get("ref") == "refs/heads/main":
        subprocess.Popen(["/root/PortalQualiconsig/deploy.sh"])

    return HttpResponse("Webhook received", status=200)
