#!/usr/bin/env python3
"""Build a signed APK with official Android SDK tools; no Gradle or remote service.

ANDROID_JAR and ANDROID_BUILD_TOOLS may point to an installed SDK. Otherwise
ANDROID_HOME/platforms/android-35 and ANDROID_HOME/build-tools/35.0.0 are used.
Signing material is generated once in WH_SIGNING_DIR (default: signing/), and
must be backed up privately to keep future updates installable over this build.
"""
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = json.loads((ROOT / 'package.json').read_text())
VERSION = PACKAGE['version']
VERSION_CODE = PACKAGE['android']['versionCode']
MIN_SDK = PACKAGE['android']['minSdk']
SDK = Path(os.environ.get('ANDROID_HOME', str(ROOT.parent / 'android-tools')))
ANDROID_JAR = Path(os.environ.get('ANDROID_JAR', str(SDK / 'platforms/android-35/android.jar')))
TOOLS = Path(os.environ.get('ANDROID_BUILD_TOOLS', str(SDK / 'build-tools/35.0.0')))
if not ANDROID_JAR.exists():
    alternative = SDK / 'platform/android-35/android.jar'
    if alternative.exists():
        ANDROID_JAR = alternative
if not (TOOLS / 'aapt2').exists() and (SDK / 'build-tools/android-15/aapt2').exists():
    TOOLS = SDK / 'build-tools/android-15'
if not ANDROID_JAR.exists() or not (TOOLS / 'aapt2').exists():
    raise SystemExit('Android SDK 35 platform/build tools are required. Set ANDROID_JAR and ANDROID_BUILD_TOOLS.')

BUILD = ROOT / 'android/build'
if BUILD.exists():
    shutil.rmtree(BUILD)
for folder in ['assets/web', 'generated', 'classes', 'dex']:
    (BUILD / folder).mkdir(parents=True)

def run(*args, **kwargs):
    subprocess.run([str(arg) for arg in args], cwd=ROOT, check=True, **kwargs)

for name in ['aapt2', 'd8', 'zipalign', 'apksigner']:
    executable = TOOLS / name
    executable.chmod(executable.stat().st_mode | 0o111)

web = BUILD / 'assets/web'
for name in ['index.html','styles.css','app.js','appearance.js','appearance.css','section-designs.js','section-designs.css','daily-facts.js','event-details.js','event-photos.js','design-review.js','design-review.css','updates.js','calendar-data.js','december-base.js','icons.js','reminders.js','manifest.webmanifest']:
    shutil.copy2(ROOT / name, web / name)
# The Android WebView uses the 192px header icon; retain the larger PWA icon on the web.
shutil.copytree(ROOT / 'assets', web / 'assets', ignore=shutil.ignore_patterns('icon-512.png'))
native_manifest = json.loads((web / 'manifest.webmanifest').read_text())
native_manifest['icons'] = [item for item in native_manifest['icons'] if item['sizes'] == '192x192']
(web / 'manifest.webmanifest').write_text(json.dumps(native_manifest, ensure_ascii=False, indent=2) + '\n')
catalogue = subprocess.check_output(['node', '--input-type=module', '-e',
    "import {events} from './calendar-data.js'; process.stdout.write(JSON.stringify(events.map(({id,date,title,category})=>({id,date,title,category}))));"], cwd=ROOT)
(BUILD / 'assets/catalogue.json').write_bytes(catalogue)

run(TOOLS / 'aapt2', 'compile', '--dir', ROOT / 'android/res', '-o', BUILD / 'resources.zip')
run(TOOLS / 'aapt2', 'link', '-o', BUILD / 'base.apk', '-I', ANDROID_JAR,
    '--manifest', ROOT / 'android/AndroidManifest.xml', '-A', BUILD / 'assets',
    '--java', BUILD / 'generated', '--min-sdk-version', str(MIN_SDK), '--target-sdk-version', '35',
    '--version-code', str(VERSION_CODE), '--version-name', VERSION, BUILD / 'resources.zip')
sources = sorted((ROOT / 'android/src').rglob('*.java')) + sorted((BUILD / 'generated').rglob('*.java'))
run('java', '-m', 'jdk.compiler/com.sun.tools.javac.Main', '-source', '8', '-target', '8',
    '-classpath', ANDROID_JAR, '-encoding', 'UTF-8', '-d', BUILD / 'classes', *sources)
classes = sorted((BUILD / 'classes').rglob('*.class'))
run(TOOLS / 'd8', '--lib', ANDROID_JAR, '--min-api', str(MIN_SDK), '--output', BUILD / 'dex', *classes)
with zipfile.ZipFile(BUILD / 'base.apk', 'a', compression=zipfile.ZIP_DEFLATED) as archive:
    for dex in sorted((BUILD / 'dex').glob('*.dex')):
        archive.write(dex, dex.name)
run(TOOLS / 'zipalign', '-p', '-f', '4', BUILD / 'base.apk', BUILD / 'aligned.apk')

signing = Path(os.environ.get('WH_SIGNING_DIR', str(ROOT / 'signing')))
signing.mkdir(mode=0o700, parents=True, exist_ok=True)
password = signing / 'password.txt'
key = signing / 'whats-happening.jks'
if not key.exists():
    password.write_text(secrets.token_urlsafe(32))
    password.chmod(0o600)
    run('keytool', '-genkeypair', '-keystore', key, '-storetype', 'PKCS12', '-alias', 'happening',
        '-storepass:file', password, '-keypass:file', password, '-keyalg', 'RSA', '-keysize', '3072',
        '-validity', '10000', '-dname', 'CN=Whats Happening, OU=Nicole, O=Personal App, C=GB')
    key.chmod(0o600)
if not password.exists():
    raise SystemExit('The private signing password file is missing; restore the signing backup.')

apk = BUILD / f'Whats-Happening-{VERSION}.apk'
run(TOOLS / 'apksigner', 'sign', '--ks', key, '--ks-key-alias', 'happening',
    '--ks-pass', 'file:' + str(password),
    '--out', apk, BUILD / 'aligned.apk')
run(TOOLS / 'apksigner', 'verify', '--verbose', '--print-certs', apk)
run(TOOLS / 'aapt2', 'dump', 'badging', apk)
print(json.dumps({'apk': str(apk), 'events': len(json.loads(catalogue)), 'bytes': apk.stat().st_size}))

# Publish these two files together in the same Pages commit. The APK URL is
# versioned so a phone cannot download an older APK from a CDN cache.
downloads = ROOT / 'downloads'
downloads.mkdir(exist_ok=True)
shutil.copy2(apk, downloads / apk.name)
release = {
    'packageName': 'uk.co.nicole.whatshappening',
    'versionCode': VERSION_CODE, 'versionName': VERSION, 'minSdk': MIN_SDK,
    'apkUrl': f'https://nikki0radz.github.io/What-s-Happening-/downloads/{apk.name}',
    'sizeBytes': apk.stat().st_size, 'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
    'releaseNotes': 'New globe logo, chosen date styles, numbered layout choices above each section, left-aligned Tell me more and a sourced daily random fact.'
}
(ROOT / 'app-update.json').write_text(json.dumps(release, indent=2) + '\n')
print('Prepared the versioned APK download and app-update.json for publication.')
