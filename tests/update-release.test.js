import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

test('published update metadata matches the signed APK and configured release',async()=>{
  const root=new URL('../',import.meta.url);
  const release=JSON.parse(await readFile(new URL('app-update.json',root),'utf8'));
  const config=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
  assert.equal(release.packageName,'uk.co.nicole.whatshappening');
  assert.equal(release.versionCode,config.android.versionCode);
  assert.equal(release.versionName,config.version);
  assert.equal(release.minSdk,config.android.minSdk);
  const expected=`https://nikki0radz.github.io/What-s-Happening-/downloads/Whats-Happening-${config.version}.apk`;
  assert.equal(release.apkUrl,expected);
  const apk=await readFile(new URL(`downloads/Whats-Happening-${config.version}.apk`,root));
  assert.equal(apk.length,release.sizeBytes);
  assert.equal(createHash('sha256').update(apk).digest('hex'),release.sha256);
  assert.ok(apk.length>1000000,'release must contain the complete offline app');
});
